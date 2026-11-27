const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'flavouriz-test-secret';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI ||
  'mongodb://127.0.0.1:27017/flavouriz_backend_test';

const app = require('../app');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const Collection = require('../models/Collection');
const Favorite = require('../models/Favorite');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

let server;
let baseUrl;
let chef;
let foodie;
let recipe;

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  return fetch(`${baseUrl}/api${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body instanceof FormData ? options.body :
      options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

async function register(prefix) {
  const response = await request('/auth/register', {
    method: 'POST',
    body: {
      name: `${prefix} Cook`,
      username: `${prefix.toLowerCase()}_cook`,
      email: `${prefix.toLowerCase()}@example.test`,
      password: 'TestPassword123',
    },
  });
  assert.equal(response.status, 201);
  return (await response.json()).data;
}

async function createRecipe(token, title) {
  const response = await request('/recipes', {
    method: 'POST',
    token,
    body: {
      title,
      description: 'A savory recipe for API testing.',
      category: 'Dinner',
      cuisine: 'Indian',
      diet: 'vegetarian',
      difficulty: 'Easy',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 2,
      ingredients: [
        { name: 'Rice', amount: '100', unit: 'g' },
        { name: 'Salt', amount: '1/2', unit: 'tsp' },
      ],
      instructions: [{ instruction: 'Cook the rice.' }, { instruction: 'Season and serve.' }],
      tags: ['api-test'],
    },
  });
  assert.equal(response.status, 201);
  return (await response.json()).data;
}

test.before(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();
  await Promise.all([
    User.init(), Recipe.init(), Review.init(), Collection.init(),
    Favorite.init(), Comment.init(), Report.init(),
  ]);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('health and authentication endpoints return frontend-compatible envelopes', async () => {
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).database, 'connected');

  const registered = await register('chef');
  chef = registered;
  assert.ok(registered.token);
  assert.equal(registered.user.passwordHash, undefined);

  const duplicate = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Duplicate',
      username: 'different_username',
      email: 'chef@example.test',
      password: 'TestPassword123',
    },
  });
  assert.equal(duplicate.status, 409);

  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: 'chef@example.test', password: 'TestPassword123' },
  });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).data.user.id, registered.user.id);
  const invalidLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'chef@example.test', password: 'wrong-password' },
  });
  assert.equal(invalidLogin.status, 401);
  assert.equal((await request('/auth/me')).status, 401);
});

test('recipe CRUD, search/filter, cursor pagination, reviews, and comments work', async () => {
  recipe = await createRecipe(chef.token, 'Golden API Curry');
  const second = await createRecipe(chef.token, 'Golden API Lentils');

  const list = await request('/recipes?search=Golden&cuisine=Indian&diet=vegetarian&maxTime=30&limit=1');
  assert.equal(list.status, 200);
  const pageOne = await list.json();
  assert.equal(pageOne.data.length, 1);
  assert.equal(pageOne.hasMore, true);

  const pageTwoResponse = await request(`/recipes?search=Golden&cuisine=Indian&diet=vegetarian&maxTime=30&limit=1&cursor=${encodeURIComponent(pageOne.nextCursor)}`);
  const pageTwo = await pageTwoResponse.json();
  assert.equal(pageTwo.data.length, 1);
  assert.notEqual(pageTwo.data[0].id, pageOne.data[0].id);

  const detail = await request(`/recipes/${recipe.id}`);
  assert.equal((await detail.json()).data.instructions[0].instruction, 'Cook the rice.');

  foodie = await register('foodie');
  const reviewResponse = await request(`/recipes/${recipe.id}/reviews`, {
    method: 'POST',
    token: foodie.token,
    body: { rating: 4, comment: 'Very good.' },
  });
  assert.equal(reviewResponse.status, 201);
  const reviewId = (await reviewResponse.json()).data.review.id;

  const duplicateReview = await request(`/recipes/${recipe.id}/reviews`, {
    method: 'POST',
    token: foodie.token,
    body: { rating: 5, comment: 'Duplicate.' },
  });
  assert.equal(duplicateReview.status, 409);

  const updatedReview = await request(`/reviews/${reviewId}`, {
    method: 'PATCH',
    token: foodie.token,
    body: { rating: 5, comment: 'Updated.' },
  });
  assert.equal(updatedReview.status, 200);
  assert.equal((await request(`/recipes/${recipe.id}`)).status, 200);
  const updatedRecipe = (await request(`/recipes/${recipe.id}`)).json();
  assert.equal((await updatedRecipe).data.averageRating, 5);
  assert.equal((await updatedRecipe).data.reviewsCount, 1);
  const helpful = await request(`/reviews/${reviewId}/helpful`, { method: 'POST', token: chef.token });
  assert.equal((await helpful.json()).data.helpful, true);
  const repeatedHelpful = await request(`/reviews/${reviewId}/helpful`, { method: 'POST', token: chef.token });
  assert.equal((await repeatedHelpful.json()).data.helpful, false);

  const comment = await request(`/recipes/${recipe.id}/comments`, {
    method: 'POST',
    token: foodie.token,
    body: { content: 'Can I use brown rice?' },
  });
  assert.equal(comment.status, 201);
  assert.equal((await request(`/recipes/${recipe.id}/comments`)).status, 200);
  const commentId = (await comment.json()).data.id;
  assert.equal((await request(`/comments/${commentId}`, {
    method: 'PATCH',
    token: foodie.token,
    body: { content: 'Use any rice you prefer.' },
  })).status, 200);

  const unauthorizedUpdate = await request(`/recipes/${recipe.id}`, {
    method: 'PATCH',
    token: foodie.token,
    body: { title: 'Not the owner' },
  });
  assert.equal(unauthorizedUpdate.status, 403);
  const update = await request(`/recipes/${recipe.id}`, {
    method: 'PATCH',
    token: chef.token,
    body: { prepTimeMinutes: 12 },
  });
  assert.equal((await update.json()).data.totalTimeMinutes, 32);
  assert.equal((await request(`/reviews/${reviewId}`, {
    method: 'DELETE',
    token: foodie.token,
  })).status, 200);
  const clearedRating = (await request(`/recipes/${recipe.id}`)).json();
  assert.equal((await clearedRating).data.averageRating, 0);
  assert.equal((await clearedRating).data.reviewsCount, 0);
  assert.equal((await request(`/recipes/${second.id}`, {
    method: 'DELETE',
    token: chef.token,
  })).status, 200);
  assert.equal((await request(`/recipes/${second.id}`)).status, 404);
});

test('favorites, collections, shopping list, follow feed, and moderation work', async () => {
  const favorite = await request(`/favorites/${recipe.id}`, { method: 'POST', token: foodie.token });
  assert.equal(favorite.status, 200);
  const favorites = await request('/favorites', { token: foodie.token });
  assert.equal((await favorites.json()).data[0].id, recipe.id);

  const collectionResponse = await request('/collections', {
    method: 'POST',
    token: foodie.token,
    body: { name: 'Weeknight meals' },
  });
  const collection = (await collectionResponse.json()).data;
  const addRecipe = await request(`/collections/${collection.id}/recipes/${recipe.id}`, {
    method: 'POST',
    token: foodie.token,
  });
  assert.equal(addRecipe.status, 200);

  const shopping = await request('/collections/shopping-list', {
    method: 'POST',
    token: foodie.token,
    body: { recipeIds: [recipe.id], servings: { [recipe.id]: 4 } },
  });
  const items = (await shopping.json()).data;
  assert.equal(items.find((item) => item.name === 'Rice').amount, 200);

  assert.equal((await request(`/users/${foodie.user.id}/follow`, {
    method: 'POST',
    token: foodie.token,
  })).status, 400);
  const follow = await request(`/users/${chef.user.id}/follow`, {
    method: 'POST',
    token: foodie.token,
  });
  assert.equal(follow.status, 200);
  const feed = await request('/feed?limit=10', { token: foodie.token });
  assert.ok((await feed.json()).data.some((item) => item.id === recipe.id));
  assert.equal((await request(`/users/${chef.user.id}/followers`)).status, 200);
  assert.equal((await request(`/users/${chef.user.id}/follow`, {
    method: 'DELETE',
    token: foodie.token,
  })).status, 200);
  assert.equal((await (await request('/feed', { token: foodie.token })).json()).data.length, 0);

  assert.equal((await request(`/collections/${collection.id}/recipes/${recipe.id}`, {
    method: 'DELETE',
    token: foodie.token,
  })).status, 200);
  assert.equal((await request(`/collections/${collection.id}`, {
    method: 'PATCH',
    token: foodie.token,
    body: { name: 'Updated dinners' },
  })).status, 200);

  await User.updateOne({ _id: chef.user.id }, { role: 'admin' });
  const admin = await request('/admin/stats', { token: chef.token });
  assert.equal(admin.status, 200);
  assert.ok((await admin.json()).data.totalRecipes >= 1);

  const report = await request('/reports', {
    method: 'POST',
    token: foodie.token,
    body: { targetType: 'recipe', targetId: recipe.id, reason: 'spam', details: 'Test report.' },
  });
  assert.equal(report.status, 201);
  const adminReports = await request('/admin/reports', { token: chef.token });
  const reports = (await adminReports.json()).data;
  assert.equal(reports.length, 1);
  const resolve = await request(`/admin/reports/${reports[0].id}`, {
    method: 'PATCH',
    token: chef.token,
    body: { action: 'dismiss', notes: 'API test resolution.' },
  });
  assert.equal(resolve.status, 200);
  assert.equal((await request(`/collections/${collection.id}`, {
    method: 'DELETE',
    token: foodie.token,
  })).status, 200);
});

test('multipart uploads reject unsupported file content before Cloudinary access', async () => {
  const form = new FormData();
  form.append('image', new Blob(['not an image'], { type: 'text/plain' }), 'text.txt');
  form.append('title', 'Rejected upload');
  const response = await request('/recipes', {
    method: 'POST',
    token: chef.token,
    body: form,
  });
  assert.equal(response.status, 400);

  const spoofedForm = new FormData();
  spoofedForm.append('image', new Blob(['not an image'], { type: 'image/png' }), 'spoofed.png');
  const spoofed = await request('/recipes', {
    method: 'POST',
    token: chef.token,
    body: spoofedForm,
  });
  assert.equal(spoofed.status, 400);
});
