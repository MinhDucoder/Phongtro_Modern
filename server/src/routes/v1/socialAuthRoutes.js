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
    console.log('Google OAuth callback - User:', {
      id: req.user._id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role
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
    // Tạo JWT token
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
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

export default router;