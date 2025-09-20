import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '~/models/userSchema.js';
import dotenv from 'dotenv';

dotenv.config();

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth profile:', {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      });

      // Kiểm tra user đã tồn tại chưa
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Nếu user tồn tại, update thông tin Google
        user.google_id = profile.id;
        user.is_verified = true; // Email từ Google đã được xác thực
        await user.save();
        console.log('Updated existing user:', user.full_name);
        return done(null, user);
      }

      // Nếu user chưa tồn tại, tạo mới
      user = new User({
        email: profile.emails[0].value,
        full_name: profile.displayName,
        google_id: profile.id,
        is_verified: true // Email từ Google đã được xác thực
      });
      await user.save();
      console.log('Created new user:', user.full_name);
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/v1/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Kiểm tra user đã tồn tại chưa
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Nếu user tồn tại, update thông tin Facebook
        user.facebook_id = profile.id;
        user.is_verified = true; // Email từ Facebook đã được xác thực
        await user.save();
        return done(null, user);
      }

      // Nếu user chưa tồn tại, tạo mới
      user = new User({
        email: profile.emails[0].value,
        full_name: `${profile.name.givenName} ${profile.name.familyName}`,
        facebook_id: profile.id,
        is_verified: true // Email từ Facebook đã được xác thực
      });
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;