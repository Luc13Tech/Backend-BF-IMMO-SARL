# Backend BF IMMO SARL

API Node.js / Express / MongoDB pour la plateforme immobilière BF IMMO SARL.

## Installation locale

```bash
cd backend-bfimmo
npm install
cp .env.example .env   # puis remplir avec tes vraies valeurs
npm run seed            # crée les 7 métiers, le contenu de base et le compte admin
npm run dev              # démarre le serveur en local (http://localhost:5000)
```

## Structure

```
backend-bfimmo/
├── src/
│   ├── config/         → connexion MongoDB + configuration Cloudinary
│   ├── models/         → Service, Property, Lead, SiteContent, AdminUser, AIKnowledge
│   ├── middleware/      → auth (JWT), validation, gestion des erreurs
│   ├── routes/          → toutes les routes API
│   └── utils/seed.js    → script d'initialisation des données
├── server.js
└── .env
```

## Variables d'environnement requises

Voir `.env.example`. Sur Render, ajoute-les dans **Environment** (jamais dans le code).

## Routes principales

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Connexion admin |
| GET | `/api/services` | Public | Liste des 7 métiers |
| GET | `/api/properties` | Public | Liste des biens (filtrable) |
| POST | `/api/leads/:service` | Public | Soumission d'un formulaire |
| GET | `/api/content` | Public | Textes éditables du site |
| POST | `/api/upload` | Admin | Upload d'image vers Cloudinary |
| GET | `/api/ai-assistant/context` | Public | Contexte pour l'Assistant Virtuel |

Toutes les routes `/api/admin/*` ou marquées "Admin" nécessitent un header :
```
Authorization: Bearer <token>
```

## Déploiement sur Render

1. Nouveau **Web Service** → connecter le repo GitHub `backend-bfimmo`
2. Build command : `npm install`
3. Start command : `npm start`
4. Ajouter toutes les variables de `.env.example` dans l'onglet **Environment**
5. Une fois déployé, exécuter le seed une fois via le Shell Render : `npm run seed`

## Sécurité — à faire avant la mise en production réelle

- [ ] Changer le mot de passe de l'utilisateur MongoDB (`bfimmosarl_db_user`) — il a été partagé en clair pendant le développement
- [ ] Changer `SEED_ADMIN_PASSWORD` immédiatement après la première connexion admin
- [ ] Restreindre l'accès réseau MongoDB Atlas aux IP de Render une fois connues, plutôt que `0.0.0.0/0`
- [ ] Ne jamais commiter le fichier `.env` (déjà exclu via `.gitignore`)

## Prochaine étape

Une fois ce backend déployé et testé, on passe au frontend (React + Vite + PWA), qui consommera cette API.
