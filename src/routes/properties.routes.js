const express = require('express');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// ===== PUBLIC =====

// GET /api/properties?listingType=vente&type=villa&status=disponible&q=dakar
router.get('/', async (req, res, next) => {
  try {
    const { listingType, type, status, q, minPrice, maxPrice } = req.query;
    const filter = { active: true };

    if (listingType) filter.listingType = listingType;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$text = { $search: q };

    const properties = await Property.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/:id
router.get('/:id', async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, active: true });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Bien introuvable.' });
    }
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) =====

// GET /api/properties/admin/all → tous les biens, y compris inactifs
router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
});

// POST /api/properties → création (les images sont uploadées séparément via /api/upload)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
});

// PUT /api/properties/:id → édition complète
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Bien introuvable.' });
    }
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/properties/:id → supprime le bien ET ses images Cloudinary
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Bien introuvable.' });
    }

    await Promise.all(
      (property.images || []).map((img) => deleteFromCloudinary(img.publicId))
    );

    res.json({ success: true, message: 'Bien supprimé.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
