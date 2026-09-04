/**
 * Script de seed pour usage LOCAL (avec accès terminal) : npm run seed
 * Pour un déploiement sans accès Shell (ex: Render plan gratuit),
 * utilise plutôt la route GET /api/seed-init?key=... (voir seed.routes.js).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { runSeed } = require('./seedData');

async function main() {
  await connectDB();

  console.log('--- Exécution du seed ---');
  const result = await runSeed();

  result.log.forEach((line) => console.log(`  ✓ ${line}`));

  if (result.adminCreated) {
    console.log(`  ✓ Admin créé : ${result.adminEmail}`);
  } else if (result.adminEmail) {
    console.log(`  ✓ Admin déjà existant : ${result.adminEmail}`);
  } else {
    console.log('  ⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD manquants — admin non créé.');
  }

  console.log('--- Terminé ---');
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Erreur pendant le seed :', err);
  process.exit(1);
});
