const express = require('express');
const router = express.Router();
const { register, verifyEmail, login } = require('../controllers/authController');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
} = require('../validations/authValidation');

router.post('/register', validate(registerSchema), register);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/login', validate(loginSchema), login);

module.exports = router;