const express = require('express');
const Lead = require('../models/Lead');
const { requireAuth } = require('../middleware/auth');
const { validateLead } = require('../middleware/validate');

const router = express.Router();

const VALID_SERVICES = [
  'achat',
  'location',
  'gerance',
  'vente',
  'conseils',
  'btp',
  'suivi-chantier',
  'contact',
];

// ===== PUBLIC =====

// POST /api/leads/:service → soumission d'un formulaire (achat, location, gerance, vente, conseils, btp, suivi-chantier, contact)
router.post('/:service', validateLead, async (req, res, next) => {
  try {
    const { service } = req.params;

    if (!VALID_SERVICES.includes(service)) {
      return res.status(400).json({ success: false, message: 'Service inconnu.' });
    }

    const { fullName, email, phone, message, ...rest } = req.body;

    const lead = await Lead.create({
      service,
      fullName,
      email,
      phone,
      message,
      data: rest, // tous les champs spécifiques au formulaire (budget, zone, type de bien, etc.)
    });

    res.status(201).json({
      success: true,
      message: 'Votre demande a bien été envoyée. Nous vous recontactons rapidement.',
      data: { id: lead._id },
    });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) =====

// GET /api/leads/admin/all?service=location&status=nouveau
router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const { service, status } = req.query;
    const filter = {};
    if (service) filter.service = service;
    if (status) filter.status = status;

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: leads });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leads/admin/:id/status → changer le statut d'une demande
router.put('/admin/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leads/admin/:id
router.delete('/admin/:id', requireAuth, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }
    res.json({ success: true, message: 'Demande supprimée.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
