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
    // Slug lisible pour les URLs partageables (ex: /biens/villa-4-pieces-sicap-abc123)
    // Généré automatiquement à partir du titre — voir properties.routes.js
    // sparse : les biens créés AVANT l'ajout des slugs (sans ce champ) ne bloquent pas l'index unique.
    // Un remplissage automatique (backfillSlugs.js) leur attribue un slug au démarrage du serveur.
    slug: { type: String, unique: true, sparse: true, index: true },
    type: {
      type: String,
      enum: ['villa', 'appartement', 'maison', 'chambre', 'hotel', 'terrain', 'bureau', 'commerce', 'autre'],
      required: true,
    },
    // 4 modes distincts, demandés explicitement :
    // - vente : bien à vendre
    // - location : location classique (mensuelle, longue durée)
    // - location_nuitee : type hôtel/Airbnb, prix par nuit
    // - location_journaliere : ex. bureau/salle louée à la journée
    listingType: {
      type: String,
      enum: ['vente', 'location', 'location_nuitee', 'location_journaliere'],
      required: true,
    },
    price: { type: Number, required: true },
    priceUnit: { type: String, default: 'FCFA' },
    location: { type: String, required: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    surface: { type: Number, default: 0 },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['disponible', 'nouveau', 'sous_offre', 'loue', 'vendu'],
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
