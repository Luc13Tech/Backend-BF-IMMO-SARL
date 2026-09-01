const express = require('express');
const SiteContent = require('../models/SiteContent');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC =====

// GET /api/content → tous les textes publics du site, sous forme { key: value }
router.get('/', async (req, res, next) => {
  try {
    const items = await SiteContent.find();
    const content = {};
    items.forEach((item) => {
      content[item.key] = item.value;
    });
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) =====

// GET /api/content/admin/all → liste complète avec métadonnées (pour l'interface d'édition)
router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const items = await SiteContent.find().sort({ section: 1, key: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// PUT /api/content/admin/:key → crée ou met à jour une entrée de contenu
router.put('/admin/:key', requireAuth, async (req, res, next) => {
  try {
    const { value, section, label } = req.body;

    const item = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { value, section, label, key: req.params.key },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

// PUT /api/content/admin/bulk/update → met à jour plusieurs clés en une fois
router.put('/admin/bulk/update', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body; // [{ key, value, section, label }, ...]
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: '"items" doit être un tableau.' });
    }

    await Promise.all(
      items.map((item) =>
        SiteContent.findOneAndUpdate(
          { key: item.key },
          { value: item.value, section: item.section, label: item.label },
          { upsert: true }
        )
      )
    );

    const all = await SiteContent.find();
    res.json({ success: true, data: all });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
