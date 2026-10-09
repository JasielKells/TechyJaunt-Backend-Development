const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user routes require a valid JWT and verified email
router.get('/profile', protect, getProfile);

module.exports = router;