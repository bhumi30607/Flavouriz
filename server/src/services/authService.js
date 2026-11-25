import bcrypt from 'bcryptjs';
import * as storage from './storageService.js';
import { generateToken } from '../utils/token.js';

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function registerUser({ name, username, email, password, bio, avatar }) {
  if (!name || !username || !email || !password) {
    const error = new Error('Name, username, email, and password are required.');
    error.statusCode = 400;
    throw error;
  }

  // Normalize inputs
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase();

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    const error = new Error('Please provide a valid email address.');
    error.statusCode = 400;
    throw error;
  }

  // Password length validation
  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters long.');
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate email
  const existingEmail = await storage.findOne('users', (u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Check duplicate username
  const existingUsername = await storage.findOne('users', (u) => u.username.toLowerCase() === cleanUsername);
  if (existingUsername) {
    const error = new Error('This username is already taken.');
    error.statusCode = 409;
    throw error;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Check if this is the first user in the system -> make admin
  const totalUsers = await storage.count('users');
  const role = totalUsers === 0 ? 'admin' : 'user';

  const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanUsername)}`;

  const newUser = await storage.create('users', {
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
    role,
    bio: bio || 'Passionate home cook & recipe explorer on Flavouriz!',
    avatar: avatar || defaultAvatar,
    isActive: true,
  });

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    username: newUser.username,
  });

  return {
    user: sanitizeUser(newUser),
    token,
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await storage.findOne('users', (u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error('This account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getCurrentUser(userId) {
  const user = await storage.findById('users', userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return sanitizeUser(user);
}
