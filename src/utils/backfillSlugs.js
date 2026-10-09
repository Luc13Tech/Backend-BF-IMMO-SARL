const Property = require('../models/Property');
const { buildPropertySlug } = require('./slugify');

/**
 * Attribue un slug lisible à tous les biens qui n'en ont pas encore
 * (biens créés avant l'introduction des slugs). Idempotent : sans effet
 * si tous les biens en ont déjà un. Appelé une fois au démarrage.
 */
async function backfillPropertySlugs() {
  try {
    const missing = await Property.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    if (missing.length === 0) return;

    for (const property of missing) {
      property.slug = buildPropertySlug(property.title);
      await property.save();
    }
    console.log(`[Slugs] ${missing.length} bien(s) mis à jour avec un slug.`);
  } catch (err) {
    console.error('[Slugs] Échec du remplissage (non bloquant) :', err.message);
  }
}

module.exports = { backfillPropertySlugs };
