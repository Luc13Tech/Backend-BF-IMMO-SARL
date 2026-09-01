const mongoose = require('mongoose');

/**
 * Chaque demande envoyée depuis un des 7 formulaires du site.
 * "data" reste flexible car chaque service a des champs différents.
 */
const leadSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      enum: ['achat', 'location', 'gerance', 'vente', 'conseils', 'btp', 'suivi-chantier', 'contact'],
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // champs spécifiques au service
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['nouveau', 'en_cours', 'traite', 'archive'],
      default: 'nouveau',
    },
    source: { type: String, default: 'site_web' },
  },
  { timestamps: true }
);

leadSchema.index({ service: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
