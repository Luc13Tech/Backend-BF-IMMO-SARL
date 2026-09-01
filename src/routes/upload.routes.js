const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Stockage en mémoire : le fichier est streamé directement vers Cloudinary,
// jamais écrit sur le disque du serveur.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo par image
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont acceptées.'));
    }
    cb(null, true);
  },
});

// POST /api/upload  (form-data: file, folder=properties|services|content)
// Protégé : seul l'admin peut ajouter des images depuis la plateforme.
router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu.' });
    }

    const folder = req.body.folder || 'misc';
    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/upload/multiple  (form-data: files[], folder=...)
router.post('/multiple', requireAuth, upload.array('files', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu.' });
    }

    const folder = req.body.folder || 'misc';
    const results = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer, folder))
    );

    res.status(201).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/upload/:publicId → supprime une image (publicId encodé, ex: bfimmo%2Fproperties%2Fabc123)
router.delete('/:publicId', requireAuth, async (req, res, next) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await deleteFromCloudinary(publicId);
    res.json({ success: true, message: 'Image supprimée.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
