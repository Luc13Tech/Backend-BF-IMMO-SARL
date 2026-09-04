/**
 * Logique de seed partagée, réutilisable à la fois par le script CLI
 * (npm run seed, pour un usage local) et par la route HTTP /api/seed-init
 * (pour déclencher le seed sans accès Shell, ex: plan gratuit Render).
 */
const Service = require('../models/Service');
const AdminUser = require('../models/AdminUser');
const SiteContent = require('../models/SiteContent');

const SERVICES = [
  {
    slug: 'achat',
    name: 'Achat',
    shortDescription: "Trouvez le bien qui correspond à votre projet d'achat à Dakar.",
    order: 1,
    formFields: [
      { name: 'propertyType', label: 'Type de bien recherché', type: 'select', options: ['Villa', 'Appartement', 'Terrain', 'Bureau', 'Commerce'] },
      { name: 'zone', label: 'Zone souhaitée', type: 'text' },
      { name: 'budget', label: 'Budget (FCFA)', type: 'number' },
    ],
  },
  {
    slug: 'location',
    name: 'Location',
    shortDescription: 'Louez rapidement un bien adapté à vos besoins.',
    order: 2,
    formFields: [
      { name: 'propertyType', label: 'Type de bien', type: 'select', options: ['Villa', 'Appartement', 'Bureau', 'Commerce'] },
      { name: 'zone', label: 'Zone souhaitée', type: 'text' },
      { name: 'monthlyBudget', label: 'Budget mensuel (FCFA)', type: 'number' },
    ],
  },
  {
    slug: 'gerance',
    name: 'Gérance',
    shortDescription: 'Confiez la gestion locative de votre bien à notre équipe.',
    order: 3,
    formFields: [
      { name: 'propertyType', label: 'Type de bien à confier', type: 'select', options: ['Villa', 'Appartement', 'Bureau', 'Commerce', 'Immeuble'] },
      { name: 'location', label: 'Localisation du bien', type: 'text' },
      { name: 'currentlyOccupied', label: 'Le bien est-il actuellement occupé ?', type: 'select', options: ['Oui', 'Non'] },
    ],
  },
  {
    slug: 'vente',
    name: 'Vente',
    shortDescription: 'Vendez votre bien avec un accompagnement complet.',
    order: 4,
    formFields: [
      { name: 'propertyType', label: 'Type de bien à vendre', type: 'select', options: ['Villa', 'Appartement', 'Terrain', 'Bureau', 'Commerce'] },
      { name: 'location', label: 'Localisation du bien', type: 'text' },
      { name: 'expectedPrice', label: 'Prix souhaité (FCFA)', type: 'number' },
    ],
  },
  {
    slug: 'conseils',
    name: 'Conseils',
    shortDescription: 'Prenez rendez-vous avec un conseiller BF IMMO.',
    order: 5,
    formFields: [
      { name: 'topic', label: 'Sujet de la consultation', type: 'text' },
      { name: 'preferredDate', label: 'Date souhaitée', type: 'date' },
    ],
  },
  {
    slug: 'btp',
    name: 'Construction BTP',
    shortDescription: 'De la conception à la réalisation de votre projet de construction.',
    order: 6,
    formFields: [
      { name: 'projectType', label: 'Type de construction', type: 'select', options: ['Villa', 'Immeuble', 'Bureau', 'Rénovation'] },
      { name: 'landLocation', label: 'Localisation du terrain', type: 'text' },
      { name: 'budget', label: 'Budget estimé (FCFA)', type: 'number' },
    ],
  },
  {
    slug: 'suivi-chantier',
    name: 'Suivi de chantier',
    shortDescription: 'Un suivi rigoureux et transparent de votre chantier en cours.',
    order: 7,
    formFields: [
      { name: 'projectReference', label: 'Référence du chantier (si connue)', type: 'text', required: false },
      { name: 'location', label: 'Localisation du chantier', type: 'text' },
    ],
  },
];

const SITE_CONTENT = [
  { key: 'hero.title', value: 'Votre bien, notre engagement', section: 'accueil', label: 'Titre du hero' },
  { key: 'hero.subtitle', value: "BF IMMO SARL vous accompagne sur l'ensemble du cycle immobilier à Dakar.", section: 'accueil', label: 'Sous-titre du hero' },
  { key: 'about.text', value: "BF IMMO SARL accompagne particuliers, investisseurs et entreprises à Dakar sur l'ensemble du cycle immobilier : achat, location, gérance, vente, conseils, construction BTP et suivi de chantier.", section: 'a_propos', label: 'Texte À propos' },
  { key: 'contact.phone', value: '+221 33 813 42 65', section: 'contact', label: 'Téléphone fixe' },
  { key: 'contact.whatsapp', value: '+221 77 829 41 42', section: 'contact', label: 'Numéro WhatsApp' },
  { key: 'contact.email', value: 'bfimmo@gmail.com', section: 'contact', label: 'Email' },
  { key: 'contact.address', value: 'Cité Belle Ville, Villa N°102KMV, Sicap Keur Massar, Dakar', section: 'contact', label: 'Adresse' },
  { key: 'legal.rc', value: 'SN-DKR-2024-B-27236', section: 'legal', label: 'Registre de commerce' },
  { key: 'legal.ninea', value: '011357317 2D2', section: 'legal', label: 'NINEA' },
  { key: 'legal.bp', value: 'BP 20096 Dakar-Thiaroye', section: 'legal', label: 'Boîte postale' },
];

/**
 * Exécute le seed complet. Idempotent : peut être appelé plusieurs fois
 * sans dupliquer les données (upsert partout).
 * @returns {Promise<{services: number, content: number, adminCreated: boolean, adminEmail: string|null}>}
 */
async function runSeed() {
  const log = [];

  for (const svc of SERVICES) {
    await Service.findOneAndUpdate({ slug: svc.slug }, svc, { upsert: true, new: true });
    log.push(`Service: ${svc.name}`);
  }

  for (const item of SITE_CONTENT) {
    await SiteContent.findOneAndUpdate({ key: item.key }, item, { upsert: true, new: true });
    log.push(`Contenu: ${item.key}`);
  }

  let adminCreated = false;
  let adminEmail = null;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (email && password) {
    const existing = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!existing) {
      await AdminUser.create({
        name: 'Administrateur BF IMMO',
        email,
        password,
        role: 'superadmin',
      });
      adminCreated = true;
    }
    adminEmail = email;
  }

  return {
    services: SERVICES.length,
    content: SITE_CONTENT.length,
    adminCreated,
    adminEmail,
    log,
  };
}

module.exports = { runSeed };
