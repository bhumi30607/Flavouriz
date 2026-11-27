const sharp = require('sharp');
const AppError = require('../utils/AppError');
const { cloudinary, isConfigured } = require('../config/cloudinary');

async function uploadImage(file, folder = 'recipes') {
  if (!file) return null;

  let metadata;
  try {
    metadata = await sharp(file.buffer, { failOn: 'error' }).metadata();
  } catch {
    throw new AppError('Uploaded file content is not a valid image.', 400);
  }
  const formatByMime = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  if (formatByMime[file.mimetype] !== metadata.format) {
    throw new AppError('The uploaded file is not a supported image.', 400);
  }
  if (!isConfigured) throw new AppError('Image storage is not configured. Set Cloudinary credentials.', 503);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: `flavouriz/${folder}`,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    }, (error, result) => {
      if (error) return reject(new AppError('Image upload failed.', 502));
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(file.buffer);
  });
}

async function uploadMany(files = [], folder) {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

async function deleteImage(publicId) {
  if (!publicId || !isConfigured) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

module.exports = { uploadImage, uploadMany, deleteImage };
