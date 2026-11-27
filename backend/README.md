# Flavouriz MongoDB API

The primary API for the existing React client. It is an Express 5/CommonJS service backed by Mongoose and MongoDB. Recipe responses preserve the frontend's `id`, `authorId`, `imageUrl`, `averageRating`, and `reviewsCount` fields.

## Local setup

1. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
2. Keep the local MongoDB URI for development, or replace `MONGODB_URI` with an Atlas URI.
3. Configure the three Cloudinary variables to enable uploads; without them upload endpoints return `503` and do not pretend to store files.
4. From the repository root, run:

   ```powershell
   npm run setup
   npm run backend:dev
   npm run client
   ```

The API listens on port `5002`; Vite proxies `/api` requests to it. Run `npm --prefix backend run seed:demo` to import the existing sample recipes and add local demo accounts. The seed command is disabled when `NODE_ENV=production`.

## API routes

All responses use `{ "success": true, "data": ... }` on success and `{ "success": false, "error": "..." }` on failure.

| Area | Routes |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Recipes | `GET/POST /api/recipes`, `GET/PATCH/DELETE /api/recipes/:id`, `GET /api/users/me/recipes` |
| Reviews | `GET/POST /api/recipes/:id/reviews`, `PATCH/DELETE /api/reviews/:id`, `POST /api/reviews/:id/helpful` |
| Comments | `GET/POST /api/recipes/:id/comments`, `PATCH/DELETE /api/comments/:id` |
| Favorites | `GET /api/favorites`, `POST/DELETE /api/favorites/:recipeId` |
| Profiles/social | `GET /api/users/:id`, `PATCH /api/users/me`, `POST/DELETE /api/users/:id/follow`, `GET /api/users/:id/followers`, `GET /api/users/:id/following` |
| Feed | `GET /api/feed?cursor=...&limit=...` |
| Collections | `GET/POST /api/collections`, `PATCH/DELETE /api/collections/:id`, `POST/DELETE /api/collections/:id/recipes/:recipeId`, `POST /api/collections/shopping-list` |
| Moderation | `POST /api/reports`; admin routes under `/api/admin` |
| Images | `POST /api/uploads/signature`, `POST /api/uploads`; recipe cover and step images are accepted on recipe multipart requests |

Recipe discovery accepts `search`, `category`, `cuisine`, `diet`, `difficulty`, `maxTime`, `featured`, `sort`, `page`, `limit`, and `cursor`. Cursor requests use a stable keyset and return `nextCursor` and `hasMore`; `page` remains supported for the existing Explore UI.

Run the integration suite with `npm --prefix backend test`. It uses `MONGODB_TEST_URI` when set, or the local `flavouriz_backend_test` database by default, and clears that test database before and after the suite.
