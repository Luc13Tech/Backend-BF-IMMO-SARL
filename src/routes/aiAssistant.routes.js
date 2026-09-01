const express = require('express');
const AIKnowledge = require('../models/AIKnowledge');
const SiteContent = require('../models/SiteContent');
const Service = require('../models/Service');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Construit le contexte que l'API IA (Claude/GPT) utilisera pour répondre.
 * Rassemble : les 7 services, les coordonnées, et la base de connaissance.
 * Le frontend appelle cette route puis transmet ce contexte à son propre
 * appel LLM (voir note d'intégration dans le README).
 */
router.get('/context', async (req, res, next) => {
  try {
    const [services, knowledge, content] = await Promise.all([
      Service.find({ active: true }).sort({ order: 1 }),
      AIKnowledge.find({ active: true }),
      SiteContent.find(),
    ]);

    const contentMap = {};
    content.forEach((c) => {
      contentMap[c.key] = c.value;
    });

    res.json({
      success: true,
      data: {
        services: services.map((s) => ({
          name: s.name,
          slug: s.slug,
          description: s.shortDescription,
        })),
        knowledge: knowledge.map((k) => ({ topic: k.topic, content: k.content })),
        contact: {
          phone: contentMap['contact.phone'] || '+221 33 813 42 65',
          whatsapp: contentMap['contact.whatsapp'] || '+221 77 829 41 42',
          email: contentMap['contact.email'] || 'bfimmo@gmail.com',
          address: contentMap['contact.address'] || '',
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) — édition de la base de connaissance IA =====

router.get('/admin/knowledge', requireAuth, async (req, res, next) => {
  try {
    const items = await AIKnowledge.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/knowledge', requireAuth, async (req, res, next) => {
  try {
    const item = await AIKnowledge.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/knowledge/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await AIKnowledge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Entrée introuvable.' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/knowledge/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await AIKnowledge.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Entrée introuvable.' });
    }
    res.json({ success: true, message: 'Entrée supprimée.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
