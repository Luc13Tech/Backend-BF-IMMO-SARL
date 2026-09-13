const mongoose = require('mongoose');

/**
 * Journal d'audit des actions effectuées par les comptes administrateurs
 * (staff/secrétaire inclus). Réservé en lecture au rôle "superadmin".
 *
 * targetId n'est PAS une référence stricte (pas de "ref" + populate) :
 * si la ressource visée (demande, bien...) est supprimée définitivement,
 * la trace de l'action doit rester lisible malgré tout.
 */
const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    // Copie figée de l'email au moment de l'action : reste lisible même
    // si le compte admin est supprimé par la suite.
    adminEmail: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'VIEW_LEAD',
        'UPDATE_LEAD_STATUS',
        'DELETE_LEAD',
        'CREATE_PROPERTY',
        'UPDATE_PROPERTY',
        'DELETE_PROPERTY',
        'UPDATE_SERVICE',
        'UPDATE_CONTENT',
      ],
    },
    targetType: {
      type: String,
      enum: ['Lead', 'Property', 'Service', 'SiteContent', 'AdminUser', null],
      default: null,
    },
    targetId: { type: String, default: null }, // stocké en String volontairement, voir note ci-dessus
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });
adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
