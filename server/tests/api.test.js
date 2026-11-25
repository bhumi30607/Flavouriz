import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import { initStorage, readAll, writeAll } from '../src/services/storageService.js';
import * as authService from '../src/services/authService.js';

let server;
let baseUrl;

test.before(async () => {
  // Ensure storage is initialized
  await initStorage();

  // Start temporary test HTTP server on random ephemeral port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('Journey 1: Health check endpoint responds with 200 OK', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'online');
  assert.equal(data.appName, 'Flavouriz Backend API');
});

test('Journey 2: Visitors can browse public recipes without authentication', async () => {
  const res = await fetch(`${baseUrl}/recipes`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.pagination);
});

test('Journey 3: Registration creates a user and rejects duplicate emails', async () => {
  const testUser = {
    name: 'Test Baker',
    username: `test_baker_${Date.now()}`,
    email: `test_baker_${Date.now()}@example.com`,
    password: 'Password@123',
  };

  // 1. Success registration
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  assert.equal(regData.success, true);
  assert.ok(regData.data.token);
  assert.equal(regData.data.user.email, testUser.email.toLowerCase());
  // Password hash must NEVER be exposed
  assert.equal(regData.data.user.passwordHash, undefined);

  // 2. Duplicate registration attempt -> 409 Conflict
  const dupRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  assert.equal(dupRes.status, 409);
  const dupData = await dupRes.json();
  assert.equal(dupData.success, false);
});

test('Journey 4: Login verifies valid credentials and rejects invalid credentials', async () => {
  const uniqueEmail = `login_test_${Date.now()}@example.com`;
  const password = 'SecretPassword123';

  // Register user first
  await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Login User',
      username: `login_u_${Date.now()}`,
      email: uniqueEmail,
      password,
    }),
  });

  // Test invalid password -> 401
  const badLogin = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'WrongPassword' }),
  });
  assert.equal(badLogin.status, 401);

  // Test correct login -> 200
  const goodLogin = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password }),
  });
  assert.equal(goodLogin.status, 200);
  const loginData = await goodLogin.json();
  assert.ok(loginData.data.token);
  assert.equal(loginData.data.user.email, uniqueEmail);
});

test('Journey 5: Authenticated users can create, read, update, and delete recipes', async () => {
  // Create user & get token
  const userRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Chef Marco',
      username: `chef_marco_${Date.now()}`,
      email: `marco_${Date.now()}@example.com`,
      password: 'ChefPassword123',
    }),
  });
  const userData = await userRes.json();
  const token = userData.data.token;

  // 1. Create Recipe
  const recipePayload = {
    title: 'Homemade Gnocchi with Sage Butter',
    description: 'Pillowy soft potato gnocchi tossed in nutty browned butter and crispy fresh sage leaves.',
    category: 'Dinner',
    cuisine: 'Italian',
    difficulty: 'Medium',
    prepTimeMinutes: 30,
    cookTimeMinutes: 10,
    servings: 4,
    ingredients: [
      { name: 'Russet potatoes', amount: '1', unit: 'kg' },
      { name: 'All-purpose flour', amount: '200', unit: 'g' },
      { name: 'Unsalted butter', amount: '80', unit: 'g' },
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Bake potatoes until tender, then rice while hot.' },
      { stepNumber: 2, instruction: 'Gently combine with flour and roll into gnocchi pillows.' },
      { stepNumber: 3, instruction: 'Boil until floating, then toss in browned butter and sage.' },
    ],
  };

  const createRes = await fetch(`${baseUrl}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recipePayload),
  });
  assert.equal(createRes.status, 201);
  const createdData = await createRes.json();
  const recipeId = createdData.data.id;
  assert.equal(createdData.data.title, recipePayload.title);

  // 2. Fetch created recipe
  const getRes = await fetch(`${baseUrl}/recipes/${recipeId}`);
  assert.equal(getRes.status, 200);
  const recipeDetails = await getRes.json();
  assert.equal(recipeDetails.data.id, recipeId);

  // 3. Update recipe
  const updateRes = await fetch(`${baseUrl}/recipes/${recipeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prepTimeMinutes: 25 }),
  });
  assert.equal(updateRes.status, 200);
  const updatedData = await updateRes.json();
  assert.equal(updatedData.data.prepTimeMinutes, 25);

  // 4. Unauthorized user cannot update someone else's recipe (403 Forbidden)
  const anotherUserRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Chef Intruder',
      username: `intruder_${Date.now()}`,
      email: `intruder_${Date.now()}@example.com`,
      password: 'IntruderPass123',
    }),
  });
  const anotherUserData = await anotherUserRes.json();
  const unauthorizedToken = anotherUserData.data.token;

  const forbiddenUpdate = await fetch(`${baseUrl}/recipes/${recipeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unauthorizedToken}`,
    },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  assert.equal(forbiddenUpdate.status, 403);

  // 5. Delete Recipe by owner -> 200
  const deleteRes = await fetch(`${baseUrl}/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(deleteRes.status, 200);

  // 6. Verify recipe is gone -> 404
  const verifyRes = await fetch(`${baseUrl}/recipes/${recipeId}`);
  assert.equal(verifyRes.status, 404);
});

test('Journey 6: Non-admin users are rejected from admin endpoints (403 Forbidden)', async () => {
  const normalUserRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Regular Cook',
      username: `regular_${Date.now()}`,
      email: `regular_${Date.now()}@example.com`,
      password: 'RegularPassword123',
    }),
  });
  const normalUserData = await normalUserRes.json();
  const normalToken = normalUserData.data.token;

  const adminStatsRes = await fetch(`${baseUrl}/admin/stats`, {
    headers: { Authorization: `Bearer ${normalToken}` },
  });
  assert.equal(adminStatsRes.status, 403);
});
