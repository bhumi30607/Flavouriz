require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/db');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

const demoUsers = [
  {
    legacyId: 'user-admin-001',
    name: 'Chef Alessandro Rossi',
    username: 'admin',
    email: 'admin@flavouriz.com',
    password: 'Admin@12345',
    role: 'admin',
    bio: 'Executive Chef, culinary educator, and platform moderator at Flavouriz.',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
  },
  {
    legacyId: 'user-chef-002',
    name: 'Sarah Jenkins',
    username: 'sarah_cooks',
    email: 'sarah@flavouriz.com',
    password: 'Chef@12345',
    role: 'user',
    bio: 'Pastry chef and sourdough enthusiast.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    legacyId: 'user-foodie-003',
    name: 'Alex Rivera',
    username: 'alex_foodie',
    email: 'alex@flavouriz.com',
    password: 'Foodie@12345',
    role: 'user',
    bio: 'Home cook, street-food lover, and spice explorer.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

async function seedDemo() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seeding is disabled in production.');
  }

  await connectDatabase();
  const userIds = new Map();
  for (const demo of demoUsers) {
    let user = await User.findOne({ email: demo.email });
    if (!user) {
      user = await User.create({
        name: demo.name,
        username: demo.username,
        email: demo.email,
        passwordHash: await bcrypt.hash(demo.password, 12),
        role: demo.role,
        bio: demo.bio,
        avatar: demo.avatar,
      });
    }
    userIds.set(demo.legacyId, user._id);
  }

  const dataPath = path.resolve(__dirname, '../../server/src/data/recipes.json');
  const recipes = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  let inserted = 0;
  for (const source of recipes) {
    const slug = slugify(source.title);
    if (await Recipe.exists({ slug })) continue;
    await Recipe.create({
      authorId: userIds.get(source.authorId) || userIds.get('user-admin-001'),
      title: source.title,
      slug,
      description: source.description,
      category: source.category,
      cuisine: source.cuisine,
      diet: source.diet || '',
      difficulty: source.difficulty,
      prepTimeMinutes: source.prepTimeMinutes || 0,
      cookTimeMinutes: source.cookTimeMinutes || 0,
      totalTimeMinutes: (source.prepTimeMinutes || 0) + (source.cookTimeMinutes || 0),
      servings: source.servings || 4,
      imageUrl: source.imageUrl || '',
      ingredients: source.ingredients || [],
      instructions: (source.instructions || []).map((step, index) => ({
        stepNumber: step.stepNumber || index + 1,
        instruction: step.instruction || step.text || String(step),
        imageUrl: step.imageUrl || '',
      })),
      tags: source.tags || [],
      averageRating: source.averageRating || 0,
      reviewsCount: source.reviewsCount || 0,
      favoritesCount: source.favoritesCount || 0,
      isFeatured: Boolean(source.isFeatured),
      createdAt: source.createdAt || new Date(),
      updatedAt: source.updatedAt || new Date(),
    });
    inserted += 1;
  }

  console.log(`Demo users available: ${demoUsers.length}; new recipes added: ${inserted}.`);
  console.log('Re-running this script does not reset existing users or duplicate recipes.');
}

seedDemo()
  .catch((error) => {
    console.error('Demo seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
