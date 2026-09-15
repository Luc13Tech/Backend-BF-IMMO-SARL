const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { requireUserAuth } = require('../middleware/userAuth');
const { rateLimit } = require('../middleware/security');

const router = express.Router();

const USER_LOGIN_LIMIT = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) =>
    `${req.ip || 'unknown'}:${String(req.body?.email || '').toLowerCase().trim()}`,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
});

const USER_REGISTER_LIMIT = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Trop de créations de comptes depuis cette adresse IP.',
});

function signUserToken(user) {
  return jwt.sign(
    {
      id: String(user._id),
      type: 'user',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      algorithm: 'HS256',
    }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  };
}

router.post('/register', USER_REGISTER_LIMIT, async (req, res, next) => {
  try {
    const fullName =
      typeof req.body?.fullName === 'string'
        ? req.body.fullName.trim()
        : '';

    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const phone =
      typeof req.body?.phone === 'string'
        ? req.body.phone.trim()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Nom complet, email et mot de passe sont requis.',
      });
    }

    if (fullName.length > 150 || email.length > 254 || phone.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Données utilisateur trop longues.',
      });
    }

    if (password.length < 8 || password.length > 256) {
      return res.status(400).json({
        success: false,
        message:
          'Le mot de passe doit contenir entre 8 et 256 caractères.',
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Un compte existe déjà avec cet email.',
      });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    const token = signUserToken(user);

    res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', USER_LOGIN_LIMIT, async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis.',
      });
    }

    if (email.length > 254 || password.length > 256) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const token = signUserToken(user);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireUserAuth, (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user),
  });
});

router.get('/favorites', requireUserAuth, async (req, res, next) => {
  try {
    const user = await req.user.populate('favorites');

    res.json({
      success: true,
      data: user.favorites,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/favorites/:propertyId', requireUserAuth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de bien invalide.',
      });
    }

    const user = req.user;

    const index = user.favorites.findIndex(
      (id) => id.toString() === propertyId
    );

    let added;

    if (index >= 0) {
      user.favorites.splice(index, 1);
      added = false;
    } else {
      user.favorites.push(propertyId);
      added = true;
    }

    await user.save();

    res.json({
      success: true,
      added,
      favorites: user.favorites,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
