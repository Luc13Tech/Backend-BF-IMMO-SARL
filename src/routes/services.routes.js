const express = require('express');
const Service = require('../models/Service');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

// ===== PUBLIC =====

router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

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

router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/:id', requireAuth, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service introuvable.' });
    }

    await logAction(req, {
      action: 'UPDATE_SERVICE',
      targetType: 'Service',
      targetId: service._id,
      details: `Modification : ${service.name}`,
    });

    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/reorder/bulk', requireAuth, async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: '"order" doit être un tableau.' });
    }

    await Promise.all(
      order.map((item) => Service.findByIdAndUpdate(item.id, { order: item.order }))
    );

    await logAction(req, {
      action: 'UPDATE_SERVICE',
      targetType: 'Service',
      details: `Réordonnancement de ${order.length} métier(s)`,
    });

    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
