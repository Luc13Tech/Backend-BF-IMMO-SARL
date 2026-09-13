const express = require('express');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

function signToken(admin) {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin || !admin.active) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const token = signToken(admin);

    // req.admin n'existe pas encore à ce stade (pas passé par requireAuth) :
    // on l'attache manuellement pour que logAction() puisse s'en servir.
    req.admin = admin;
    await logAction(req, { action: 'LOGIN', details: 'Connexion réussie' });

    res.json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
// Le token JWT n'est pas révoqué côté serveur (stateless) — cette route
// sert uniquement à tracer l'événement dans le journal d'audit. Le
// frontend doit dans tous les cas supprimer le token de son côté.
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await logAction(req, { action: 'LOGOUT', details: 'Déconnexion' });
    res.json({ success: true, message: 'Déconnexion enregistrée.' });
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
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel requis, et le nouveau doit contenir au moins 8 caractères.',
      });
    }

    const admin = await AdminUser.findById(req.admin._id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect.' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Mot de passe mis à jour.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
