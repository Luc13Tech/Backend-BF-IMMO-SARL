const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireUserAuth } = require('../middleware/userAuth');

const router = express.Router();

function signUserToken(user) {
  return jwt.sign(
    { id: user._id, type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
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

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom complet, email et mot de passe sont requis.',
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Un compte existe déjà avec cet email.',
      });
    }

    const user = await User.create({ fullName, email, phone, password });
    const token = signUserToken(user);

    res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const token = signUserToken(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me
router.get('/me', requireUserAuth, (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// GET /api/users/favorites → liste des biens favoris (peuplés)
router.get('/favorites', requireUserAuth, async (req, res, next) => {
  try {
    const user = await req.user.populate('favorites');
    res.json({ success: true, data: user.favorites });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/favorites/:propertyId → ajoute/retire un bien des favoris (bascule)
router.put('/favorites/:propertyId', requireUserAuth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const user = req.user;

    const index = user.favorites.findIndex((id) => id.toString() === propertyId);
    let added;

    if (index >= 0) {
      user.favorites.splice(index, 1);
      added = false;
    } else {
      user.favorites.push(propertyId);
      added = true;
    }

    await user.save();
    res.json({ success: true, added, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
