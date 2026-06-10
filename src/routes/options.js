const express = require("express");
const multer = require("multer");

const { pool } = require("../db");
const { uploadBuffer } = require("../utils/cloudinary");
const {
  FORM_SECTIONS,
  OPTION_DETAIL_TABLE,
  OPTION_GROUPS,
  OPTION_GROUP_BY_SLUG,
  OPTION_SEEDS,
  assertSafeTableName,
} = require("../db/optionSections");
const {
  createGroupSchema,
  updateGroupSchema,
  upsertItemsSchema,
} = require("../validators/options");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

function parseMetadata(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
}

function normalizeGroup(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    multi_select: Boolean(row.multi_select),
    input_type: row.input_type || "",
    metadata: null,
    updated_at: row.updated_at,
    items_count: typeof row.items_count === "number" ? row.items_count : Number(row.items_count || 0),
  };
}

function normalizeItem(row) {
  return {
    id: row.id,
    group_id: row.group_id,
    value: row.value,
    label: row.label,
    description: row.description || "",
    image_url: row.image_url,
    accent_color: row.accent_color,
    metadata: parseMetadata(row.metadata),
    sort_order: row.sort_order,
    updated_at: row.updated_at,
  };
}

function getGroupConfig(slug) {
  return OPTION_GROUP_BY_SLUG[slug] || null;
}

function inputTypeFromMultiSelect(config, multiSelect) {
  const current = String(config?.inputType || "").toLowerCase();
  if (current.includes("card")) return multiSelect ? "card checkbox" : "card option";
  return multiSelect ? "checkbox" : "option";
}

async function findGroupBySlug(slug, connection = pool) {
  const config = getGroupConfig(slug);
  if (!config) return null;
  const tableName = assertSafeTableName(config.tableName);
  const [rows] = await connection.query(
    `SELECT f.id,
            f.ma_truong AS slug,
            f.ten_truong AS title,
            f.mo_ta AS description,
            f.kieu_nhap AS input_type,
            CASE
              WHEN LOWER(f.kieu_nhap) LIKE '%checkbox%' THEN 1
              ELSE 0
            END AS multi_select,
            f.updated_at,
            COUNT(o.id) AS items_count
       FROM \`${tableName}\` f
  LEFT JOIN \`${OPTION_DETAIL_TABLE}\` o ON o.bang_cha = ? AND o.field_id = f.id AND o.trang_thai = 'active'
      WHERE f.ma_truong = ?
      GROUP BY f.id, f.ma_truong, f.ten_truong, f.mo_ta, f.kieu_nhap, f.updated_at`,
    [tableName, slug]
  );
  return rows[0] || null;
}

async function ensureGroupExists(slug, connection = pool) {
  const config = getGroupConfig(slug);
  if (!config) return null;

  const existing = await findGroupBySlug(slug, connection);
  if (existing) return existing;

  const tableName = assertSafeTableName(config.tableName);
  const [result] = await connection.query(
    `INSERT INTO \`${tableName}\`
       (ten_truong, ma_truong, kieu_nhap, bat_buoc, placeholder, mo_ta, thu_tu, trang_thai)
     VALUES (?, ?, ?, 0, '', ?, ?, 'active')
     ON DUPLICATE KEY UPDATE
       ten_truong = VALUES(ten_truong),
       kieu_nhap = VALUES(kieu_nhap),
       mo_ta = VALUES(mo_ta),
       trang_thai = 'active'`,
    [
      config.title,
      config.slug,
      config.inputType || (config.multi_select ? "checkbox" : "option"),
      config.description || "",
      config.order || 0,
    ]
  );

  const fieldId = result.insertId || (await findGroupBySlug(slug, connection))?.id;
  const seeds = OPTION_SEEDS[slug] || [];
  for (const [index, option] of seeds.entries()) {
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
         trang_thai = 'active'`,
      [
        tableName,
        fieldId,
        config.title,
        option.value,
        option.label,
        option.description || "",
        option.image_url || null,
        option.accent_color || null,
        option.metadata ? JSON.stringify(option.metadata) : null,
        option.sort_order ?? index,
      ]
    );
  }

  return findGroupBySlug(slug, connection);
}

async function getGroupItems(slug, connection = pool) {
  const config = getGroupConfig(slug);
  if (!config) return [];
  const tableName = assertSafeTableName(config.tableName);
  const group = await ensureGroupExists(slug, connection);
  if (!group) return [];
  const [items] = await connection.query(
    `SELECT id,
            field_id AS group_id,
            gia_tri AS value,
            noi_dung AS label,
            mo_ta AS description,
            hinh_anh AS image_url,
            mau_sac AS accent_color,
            metadata,
            thu_tu AS sort_order,
            updated_at
       FROM \`${OPTION_DETAIL_TABLE}\`
      WHERE bang_cha = ? AND field_id = ? AND trang_thai = 'active'
      ORDER BY thu_tu DESC, id DESC`,
    [tableName, group.id]
  );
  return items;
}

router.get("/", async (_req, res, next) => {
  try {
    const groups = [];
    for (const group of OPTION_GROUPS) {
      const row = await ensureGroupExists(group.slug);
      if (row) groups.push(normalizeGroup(row));
    }
    res.json({ groups });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createGroupSchema.parse(req.body);
    const group = getGroupConfig(parsed.slug);
    if (!group) {
      return res.status(400).json({
        message: "Các group hiện được định nghĩa theo field của 8 bảng UI. Hãy thêm lựa chọn vào field hiện có.",
      });
    }
    res.status(201).json({ group: normalizeGroup(await ensureGroupExists(group.slug)) });
  } catch (err) {
    next(err);
  }
});

router.get("/sections/tables", async (_req, res, next) => {
  try {
    res.json({
      sections: FORM_SECTIONS.map((section) => ({
        tableName: section.tableName,
        title: section.title,
        fields: section.fields,
      })),
      detailTable: OPTION_DETAIL_TABLE,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const groupRow = await ensureGroupExists(slug);
    if (!groupRow) {
      return res.status(404).json({ message: "Option group not found" });
    }
    const items = await getGroupItems(slug);
    res.json({ group: normalizeGroup(groupRow), items: items.map(normalizeItem) });
  } catch (err) {
    next(err);
  }
});

router.put("/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const parsed = updateGroupSchema.parse(req.body);
    const config = getGroupConfig(slug);
    if (!config) {
      return res.status(404).json({ message: "Option group not found" });
    }

    const tableName = assertSafeTableName(config.tableName);
    await ensureGroupExists(slug);
    await pool.query(
      `UPDATE \`${tableName}\`
          SET ten_truong = COALESCE(?, ten_truong),
              mo_ta = COALESCE(?, mo_ta),
              kieu_nhap = COALESCE(?, kieu_nhap),
              updated_at = CURRENT_TIMESTAMP
        WHERE ma_truong = ?`,
      [
        parsed.title ?? null,
        parsed.description ?? null,
        parsed.multi_select === undefined ? null : inputTypeFromMultiSelect(config, parsed.multi_select),
        slug,
      ]
    );

    const updated = await findGroupBySlug(slug);
    res.json({ group: normalizeGroup(updated) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const config = getGroupConfig(slug);
    if (!config) {
      return res.status(404).json({ message: "Option group not found" });
    }
    const tableName = assertSafeTableName(config.tableName);
    const group = await findGroupBySlug(slug);
    if (!group) {
      return res.status(404).json({ message: "Option group not found" });
    }
    await pool.query(`DELETE FROM \`${OPTION_DETAIL_TABLE}\` WHERE bang_cha = ? AND field_id = ?`, [tableName, group.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/:slug/upload-image", upload.single("file"), async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const config = getGroupConfig(slug);
    if (!config) {
      return res.status(404).json({ message: "Option group not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Missing image file" });
    }

    const uploadInfo = await uploadBuffer(req.file.buffer, {
      folder: `${process.env.CLOUDINARY_FOLDER || "landingpage_be"}/options/${slug}`,
      square: true,
      squareSize: 1200,
    });

    const tableName = assertSafeTableName(config.tableName);
    const group = await ensureGroupExists(slug);
    const itemId = Number(req.body.item_id || 0);
    const materialIndex = req.body.material_index === undefined ? null : Number(req.body.material_index);
    let persisted = false;

    if (group && itemId > 0 && Number.isInteger(materialIndex) && materialIndex >= 0) {
      const [rows] = await pool.query(
        `SELECT metadata
           FROM \`${OPTION_DETAIL_TABLE}\`
          WHERE id = ? AND bang_cha = ? AND field_id = ?`,
        [itemId, tableName, group.id]
      );
      const metadata = parseMetadata(rows[0]?.metadata) || {};
      const items = Array.isArray(metadata.items)
        ? metadata.items
        : Array.isArray(metadata.variants)
          ? metadata.variants.map((entry) => ({
              name: entry.name || entry.id || "",
              image_url: entry.image_url || "",
            }))
          : [];
      if (items[materialIndex]) {
        items[materialIndex] = {
          ...items[materialIndex],
          image_url: uploadInfo.url,
        };
        const { variants, ...metadataWithoutVariants } = metadata;
        metadataWithoutVariants.items = items;
        await pool.query(
          `UPDATE \`${OPTION_DETAIL_TABLE}\`
              SET metadata = ?,
                  updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND bang_cha = ? AND field_id = ?`,
          [JSON.stringify(metadataWithoutVariants), itemId, tableName, group.id]
        );
        persisted = true;
      }
    } else if (group && itemId > 0) {
      const [result] = await pool.query(
        `UPDATE \`${OPTION_DETAIL_TABLE}\`
            SET hinh_anh = ?,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND bang_cha = ? AND field_id = ?`,
        [uploadInfo.url, itemId, tableName, group.id]
      );
      persisted = result.affectedRows > 0;
    }

    res.status(201).json({
      image: {
        url: uploadInfo.url,
        cloudinary_public_id: uploadInfo.publicId,
        width: uploadInfo.width,
        height: uploadInfo.height,
        bytes: uploadInfo.bytes,
        format: uploadInfo.format,
      },
      persisted,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:slug/items", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const parsed = upsertItemsSchema.parse(req.body);
    const config = getGroupConfig(slug);
    if (!config) {
      return res.status(404).json({ message: "Option group not found" });
    }

    const tableName = assertSafeTableName(config.tableName);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();
      const group = await ensureGroupExists(slug, conn);
      if (!group) {
        return res.status(404).json({ message: "Option group not found" });
      }

      const keepIds = [];
      for (const [index, item] of parsed.items.entries()) {
        const sortOrder = item.sort_order ?? index;
        const serializedMetadata = item.metadata ? JSON.stringify(item.metadata) : null;

        if (item.id) {
          await conn.query(
            `UPDATE \`${OPTION_DETAIL_TABLE}\`
                SET gia_tri = ?,
                    noi_dung = ?,
                    mo_ta = ?,
                    hinh_anh = ?,
                    mau_sac = ?,
                    metadata = ?,
                    thu_tu = ?,
                    trang_thai = 'active',
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = ? AND bang_cha = ? AND field_id = ?`,
            [
              item.value,
              item.label,
              item.description || "",
              item.image_url || null,
              item.accent_color || null,
              serializedMetadata,
              sortOrder,
              item.id,
              tableName,
              group.id,
            ]
          );
          keepIds.push(item.id);
        } else {
          const [insert] = await conn.query(
            `INSERT INTO \`${OPTION_DETAIL_TABLE}\`
               (bang_cha, field_id, nhom_lua_chon, gia_tri, noi_dung, mo_ta, hinh_anh, mau_sac, metadata, thu_tu, trang_thai)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
              tableName,
              group.id,
              group.title,
              item.value,
              item.label,
              item.description || "",
              item.image_url || null,
              item.accent_color || null,
              serializedMetadata,
              sortOrder,
            ]
          );
          keepIds.push(insert.insertId);
        }
      }

      if (keepIds.length) {
        const placeholders = keepIds.map(() => "?").join(",");
        await conn.query(
          `DELETE FROM \`${OPTION_DETAIL_TABLE}\` WHERE bang_cha = ? AND field_id = ? AND id NOT IN (${placeholders})`,
          [tableName, group.id, ...keepIds]
        );
      } else {
        await conn.query(`DELETE FROM \`${OPTION_DETAIL_TABLE}\` WHERE bang_cha = ? AND field_id = ?`, [tableName, group.id]);
      }

      await conn.commit();

      const updatedGroup = await findGroupBySlug(slug, conn);
      const items = await getGroupItems(slug, conn);
      res.json({ group: normalizeGroup(updatedGroup), items: items.map(normalizeItem) });
    } catch (transactionErr) {
      await conn.rollback();
      throw transactionErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
