const mongoose = require('mongoose');

/**
 * Base de questions/réponses pour l'Assistant Virtuel — AUCUNE clé API,
 * AUCUN appel externe. Chaque entrée porte une liste de mots-clés ; le
 * frontend calcule lui-même, dans le navigateur, quelle entrée correspond
 * le mieux à la question tapée par le visiteur (voir src/utils/matchFaq.js
 * côté frontend). Entièrement éditable depuis l'admin.
 */
const aiFaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true }, // affichée en admin, à titre indicatif
    keywords: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Au moins un mot-clé est requis.',
      },
    },
    answer: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'achat', 'location', 'gerance', 'vente', 'conseils', 'btp', 'suivi-chantier', 'contact'],
      default: 'general',
    },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

aiFaqSchema.index({ active: 1, order: 1 });

module.exports = mongoose.model('AIFaq', aiFaqSchema);
