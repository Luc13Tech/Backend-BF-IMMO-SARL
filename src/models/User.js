const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Compte utilisateur public (visiteur du site), distinct des comptes
 * AdminUser. Sert à l'inscription/connexion et à la sauvegarde de biens
 * en favoris.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
