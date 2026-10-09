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

    // Slug lisible pour les URLs partageables.
    // Généré automatiquement à partir du titre.
    // Les anciens biens sans slug restent compatibles.
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'villa',
        'appartement',
        'maison',
        'chambre',
        'hotel',
        'terrain',
        'bureau',
        'commerce',
        'autre',
      ],
      required: true,
    },

    // Types de transaction.
    // Les valeurs techniques et les anciens libellés français
    // sont acceptés pour préserver la compatibilité des données.
    listingType: {
      type: String,
      enum: [
        'vente',
        'location',
        'location_nuitee',
        'location_journaliere',

        // Compatibilité avec les données déjà enregistrées.
        'Vente',
        'Location',
        'Nuitée',
        'Location nuitée',
        'Location journalière',
      ],
      required: true,
    },

    // Prix facultatif : aucune valeur 0 n'est imposée.
    price: {
      type: Number,
      min: 0,
    },

    priceUnit: {
      type: String,
      default: 'FCFA',
    },

    location: {
      type: String,
      required: true,
    },

    bedrooms: {
      type: Number,
      default: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
    },

    surface: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: [
        'disponible',
        'nouveau',
        'sous_offre',
        'loue',
        'vendu',
      ],
      default: 'disponible',
    },

    images: [imageSchema],

    featured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour filtrer les biens par transaction, type et statut.
propertySchema.index({
  listingType: 1,
  type: 1,
  status: 1,
});

// Index de recherche textuelle.
propertySchema.index({
  title: 'text',
  location: 'text',
  description: 'text',
});

module.exports = mongoose.model('Property', propertySchema);
