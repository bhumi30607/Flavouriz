const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/token');
const { serializeUser } = require('../utils/serialize');

async function register({ name, username, email, password, bio }) {
  const cleanName = String(name || '').trim();
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanName || !cleanUsername || !cleanEmail || !password) {
    throw new AppError('Name, username, email, and password are required.', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new AppError('Please provide a valid email address.', 400);
  }
  if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
    throw new AppError('Username must be 3-30 characters and use letters, numbers, or underscores.', 400);
  }
  if (String(password).length < 6 || String(password).length > 128) {
    throw new AppError('Password must be between 6 and 128 characters.', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: cleanName,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
    bio: String(bio || '').trim(),
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanUsername)}`,
  });
  return { user: serializeUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  if (!email || !password) throw new AppError('Email and password are required.', 400);
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password.', 401);
  }
  if (!user.isActive) throw new AppError('This account has been deactivated.', 403);
  return { user: serializeUser(user), token: signToken(user) };
}

async function getCurrentUser(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found.', 404);
  return serializeUser(user);
}

module.exports = { register, login, getCurrentUser };
