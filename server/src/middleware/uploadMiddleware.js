import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';

// Allowed image mime types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeName = `recipe-${Date.now()}-${randomHex}${ext}`;
    cb(null, safeName);
  },
});

// File filter validation
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

export const uploadRecipeImage = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize, // 5MB
  },
  fileFilter,
});
