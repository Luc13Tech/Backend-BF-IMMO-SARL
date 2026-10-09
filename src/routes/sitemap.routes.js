const express = require('express');
const Property = require('../models/Property');
const Service = require('../models/Service');

const router = express.Router();

const SITE_URL = process.env.SITE_URL || 'https://bfimmo-senegal.com';

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq = 'weekly', priority = '0.7' }) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * GET /sitemap.xml
 * Liste automatiquement : pages statiques, les 7 métiers actifs, et CHAQUE
 * bien actif (avec son slug lisible). Toute nouvelle annonce ajoutée depuis
 * l'admin apparaît d'elle-même dans le sitemap, sans aucune action manuelle.
 */
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const [services, properties] = await Promise.all([
      Service.find({ active: true }).select('slug updatedAt'),
      Property.find({ active: true }).select('slug _id updatedAt'),
    ]);

    const entries = [
      urlEntry({ loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' }),
      urlEntry({ loc: `${SITE_URL}/biens`, changefreq: 'daily', priority: '0.9' }),
      urlEntry({ loc: `${SITE_URL}/a-propos`, changefreq: 'monthly', priority: '0.5' }),
      urlEntry({ loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.6' }),
      ...services.map((s) =>
        urlEntry({ loc: `${SITE_URL}/services/${s.slug}`, lastmod: s.updatedAt, changefreq: 'monthly', priority: '0.8' })
      ),
      ...properties.map((p) =>
        urlEntry({ loc: `${SITE_URL}/biens/${p.slug || p._id}`, lastmod: p.updatedAt, changefreq: 'weekly', priority: '0.8' })
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /robots.txt
 * Autorise l'indexation du site public, interdit explicitement l'espace admin
 * et les pages de compte, et pointe vers le sitemap.
 */
router.get('/robots.txt', (req, res) => {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /mon-compte
Disallow: /connexion
Disallow: /inscription

Sitemap: ${SITE_URL}/sitemap.xml
`;
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(body);
});

module.exports = router;
