const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    adminEmail: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: ['LOGIN','LOGOUT','VIEW_LEAD','UPDATE_LEAD_STATUS','DELETE_LEAD','CREATE_PROPERTY','UPDATE_PROPERTY','DELETE_PROPERTY','UPDATE_SERVICE','UPDATE_CONTENT','CREATE_FAQ','UPDATE_FAQ','DELETE_FAQ'],
    },
    targetType: { type: String, enum: ['Lead', 'Property', 'Service', 'SiteContent', 'AdminUser', 'AIFaq', null], default: null },
    targetId: { type: String, default: null },
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
