require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { backfillPropertySlugs } = require('./src/utils/backfillSlugs');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await backfillPropertySlugs(); // donne un slug lisible aux biens existants qui n'en ont pas
  app.listen(PORT, () => {
    console.log(`[Serveur] BF IMMO API démarrée sur le port ${PORT}`);
  });
}

start();
