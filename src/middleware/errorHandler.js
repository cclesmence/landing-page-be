function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({ error: err.errors });
  }

  res.status(500).json({ error: "Internal server error" });
}

module.exports = errorHandler;
