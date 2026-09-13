const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Enregistre une action administrateur dans le journal d'audit.
 * Ne fait jamais échouer la requête principale : une erreur ici est
 * uniquement journalisée en console, jamais renvoyée au client — la
 * traçabilité ne doit pas casser une action métier normale.
 *
 * @param {import('express').Request} req - requête en cours (pour req.admin, req.ip, req headers)
 * @param {Object} entry
 * @param {string} entry.action - une des valeurs de l'enum AdminAuditLog.action
 * @param {string} [entry.targetType] - 'Lead' | 'Property' | 'Service' | 'SiteContent' | 'AdminUser'
 * @param {string} [entry.targetId] - identifiant de la ressource visée
 * @param {string} [entry.details] - texte libre, ex: "Statut : nouveau → traité"
 */
async function logAction(req, { action, targetType = null, targetId = null, details = '' }) {
  try {
    if (!req.admin) return; // rien à tracer sans admin authentifié

    await AdminAuditLog.create({
      adminId: req.admin._id,
      adminEmail: req.admin.email,
      action,
      targetType,
      targetId: targetId ? String(targetId) : null,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (err) {
    console.error('[Audit] Échec de journalisation (non bloquant) :', err.message);
  }
}

module.exports = { logAction };
