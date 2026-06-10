const mysql = require("mysql2/promise");
const {
  FORM_SECTIONS,
  OPTION_DETAIL_TABLE,
  OPTION_GROUP_BY_SLUG,
  OPTION_SEEDS,
  formFieldTableSchema,
  optionDetailTableSchema,
} = require("./optionSections");

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 4000);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "landingpage";
const DB_POOL_SIZE = Number(process.env.DB_POOL_SIZE || 5);
const DB_SSL = String(process.env.DB_SSL || "true").toLowerCase() !== "false";
const CUSTOMER_SUBMISSIONS_TABLE = "customer_submissions";

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: DB_POOL_SIZE,
  ssl: DB_SSL ? { rejectUnauthorized: false } : undefined,
  timezone: "+00:00",
});

async function tableExists(tableName, connection = pool) {
  const [rows] = await connection.query("SHOW TABLES LIKE ?", [tableName]);
  return rows.length > 0;
}

async function tableHasColumn(tableName, columnName, connection = pool) {
  if (!(await tableExists(tableName, connection))) return false;
  const [rows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
  return rows.length > 0;
}

async function collectLegacyOptions() {
  const bySlug = {};

  if (await tableExists(OPTION_DETAIL_TABLE)) {
    for (const section of FORM_SECTIONS) {
      if (!(await tableHasColumn(section.tableName, "ma_truong"))) continue;
      const [rows] = await pool.query(
        `SELECT f.ma_truong AS slug,
                o.gia_tri AS value,
                o.noi_dung AS label,
                o.mo_ta AS description,
                o.hinh_anh AS image_url,
                o.mau_sac AS accent_color,
                o.metadata,
                o.thu_tu AS sort_order
           FROM \`${section.tableName}\` f
           JOIN \`${OPTION_DETAIL_TABLE}\` o ON o.bang_cha = ? AND o.field_id = f.id
          WHERE o.trang_thai = 'active'
          ORDER BY f.thu_tu, o.thu_tu, o.id`,
        [section.tableName]
      );
      rows.forEach((row) => appendLegacyOption(bySlug, row.slug, row));
    }
  }

  if ((await tableExists("option_groups")) && (await tableExists("option_items"))) {
    const [rows] = await pool.query(`
      SELECT g.slug AS slug,
             i.value,
             i.label,
             i.description,
             i.image_url,
             i.accent_color,
             i.metadata,
             i.sort_order
        FROM option_groups g
        JOIN option_items i ON i.group_id = g.id
       ORDER BY g.id, i.sort_order, i.id
    `);
    rows.forEach((row) => appendLegacyOption(bySlug, row.slug, row));
  }

  for (const section of FORM_SECTIONS) {
    if (!(await tableHasColumn(section.tableName, "group_slug"))) continue;
    const [rows] = await pool.query(
      `SELECT group_slug AS slug,
              value,
              label,
              description,
              image_url,
              accent_color,
              metadata,
              sort_order
         FROM \`${section.tableName}\`
        ORDER BY group_slug, sort_order, id`
    );
    rows.forEach((row) => appendLegacyOption(bySlug, row.slug, row));
  }

  return bySlug;
}

function appendLegacyOption(bySlug, slug, row) {
  if (!OPTION_GROUP_BY_SLUG[slug]) return;
  if (!bySlug[slug]) bySlug[slug] = [];
  if (bySlug[slug].some((item) => item.value === row.value)) return;
  bySlug[slug].push({
    value: row.value,
    label: row.label,
    description: row.description || "",
    image_url: row.image_url || null,
    accent_color: row.accent_color || null,
    metadata: row.metadata,
    sort_order: row.sort_order || bySlug[slug].length,
  });
}

async function runMigrations() {
  const legacyOptions = await collectLegacyOptions();
  let rebuildDetailTable = false;

  for (const section of FORM_SECTIONS) {
    if ((await tableExists(section.tableName)) && !(await tableHasColumn(section.tableName, "ma_truong"))) {
      rebuildDetailTable = true;
      await pool.query(`DROP TABLE IF EXISTS \`${section.tableName}\``);
    }
  }
  if (rebuildDetailTable) {
    await pool.query(`DROP TABLE IF EXISTS \`${OPTION_DETAIL_TABLE}\``);
  }
  await pool.query("DROP TABLE IF EXISTS option_items");
  await pool.query("DROP TABLE IF EXISTS option_groups");
  await pool.query("DROP TABLE IF EXISTS gallery_images");
  await pool.query("DROP TABLE IF EXISTS content_sections");

  for (const section of FORM_SECTIONS) {
    await pool.query(formFieldTableSchema(section.tableName));
  }
  await pool.query(optionDetailTableSchema());
  await pool.query(customerSubmissionsTableSchema());

  await seedDefaults(legacyOptions);
}

function customerSubmissionsTableSchema() {
  return `
    CREATE TABLE IF NOT EXISTS \`${CUSTOMER_SUBMISSIONS_TABLE}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      submission_code VARCHAR(180) NOT NULL,
      submission_id VARCHAR(80) NOT NULL,
      customer_name VARCHAR(160) NOT NULL,
      normalized_name VARCHAR(180) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      normalized_phone VARCHAR(32) NOT NULL,
      email VARCHAR(160) DEFAULT '',
      payload JSON NOT NULL,
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_code (submission_code),
      KEY idx_lookup (normalized_name, normalized_phone),
      KEY idx_created_at (created_at)
    );
  `;
}

async function seedDefaults(legacyOptions = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const section of FORM_SECTIONS) {
      for (const field of section.fields) {
        const [result] = await conn.query(
          `INSERT INTO \`${section.tableName}\`
             (ten_truong, ma_truong, kieu_nhap, bat_buoc, placeholder, mo_ta, thu_tu, trang_thai)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
           ON DUPLICATE KEY UPDATE
             ma_truong = ma_truong;`,
          [
            field.label,
            field.code,
            field.inputType,
            field.required ? 1 : 0,
            field.placeholder || "",
            field.description || "",
            field.order || 0,
          ]
        );

        const fieldId = result.insertId || (await getFieldId(conn, section.tableName, field.code));
        const options = legacyOptions[field.code]?.length ? legacyOptions[field.code] : OPTION_SEEDS[field.code] || [];
        for (const [index, option] of options.entries()) {
          await upsertOptionDetail(conn, {
            tableName: section.tableName,
            fieldId,
            fieldLabel: field.label,
            value: option.value,
            label: option.label,
            description: option.description || "",
            imageUrl: option.image_url || null,
            accentColor: option.accent_color || null,
            metadata: option.metadata || null,
            sortOrder: option.sort_order ?? index,
          });
        }
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getFieldId(connection, tableName, code) {
  const [rows] = await connection.query(`SELECT id FROM \`${tableName}\` WHERE ma_truong = ?`, [code]);
  return rows[0]?.id;
}

async function upsertOptionDetail(connection, option) {
  await connection.query(
    `INSERT INTO \`${OPTION_DETAIL_TABLE}\`
       (bang_cha, field_id, nhom_lua_chon, gia_tri, noi_dung, mo_ta, hinh_anh, mau_sac, metadata, thu_tu, trang_thai)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE
       nhom_lua_chon = VALUES(nhom_lua_chon),
       noi_dung = VALUES(noi_dung),
       mo_ta = VALUES(mo_ta),
       hinh_anh = VALUES(hinh_anh),
       mau_sac = VALUES(mau_sac),
       metadata = VALUES(metadata),
       thu_tu = VALUES(thu_tu),
       trang_thai = VALUES(trang_thai);`,
    [
      option.tableName,
      option.fieldId,
      option.fieldLabel,
      option.value,
      option.label,
      option.description || "",
      option.imageUrl || null,
      option.accentColor || null,
      option.metadata ? (typeof option.metadata === "string" ? option.metadata : JSON.stringify(option.metadata)) : null,
      option.sortOrder || 0,
    ]
  );
}

async function initDb() {
  await runMigrations();
}

module.exports = {
  pool,
  initDb,
  CUSTOMER_SUBMISSIONS_TABLE,
};
