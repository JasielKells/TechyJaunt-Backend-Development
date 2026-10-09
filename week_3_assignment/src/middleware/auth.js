const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes by verifying the JWT and ensuring the user
 * exists AND has verified their email.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User no longer exists' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before accessing this resource',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };