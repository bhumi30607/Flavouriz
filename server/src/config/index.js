import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Determine directory names for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'flavouriz_development_only_jwt_secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedClientUrls: (process.env.ALLOWED_CLIENT_URLS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  dataDir: path.resolve(__dirname, '../data'),
  uploadsDir: path.resolve(__dirname, '../uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
};
