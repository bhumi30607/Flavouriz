# Flavouriz REST API Documentation

The active MongoDB API is implemented in `backend/` and listens on port `5002` by default. It preserves the frontend's `{ success, data }` response envelope and legacy recipe fields (`imageUrl`, `averageRating`, `reviewsCount`, `authorId`). The original JSON API under `server/` remains available on port `5000`.

This document describes the Flavouriz REST API endpoints used by the React client.

- **Base URL:** `http://localhost:5002/api`
- **Content-Type:** `application/json` (or `multipart/form-data` for file uploads)
- **Authentication:** `Authorization: Bearer <jwt_token>` header or `token` cookie

---

## 1. System Health & Diagnostics

### `GET /health`
* **Access:** Public
* **Description:** Check server operational status, uptime, and Node.js runtime version.
* **Response (200 OK):**
```json
{
  "status": "online",
  "appName": "Flavouriz Backend API",
  "version": "1.0.0",
  "timestamp": "2026-10-25T11:00:00.000Z",
  "uptimeSeconds": 360,
  "nodeVersion": "v25.1.0"
}
```

---

## 2. Authentication Endpoints

### `POST /auth/register`
* **Access:** Public
* **Description:** Create a new user account. Returns sanitized user object and JWT token.
* **Request Body:**
```json
{
  "name": "Maria Silva",
  "username": "maria_cooks",
  "email": "maria@example.com",
  "password": "Password@123",
  "bio": "Passionate home cook exploring Mediterranean flavors."
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": "c1f71dfc-76d7-4ebc-a299-1582ceef8672",
      "name": "Maria Silva",
      "username": "maria_cooks",
      "email": "maria@example.com",
      "role": "user",
      "bio": "Passionate home cook exploring Mediterranean flavors.",
      "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=maria_cooks",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
* **Error Responses:**
  * `400 Bad Request` — Missing required fields or password too short.
  * `409 Conflict` — Email or username already taken.

---

### `POST /auth/login`
* **Access:** Public
* **Description:** Authenticate using email and password.
* **Request Body:**
```json
{
  "email": "admin@flavouriz.com",
  "password": "Admin@12345"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": {
      "id": "user-admin-001",
      "name": "Chef Alessandro Rossi",
      "username": "admin",
      "email": "admin@flavouriz.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
* **Error Responses:**
  * `401 Unauthorized` — Invalid email or password.
  * `403 Forbidden` — Account deactivated.

---

### `GET /auth/me`
* **Access:** Authenticated (Bearer Token required)
* **Description:** Retrieve current authenticated user profile.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-admin-001",
    "name": "Chef Alessandro Rossi",
    "username": "admin",
    "email": "admin@flavouriz.com",
    "role": "admin",
    "bio": "Executive Chef at Flavouriz.",
    "avatar": "https://images.unsplash.com/..."
  }
}
```
* **Error Responses:**
  * `401 Unauthorized` — Missing or expired token.

---

## 3. Recipe Endpoints

### `GET /recipes`
* **Access:** Public (Optional Auth to flag `isFavorited`)
* **Query Parameters:**
  * `search` (string) — Search title, description, ingredients, or cuisine.
  * `category` (string) — Filter by `Breakfast`, `Lunch`, `Dinner`, `Snacks`, `Desserts`.
  * `cuisine` (string) — Filter by `Italian`, `Mexican`, `Indian`, `Mediterranean`, `Asian`, `French`, `American`.
  * `difficulty` (string) — Filter by `Easy`, `Medium`, `Hard`.
  * `sort` (string) — Sort by `newest`, `highest_rated`, `popular`, `quickest`, `oldest`.
  * `featured` (boolean string: `true`) — Filter featured recipes.
  * `authorId` (string) — Filter recipes by author.
  * `page` (number, default: 1) — Page number.
  * `limit` (number, default: 9) — Results per page.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "recipe-002",
      "title": "Authentic Roman Spaghetti alla Carbonara",
      "description": "The definitive Italian classic...",
      "category": "Dinner",
      "cuisine": "Italian",
      "difficulty": "Medium",
      "prepTimeMinutes": 10,
      "cookTimeMinutes": 15,
      "servings": 2,
      "imageUrl": "https://images.unsplash.com/...",
      "authorId": "user-admin-001",
      "authorName": "Chef Alessandro Rossi",
      "averageRating": 5.0,
      "reviewsCount": 5,
      "favoritesCount": 24,
      "isFeatured": true
    }
  ],
  "pagination": {
    "total": 14,
    "page": 1,
    "limit": 9,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### `GET /recipes/:id`
* **Access:** Public (Optional Auth)
* **Description:** Retrieve single recipe details, author information, ingredients, instructions, and related dishes.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "recipe-002",
    "title": "Authentic Roman Spaghetti alla Carbonara",
    "ingredients": [
      { "id": 1, "name": "Bronze-cut spaghetti", "amount": "250", "unit": "g" }
    ],
    "instructions": [
      { "stepNumber": 1, "instruction": "Boil pasta in salted water..." }
    ],
    "author": {
      "id": "user-admin-001",
      "name": "Chef Alessandro Rossi",
      "username": "admin",
      "avatar": "https://..."
    },
    "isFavorited": false,
    "userReview": null,
    "relatedRecipes": [...]
  }
}
```
* **Error Responses:**
  * `404 Not Found` — Recipe with given ID does not exist.

---

### `POST /recipes`
* **Access:** Authenticated
* **Content-Type:** `multipart/form-data` or `application/json`
* **Description:** Create a new recipe. Supports image upload via Multer.
* **Request Fields:**
  * `title` (string, required)
  * `description` (string, required)
  * `category` (string, required)
  * `cuisine` (string, required)
  * `difficulty` (string, required)
  * `prepTimeMinutes` (number)
  * `cookTimeMinutes` (number)
  * `servings` (number)
  * `ingredients` (JSON array or stringified JSON)
  * `instructions` (JSON array or stringified JSON)
  * `image` (file, optional)
  * `imageUrl` (string, optional)
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Recipe created successfully.",
  "data": {
    "id": "e96f13b8-80e2-4ea5-802c-49938e55e2d1",
    "title": "Lemon Herb Roast Chicken",
    "authorId": "user-chef-002",
    "averageRating": 0,
    "reviewsCount": 0
  }
}
```

---

### `PATCH /recipes/:id`
* **Access:** Authenticated (Owner or Admin only)
* **Description:** Update an existing recipe.
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recipe updated successfully.",
  "data": { "id": "recipe-001", "prepTimeMinutes": 20 }
}
```
* **Error Responses:**
  * `403 Forbidden` — Requesting user is neither author nor admin.
  * `404 Not Found` — Recipe not found.

---

### `DELETE /recipes/:id`
* **Access:** Authenticated (Owner or Admin only)
* **Description:** Delete recipe along with cascading reviews and favorites.
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recipe and related items deleted successfully."
}
```

---

## 4. Favorites & Cookbook Endpoints

### `GET /favorites`
* **Access:** Authenticated
* **Description:** Get all recipes saved to the current user's cookbook.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [ { "id": "recipe-001", "title": "Artisan Sourdough French Toast..." } ]
}
```

### `POST /favorites/:recipeId`
* **Access:** Authenticated
* **Description:** Add recipe to cookbook.
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recipe saved to cookbook.",
  "data": { "isFavorited": true, "favoritesCount": 13 }
}
```

### `DELETE /favorites/:recipeId`
* **Access:** Authenticated
* **Description:** Remove recipe from cookbook.
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recipe removed from cookbook.",
  "data": { "isFavorited": false, "favoritesCount": 12 }
}
```

---

## 5. Reviews Endpoints

### `GET /recipes/:id/reviews`
* **Access:** Public
* **Description:** Retrieve all reviews and ratings for a recipe.

### `POST /recipes/:id/reviews`
* **Access:** Authenticated
* **Description:** Submit rating (1 to 5 stars) and review. Rejects duplicate review from same user.
* **Request Body:**
```json
{
  "rating": 5,
  "comment": "Incredible texture! Followed instructions to the letter."
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Review submitted successfully.",
  "data": {
    "review": { "id": "rev-101", "rating": 5, "comment": "..." },
    "recipeStats": { "averageRating": 4.9, "reviewsCount": 6 }
  }
}
```
* **Error Responses:**
  * `409 Conflict` — User has already reviewed this recipe.

### `PATCH /reviews/:id`
* **Access:** Authenticated (Owner or Admin)
* **Description:** Update review rating or comment text.

### `DELETE /reviews/:id`
* **Access:** Authenticated (Owner or Admin)
* **Description:** Remove review and recalculate average rating.

---

## 6. Comments Endpoints

### `GET /recipes/:id/comments`
* **Access:** Public
* **Description:** Retrieve discussion comments for a recipe.

### `POST /recipes/:id/comments`
* **Access:** Authenticated
* **Request Body:** `{ "content": "Can I replace white flour with almond flour?" }`

### `PATCH /comments/:id`
* **Access:** Authenticated (Owner or Admin)
* **Request Body:** `{ "content": "Updated comment text." }`

### `DELETE /comments/:id`
* **Access:** Authenticated (Owner or Admin)

---

## 7. Reports & Moderation Endpoints

### `POST /reports`
* **Access:** Authenticated
* **Request Body:**
```json
{
  "targetType": "recipe",
  "targetId": "recipe-001",
  "reason": "inappropriate",
  "details": "Recipe description contains promotional external spam link."
}
```

### `GET /admin/stats`
* **Access:** Authenticated Admin only (`role: admin`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 3,
    "activeUsers": 3,
    "totalRecipes": 14,
    "featuredRecipes": 6,
    "totalReviews": 4,
    "totalComments": 2,
    "pendingReports": 0,
    "categoryBreakdown": { "Breakfast": 3, "Dinner": 5, "Lunch": 2, "Snacks": 2, "Desserts": 2 }
  }
}
```

### `GET /admin/reports`
* **Access:** Authenticated Admin only

### `PATCH /admin/reports/:id`
* **Access:** Authenticated Admin only
* **Request Body:**
```json
{
  "action": "delete_content",
  "notes": "Spam confirmed and removed."
}
```

### `PATCH /admin/recipes/:id/featured`
* **Access:** Authenticated Admin only
* **Description:** Toggles recipe featured status on homepage.

### `PATCH /admin/users/:id/role`
* **Access:** Authenticated Admin only
* **Request Body:** `{ "role": "admin" }`

### `PATCH /admin/users/:id/status`
* **Access:** Authenticated Admin only
* **Description:** Toggles user active / suspended status.
