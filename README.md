# Flavouriz — Recipe Sharing & Cooking Community Platform

> **A Full-Stack College Web Development Project** adhering strictly to the prescribed academic syllabus. Built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express.js**, and atomic **JSON-file persistence** (zero external databases required).

---

## 🍳 Project Overview

**Flavouriz** is a modern, responsive, food-magazine style recipe-sharing platform and cooking community. It enables food lovers to discover global culinary treasures, publish their own kitchen creations with photos and step-by-step instructions, save dishes to a personal cookbook, rate and review recipes, discuss techniques via comments, and moderate community content through an administrative governance dashboard.

### Core Philosophy
* **Syllabus Integrity:** Built strictly using the core technologies taught in college web development modules (Semantic HTML5, CSS3/Tailwind, JavaScript ES6+, Node.js core modules, Express.js REST APIs, JWT, Bcrypt, Multer).
* **Zero Database Overhead:** No MongoDB, SQL, Firebase, or cloud database credentials are required. Application state persists reliably across server restarts using Node.js core `fs/promises` and `path` with sequential Promise write queues and atomic replacements.
* **Production-Grade UX:** Warm cream (`#F7F3EC`), forest green (`#263D2C`), and terracotta (`#D97A43`) design palette with full mobile responsiveness, skeleton loading states, friendly empty states, and interactive ingredient checklists.

---

## ✨ Features

* **Recipe Discovery & Search:**
  * Real-time search across titles, descriptions, cuisines, and ingredient keywords.
  * Multi-dimensional filtering by Category (Breakfast, Lunch, Dinner, Snacks, Desserts), Cuisine (Italian, Mexican, Indian, Mediterranean, Asian, American, French), and Difficulty (Easy, Medium, Hard).
  * Flexible sorting (Newest, Highest Rated, Most Popular, Fastest to Cook).
* **Interactive Recipe Details:**
  * High-resolution food photography.
  * Author attribution and chef biography.
  * Prep time, cook time, total time, and portion serving badges.
  * Interactive ingredient checklist (check off items as you cook).
  * Numbered, step-by-step cooking instructions.
  * Related dishes recommendation carousel.
* **Authentication & Authorization:**
  * Secure user registration and login with `bcryptjs` password hashing (10 salt rounds).
  * Stateless JSON Web Token (JWT) session management.
  * Role-based access control (`user` vs `admin`).
  * Strict ownership checks on recipes, reviews, and comments (users can only edit/delete their own creations).
* **Personal Digital Cookbook:**
  * One-click recipe bookmarking with instantaneous optimistic state and toast notifications.
  * Personal cookbook collection page with dedicated search.
* **Ratings & Community Reviews:**
  * 1-to-5 star rating system with live average calculation and review counts.
  * Duplicate review prevention (one review per user per recipe, with edit/delete capability).
  * Community question-and-answer discussion thread under every recipe.
* **Photo Uploads:**
  * Multipart recipe image uploads handled locally via `Multer` with MIME type filtering (JPEG, PNG, WEBP, GIF) and 5MB size limits.
  * Seamless online Image URL fallback.
* **Admin Moderation Dashboard:**
  * Platform analytics: total users, active accounts, total recipes, reviews, comments, and pending flags.
  * Recipe category distribution breakdown.
  * Community reports queue with action resolutions (dismiss, remove content, suspend user).
  * Feature/unfeature recipes on the homepage.
  * Manage user roles and active status.
* **Academic Viva & Learning Suite:**
  * Standalone executable examples for all Node.js Module 2 concepts (HTTP server, Streams, Buffers, EventEmitter, File System, Event Loop, CJS vs ESM).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript ES6+, React 18, Vite, Tailwind CSS 3, React Router v6, Lucide Icons, Fetch API |
| **Backend** | Node.js (v18+), Express.js 4, ES Modules (`import`/`export`), RESTful Architecture, Express Middleware |
| **Data Persistence** | Node.js Core File System (`fs/promises`), Path (`path`), Atomic JSON Storage Service |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Salted Hashing (`bcryptjs`), Cookie Parser |
| **File Uploads** | Multer (local disk storage with strict MIME/size filters) |
| **Testing** | Node.js Built-in Test Runner (`node --test`), Node Assert (`node:assert/strict`), Postman |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure **Node.js** (v18.0.0 or later) and **NPM** (v9+) are installed:
```bash
node -v
npm -v
```

### 2. Install Dependencies
Run from the root directory:
```bash
# Installs dependencies for both server and client
npm run setup
```

### 3. Initialize Sample Seed Data
Populate 14 realistic sample recipes across all meal categories and world cuisines, along with sample users and reviews:
```bash
npm run seed
```

### 4. Start Development Servers
Open two terminal windows:

* **Terminal 1 (Backend API on port 5000):**
  ```bash
  npm run server
  ```
  *Health check:* `http://localhost:5000/api/health`

* **Terminal 2 (Frontend Client on port 5173):**
  ```bash
  npm run client
  ```
  *Open in browser:* `http://localhost:5173`

---

## 🔑 Demo Accounts for Evaluation & Viva

The login page includes **one-click demo login buttons** to immediately explore different user roles:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@flavouriz.com` | `Admin@12345` | Platform moderation, feature dishes, user privileges, system analytics |
| **Chef** | `sarah@flavouriz.com` | `Chef@12345` | Recipe publishing, editing own recipes, reviews, cookbook |
| **Foodie** | `alex@flavouriz.com` | `Foodie@12345` | Browsing, recipe creation, comments, bookmarking |

---

## 🧪 Automated Testing

Execute the automated backend API test suite:
```bash
npm test
```
Verifies all key user journeys (public browsing, registration, duplicate checks, login verification, recipe CRUD, ownership authorization, admin route protection, and error handling).

---

## 📚 Syllabus Educational Examples (Module 2)

To demonstrate individual Node.js core module concepts during practical exams, run:

```bash
# Built-in Core HTTP Server (No Framework)
npm run demo:http

# Event Emitter with Custom Events
npm run demo:events

# File System & Path Modules (Promises vs Callbacks)
npm run demo:fs

# Streams & Transform Pipeline (Chunk-by-chunk processing)
npm run demo:stream

# Buffer & Binary Encoding (UTF-8, Hex, Base64)
npm run demo:buffer

# Event Loop Execution Phases (Microtasks vs Macrotasks)
npm run demo:event-loop

# Asynchronous Execution & Error Handling
npm run demo:async-error

# CommonJS vs ES Modules
npm run demo:modules:cjs
npm run demo:modules:esm
```

---

## 📖 Documentation Directory

* **[Syllabus Coverage Matrix](docs/SYLLABUS_COVERAGE.md):** Maps all four syllabus modules to project files with viva exam questions & answers.
* **[REST API Documentation](docs/API_DOCUMENTATION.md):** Complete specifications of all endpoints, parameters, request bodies, and HTTP status codes.
* **[Setup & Installation Guide](docs/SETUP_GUIDE.md):** Detailed environment configuration and developer debugging tips.
* **[Postman Testing Guide](docs/POSTMAN_TESTING.md):** Instructions for manual endpoint testing and verification.
* **[Postman Collection JSON](docs/flavouriz.postman_collection.json):** Ready-to-import Postman collection.

---

## 🛡️ License

This project is created for academic and educational purposes under the college Web Development syllabus guidelines.
