# Flavouriz — Postman & API Testing Guide

This guide provides step-by-step instructions to test all **Flavouriz** REST API endpoints using **Postman**, **Insomnia**, or **cURL**.

A complete, importable Postman collection is provided in `docs/flavouriz.postman_collection.json`.

---

## 1. Setup Environment in Postman

1. Open Postman.
2. Create an Environment named **Flavouriz Local** with the following variables:
   * `baseUrl`: `http://localhost:5000/api`
   * `token`: *(leave empty, will be populated on login)*

---

## 2. Test Execution Sequence

### Phase 1: Health & Diagnostics
* **Request:** `GET {{baseUrl}}/health`
* **Expected Status:** `200 OK`
* **Verification:** Check `status: "online"` and Node version.

---

### Phase 2: User Registration & Authentication
#### Request 2.1: Register New User
* **Method:** `POST`
* **URL:** `{{baseUrl}}/auth/register`
* **Body (raw JSON):**
  ```json
  {
    "name": "Chef Leonardo",
    "username": "leo_cooks",
    "email": "leo@flavouriz.com",
    "password": "Password@123"
  }
  ```
* **Expected Status:** `201 Created`
* **Tests Script in Postman:**
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  pm.test("Token returned and saved", function () {
      const jsonData = pm.response.json();
      pm.environment.set("token", jsonData.data.token);
  });
  ```

#### Request 2.2: Duplicate Email Rejection
* Send the exact same request again.
* **Expected Status:** `409 Conflict`
* **Message:** `"An account with this email already exists."`

#### Request 2.3: Login with Admin Account
* **Method:** `POST`
* **URL:** `{{baseUrl}}/auth/login`
* **Body:**
  ```json
  {
    "email": "admin@flavouriz.com",
    "password": "Admin@12345"
  }
  ```
* **Expected Status:** `200 OK`
* Save the returned token as `adminToken`.

---

### Phase 3: Recipe Discovery & Filtering
#### Request 3.1: Get All Recipes
* **Method:** `GET`
* **URL:** `{{baseUrl}}/recipes?limit=6&page=1`
* **Expected Status:** `200 OK`
* **Verification:** Response contains `data` array and `pagination` metadata.

#### Request 3.2: Filter by Cuisine & Category
* **Method:** `GET`
* **URL:** `{{baseUrl}}/recipes?cuisine=Italian&category=Dinner`
* **Expected Status:** `200 OK`
* **Verification:** All returned recipes match Italian cuisine.

#### Request 3.3: Keyword Search
* **Method:** `GET`
* **URL:** `{{baseUrl}}/recipes?search=carbonara`
* **Expected Status:** `200 OK`
* **Verification:** Carbonara recipe returned.

---

### Phase 4: Recipe CRUD & Ownership Authorization
#### Request 4.1: Create Recipe (Authenticated)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/recipes`
* **Headers:** `Authorization: Bearer {{token}}`
* **Body (JSON):**
  ```json
  {
    "title": "Avocado Tartine with Poached Egg",
    "description": "Crusty sourdough toast topped with seasoned smashed avocado and a poached egg.",
    "category": "Breakfast",
    "cuisine": "French",
    "difficulty": "Easy",
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 5,
    "servings": 2,
    "ingredients": [
      { "name": "Sourdough bread", "amount": "2", "unit": "slices" },
      { "name": "Haas avocado", "amount": "1", "unit": "ripe" },
      { "name": "Eggs", "amount": "2", "unit": "large" }
    ],
    "instructions": [
      { "stepNumber": 1, "instruction": "Toast sourdough slices until golden." },
      { "stepNumber": 2, "instruction": "Mash avocado with sea salt and spread over toast." },
      { "stepNumber": 3, "instruction": "Top with soft poached egg." }
    ]
  }
  ```
* **Expected Status:** `201 Created`
* Save the returned recipe ID as `myRecipeId`.

#### Request 4.2: Unauthorized Update (Forbidden)
* Try updating someone else's recipe (e.g. `recipe-001`) with regular user `token`.
* **Method:** `PATCH`
* **URL:** `{{baseUrl}}/recipes/recipe-001`
* **Headers:** `Authorization: Bearer {{token}}`
* **Body:** `{ "title": "Tampered Title" }`
* **Expected Status:** `403 Forbidden`
* **Message:** `"Forbidden: You can only edit your own recipes."`

---

### Phase 5: Cookbook, Reviews & Comments
#### Request 5.1: Add to Cookbook
* **Method:** `POST`
* **URL:** `{{baseUrl}}/favorites/recipe-002`
* **Headers:** `Authorization: Bearer {{token}}`
* **Expected Status:** `200 OK`
* **Response:** `{ "success": true, "message": "Recipe saved to cookbook." }`

#### Request 5.2: Submit 5-Star Review
* **Method:** `POST`
* **URL:** `{{baseUrl}}/recipes/recipe-002/reviews`
* **Headers:** `Authorization: Bearer {{token}}`
* **Body:**
  ```json
  {
    "rating": 5,
    "comment": "Made this for dinner tonight! Incredible creaminess without using heavy cream."
  }
  ```
* **Expected Status:** `201 Created`

#### Request 5.3: Duplicate Review Rejection
* Send the same review again.
* **Expected Status:** `409 Conflict`
* **Message:** `"You have already submitted a review for this recipe."`

---

### Phase 6: Admin Dashboard & Governance
#### Request 6.1: Non-Admin Access Rejection
* **Method:** `GET`
* **URL:** `{{baseUrl}}/admin/stats`
* **Headers:** `Authorization: Bearer {{token}}` *(regular user)*
* **Expected Status:** `403 Forbidden`

#### Request 6.2: Admin Access Granted
* **Method:** `GET`
* **URL:** `{{baseUrl}}/admin/stats`
* **Headers:** `Authorization: Bearer {{adminToken}}`
* **Expected Status:** `200 OK`
* **Verification:** Returns user counts, category breakdown, and pending report stats.
