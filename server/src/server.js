import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { initStorage } from './services/storageService.js';

async function startServer() {
  try {
    // Step 1: Ensure JSON storage files and upload folders are initialized safely
    await initStorage();
    console.log('[Storage] JSON storage layer initialized successfully.');

    // Step 2: Create HTTP server using Node.js core http module
    const server = http.createServer(app);

    server.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(` Flavouriz Server running in ${config.nodeEnv} mode`);
      console.log(` Local API:      http://localhost:${config.port}/api`);
      console.log(` Health Check:   http://localhost:${config.port}/api/health`);
      console.log(` Uploads Folder: ${config.uploadsDir}`);
      console.log(` Data Folder:    ${config.dataDir}`);
      console.log(`=======================================================`);
    });

    // Handle graceful shutdown
    const handleShutdown = (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down Flavouriz server...`);
      server.close(() => {
        console.log('HTTP server closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
