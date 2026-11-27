const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-z0-9_]+$/,
    unique: true,
  },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  bio: { type: String, default: '', maxlength: 500 },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

userSchema.index({ name: 'text', username: 'text' });

module.exports = mongoose.model('User', userSchema);
