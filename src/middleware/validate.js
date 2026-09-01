/**
 * Validation simple et sans dépendance externe pour les demandes (leads).
 * Vérifie les champs communs à tous les formulaires ; les champs
 * spécifiques à chaque service restent libres dans "data".
 */
function validateLead(req, res, next) {
  const { fullName, phone } = req.body;
  const errors = [];

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Le nom complet est requis.');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
    errors.push('Un numéro de téléphone valide est requis.');
  }

  if (req.body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      errors.push('L\'adresse email n\'est pas valide.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Champs invalides.', errors });
  }

  next();
}

module.exports = { validateLead };
