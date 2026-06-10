const express = require("express");
const { z } = require("zod");

const { pool, CUSTOMER_SUBMISSIONS_TABLE } = require("../db");

const router = express.Router();

const payloadSchema = z.record(z.any());
const createSubmissionSchema = z.object({
  payload: payloadSchema,
});
const lookupSchema = z.object({
  name: z.string().min(1).max(160),
  phone: z.string().min(4).max(40),
});

function normalizeName(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function makeSubmissionCode(name, phone) {
  return `${normalizeName(name) || "khach-hang"}-${normalizePhone(phone) || "no-phone"}`;
}

function sanitizePayload(payload) {
  const { images, ...rest } = payload || {};
  return {
    ...rest,
    images: Array.isArray(images)
      ? images.map((image) => ({
          room: image.room || "",
          filename: image.filename || "",
          mimeType: image.mimeType || "",
          size: image.size || image.bytes || 0,
        }))
      : [],
  };
}

function normalizeSubmission(row) {
  const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
  return {
    id: row.id,
    submission_code: row.submission_code,
    submission_id: row.submission_id,
    customer_name: row.customer_name,
    phone: row.phone,
    email: row.email || "",
    payload,
    submitted_at: row.submitted_at,
    created_at: row.created_at,
  };
}

router.post("/", async (req, res, next) => {
  try {
    const parsed = createSubmissionSchema.parse(req.body);
    const payload = sanitizePayload(parsed.payload);
    const customerName = payload.ho_ten || payload.chu_dau_tu || "";
    const phone = payload.so_dien_thoai || "";
    const normalizedName = normalizeName(customerName);
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedName || !normalizedPhone) {
      return res.status(400).json({ message: "Missing customer name or phone" });
    }

    const submissionCode = makeSubmissionCode(customerName, phone);
    const submissionId = payload.submission_id || `SUB-${Date.now()}`;
    const submittedAt = payload.submitted_at ? new Date(payload.submitted_at) : new Date();

    const [result] = await pool.query(
      `INSERT INTO \`${CUSTOMER_SUBMISSIONS_TABLE}\`
         (submission_code, submission_id, customer_name, normalized_name, phone, normalized_phone, email, payload, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionCode,
        submissionId,
        customerName,
        normalizedName,
        phone,
        normalizedPhone,
        payload.email || payload.email_du_an || "",
        JSON.stringify(payload),
        submittedAt,
      ]
    );

    const [rows] = await pool.query(`SELECT * FROM \`${CUSTOMER_SUBMISSIONS_TABLE}\` WHERE id = ?`, [result.insertId]);
    res.status(201).json({ submission: normalizeSubmission(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 300);
    const [rows] = await pool.query(
      `SELECT * FROM \`${CUSTOMER_SUBMISSIONS_TABLE}\`
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
      [limit]
    );
    res.json({ submissions: rows.map(normalizeSubmission) });
  } catch (err) {
    next(err);
  }
});

router.post("/lookup", async (req, res, next) => {
  try {
    const parsed = lookupSchema.parse(req.body);
    const normalizedName = normalizeName(parsed.name);
    const normalizedPhone = normalizePhone(parsed.phone);
    const [rows] = await pool.query(
      `SELECT * FROM \`${CUSTOMER_SUBMISSIONS_TABLE}\`
       WHERE normalized_name = ? AND normalized_phone = ?
       ORDER BY created_at DESC, id DESC`,
      [normalizedName, normalizedPhone]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Không tìm thấy câu trả lời phù hợp." });
    }
    const submissions = rows.map(normalizeSubmission);
    res.json({ submission: submissions[0], submissions });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid submission id" });
    }

    const [result] = await pool.query(`DELETE FROM \`${CUSTOMER_SUBMISSIONS_TABLE}\` WHERE id = ?`, [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
