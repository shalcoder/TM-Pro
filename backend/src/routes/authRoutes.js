const express = require('express');
const authController = require('../controllers/authController');
const passport = require('../config/passport');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.oauthSuccess
);

module.exports = router;
