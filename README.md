# Game Fight 🥊

Application de combat tour par tour avec gestion de personnages, authentification JWT et système d'IA.

## Fonctionnalités

- 🔐 **Authentification JWT** avec rôles (ADMIN, JOUEUR)
- 👤 **Gestion des personnages** par l'admin (CRUD complet)
- ⚔️ **Combat tour par tour** contre une IA
- 🎲 **Système de coups critiques** (10% de chance, dégâts x2)
- ✨ **Animations CSS** pour les actions de combat
- 📊 **Caractéristiques** : Vie, Attaque, Défense, Vitesse
- 🎯 **Compétences** avec coût en mana

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer MongoDB (assurez-vous qu'il est installé)
mongod

# Démarrer le serveur de développement (backend + frontend)
npm run dev
```

## Scripts disponibles

- `npm run dev` - Lance le backend et frontend en mode développement
- `npm run server` - Lance uniquement le backend
- `npm run client` - Lance uniquement le frontend
- `npm start` - Lance le backend en production
- `npm run build` - Build le frontend pour la production

## Technologies

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: React, Vite, React Router
- **Styling**: CSS avec animations
- **Icons**: Lucide React

## Structure du projet

```
├── server/              # Backend Express
│   ├── models/         # Modèles MongoDB
│   ├── routes/         # Routes API
│   ├── middleware/     # Middleware JWT
│   └── server.js       # Point d'entrée serveur
├── src/                # Frontend React
│   └── components/     # Composants React
├── pages/              # Pages principales
├── services/           # Services API
└── styles/             # Fichiers CSS
```

## Comptes par défaut

Après le premier lancement, vous pouvez créer un compte admin via l'inscription avec le rôle ADMIN.

## Déploiement

Le projet peut être déployé sur des plateformes comme:
- **Backend**: Render, Railway, Heroku
- **Frontend**: Vercel, Netlify
- **Database**: MongoDB Atlas
