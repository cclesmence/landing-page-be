const { v2: cloudinary } = require("cloudinary");

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const DEFAULT_FOLDER = process.env.CLOUDINARY_FOLDER || "landingpage_be";

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn("[Cloudinary] Missing credentials. Upload endpoints will fail until configured.");
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

function ensureConfigured() {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    const error = new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars.");
    error.status = 500;
    throw error;
  }
}

function uploadBuffer(buffer, options = {}) {
  ensureConfigured();
  const folder = options.folder || DEFAULT_FOLDER;
  const uploadOptions = {
    folder,
    resource_type: "image",
    overwrite: true,
  };

  if (options.square) {
    uploadOptions.transformation = [
      {
        width: options.squareSize || 1200,
        height: options.squareSize || 1200,
        crop: "fill",
        gravity: "auto",
      },
    ];
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve({
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
      });
    });

    stream.end(buffer);
  });
}

async function deleteAsset(publicId) {
  if (!publicId) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

module.exports = {
  uploadBuffer,
  deleteAsset,
};
