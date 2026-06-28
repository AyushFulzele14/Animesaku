const cloudinary = require("../config/cloudinary");

const uploadImageBuffer = async (buffer, folder = "anime-store") => {
  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  return cloudinary.uploader.upload(base64, {
    folder,
    fetch_format: "auto",
    quality: "auto:good",
    resource_type: "image",
  });
};

const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImageBuffer, deleteImage };
