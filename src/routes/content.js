const express = require("express");

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({ sections: [] });
});

router.put("/", async (_req, res) => {
  res.status(410).json({
    message: "content_sections has been removed. Form labels are now managed in the 8 UI section tables.",
  });
});

module.exports = router;
