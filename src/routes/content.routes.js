const express = require('express');
const SiteContent = require('../models/SiteContent');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

// ===== PUBLIC =====

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

router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const items = await SiteContent.find().sort({ section: 1, key: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/:key', requireAuth, async (req, res, next) => {
  try {
    const { value, section, label } = req.body;

    const item = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { value, section, label, key: req.params.key },
      { new: true, upsert: true, runValidators: true }
    );

    await logAction(req, {
      action: 'UPDATE_CONTENT',
      targetType: 'SiteContent',
      targetId: item._id,
      details: `Modification : ${req.params.key}`,
    });

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/bulk/update', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body;
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

    await logAction(req, {
      action: 'UPDATE_CONTENT',
      targetType: 'SiteContent',
      details: `Modification groupée de ${items.length} entrée(s) : ${items.map((i) => i.key).join(', ')}`,
    });

    const all = await SiteContent.find();
    res.json({ success: true, data: all });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
