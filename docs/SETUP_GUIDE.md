# Flavouriz — Setup & Installation Guide

Welcome to **Flavouriz**. This guide details how to install, configure, run, and debug the complete full-stack recipe platform locally.

---

## 1. Prerequisites

Before getting started, make sure you have the following installed on your operating system:
* **Node.js:** v20.19.0 or higher (required by Mongoose 9). Check with:
  ```bash
  node -v
  ```
* **NPM:** v9.0.0 or higher. Check with:
  ```bash
  npm -v
  ```
* **Web Browser:** Google Chrome, Mozilla Firefox, or Microsoft Edge.
* **Database:** MongoDB 6+ locally or a MongoDB Atlas URI for the primary API in `backend/`.

---

## 2. Directory Structure Overview

```
FLAVOURIZ/
├── client/              # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, RecipeCard, etc.)
│   │   ├── context/     # AuthContext and ToastContext
│   │   ├── pages/       # 13 required pages
│   │   └── services/    # Axios API abstraction (api.js)
│   ├── package.json
│   └── vite.config.js   # Configured with proxy to :5002
│
├── backend/              # Primary Express + Mongoose + MongoDB API
│   ├── config/           # MongoDB and Cloudinary configuration
│   ├── controllers/      # API request handlers
│   ├── middleware/       # JWT auth, image upload, rate limit, errors
│   ├── models/           # Mongoose schemas and indexes
│   ├── routes/           # REST endpoint declarations
│   ├── services/         # Business logic and Cloudinary pipeline
│   └── server.js         # MongoDB API bootstrap
│
├── server/              # Node.js + Express.js Backend
│   ├── src/
│   │   ├── config/      # Environment and path configurations
│   │   ├── controllers/ # HTTP request handlers
│   │   ├── data/        # JSON storage files (users, recipes, reviews, etc.)
│   │   ├── middleware/  # Auth, Multer upload, Logger, Error handlers
│   │   ├── routes/      # Express Router declarations
│   │   ├── services/    # Business logic & atomic JSON storageService
│   │   ├── uploads/     # Multer recipe uploaded images
│   │   ├── app.js       # Express configuration
│   │   └── server.js    # HTTP server bootstrap & shutdown
│   ├── tests/           # Automated node:test API tests
│   └── package.json
│
├── learning-examples/   # Syllabus Module 2 educational runnable scripts
│   ├── http-server.js
│   ├── event-emitter.js
│   ├── file-system.js
│   ├── file-stream.js
│   ├── buffer-demo.js
│   └── module-examples/ # CJS vs ESM comparison
│
├── docs/                # Comprehensive documentation
│   ├── SYLLABUS_COVERAGE.md
│   ├── API_DOCUMENTATION.md
│   ├── SETUP_GUIDE.md
│   └── POSTMAN_TESTING.md
│
├── README.md            # High-level overview
└── package.json         # Master workspace scripts
```

---

## 3. Installation Steps

### Step 1: Install Dependencies
From the root folder, run:
```bash
# Installs the MongoDB API and React client
npm run setup

# Install only the legacy JSON API if you need it
npm --prefix server install
```

---

### Step 2: Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and replace the JWT placeholder. Development defaults use local MongoDB; for Atlas, provide your own `MONGODB_URI`. Cloudinary values are required only for persistent image uploads.

`backend/.env`:
```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/flavouriz_dev
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

### Step 3: Seed Optional Development Demo Data
The opt-in development seed imports sample recipes and creates demo accounts; it refuses to run in production:
```bash
npm --prefix backend run seed:demo
```

---

## 4. Starting the Application

You can start the backend and frontend in two separate terminals:

### Terminal 1: MongoDB API (Port 5002)
```bash
npm run backend:dev
# Or without auto-reload:
npm run backend
```
* API Health Check: `http://localhost:5002/api/health`

### Terminal 2: Frontend Client (Port 5173)
```bash
npm run client
```
* Open in browser: `http://localhost:5173`
* Vite proxies `/api` to the MongoDB API on port `5002`.

---

## 5. Demo Accounts (after optional seed)

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@flavouriz.com` | `Admin@12345` | Full moderation, feature dishes, user management, stats |
| **Chef** | `sarah@flavouriz.com` | `Chef@12345` | Recipe CRUD, reviews, favorites, profile |
| **Foodie** | `alex@flavouriz.com` | `Foodie@12345` | Recipe CRUD, comments, reviews, cookbook |

The login page provides quick-login buttons for the admin and chef accounts. Seeding is opt-in and intended only for a local development database.

---

## 6. Running Automated Tests

Run the backend integration suite (a MongoDB instance must be available):
```bash
npm test
```
It uses the separate `flavouriz_backend_test` database and drops that test database before and after the run.

---

## 7. Running Syllabus Module 2 Educational Demos

Each concept in the syllabus has a standalone runnable script:

```bash
# 1. Built-in Core HTTP Server (No Express)
npm run demo:http

# 2. EventEmitter Demonstration
npm run demo:events

# 3. File System & Path Modules (Promises vs Callbacks)
npm run demo:fs

# 4. Streams & Transform Pipeline
npm run demo:stream

# 5. Buffers & Binary Encoding
npm run demo:buffer

# 6. Event Loop Microtasks vs Macrotasks
npm run demo:event-loop

# 7. Asynchronous Error Handling
npm run demo:async-error

# 8. CommonJS vs ES Modules
npm run demo:modules:cjs
npm run demo:modules:esm
```

---

## 8. Debugging Guide

### Frontend Debugging:
1. Open Chrome DevTools (`F12` or `Ctrl + Shift + I`).
2. **Network Tab:** Filter by `Fetch/XHR` to inspect API request and response JSON payloads and headers.
3. **Console Tab:** View client-side errors and warnings.
4. **Application Tab:** Inspect `localStorage` for `flavouriz_token`.

### Backend Debugging:
1. **Console Request Logs:** The custom `requestLogger` outputs real-time requests with color-coded HTTP status codes and millisecond response times.
2. **Node.js Inspect Mode:** Start with `node --inspect server/src/server.js` and open `chrome://inspect` in Google Chrome to set breakpoints and inspect heap variables in real time.
