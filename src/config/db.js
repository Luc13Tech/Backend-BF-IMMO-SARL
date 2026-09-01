const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI manquant dans les variables d\'environnement');
    }

    mongoose.set('strictQuery', true);

    await mongoose.connect(uri);

    console.log(`[MongoDB] Connecté à la base : ${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Erreur de connexion :', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Déconnecté.');
    });
  } catch (err) {
    console.error('[MongoDB] Échec de connexion initiale :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
