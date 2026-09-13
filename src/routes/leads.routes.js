const express = require('express');
const Lead = require('../models/Lead');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateLead } = require('../middleware/validate');
const { logAction } = require('../utils/audit');

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
      data: rest,
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

// GET /api/leads/admin/:id → consultation d'une demande précise (tracée)
router.get('/admin/:id', requireAuth, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }

    await logAction(req, {
      action: 'VIEW_LEAD',
      targetType: 'Lead',
      targetId: lead._id,
      details: `Consultation de la demande de ${lead.fullName}`,
    });

    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leads/admin/:id/status → tout admin peut changer le statut
// (y compris archiver — un simple changement de statut, réversible)
router.put('/admin/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const before = await Lead.findById(req.params.id);

    if (!before) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    await logAction(req, {
      action: 'UPDATE_LEAD_STATUS',
      targetType: 'Lead',
      targetId: lead._id,
      details: `Statut : ${before.status} → ${lead.status}`,
    });

    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leads/admin/:id → suppression DÉFINITIVE, réservée au superadmin.
// Un compte "admin" (secrétaire) peut archiver via le statut ci-dessus,
// mais ne peut pas effacer une demande de la base.
router.delete('/admin/:id', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }

    await logAction(req, {
      action: 'DELETE_LEAD',
      targetType: 'Lead',
      targetId: req.params.id,
      details: `Suppression définitive — demande de ${lead.fullName} (${lead.service})`,
    });

    res.json({ success: true, message: 'Demande supprimée.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
