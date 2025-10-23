import express from 'express';
import passport from '../../config/passportConfig.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { setUserRefreshJti } from '../../services/tokenStore.js';

const router = express.Router();

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Missing JWT_SECRET env');
    }
    const token = jwt.sign(
      { 
        id: req.user._id, 
        role: req.user.role,
        full_name: req.user.full_name,
        email: req.user.email
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    // Set cookie với thông tin user
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Also set refresh token (30d) with JTI and persist to store for rotation
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('Missing JWT_REFRESH_SECRET env');
    }
    const refreshJti = crypto.randomUUID();
    const refreshToken = jwt.sign({ id: req.user._id, jti: refreshJti }, refreshSecret, { expiresIn: '30d' });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Persist current refresh JTI
    try {
      await setUserRefreshJti(String(req.user._id), refreshJti, 30 * 24 * 60 * 60);
    } catch (_) {}

    // Redirect về frontend với thông báo đăng nhập thành công
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?login=success`);
  }
);

// Facebook OAuth Routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  async (req, res) => {
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Missing JWT_SECRET env');
    }
    const token = jwt.sign(
      { 
        id: req.user._id, 
        role: req.user.role,
        full_name: req.user.full_name,
        email: req.user.email
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    // Set cookie với thông tin user
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    // Also set refresh token (30d) with JTI and persist
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('Missing JWT_REFRESH_SECRET env');
    }
    const fbRefreshJti = crypto.randomUUID();
    const refreshToken = jwt.sign({ id: req.user._id, jti: fbRefreshJti }, refreshSecret, { expiresIn: '30d' });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    try {
      await setUserRefreshJti(String(req.user._id), fbRefreshJti, 30 * 24 * 60 * 60);
    } catch (_) {}

    // Redirect về frontend với thông báo đăng nhập thành công
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?login=success`);
  }
);

export default router;