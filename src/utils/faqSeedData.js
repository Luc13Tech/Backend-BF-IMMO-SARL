/**
 * Base de connaissance de départ pour l'Assistant Virtuel — 100% éditable
 * ensuite depuis l'admin (ajout, modification, suppression, activation).
 * Chaque entrée : des mots-clés qui déclenchent la réponse quand ils
 * apparaissent dans la question du visiteur (voir matchFaq.js côté frontend).
 */
const FAQ_SEED = [
  // ===== GÉNÉRAL =====
  {
    question: 'Quels sont vos horaires ?',
    keywords: ['horaire', 'heure', 'ouvert', 'ouverture', 'fermeture', 'disponible quand'],
    answer: "Notre équipe est disponible du lundi au samedi, de 8h30 à 18h30. En dehors de ces horaires, écrivez-nous sur WhatsApp — nous répondons dès que possible.",
    category: 'general',
    order: 1,
  },
  {
    question: 'Où êtes-vous situés ?',
    keywords: ['adresse', 'situe', 'localisation', 'bureau', 'ou trouver', 'ou etes'],
    answer: "Nos bureaux sont à Cité Belle Ville, Villa N°102KMW, Sicap Keur Massar, Dakar. Vous pouvez aussi nous retrouver sur la carte dans la page Contact.",
    category: 'general',
    order: 2,
  },
  {
    question: 'Quelles zones couvrez-vous ?',
    keywords: ['zone', 'quartier', 'ville', 'region', 'partout au senegal', 'couvrez'],
    answer: "Nous intervenons principalement à Dakar et sa banlieue (Sicap Keur Massar, Parcelles Assainies, Almadies, Mermoz, Ouakam, Yoff...). Pour un projet en dehors de ces zones, contactez-nous : nous étudions chaque demande.",
    category: 'general',
    order: 3,
  },
  {
    question: 'Comment vous contacter ?',
    keywords: ['contact', 'joindre', 'telephone', 'numero', 'appeler', 'whatsapp'],
    answer: "Vous pouvez nous appeler au +221 33 813 42 65, nous écrire sur WhatsApp au +221 77 829 41 42, ou par email à contact@bfimmo-senegal.com.",
    category: 'contact',
    order: 4,
  },
  {
    question: 'Quel est votre délai de réponse ?',
    keywords: ['delai', 'reponse rapide', 'combien de temps', 'rapidite', 'attendre'],
    answer: "Nous répondons généralement sous 24h ouvrées à toute demande envoyée via le site ou WhatsApp.",
    category: 'general',
    order: 5,
  },
  {
    question: 'Quels services proposez-vous ?',
    keywords: ['service', 'que faites vous', 'activite', 'metier', 'proposez'],
    answer: "BF IMMO SARL propose 7 services : achat, location, gérance, vente, conseils, construction BTP et suivi de chantier. Chaque service a son propre formulaire sur le site pour nous transmettre votre demande précise.",
    category: 'general',
    order: 6,
  },
  {
    question: "Est-ce que je peux visiter vos bureaux sans rendez-vous ?",
    keywords: ['visiter bureau', 'sans rendez-vous', 'passer directement', 'venir sur place'],
    answer: "Nous recommandons de prendre rendez-vous au préalable (téléphone ou WhatsApp) pour garantir la disponibilité d'un conseiller à votre arrivée.",
    category: 'general',
    order: 7,
  },

  // ===== ACHAT =====
  {
    question: 'Comment acheter un bien avec vous ?',
    keywords: ['acheter', 'achat', 'devenir proprietaire', 'acquerir'],
    answer: "Remplissez le formulaire de la page Achat avec le type de bien, la zone et votre budget. Un conseiller vous recontacte pour affiner votre recherche et organiser des visites.",
    category: 'achat',
    order: 10,
  },
  {
    question: 'Quels documents faut-il pour acheter ?',
    keywords: ['document achat', 'papier necessaire', 'piece identite achat', 'dossier acheteur'],
    answer: "Pour un achat, il faut généralement une pièce d'identité valide, un justificatif de revenus, et selon le mode de financement, une attestation bancaire. Notre équipe vous guide précisément selon votre situation.",
    category: 'achat',
    order: 11,
  },
  {
    question: "Combien de temps prend un achat immobilier ?",
    keywords: ['duree achat', 'combien de temps acheter', 'delai acquisition'],
    answer: "Le délai varie selon le bien et le financement, en général entre 1 et 3 mois entre la visite et la signature définitive. Nous vous accompagnons à chaque étape pour éviter les retards.",
    category: 'achat',
    order: 12,
  },
  {
    question: "Proposez-vous des terrains à vendre ?",
    keywords: ['terrain a vendre', 'acheter terrain', 'parcelle vente'],
    answer: "Oui, nous avons régulièrement des terrains disponibles. Consultez la page Nos biens et filtrez par type « Terrain », ou passez par le formulaire Achat pour préciser votre zone souhaitée.",
    category: 'achat',
    order: 13,
  },

  // ===== LOCATION =====
  {
    question: 'Comment louer un bien ?',
    keywords: ['louer', 'location appartement', 'trouver location', 'chercher a louer'],
    answer: "Remplissez le formulaire de la page Location avec le type de bien, la zone et votre budget mensuel. Nous vous proposons des biens correspondants et organisons les visites.",
    category: 'location',
    order: 20,
  },
  {
    question: 'Quelle caution pour une location ?',
    keywords: ['caution', 'avance location', 'depot garantie'],
    answer: "La caution demandée dépend du bien et du propriétaire, généralement entre 1 et 3 mois de loyer. Le détail exact vous est communiqué avant la signature du bail.",
    category: 'location',
    order: 21,
  },
  {
    question: 'Proposez-vous des locations pour une nuit ?',
    keywords: ['nuitee', 'location nuit', 'une nuit', 'airbnb', 'chambre hotel', 'court sejour'],
    answer: "Oui, certains biens sont disponibles en location par nuitée (type chambre ou logement meublé de courte durée). Filtrez « Location par nuitée » dans Nos biens pour les voir directement.",
    category: 'location',
    order: 22,
  },
  {
    question: 'Proposez-vous des locations à la journée ?',
    keywords: ['journaliere', 'location jour', 'louer pour la journee', 'salle a la journee', 'bureau journee'],
    answer: "Oui, nous proposons aussi des biens en location journalière (bureaux, salles, certains logements). Filtrez « Location journalière » dans Nos biens.",
    category: 'location',
    order: 23,
  },
  {
    question: "Quelle est la différence entre location classique et nuitée ?",
    keywords: ['difference location nuitee', 'location mensuelle ou nuit', 'type de location'],
    answer: "La location classique est mensuelle et destinée à un usage durable (habitation, bureau). La location par nuitée ou journalière convient à un séjour court, facturé à la nuit ou à la journée, comme un hôtel.",
    category: 'location',
    order: 24,
  },
  {
    question: 'Puis-je louer un appartement meublé ?',
    keywords: ['meuble', 'appartement meuble', 'logement equipe'],
    answer: "Nous avons des biens meublés et non meublés selon les annonces. Précisez votre préférence dans le formulaire Location, nous filtrerons nos propositions en conséquence.",
    category: 'location',
    order: 25,
  },

  // ===== GÉRANCE =====
  {
    question: 'Comment confier mon bien en gérance ?',
    keywords: ['gerance', 'gerer mon bien', 'confier appartement', 'gestion locative'],
    answer: "Remplissez le formulaire Gérance en précisant le type de bien et s'il est déjà occupé. Notre équipe évalue votre bien et vous propose une offre de gestion adaptée.",
    category: 'gerance',
    order: 30,
  },
  {
    question: 'Quels sont vos frais de gérance ?',
    keywords: ['frais gerance', 'commission gestion', 'pourcentage gerance', 'cout gerance'],
    answer: "Nos frais de gérance dépendent du type de bien et des services inclus (recherche de locataire, encaissement des loyers, entretien...). Contactez-nous pour un devis personnalisé.",
    category: 'gerance',
    order: 31,
  },
  {
    question: 'Trouvez-vous les locataires vous-même ?',
    keywords: ['trouver locataire', 'chercher locataire', 'recherche locataire'],
    answer: "Oui, la recherche et la sélection de locataires fiables font partie de notre service de gérance, avec vérification des dossiers avant signature.",
    category: 'gerance',
    order: 32,
  },

  // ===== VENTE =====
  {
    question: 'Comment vendre mon bien avec vous ?',
    keywords: ['vendre', 'vente bien', 'mettre en vente', 'ceder mon bien'],
    answer: "Remplissez le formulaire Vente avec le type de bien, sa localisation et le prix souhaité. Nous évaluons votre bien, le mettons en avant sur notre plateforme, et recherchons activement des acheteurs.",
    category: 'vente',
    order: 40,
  },
  {
    question: 'Combien de temps pour vendre un bien ?',
    keywords: ['duree vente', 'combien de temps vendre', 'delai vente'],
    answer: "Le délai dépend du type de bien, du prix et de la zone. En moyenne, comptez 2 à 6 mois. Nous vous conseillons sur le prix pour optimiser ce délai.",
    category: 'vente',
    order: 41,
  },
  {
    question: 'Quelle commission prenez-vous sur une vente ?',
    keywords: ['commission vente', 'frais agence vente', 'pourcentage vente'],
    answer: "Notre commission dépend du type et de la valeur du bien. Elle vous est communiquée clairement dès notre premier échange, sans frais cachés.",
    category: 'vente',
    order: 42,
  },

  // ===== CONSEILS =====
  {
    question: 'Comment obtenir un conseil personnalisé ?',
    keywords: ['conseil', 'rendez vous conseil', 'accompagnement', 'avis expert'],
    answer: "Remplissez le formulaire Conseils avec le sujet qui vous préoccupe et une date souhaitée. Un conseiller BF IMMO vous contacte pour organiser un échange, en personne ou par téléphone.",
    category: 'conseils',
    order: 50,
  },
  {
    question: 'Les conseils sont-ils payants ?',
    keywords: ['conseil payant', 'gratuit conseil', 'cout consultation'],
    answer: "Un premier échange de conseil est gratuit pour évaluer votre besoin. Un accompagnement plus poussé peut faire l'objet d'un devis, présenté avant toute facturation.",
    category: 'conseils',
    order: 51,
  },

  // ===== BTP / CONSTRUCTION =====
  {
    question: 'Construisez-vous des maisons ?',
    keywords: ['construire', 'construction', 'batir', 'maison neuve', 'btp'],
    answer: "Oui, notre service Construction BTP prend en charge vos projets de construction, de la conception à la réalisation. Remplissez le formulaire BTP avec le type de construction et votre budget estimé.",
    category: 'btp',
    order: 60,
  },
  {
    question: 'Faites-vous les plans de construction ?',
    keywords: ['plan construction', 'architecte', 'dessin maison', 'conception'],
    answer: "Nous coordonnons la conception avec des architectes partenaires selon votre projet et votre terrain. Décrivez votre besoin dans le formulaire BTP pour recevoir un premier avis.",
    category: 'btp',
    order: 61,
  },
  {
    question: 'Combien coûte la construction d\'une villa ?',
    keywords: ['cout construction', 'prix construire villa', 'budget construction'],
    answer: "Le coût dépend de la surface, des matériaux et de la finition souhaitée. Donnez-nous votre budget estimé dans le formulaire BTP, nous vous proposons une évaluation adaptée.",
    category: 'btp',
    order: 62,
  },
  {
    question: 'Gérez-vous les autorisations de construire ?',
    keywords: ['permis de construire', 'autorisation construction', 'demarche administrative'],
    answer: "Nous vous accompagnons dans les démarches administratives liées à votre projet de construction, y compris les autorisations nécessaires selon votre commune.",
    category: 'btp',
    order: 63,
  },

  // ===== SUIVI DE CHANTIER =====
  {
    question: 'Proposez-vous un suivi de chantier ?',
    keywords: ['suivi chantier', 'surveiller travaux', 'controle chantier'],
    answer: "Oui, notre service de suivi de chantier assure un contrôle rigoureux de l'avancement, de la qualité et du respect du budget de vos travaux en cours.",
    category: 'suivi-chantier',
    order: 70,
  },
  {
    question: 'À quelle fréquence suivez-vous un chantier ?',
    keywords: ['frequence visite chantier', 'combien de fois chantier', 'passage chantier'],
    answer: "La fréquence des visites dépend de la phase du chantier — généralement hebdomadaire, avec un rapport détaillé à chaque étape clé.",
    category: 'suivi-chantier',
    order: 71,
  },
  {
    question: 'Mon chantier est déjà commencé, pouvez-vous le reprendre ?',
    keywords: ['reprendre chantier', 'chantier en cours', 'deja commence'],
    answer: "Oui, nous pouvons reprendre le suivi d'un chantier déjà en cours. Indiquez la référence du chantier si vous en avez une, ou décrivez la situation actuelle dans le formulaire.",
    category: 'suivi-chantier',
    order: 72,
  },

  // ===== PAIEMENT / GARANTIES =====
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    keywords: ['paiement', 'payer comment', 'mobile money', 'virement', 'especes'],
    answer: "Nous acceptons les virements bancaires, le mobile money et les espèces selon les transactions. Les modalités précises sont convenues avec votre conseiller avant signature.",
    category: 'general',
    order: 80,
  },
  {
    question: 'Vos annonces sont-elles vérifiées ?',
    keywords: ['annonce fiable', 'verifie', 'arnaque', 'securite transaction'],
    answer: "Oui, chaque bien publié sur notre plateforme est vérifié par notre équipe avant sa mise en ligne pour garantir la fiabilité des informations.",
    category: 'general',
    order: 81,
  },
  {
    question: 'Puis-je annuler une demande envoyée ?',
    keywords: ['annuler demande', 'retirer ma demande', 'changer avis'],
    answer: "Bien sûr, contactez-nous directement par téléphone ou WhatsApp en précisant votre nom pour annuler ou modifier une demande déjà envoyée.",
    category: 'general',
    order: 82,
  },

  // ===== FAVORIS / COMPTE =====
  {
    question: 'Comment sauvegarder un bien en favori ?',
    keywords: ['favori', 'sauvegarder bien', 'enregistrer annonce'],
    answer: "Créez un compte visiteur (bouton Connexion en haut du site), puis cliquez sur le cœur affiché sur chaque bien pour l'ajouter à vos favoris.",
    category: 'general',
    order: 90,
  },
  {
    question: 'Comment partager un bien à quelqu\'un ?',
    keywords: ['partager bien', 'envoyer lien', 'copier lien annonce'],
    answer: "Sur la fiche de chaque bien, utilisez le bouton « Copier le lien » : vous pouvez ensuite l'envoyer directement, la personne arrivera automatiquement sur ce bien précis.",
    category: 'general',
    order: 91,
  },
];

module.exports = { FAQ_SEED };
