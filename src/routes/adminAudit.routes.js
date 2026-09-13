const express = require('express');
const AdminAuditLog = require('../models/AdminAuditLog');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin-audit?page=1&limit=50&admin=xxx&action=DELETE_LEAD&from=2026-01-01&to=2026-12-31
 * Réservé au rôle "superadmin" — un compte "admin" (ex: secrétaire) reçoit
 * un 403 même en devinant l'URL, la vérification se fait ici côté serveur,
 * pas seulement en cachant le lien dans l'interface.
 */
router.get('/', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, admin, action, from, to } = req.query;
    const filter = {};

    if (admin) filter.adminId = admin;
    if (action) filter.action = action;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Math.max(1, Number(limit)));

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      AdminAuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
