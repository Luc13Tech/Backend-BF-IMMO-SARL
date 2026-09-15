const express = require('express');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { logAction } = require('../utils/audit');

const router = express.Router();

// ===== PUBLIC =====

// GET /api/properties?listingType=vente&type=villa&status=disponible&q=dakar&featured=true&limit=1
router.get('/', async (req, res, next) => {
  try {
    const {
      listingType,
      type,
      status,
      q,
      minPrice,
      maxPrice,
      featured,
      limit,
    } = req.query;

    const filter = {
      active: true,
    };

    if (listingType) {
      filter.listingType = String(listingType).slice(0, 50);
    }

    if (type) {
      filter.type = String(type).slice(0, 50);
    }

    if (status) {
      filter.status = String(status).slice(0, 50);
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};

      if (minPrice !== undefined) {
        const value = Number(minPrice);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: 'Prix minimum invalide.',
          });
        }

        priceFilter.$gte = value;
      }

      if (maxPrice !== undefined) {
        const value = Number(maxPrice);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: 'Prix maximum invalide.',
          });
        }

        priceFilter.$lte = value;
      }

      if (
        priceFilter.$gte !== undefined &&
        priceFilter.$lte !== undefined &&
        priceFilter.$gte > priceFilter.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: 'Intervalle de prix invalide.',
        });
      }

      filter.price = priceFilter;
    }

    if (q) {
      const search = String(q).trim().slice(0, 100);

      if (search) {
        filter.$text = {
          $search: search,
        };
      }
    }

    let query = Property
      .find(filter)
      .sort({
        featured: -1,
        createdAt: -1,
      });

    const requestedLimit = Number(limit);

    if (Number.isFinite(requestedLimit) && requestedLimit > 0) {
      query = query.limit(
        Math.min(Math.floor(requestedLimit), 100)
      );
    } else {
      query = query.limit(100);
    }

    const properties = await query;

    res.json({
      success: true,
      data: properties,
    });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) =====

router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.create(req.body);

    await logAction(req, {
      action: 'CREATE_PROPERTY',
      targetType: 'Property',
      targetId: property._id,
      details: `Création : ${property.title}`,
    });

    res.status(201).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Bien introuvable.' });
    }

    await logAction(req, {
      action: 'UPDATE_PROPERTY',
      targetType: 'Property',
      targetId: property._id,
      details: `Modification : ${property.title}`,
    });

    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Bien introuvable.' });
    }

    await Promise.all(
      (property.images || []).map((img) => deleteFromCloudinary(img.publicId))
    );

    await logAction(req, {
      action: 'DELETE_PROPERTY',
      targetType: 'Property',
      targetId: req.params.id,
      details: `Suppression : ${property.title}`,
    });

    res.json({ success: true, message: 'Bien supprimé.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
