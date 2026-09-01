const mongoose = require('mongoose');

/**
 * Les 7 métiers de BF IMMO. Chaque service définit aussi les champs
 * attendus par son propre formulaire, pour que le frontend puisse
 * générer le bon formulaire dynamiquement.
 */
const formFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // ex: "budget"
    label: { type: String, required: true }, // ex: "Budget mensuel (FCFA)"
    type: {
      type: String,
      enum: ['text', 'email', 'tel', 'number', 'select', 'textarea', 'date'],
      default: 'text',
    },
    required: { type: Boolean, default: true },
    options: [{ type: String }], // utilisé si type = "select"
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ['achat', 'location', 'gerance', 'vente', 'conseils', 'btp', 'suivi-chantier'],
    },
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    icon: { type: String, default: '' }, // nom d'icône (lucide-react) éditable
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    formFields: [formFieldSchema],
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
  },
  { timestamps: true }
);

serviceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', serviceSchema);
