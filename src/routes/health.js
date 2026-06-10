const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT NOW() as now");
    res.json({ status: "ok", now: rows[0].now });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
