import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/userSchema.js';
import dotenv from 'dotenv';

dotenv.config();

// Google 
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
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
        user.is_verified = true; 
        await user.save();
        console.log('Updated existing user:', user.full_name);
        return done(null, user);
      }

      // Nếu user chưa tồn tại, tạo mới
      user = new User({
        email: profile.emails[0].value,
        full_name: profile.displayName,
        google_id: profile.id,
        is_verified: true 
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
} else {
  console.log('⚠️ Google OAuth credentials not found, skipping Google strategy');
}

// Facebook 
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/v1/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'displayName'],
      passReqToCallback: true
    },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('Facebook OAuth profile:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        name: profile.name
      });

      // Kiểm tra email có tồn tại không
      let email = null;
      if (profile.emails && profile.emails[0] && profile.emails[0].value) {
        email = profile.emails[0].value;
      } else {
        // Nếu không có email, tạo email tạm thời từ Facebook ID
        email = `facebook_${profile.id}@gmail.com`;
        console.log('Facebook OAuth: No email found, using temporary email:', email);
      }
      
      // Kiểm tra user đã tồn tại chưa
      let user = await User.findOne({ email: email });
      
      if (user) {
        // Nếu user tồn tại, update thông tin Facebook
        user.facebook_id = profile.id;
        user.is_verified = true; 
        await user.save();
        console.log('Updated existing user:', user.full_name);
        return done(null, user);
      }

      // Nếu user chưa tồn tại, tạo mới
      const fullName = profile.displayName || 
        (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : 'Facebook User');
      
      user = new User({
        email: email,
        full_name: fullName,
        facebook_id: profile.id,
        is_verified: true 
      });
      await user.save();
      console.log('Created new user:', user.full_name);
      return done(null, user);
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return done(error, null);
    }
  }
  ));
} else {
  console.log('⚠️ Facebook OAuth credentials not found, skipping Facebook strategy');
}

// Serialize 
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