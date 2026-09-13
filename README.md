# Backend BF IMMO SARL

API Node.js / Express / MongoDB pour la plateforme immobilière BF IMMO SARL.

## Installation locale

```bash
cd backend-bfimmo
npm install
cp .env.example .env   # puis remplir avec tes vraies valeurs
npm run seed             # crée les 7 métiers, le contenu de base et le compte admin
npm run dev               # démarre le serveur en local (http://localhost:5000)
```

## Structure

```
backend-bfimmo/
├── src/
│   ├── config/         → connexion MongoDB + configuration Cloudinary
│   ├── models/         → Service, Property, Lead, SiteContent, AdminUser, User, AIKnowledge, AdminAuditLog
│   ├── middleware/      → auth admin (JWT + rôles), auth utilisateur, validation, erreurs
│   ├── routes/          → toutes les routes API
│   └── utils/            → seed, seedData, audit (journalisation)
├── server.js
└── .env
```

## Rôles administrateur

`AdminUser.role` vaut `superadmin` ou `admin` :
- **superadmin** : accès à tout, y compris le journal d'audit (`/api/admin-audit`) et la suppression définitive des demandes
- **admin** (ex: secrétaire) : gère les demandes/biens/contenu au quotidien, mais ne peut ni consulter le journal d'audit, ni supprimer définitivement une demande (seulement l'archiver via son statut)

## Journal d'audit

Chaque action sensible (connexion, modification/suppression de demande, bien, service, contenu) est enregistrée dans `AdminAuditLog`, y compris l'admin responsable, l'heure, l'IP, et un descriptif. Même si une ressource est supprimée, sa trace reste dans le journal.

Consultable via `GET /api/admin-audit` (superadmin uniquement), avec filtres `admin`, `action`, `from`, `to`, et pagination.

## Variables d'environnement requises

Voir `.env.example`. Sur Render, ajoute-les dans **Environment** (jamais dans le code).

## Déploiement sur Render

1. Nouveau **Web Service** → connecter le repo GitHub `backend-bfimmo`
2. Build command : `npm install`
3. Start command : `npm start`
4. Ajouter toutes les variables de `.env.example` dans l'onglet **Environment**
5. Sans accès Shell (plan gratuit) : visiter `https://ton-backend.onrender.com/api/seed-init?key=TA_CLE` une fois déployé, pour créer les données de départ et le compte admin

## Sécurité — rappels

- Ne jamais commiter le fichier `.env` (déjà exclu via `.gitignore`)
- Régénérer le mot de passe MongoDB et le secret Cloudinary s'ils ont été partagés en clair pendant le développement
- Changer `SEED_ADMIN_PASSWORD` après la première connexion admin
