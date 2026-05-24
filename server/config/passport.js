'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { User, Role } = require('../models');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const google_id = profile.id;
        const first_name = profile.name?.givenName || '';
        const last_name = profile.name?.familyName || '';

        // Check if user already exists by google_id
        let user = await User.findOne({ where: { google_id } });

        if (user) {
          return done(null, user);
        }

        // Check if email already exists (user registered with password before)
        user = await User.findOne({ where: { email } });

        if (user) {
          // Link google_id to existing account
          await user.update({ google_id });
          return done(null, user);
        }

        // Get default role
        const role = await Role.findOne({
          where: { role_name: 'Registered User' },
        });

        // Create new user
        user = await User.create({
          google_id,
          email,
          first_name,
          last_name,
          role_id: role.id,
          password_hash: null, // OAuth user, no password
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
