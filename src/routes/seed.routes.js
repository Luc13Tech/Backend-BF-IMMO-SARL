const express = require('express');
const { runSeed } = require('../utils/seedData');

const router = express.Router();

/**
 * GET /api/seed-init?key=...
 *
 * Déclenche le seed (7 métiers, textes du site, compte admin) directement
 * depuis le navigateur — utile quand l'accès Shell n'est pas disponible
 * (ex: plan gratuit Render). Protégé par une clé secrète en variable
 * d'environnement pour éviter qu'un tiers ne déclenche/réinitialise les
 * données publiquement. Idempotent : peut être rappelé sans risque.
 */
router.get('/', async (req, res, next) => {
  try {
    const key = req.query.key;
    const expected = process.env.SEED_SECRET_KEY;

    if (!expected) {
      return res.status(500).json({
        success: false,
        message: 'SEED_SECRET_KEY non configurée côté serveur.',
      });
    }

    if (!key || key !== expected) {
      return res.status(401).json({ success: false, message: 'Clé invalide.' });
    }

    const result = await runSeed();

    res.json({
      success: true,
      message: 'Seed exécuté avec succès.',
      result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
