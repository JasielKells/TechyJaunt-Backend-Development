const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return password by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Store only the HASH of the verification token for security
    verificationTokenHash: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);