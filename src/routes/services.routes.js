const express = require('express');
const Service = require('../models/Service');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC =====

// GET /api/services  → les 7 métiers actifs, triés pour l'affichage
router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:slug → un métier précis (utile pour générer son formulaire)
router.get('/:slug', async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, active: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service introuvable.' });
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) =====

// GET /api/admin/services → tous les services, y compris inactifs
router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/services/:id → édition d'un service (texte, ordre, champs de formulaire...)
router.put('/admin/:id', requireAuth, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service introuvable.' });
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/services/reorder → mise à jour groupée de l'ordre d'affichage
router.put('/admin/reorder/bulk', requireAuth, async (req, res, next) => {
  try {
    const { order } = req.body; // [{ id, order }, ...]
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: '"order" doit être un tableau.' });
    }

    await Promise.all(
      order.map((item) => Service.findByIdAndUpdate(item.id, { order: item.order }))
    );

    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
