# Flavouriz — Setup & Installation Guide

Welcome to **Flavouriz**. This guide details how to install, configure, run, and debug the complete full-stack recipe platform locally.

---

## 1. Prerequisites

Before getting started, make sure you have the following installed on your operating system:
* **Node.js:** v18.0.0 or higher (v20+ recommended). Check with:
  ```bash
  node -v
  ```
* **NPM:** v9.0.0 or higher. Check with:
  ```bash
  npm -v
  ```
* **Web Browser:** Google Chrome, Mozilla Firefox, or Microsoft Edge.
* **Database Requirement:** None! In strict accordance with the syllabus, this project requires **no external database engine** (no MongoDB, MySQL, Postgres, or Firebase). All data persists cleanly using Node.js core `fs/promises` inside `server/src/data/*.json`.

---

## 2. Directory Structure Overview

```
FLAVOURIZ/
├── client/              # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, RecipeCard, etc.)
│   │   ├── context/     # AuthContext and ToastContext
│   │   ├── pages/       # 13 required pages
│   │   └── services/    # Fetch API abstraction (api.js)
│   ├── package.json
│   └── vite.config.js   # Configured with proxy to :5000
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
# Option A: One-step automated setup
npm run setup

# Option B: Manual per-folder install
cd server && npm install
cd ../client && npm install
```

---

### Step 2: Configure Environment Variables

The server comes with `.env.example`. A `.env` file is generated automatically with sensible development defaults:

`server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=flavouriz_super_secret_jwt_key_2026_exam_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
DATA_DIR=./src/data
UPLOADS_DIR=./src/uploads
MAX_FILE_SIZE=5242880
```

---

### Step 3: Populate Sample Seed Data
Initialize the 14 realistic sample recipes, demo users, reviews, and comments:
```bash
npm run seed
```
Output will confirm:
```
✅ Flavouriz database seeded successfully!
   Users:     3 (1 admin, 2 chefs/foodies)
   Recipes:   14 across all categories & cuisines
   Reviews:   4
   Comments:  2
   Favorites: 4
```

---

## 4. Starting the Application

You can start the backend and frontend in two separate terminals:

### Terminal 1: Backend Server (Port 5000)
```bash
npm run server
# Or with auto-reload during development:
npm run server:dev
```
* API Health Check: `http://localhost:5000/api/health`

### Terminal 2: Frontend Client (Port 5173)
```bash
npm run client
```
* Open in browser: `http://localhost:5173`

---

## 5. Ready-to-Use Demo Accounts (Viva & Evaluation)

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@flavouriz.com` | `Admin@12345` | Full moderation, feature dishes, user management, stats |
| **Chef** | `sarah@flavouriz.com` | `Chef@12345` | Recipe CRUD, reviews, favorites, profile |
| **Foodie** | `alex@flavouriz.com` | `Foodie@12345` | Recipe CRUD, comments, reviews, cookbook |

*Note: The login page provides **1-click quick login buttons** so examiners can switch personas instantly.*

---

## 6. Running Automated Tests

Run the built-in test suite:
```bash
npm test
```
All route journeys will execute against an in-memory test instance without modifying production seed data.

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
