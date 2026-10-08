const express = require('express');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { logAction } = require('../utils/audit');

const router = express.Router();

// ===== UTILITAIRE SLUG =====

// Génère un slug propre à partir du titre.
// Exemple : "Villa à vendre à Dakar" -> "villa-a-vendre-a-dakar"
function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Génère un slug unique sans modifier les anciens biens.
async function buildPropertySlug(title) {
  const baseSlug = slugify(title) || 'bien';

  let slug = baseSlug;
  let counter = 2;

  while (await Property.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

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

    const filter = { active: true };

    if (listingType) filter.listingType = listingType;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (featured === 'true') filter.featured = true;

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (q) filter.$text = { $search: q };

    let query = Property.find(filter).sort({
      featured: -1,
      createdAt: -1,
    });

    if (limit) {
      query = query.limit(Number(limit));
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

// GET /api/properties/:idOrSlug
// Accepte à la fois le slug lisible (nouveaux liens partageables) et l'ID
// MongoDB (anciens liens déjà partagés) — aucun lien existant ne se casse.
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const conditions = [{ slug: idOrSlug }];

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      conditions.push({ _id: idOrSlug });
    }

    const property = await Property.findOne({
      active: true,
      $or: conditions,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien introuvable.',
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) =====

router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const properties = await Property.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: properties,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Le slug est toujours généré côté serveur,
    // jamais fourni par le client.
    delete payload.slug;

    payload.slug = await buildPropertySlug(payload.title || 'bien');

    // Si aucun prix n'est fourni, on ne crée pas artificiellement
    // une valeur 0.
    if (
      payload.price === '' ||
      payload.price === null ||
      payload.price === undefined
    ) {
      delete payload.price;
    } else {
      payload.price = Number(payload.price);
    }

    const property = await Property.create(payload);

    await logAction(req, {
      action: 'CREATE_PROPERTY',
      targetType: 'Property',
      targetId: property._id,
      details: `Création : ${property.title}`,
    });

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Le slug reste STABLE après création, même si le titre change :
    // un lien déjà partagé à un client ne doit jamais cesser de fonctionner.
    delete payload.slug;

    // Si le prix est supprimé lors d'une modification,
    // on ne remplace pas la valeur par 0.
    if (
      payload.price === '' ||
      payload.price === null ||
      payload.price === undefined
    ) {
      delete payload.price;
    } else {
      payload.price = Number(payload.price);
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      payload,
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

    res.json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Bien introuvable.',
      });
    }

    await Promise.all(
      (property.images || []).map((img) =>
        deleteFromCloudinary(img.publicId)
      )
    );

    await logAction(req, {
      action: 'DELETE_PROPERTY',
      targetType: 'Property',
      targetId: req.params.id,
      details: `Suppression : ${property.title}`,
    });

    res.json({
      success: true,
      message: 'Bien supprimé.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
