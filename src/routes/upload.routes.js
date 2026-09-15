const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../config/cloudinary');
const { rateLimit } = require('../middleware/security');

const router = express.Router();

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Trop de téléchargements de fichiers. Réessayez plus tard.',
});

const ALLOWED_FOLDERS = new Set([
  'properties',
  'services',
  'content',
  'misc',
]);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 20,
    fields: 10,
    parts: 35,
    headerPairs: 200,
  },

  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new Error(
          'Format image non autorisé. Utilisez JPEG, PNG, WEBP ou GIF.'
        )
      );
    }

    cb(null, true);
  },
});

function getFolder(req) {
  const folder =
    typeof req.body?.folder === 'string'
      ? req.body.folder.trim()
      : 'misc';

  return ALLOWED_FOLDERS.has(folder)
    ? folder
    : 'misc';
}

function validateImageSignature(buffer, mimeType) {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  // JPEG
  if (
    mimeType === 'image/jpeg' &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return true;
  }

  // PNG
  if (
    mimeType === 'image/png' &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WEBP
  if (
    mimeType === 'image/webp' &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return true;
  }

  // GIF
  if (
    mimeType === 'image/gif' &&
    (
      buffer.toString('ascii', 0, 6) === 'GIF87a' ||
      buffer.toString('ascii', 0, 6) === 'GIF89a'
    )
  ) {
    return true;
  }

  return false;
}

// POST /api/upload
router.post(
  '/',
  requireAuth,
  uploadRateLimit,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier reçu.',
        });
      }

      if (
        !validateImageSignature(
          req.file.buffer,
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          success: false,
          message: 'Le contenu du fichier ne correspond pas à une image valide.',
        });
      }

      const folder = getFolder(req);

      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        folder
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/upload/multiple
router.post(
  '/multiple',
  requireAuth,
  uploadRateLimit,
  upload.array('files', 20),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier reçu.',
        });
      }

      for (const file of req.files) {
        if (!validateImageSignature(file.buffer, file.mimetype)) {
          return res.status(400).json({
            success: false,
            message:
              'Un des fichiers ne correspond pas à une image valide.',
          });
        }
      }

      const folder = getFolder(req);

      const results = await Promise.all(
        req.files.map((file) =>
          uploadBufferToCloudinary(file.buffer, folder)
        )
      );

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/upload/:publicId
router.delete(
  '/:publicId',
  requireAuth,
  uploadRateLimit,
  async (req, res, next) => {
    try {
      const publicId = decodeURIComponent(req.params.publicId);

      /*
       * Empêche un admin de demander la suppression d'un asset
       * Cloudinary qui ne fait pas partie de l'espace BF IMMO.
       */
      if (!publicId.startsWith('bfimmo/')) {
        return res.status(403).json({
          success: false,
          message: 'Ressource Cloudinary non autorisée.',
        });
      }

      await deleteFromCloudinary(publicId);

      res.json({
        success: true,
        message: 'Image supprimée.',
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
