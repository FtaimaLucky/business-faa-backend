require("dotenv").config();
const { env } = require("./env.config");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SCERECT,
  secure: true,
});

const cloudinaryFileUpload = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("localFilePath is required");
  }

  const result = await cloudinary.uploader.upload(localFilePath, {
    resource_type: "image",
  });

  const optimizedUrl = cloudinary.url(result.public_id, {
    fetch_format: "auto",
    quality: "auto",
    transformation: [{ width: 1024, crop: "limit" }],
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    optimized_url: optimizedUrl,
  };
};

module.exports = { cloudinaryFileUpload, cloudinary };
