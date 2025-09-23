import express from 'express';
import passport from '~/config/passportConfig.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('=== GOOGLE OAUTH LOGIN ===');
    console.log('Full user object from Google:', JSON.stringify(req.user, null, 2));
    console.log('User details:', {
      id: req.user._id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role,
      google_id: req.user.google_id,
      is_verified: req.user.is_verified,
      is_banned: req.user.is_banned,
      created_at: req.user.created_at,
      last_login: req.user.last_login
    });

    // Tạo JWT token với thông tin user đầy đủ
    const token = jwt.sign(
      { 
        id: req.user._id, 
        role: req.user.role,
        full_name: req.user.full_name,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie với thông tin user
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 7*24*60*60*1000 // 7 days
    });

    // Redirect về frontend với thông báo đăng nhập thành công
    res.redirect('http://localhost:3000?login=success');
  }
);

// Facebook OAuth Routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('=== FACEBOOK OAUTH LOGIN ===');
    console.log('Full user object from Facebook:', JSON.stringify(req.user, null, 2));
    console.log('User details:', {
      id: req.user._id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role,
      facebook_id: req.user.facebook_id,
      is_verified: req.user.is_verified,
      is_banned: req.user.is_banned,
      created_at: req.user.created_at,
      last_login: req.user.last_login
    });

    // Tạo JWT token với thông tin user đầy đủ
    const token = jwt.sign(
      { 
        id: req.user._id, 
        role: req.user.role,
        full_name: req.user.full_name,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie với thông tin user
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: 'lax',
      maxAge: 7*24*60*60*1000 // 7 days
    });

    // Redirect về frontend với thông báo đăng nhập thành công
    res.redirect('http://localhost:3000?login=success');
  }
);

export default router;