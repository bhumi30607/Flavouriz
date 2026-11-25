# Flavouriz — Web Development Syllabus Coverage Matrix

This document provides a comprehensive mapping between the prescribed college **Web Development Syllabus (Modules 1 to 4)** and the actual implementation files, architectures, and runnable learning examples in **Flavouriz**. Use this guide during practical examinations, project demonstrations, and viva voce.

---

## Module 1: Web Fundamentals (18 Hours, 15% Weightage)

| Syllabus Topic | Flavouriz Implementation File(s) | Practical Demonstration & Viva Explanation |
| :--- | :--- | :--- |
| **Semantic HTML5** | `client/index.html`<br>`client/src/components/Navbar.jsx`<br>`client/src/components/Footer.jsx`<br>`client/src/components/RecipeCard.jsx`<br>`client/src/pages/RecipeDetails.jsx` | Uses semantic tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<figure>`, `<button>`, `<form>`) rather than unsemantic `div` soup. Improves accessibility and SEO. |
| **CSS3 & Responsive Design** | `client/src/index.css`<br>`client/tailwind.config.js` | Uses modern CSS box model, flexbox, CSS Grid, media queries, mobile-first design, fluid typography, subtle box-shadows, and transitions. |
| **Git / GitHub Setup** | `.gitignore`<br>`README.md` | Proper repository structure ignoring `node_modules`, `.env`, build outputs (`dist/`), and runtime scratch caches. Commit guidelines and branch workflow documented. |
| **JavaScript Fundamentals** | Throughout `client/src/` & `server/src/` | Variables (`const`, `let`), data types (Objects, Arrays, Strings, Numbers, Booleans), functions, arrow functions, and array iteration methods (`map`, `filter`, `reduce`, `find`, `some`). |
| **DOM and Events** | `client/src/pages/RecipeDetails.jsx`<br>`client/src/components/SearchBar.jsx`<br>`client/src/components/Navbar.jsx` | Click events, form submit events, input change events, outside-click detection with `useEffect` and `useRef`, Escape key modal closing. |
| **ES6+ Modern Features** | Codebase-wide | Destructuring assignments (`const { title, cuisine } = req.body`), default parameters, template literals, spread/rest operators (`...formData`), enhanced object literals. |
| **Asynchronous JS & Fetch API** | `client/src/services/api.js`<br>`client/src/pages/Home.jsx`<br>`client/src/pages/Explore.jsx` | Promises, `async/await`, native `fetch()` calls to REST endpoints, `Promise.all()` for concurrent data loading, handling HTTP status codes. |
| **NPM & `package.json`** | Root `package.json`<br>`server/package.json`<br>`client/package.json` | Dependency management, scripts (`npm run setup`, `npm run seed`, `npm test`), semantic versioning (`^`, `~`). |

---

## Module 2: Node.js Fundamentals and Core Modules (20 Hours, 17% Weightage)

| Syllabus Topic | Flavouriz Implementation File(s) | Practical Demonstration & Viva Explanation |
| :--- | :--- | :--- |
| **Node.js Setup & REPL** | `README.md`<br>`docs/SETUP_GUIDE.md` | Verification of Node.js (v18+) runtime environment, executing interactive code in Node.js REPL. |
| **Global Objects & Process** | `learning-examples/event-loop-demo.js`<br>`server/src/config/index.js` | Demonstrating `process.env`, `process.uptime()`, `process.memoryUsage()`, `process.pid`, `process.version`, and `global`. |
| **Event Loop & Asynchronous Architecture** | `learning-examples/event-loop-demo.js` | Demonstrates the order of execution between Call Stack, `process.nextTick()` microtasks, Promise microtasks, and Event Loop macrotasks (`setTimeout`, `setImmediate`). |
| **CommonJS vs ES Modules** | `learning-examples/module-examples/commonjs-demo.cjs`<br>`learning-examples/module-examples/esmodule-demo.mjs` | Compares `require()` / `module.exports` vs static `import` / `export`, execution timing, Top-Level Await, and `__dirname` vs `import.meta.url`. |
| **File System (`fs`) & Path Modules** | `server/src/services/storageService.js`<br>`learning-examples/file-system.js` | Demonstrates `path.join()`, `path.resolve()`, `fs.mkdir()`, `fs.writeFile()`, `fs.readFile()`, `fs.appendFile()`, `fs.stat()`, and `fs.unlink()`. Atomic file write using temporary files and rename. |
| **Streams & Buffers** | `learning-examples/file-stream.js`<br>`learning-examples/buffer-demo.js` | Processing data in chunks via `createReadStream()`, `createWriteStream()`, `pipe()`, `pipeline()`, and `Transform` stream. Buffer creation (`Buffer.from`, `Buffer.alloc`), encoding (UTF-8, Base64, Hex). |
| **HTTP Module (Built-in Server)** | `learning-examples/http-server.js` | Building an HTTP web server from scratch without third-party frameworks using `http.createServer()`, parsing URLs, reading body streams, setting response headers and status codes. |
| **Events & EventEmitter** | `learning-examples/event-emitter.js` | Custom event creation with `EventEmitter`, subscribing with `.on()` and `.once()`, emitting events with payload data using `.emit()`, error event listeners. |
| **Error Handling in Node.js** | `server/src/middleware/errorMiddleware.js`<br>`learning-examples/async-error-demo.js` | Try/catch blocks, custom Error classes with HTTP status codes, Express centralized error handling, catching unhandled rejections. |

---

## Module 3: Frontend Development & Debugging (18 Hours, 15% Weightage)

| Syllabus Topic | Flavouriz Implementation File(s) | Practical Demonstration & Viva Explanation |
| :--- | :--- | :--- |
| **React Components & Architecture** | `client/src/components/*`<br>`client/src/pages/*` | Functional components, reusable component architecture, props passing, conditional rendering, list keys. |
| **React State & Hooks** | `client/src/context/AuthContext.jsx`<br>`client/src/context/ToastContext.jsx`<br>`client/src/pages/Explore.jsx` | `useState`, `useEffect`, `useContext`, `useCallback`, `useRef`, `useNavigate`, `useParams`, `useSearchParams`. Global authentication state management without heavy Redux. |
| **Tailwind CSS Styling** | `client/tailwind.config.js`<br>`client/src/index.css` | Utility-first CSS, custom palette (`#F7F3EC` cream, `#263D2C` forest green, `#D97A43` terracotta), custom shadows, responsive grid layouts (`sm:`, `md:`, `lg:`). |
| **Asynchronous Fetch API & JSON** | `client/src/services/api.js` | Native Fetch API client handling Bearer tokens, multipart FormData uploads, JSON serialization, and error propagation. |
| **UI/UX Polishing** | `client/src/components/LoadingSpinner.jsx`<br>`client/src/components/ErrorMessage.jsx`<br>`client/src/components/EmptyState.jsx` | Polished loading states with animated spinners, descriptive error alerts with retry triggers, friendly empty states with action links. |
| **Browser DevTools Debugging** | Documented in `docs/SETUP_GUIDE.md` | Network tab inspection of API payloads, Console logging, Elements tab CSS inspection, React Developer Tools component tree. |
| **Automated Testing** | `server/tests/api.test.js` | Running automated route and user journey tests with Node's native test runner (`node --test`). |

---

## Module 4: Express.js and REST APIs

| Syllabus Topic | Flavouriz Implementation File(s) | Practical Demonstration & Viva Explanation |
| :--- | :--- | :--- |
| **Express Setup & Server Structure** | `server/src/app.js`<br>`server/src/server.js` | Express application initialization, modular file structure, route mounting, port listening, graceful shutdown handling. |
| **Express Middleware** | `server/src/middleware/*` | Built-in middleware (`express.json()`, `express.urlencoded()`, `express.static()`), custom request logging (`loggerMiddleware.js`), CORS middleware, centralized error handler. |
| **Routing & Parameters** | `server/src/routes/*` | Express Router instances, route parameters (`/api/recipes/:id`), query parameters (`/api/recipes?search=pasta&category=Dinner`), HTTP method routing (GET, POST, PATCH, DELETE). |
| **REST API Design & CRUD** | `server/src/controllers/*`<br>`server/src/services/*` | Full CRUD endpoints for Recipes, Favorites, Reviews, Comments, Users, and Reports following RESTful conventions. |
| **HTTP Status Codes** | Throughout backend | `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `500` Internal Server Error. |
| **Authentication & Password Hashing** | `server/src/services/authService.js`<br>`server/src/utils/token.js` | Salted password hashing with `bcryptjs` (10 rounds). JSON Web Token (JWT) generation and verification with expiration (`7d`). |
| **Protected Routes & Role Authorization** | `server/src/middleware/authMiddleware.js`<br>`server/src/middleware/requireRole.js` | Token verification from `Authorization: Bearer <token>` or HTTP-only cookies. Role verification restricting admin moderation endpoints to users with `role: 'admin'`. Ownership verification preventing users from altering others' recipes or comments. |
| **File Uploads & Multer** | `server/src/middleware/uploadMiddleware.js` | Handling multipart/form-data with Multer, disk storage configuration, MIME type validation (JPEG, PNG, WEBP), file size restrictions (5MB), unique filename generation. |
| **API Testing with Postman** | `docs/POSTMAN_TESTING.md`<br>`docs/flavouriz.postman_collection.json` | Comprehensive Postman test collection with environment variables covering authentication, recipe CRUD, reviews, favorites, and error responses. |

---

## Viva Voce Cheat Sheet: Top 10 Questions & Answers

1. **Q: Why is there no MongoDB or SQL database in this project?**
   * **A:** In strict accordance with our college Web Development syllabus, database technologies (MongoDB/Mongoose/SQL) are not prescribed. We implemented a robust JSON-file persistence layer using Node.js core `fs/promises` and `path` with sequential Promise write queues and atomic writes to prevent data corruption.

2. **Q: How does the application prevent race conditions during JSON file writes?**
   * **A:** In `server/src/services/storageService.js`, write operations are chained onto a per-collection Promise queue (`writeQueues.set(collectionName, writeOperation)`). Furthermore, files are written to a `.tmp` file first and then atomically replaced using `fs.rename()`.

3. **Q: How is authentication implemented without sessions?**
   * **A:** We use stateless JSON Web Tokens (JWT). Upon registration or login, the server hashes the password with `bcryptjs` and signs a JWT containing `{ id, email, role, username }`. The client sends this token in the `Authorization: Bearer <token>` header for protected endpoints.

4. **Q: What is the difference between CommonJS and ES Modules?**
   * **A:** CommonJS uses `require()` and `module.exports` and loads synchronously at runtime; ES Modules use static `import` / `export`, support top-level await, and are standardized across Node.js and browsers. We provide executable comparisons in `learning-examples/module-examples/`.

5. **Q: What does the Event Loop do in Node.js?**
   * **A:** The Event Loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded by offloading operations to the system kernel. It processes microtasks (`process.nextTick`, Promises) before moving through phases (Timers, I/O callbacks, Idle/Prepare, Poll, Check `setImmediate`, Close callbacks). Demonstrated in `learning-examples/event-loop-demo.js`.

6. **Q: What is a Buffer in Node.js?**
   * **A:** A Buffer is a raw chunk of binary memory allocated outside the V8 JavaScript engine heap. Buffers are used when dealing with TCP streams, reading binary image files in Multer, or network packets. Demonstrated in `learning-examples/buffer-demo.js`.

7. **Q: How are file uploads secured?**
   * **A:** Multer inspects the MIME type to allow only `image/jpeg`, `image/png`, `image/webp`, and `image/gif`. It enforces a 5MB size limit (`limits: { fileSize: 5242880 }`) and generates random hex filenames to prevent path traversal or file overwrites.

8. **Q: How is ownership authorization enforced?**
   * **A:** For editing or deleting recipes, reviews, and comments, the controller compares `String(item.authorId) === String(req.user.id)`. If the requesting user is neither the owner nor an administrator (`req.user.role === 'admin'`), the server immediately rejects the request with HTTP `403 Forbidden`.

9. **Q: What is the purpose of `Promise.all`?**
   * **A:** `Promise.all` takes an iterable of promises and returns a single promise that resolves when all input promises have resolved. In `client/src/pages/Home.jsx`, we use it to load featured, popular, and latest recipes concurrently rather than sequentially, reducing network latency.

10. **Q: How are password hashes kept secure?**
    * **A:** Passwords are never stored in plaintext; they are salted and hashed using `bcryptjs` with 10 rounds of computational salt. Furthermore, in `server/src/services/authService.js`, the `sanitizeUser()` helper strips the `passwordHash` field before any user object is returned in API responses.
