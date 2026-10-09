const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { generateJWT, generateVerificationToken } = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/email');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send a verification email
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Duplicate email check
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token (raw -> email, hash -> DB)
    const { rawToken, hashedToken, expiresAt } = generateVerificationToken();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationTokenHash: hashedToken,
      verificationTokenExpires: expiresAt,
    });

    // Send verification email (do not fail registration if email fails)
    try {
      await sendVerificationEmail(user.email, user.name, rawToken);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error during registration' });
  }
};

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email using the token from the email link
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      verificationTokenHash: hashedToken,
    }).select('+verificationTokenHash +verificationTokenExpires');

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired verification token' });
    }

    if (user.verificationTokenExpires < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: 'Verification token has expired' });
    }

    if (user.isVerified) {
      return res
        .status(200)
        .json({ success: true, message: 'Email already verified' });
    }

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error during verification' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return a JWT
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    const token = generateJWT(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error during login' });
  }
};

module.exports = { register, verifyEmail, login };