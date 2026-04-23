const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../../db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER',
    // Updated to match Nginx proxy (Port 80)
    callbackURL: "http://localhost/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await prisma.user.findUnique({ 
        where: { email },
        include: { organization: true }
      });

      if (!user) {
        // Create new Org + Admin for new OAuth users
        const org = await prisma.organization.create({
          data: { name: `${profile.displayName}'s Team` }
        });

        user = await prisma.user.create({
          data: {
            email,
            password: 'OAUTH_USER', // Security placeholder
            role: 'ADMIN',
            organizationId: org.id
          },
          include: { organization: true }
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
