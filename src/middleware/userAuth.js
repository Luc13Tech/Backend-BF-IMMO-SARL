const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Vérifie le token JWT d'un utilisateur public (distinct du token admin :
 * le payload contient "type: user" pour éviter qu'un token admin ou
 * utilisateur ne soit accepté sur les routes de l'autre système).
 */
async function requireUserAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Connexion requise.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'user') {
      return res.status(401).json({ success: false, message: 'Token invalide.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Compte introuvable ou désactivé.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
}

module.exports = { requireUserAuth };
