/* eslint-disable no-unused-vars */

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route introuvable.',
  });
}

function errorHandler(err, req, res, next) {
  console.error('[Erreur serveur]', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'production'
      ? undefined
      : err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation.',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // ID MongoDB invalide
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Identifiant invalide.',
    });
  }

  // Doublon MongoDB
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Une ressource avec cette valeur unique existe déjà.',
      field: Object.keys(err.keyPattern || {})[0],
    });
  }

  // Limite Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Fichier trop volumineux.',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({
      success: false,
      message: 'Trop de fichiers envoyés.',
    });
  }

  // CORS
  if (
    err.message === 'Non autorisé par la politique CORS.'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Origine non autorisée.',
    });
  }

  const status =
    Number.isInteger(err.statusCode) && err.statusCode >= 400
      ? err.statusCode
      : 500;

  /*
   * En production, ne jamais exposer le message interne d'une erreur
   * inattendue.
   */
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur.'
      : err.message || 'Erreur interne du serveur.';

  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
