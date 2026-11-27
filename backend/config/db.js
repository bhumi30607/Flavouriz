const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI ||
    (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/flavouriz_dev');

  if (!uri) {
    throw new Error('MONGODB_URI is required in production.');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = { connectDatabase };
