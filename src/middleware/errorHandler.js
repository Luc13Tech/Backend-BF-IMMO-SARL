/* eslint-disable no-unused-vars */

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route introuvable : ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('[Erreur]', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation.',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Une ressource avec cette valeur unique existe déjà.',
      field: Object.keys(err.keyPattern || {})[0],
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Erreur interne du serveur.',
  });
}

module.exports = { notFound, errorHandler };
