require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { initDb } = require("./db");
const errorHandler = require("./middleware/errorHandler");
const contentRoutes = require("./routes/content");
const imageRoutes = require("./routes/images");
const optionRoutes = require("./routes/options");
const submissionRoutes = require("./routes/submissions");
const healthRoutes = require("./routes/health");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const corsOrigins = (process.env.ALLOWED_ORIGINS || "").split(/,\s*/).filter(Boolean);
function isLocalOrigin(origin) {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch (err) {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    if (!corsOrigins.length || corsOrigins.includes(origin) || isLocalOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
}));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "LandingPage_BE is running" });
});

app.use("/api/health", healthRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/submissions", submissionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
