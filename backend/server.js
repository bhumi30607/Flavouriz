require('dotenv').config();

const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const { connectDatabase } = require('./config/db');

async function startServer() {
  if (process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.');
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'local-development-secret-change-before-deploying';
  }

  await connectDatabase();
  const port = Number(process.env.PORT) || 5002;
  const server = http.createServer(app);

  server.on('error', async (error) => {
    console.error(`Flavouriz API failed to listen on port ${port}: ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  server.listen(port, () => {
    console.log(`Flavouriz MongoDB API listening on http://localhost:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; closing Flavouriz API.`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('Unable to start Flavouriz backend:', error.message);
  process.exitCode = 1;
});
