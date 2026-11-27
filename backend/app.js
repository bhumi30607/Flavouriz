require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = new Set([
  process.env.CLIENT_URL || 'http://localhost:5173',
  ...(process.env.ALLOWED_CLIENT_URLS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    const error = new Error('Origin not allowed by CORS.');
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    status: ready ? 'online' : 'starting',
    appName: 'Flavouriz Backend API',
    database: ready ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/feed', require('./routes/feedRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});
app.use(errorHandler);

module.exports = app;
