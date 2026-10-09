/**
 * Transforme un texte en slug d'URL propre :
 * "Villa 4 pièces à Sicap Keur Massar" -> "villa-4-pieces-a-sicap-keur-massar"
 */
function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

/**
 * Génère un slug unique pour un bien : titre lisible + petit suffixe
 * aléatoire, pour éviter toute collision même si deux biens ont le même titre.
 */
function buildPropertySlug(title) {
  const base = slugify(title) || 'bien';
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

module.exports = { slugify, buildPropertySlug };
