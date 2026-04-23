const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./db');
const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
      
      if (!user) {
        // Create a default organization for new Google users
        let organization = await prisma.organization.create({
          data: { name: `${profile.displayName}'s Organization` }
        });

        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            password: 'OAUTH_USER', // Placeholder
            role: 'ADMIN',
            organizationId: organization.id
          }
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET);
    const userData = JSON.stringify({ 
      id: req.user.id, 
      email: req.user.email, 
      role: req.user.role, 
      organizationId: req.user.organizationId 
    });
    // Redirect back to frontend with token and user data in query params
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);

router.post('/signup', async (req, res) => {
  const { email, password, organizationName, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create organization first or use existing
    let organization = await prisma.organization.findFirst({
      where: { name: organizationName }
    });
    
    if (!organization) {
      organization = await prisma.organization.create({
        data: { name: organizationName }
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'MEMBER',
        organizationId: organization.id
      }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId } });
  } catch (err) {
    res.status(400).json({ error: 'User creation failed: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId } });
  } catch (err) {
    res.status(400).json({ error: 'Login failed' });
  }
});

module.exports = router;
