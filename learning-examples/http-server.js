/**
 * SYLLABUS MODULE 2: Node.js Core HTTP Module Demonstration
 *
 * Concepts Demonstrated:
 * 1. Creating an HTTP server without Express using Node.js built-in 'http' module.
 * 2. Parsing request URL and HTTP methods (GET, POST).
 * 3. Handling query strings and request headers.
 * 4. Writing response headers with Content-Type and custom headers.
 * 5. Sending HTTP status codes (200, 404, 405).
 * 6. Reading request body streams chunk by chunk using Buffer.
 */

import http from 'http';
import { URL } from 'url';

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Construct parsed URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`[HTTP Core Server] Incoming Request: ${method} ${pathname}`);

  // Set default JSON response headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Powered-By', 'Node.js Core HTTP Module (No Framework)');

  // Route 1: GET /
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        message: 'Welcome to the Node.js Core HTTP Server demonstration!',
        syllabus: 'Module 2: Node.js Fundamentals and Core Modules',
        timestamp: new Date().toISOString(),
        endpoints: ['/api/recipes', '/api/info', '/echo (POST)'],
      })
    );
    return;
  }

  // Route 2: GET /api/recipes
  if (pathname === '/api/recipes' && method === 'GET') {
    const cuisine = parsedUrl.searchParams.get('cuisine') || 'All';
    res.writeHead(200);
    res.end(
      JSON.stringify({
        source: 'Core HTTP Server',
        filteredCuisine: cuisine,
        recipes: [
          { id: 1, name: 'Margherita Pizza', cuisine: 'Italian', difficulty: 'Easy' },
          { id: 2, name: 'Fish Tacos', cuisine: 'Mexican', difficulty: 'Medium' },
        ],
      })
    );
    return;
  }

  // Route 3: POST /echo (Demonstrates reading streaming request body)
  if (pathname === '/echo' && method === 'POST') {
    const chunks = [];

    // 'data' event fires as TCP packets arrive
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // 'end' event fires when client finishes sending
    req.on('end', () => {
      const rawBody = Buffer.concat(chunks).toString();
      res.writeHead(200);
      res.end(
        JSON.stringify({
          status: 'success',
          message: 'Received stream chunks and assembled payload via Buffer.concat()',
          receivedBody: rawBody ? JSON.parse(rawBody || '{}') : {},
          receivedBytes: Buffer.byteLength(rawBody),
        })
      );
    });
    return;
  }

  // 404 Not Found fallback
  res.writeHead(404);
  res.end(
    JSON.stringify({
      error: 'Not Found',
      message: `The route ${method} ${pathname} does not exist on this HTTP server.`,
    })
  );
});

// Start listening if run directly
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Node.js Core HTTP Server running at http://localhost:${PORT}`);
  console.log(` Try visiting: http://localhost:${PORT}/api/recipes?cuisine=Italian`);
  console.log(` Press Ctrl+C to stop.`);
  console.log(`======================================================\n`);
});

// Auto-close after 5 seconds if run in non-interactive batch test mode
if (process.env.TEST_MODE === 'true') {
  setTimeout(() => server.close(), 1000);
}
