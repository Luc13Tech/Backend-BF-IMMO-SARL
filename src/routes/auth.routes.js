const express = require('express');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../utils/audit');
const { rateLimit } = require('../middleware/security');

const router = express.Router();

const ADMIN_LOGIN_LIMIT = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) =>
    `${req.ip || 'unknown'}:${String(req.body?.email || '').toLowerCase().trim()}`,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
});

function signToken(admin) {
  return jwt.sign(
    {
      id: String(admin._id),
      role: admin.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      algorithm: 'HS256',
    }
  );
}

// POST /api/auth/login
router.post('/login', ADMIN_LOGIN_LIMIT, async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis.',
      });
    }

    if (email.length > 254 || password.length > 256) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const admin = await AdminUser.findOne({ email }).select('+password');

    if (!admin || !admin.active) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const token = signToken(admin);

    req.admin = admin;

    await logAction(req, {
      action: 'LOGIN',
      details: 'Connexion réussie',
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await logAction(req, {
      action: 'LOGOUT',
      details: 'Déconnexion',
    });

    res.json({
      success: true,
      message: 'Déconnexion enregistrée.',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
});

// PUT /api/auth/change-password
router.put('/change-password', requireAuth, async (req, res, next) => {
  try {
    const currentPassword =
      typeof req.body?.currentPassword === 'string'
        ? req.body.currentPassword
        : '';

    const newPassword =
      typeof req.body?.newPassword === 'string'
        ? req.body.newPassword
        : '';

    if (
      !currentPassword ||
      !newPassword ||
      newPassword.length < 8 ||
      newPassword.length > 256
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Mot de passe actuel requis, et le nouveau doit contenir entre 8 et 256 caractères.',
      });
    }

    const admin = await AdminUser.findById(req.admin._id)
      .select('+password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Compte administrateur introuvable.',
      });
    }

    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect.',
      });
    }

    admin.password = newPassword;
    await admin.save();

    await logAction(req, {
      action: 'CHANGE_PASSWORD',
      targetType: 'AdminUser',
      targetId: admin._id,
      details: 'Mot de passe administrateur modifié.',
    });

    res.json({
      success: true,
      message: 'Mot de passe mis à jour.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
