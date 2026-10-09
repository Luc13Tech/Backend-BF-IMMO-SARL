const express = require('express');
const AIFaq = require('../models/AIFaq');
const { requireAuth } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

// ===== PUBLIC =====

// GET /api/ai-assistant/faqs
// Renvoie toutes les entrées actives (question/mots-clés/réponse). Le
// frontend charge cette liste UNE fois puis fait tout le rapprochement de
// mots-clés lui-même, dans le navigateur — aucune clé API, aucun coût par
// question posée.
router.get('/faqs', async (req, res, next) => {
  try {
    const faqs = await AIFaq.find({ active: true }).sort({ order: 1 }).select('question keywords answer category');
    res.json({ success: true, data: faqs });
  } catch (err) {
    next(err);
  }
});

// ===== ADMIN (protégé) =====

router.get('/admin/faqs', requireAuth, async (req, res, next) => {
  try {
    const faqs = await AIFaq.find().sort({ category: 1, order: 1 });
    res.json({ success: true, data: faqs });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/faqs', requireAuth, async (req, res, next) => {
  try {
    const faq = await AIFaq.create(req.body);

    await logAction(req, {
      action: 'CREATE_FAQ',
      targetType: 'AIFaq',
      targetId: faq._id,
      details: `Création : ${faq.question}`,
    });

    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/faqs/:id', requireAuth, async (req, res, next) => {
  try {
    const faq = await AIFaq.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ success: false, message: 'Entrée introuvable.' });

    await logAction(req, {
      action: 'UPDATE_FAQ',
      targetType: 'AIFaq',
      targetId: faq._id,
      details: `Modification : ${faq.question}`,
    });

    res.json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/faqs/:id', requireAuth, async (req, res, next) => {
  try {
    const faq = await AIFaq.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'Entrée introuvable.' });

    await logAction(req, {
      action: 'DELETE_FAQ',
      targetType: 'AIFaq',
      targetId: req.params.id,
      details: `Suppression : ${faq.question}`,
    });

    res.json({ success: true, message: 'Entrée supprimée.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
