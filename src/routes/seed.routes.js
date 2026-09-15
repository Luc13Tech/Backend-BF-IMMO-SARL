const express = require('express');
const { runSeed } = require('../utils/seedData');

const router = express.Router();

/*
 * Route de seed initiale.
 *
 * Pour compatibilité avec ton fonctionnement actuel, la clé peut encore
 * être fournie en query string.
 *
 * Préférence sécurité :
 * Authorization: Bearer <SEED_SECRET_KEY>
 *
 * La route doit idéalement être désactivée une fois le premier seed terminé.
 */

router.get('/', async (req, res, next) => {
  try {
    const expected = process.env.SEED_SECRET_KEY;

    if (!expected) {
      return res.status(503).json({
        success: false,
        message: 'Service de seed désactivé.',
      });
    }

    const authorization = req.headers.authorization || '';

    let providedKey = '';

    if (authorization.startsWith('Bearer ')) {
      providedKey = authorization.slice(7).trim();
    }

    /*
     * Compatibilité avec l'ancienne méthode.
     */
    if (!providedKey) {
      providedKey =
        typeof req.query.key === 'string'
          ? req.query.key
          : '';
    }

    if (!providedKey || providedKey !== expected) {
      return res.status(401).json({
        success: false,
        message: 'Clé invalide.',
      });
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
