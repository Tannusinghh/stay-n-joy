const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

// Routes
router.route('/signup')
    .get(authController.renderSignupForm)
    .post(authController.signup);

router.route('/login')
    .get(authController.renderLoginForm)
    .post(authController.login);

router.get('/logout', authController.logout);

module.exports = router;
