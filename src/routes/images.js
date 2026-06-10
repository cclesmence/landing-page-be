const express = require("express");

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({ images: [] });
});

router.post("/", async (_req, res) => {
  res.status(410).json({
    message: "gallery_images has been removed from the form database schema.",
  });
});

router.put("/:id", async (_req, res) => {
  res.status(410).json({
    message: "gallery_images has been removed from the form database schema.",
  });
});

router.delete("/:id", async (_req, res) => {
  res.status(410).json({
    message: "gallery_images has been removed from the form database schema.",
  });
});

module.exports = router;
