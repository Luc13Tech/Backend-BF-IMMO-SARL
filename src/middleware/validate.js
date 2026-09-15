function isString(value) {
  return typeof value === 'string';
}

function validateLead(req, res, next) {
  const {
    fullName,
    phone,
    email,
    message,
    data,
  } = req.body || {};

  if (!isString(fullName) || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Le nom complet est requis.',
    });
  }

  if (fullName.length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Le nom complet est trop long.',
    });
  }

  if (!isString(phone) || phone.trim().length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Un numéro de téléphone valide est requis.',
    });
  }

  if (phone.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Le numéro de téléphone est trop long.',
    });
  }

  if (email !== undefined && email !== null && email !== '') {
    if (!isString(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email invalide.',
      });
    }

    if (email.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'Email trop long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Email invalide.',
      });
    }
  }

  if (message !== undefined && message !== null) {
    if (!isString(message) || message.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Message trop long.',
      });
    }
  }

  if (data !== undefined && data !== null) {
    if (
      typeof data !== 'object' ||
      Array.isArray(data)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Données de formulaire invalides.',
      });
    }

    const keys = Object.keys(data);

    if (keys.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Trop de champs dans la demande.',
      });
    }

    for (const key of keys) {
      if (key.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Nom de champ invalide.',
        });
      }

      const value = data[key];

      if (
        typeof value === 'string' &&
        value.length > 5000
      ) {
        return res.status(400).json({
          success: false,
          message: 'Un champ de la demande est trop long.',
        });
      }
    }
  }

  next();
}

module.exports = {
  validateLead,
};
