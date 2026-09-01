const mongoose = require('mongoose');

/**
 * Stockage clé/valeur pour tout le texte éditable du site
 * (hero, à propos, footer, coordonnées...). Permet à l'admin
 * de tout modifier sans toucher au code.
 *
 * Exemples de "key" : "hero.title", "hero.subtitle", "about.text",
 * "contact.phone", "contact.whatsapp", "contact.email", "contact.address",
 * "legal.rc", "legal.ninea", "legal.bp"
 */
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    section: { type: String, default: 'general' }, // pour grouper dans l'admin
    label: { type: String, default: '' }, // libellé lisible pour l'admin
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
