const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'villa',
        'appartement',
        'terrain',
        'bureau',
        'commerce',
        'Réalisation en cours',
        'autre',
      ],
      required: true,
    },
    listingType: {
      type: String,
      enum: ['vente', 'location', 'Location journalière', 'Nuitée', 'autre'],
      required: true,
    },
    price: { type: Number, default: null },
    priceUnit: { type: String, default: 'FCFA' },
    location: { type: String, required: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    surface: { type: Number, default: 0 },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'disponible',
        'nouveau',
        'sous_offre',
        'loue',
        'vendu',
        'Réalisation en cours',
      ],
      default: 'disponible',
    },
    images: [imageSchema],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.index({ listingType: 1, type: 1, status: 1 });
propertySchema.index({ title: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
