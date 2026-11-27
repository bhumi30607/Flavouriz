const { cloudinary, isConfigured } = require('../config/cloudinary');
const imageService = require('../services/imageService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.signature = asyncHandler(async (req, res) => {
  if (!isConfigured) throw new AppError('Image storage is not configured. Set Cloudinary credentials.', 503);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `flavouriz/users/${req.user.id}`;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );
  res.status(200).json({
    success: true,
    data: {
      timestamp,
      folder,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    },
  });
});

exports.upload = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) throw new AppError('Upload at least one image using the images field.', 400);
  const data = await imageService.uploadMany(files, `users/${req.user.id}`);
  res.status(201).json({ success: true, data });
});
