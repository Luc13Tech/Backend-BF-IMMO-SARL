const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload un buffer d'image vers Cloudinary dans un dossier dédié à BF IMMO.
 * @param {Buffer} fileBuffer - le buffer du fichier reçu via multer (memoryStorage)
 * @param {string} folder - sous-dossier Cloudinary (ex: "properties", "services", "content")
 * @returns {Promise<{url: string, publicId: string}>}
 */
function uploadBufferToCloudinary(fileBuffer, folder = 'misc') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `bfimmo/${folder}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Supprime une image Cloudinary à partir de son publicId.
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[Cloudinary] Échec de suppression :', err.message);
  }
}

module.exports = { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };
