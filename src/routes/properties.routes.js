const express = require('express');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { logAction } = require('../utils/audit');

const router = express.Router();

// ============================================================
// PUBLIC
// ============================================================

/**
 * GET /api/properties
 *
 * Liste publique des biens actifs.
 *
 * Exemples :
 * /api/properties
 * /api/properties?listingType=vente
 * /api/properties?type=villa
 * /api/properties?featured=true
 * /api/properties?limit=6
 */
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

    // =========================
    // Filtre prix
    // =========================
    if (minPrice !== undefined || maxPrice !== undefined) {
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

    // =========================
    // Recherche
    // =========================
    if (q) {
      const search = String(q).trim().slice(0, 100);

      if (search) {
        filter.$text = {
          $search: search,
        };
      }
    }

    // =========================
    // Requête
    // =========================
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

    return res.json({
      success: true,
      data: properties,
    });
  } catch (err) {
    next(err);
  }
});


// ============================================================
// PUBLIC — DÉTAIL D'UN BIEN
// ============================================================

/**
 * GET /api/properties/:id
 *
 * Récupère un bien actif par son ID.
 *
 * Cette route est utilisée par la page :
 * /biens/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérification de l'ObjectId MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant du bien invalide.',
      });
    }

    const property = await Property.findOne({
      _id: id,
      active: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien introuvable.',
      });
    }

    return res.json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
});


// ============================================================
// ADMIN — LISTE COMPLÈTE
// ============================================================

router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const properties = await Property
      .find()
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: properties,
    });
  } catch (err) {
    next(err);
  }
});


// ============================================================
// ADMIN — CRÉER UN BIEN
// ============================================================

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.create(req.body);

    await logAction(req, {
      action: 'CREATE_PROPERTY',
      targetType: 'Property',
      targetId: property._id,
      details: `Création : ${property.title}`,
    });

    return res.status(201).json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
});


// ============================================================
// ADMIN — MODIFIER UN BIEN
// ============================================================

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant du bien invalide.',
      });
    }

    const property = await Property.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien introuvable.',
      });
    }

    await logAction(req, {
      action: 'UPDATE_PROPERTY',
      targetType: 'Property',
      targetId: property._id,
      details: `Modification : ${property.title}`,
    });

    return res.json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
});


// ============================================================
// ADMIN — SUPPRIMER UN BIEN
// ============================================================

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant du bien invalide.',
      });
    }

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien introuvable.',
      });
    }

    // Suppression des images Cloudinary
    await Promise.all(
      (property.images || [])
        .filter((img) => img?.publicId)
        .map((img) => deleteFromCloudinary(img.publicId))
    );

    // Journal de surveillance
    await logAction(req, {
      action: 'DELETE_PROPERTY',
      targetType: 'Property',
      targetId: req.params.id,
      details: `Suppression : ${property.title}`,
    });

    return res.json({
      success: true,
      message: 'Bien supprimé.',
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
