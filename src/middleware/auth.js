const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

/**
 * Vérifie le token JWT envoyé dans le header Authorization: Bearer <token>
 * et attache l'admin authentifié à req.admin
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentification requise.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.id);

    if (!admin || !admin.active) {
      return res.status(401).json({ success: false, message: 'Compte introuvable ou désactivé.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
