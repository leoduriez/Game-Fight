# Instructions de lancement - Game Fight 🥊

## Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé :

1. **Node.js** (version 16 ou supérieure)
2. **MongoDB** (version 4.4 ou supérieure)
3. **npm** ou **yarn**

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer MongoDB

Assurez-vous que MongoDB est installé et en cours d'exécution sur votre machine.

**Sur macOS avec Homebrew :**
```bash
brew services start mongodb-community
```

**Sur Windows :**
Lancez MongoDB depuis les services Windows ou via la commande :
```bash
mongod
```

**Sur Linux :**
```bash
sudo systemctl start mongod
```

### 3. Vérifier le fichier .env

Le fichier `.env` contient déjà les configurations par défaut :
```
MONGODB_URI=mongodb://localhost:27017/gamefight
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi_en_production
PORT=5000
NODE_ENV=development
```

**⚠️ IMPORTANT :** En production, changez le `JWT_SECRET` par une valeur sécurisée !

## Lancement de l'application

### Option 1 : Lancer backend et frontend ensemble (recommandé)

```bash
npm run dev
```

Cette commande lance :
- Le serveur backend sur `http://localhost:5000`
- Le frontend React sur `http://localhost:3000`

### Option 2 : Lancer séparément

**Terminal 1 - Backend :**
```bash
npm run server
```

**Terminal 2 - Frontend :**
```bash
npm run client
```

## Accès à l'application

Une fois lancée, ouvrez votre navigateur et accédez à :
```
http://localhost:3000
```

## Première utilisation

### 1. Créer un compte administrateur

1. Cliquez sur "S'inscrire"
2. Remplissez le formulaire
3. **Sélectionnez le rôle "Administrateur"**
4. Créez votre compte

### 2. Créer des personnages (Admin)

1. Connectez-vous avec votre compte admin
2. Cliquez sur "Admin" dans la navigation
3. Cliquez sur "Créer un personnage"
4. Remplissez le formulaire avec :
   - Nom et description
   - 5 caractéristiques (Vie, Attaque, Défense, Vitesse, Mana)
   - 4 compétences avec leur coût en mana

### 3. Jouer (Joueur)

1. Créez un compte avec le rôle "Joueur" ou utilisez votre compte admin
2. Sélectionnez un personnage
3. Cliquez sur "Commencer le combat !"
4. Utilisez les compétences pour vaincre l'IA

## Fonctionnalités

### ✅ Authentification
- Inscription et connexion avec JWT
- Rôles : ADMIN et JOUEUR
- Routes protégées

### ✅ Gestion des personnages (Admin)
- Créer, modifier, supprimer des personnages
- Activer/désactiver des personnages
- 5 caractéristiques par personnage
- 4 compétences par personnage

### ✅ Système de combat
- Combat tour par tour contre une IA
- Le plus rapide attaque en premier
- Système de mana pour les compétences
- Coups critiques (10% de chance, dégâts x2)
- Journal de combat détaillé

### ✅ Animations CSS
- Animation d'attaque (déplacement)
- Animation de dégâts (shake + effet rouge)
- Barres de vie animées
- Animations de victoire/défaite
- Effets de hover et transitions

## Structure du projet

```
projet_game_fight/
├── server/                 # Backend Express
│   ├── models/            # Modèles MongoDB
│   ├── routes/            # Routes API
│   ├── middleware/        # Middleware JWT
│   ├── utils/             # Logique de jeu
│   └── server.js          # Serveur principal
├── src/                   # Frontend React
│   └── components/        # Composants React
├── pages/                 # Pages principales
├── services/              # Services API
├── context/               # Context React
├── hooks/                 # Hooks personnalisés
├── styles/                # CSS et animations
├── App.js                 # Composant principal
├── index.js               # Point d'entrée
└── package.json           # Dépendances

```

## Scripts disponibles

- `npm run dev` - Lance backend + frontend en développement
- `npm run server` - Lance uniquement le backend
- `npm run client` - Lance uniquement le frontend
- `npm start` - Lance le backend en production
- `npm run build` - Build le frontend pour la production

## Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier le statut
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Redémarrer
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod  # Linux
```

### Port déjà utilisé
Si le port 5000 ou 3000 est déjà utilisé, modifiez :
- Backend : `PORT` dans `.env`
- Frontend : `server.port` dans `vite.config.js`

### Erreur de connexion à MongoDB
Vérifiez que `MONGODB_URI` dans `.env` correspond à votre configuration MongoDB.

## Déploiement

### Backend (Render, Railway, Heroku)
1. Créez un compte sur la plateforme
2. Connectez votre repository Git
3. Configurez les variables d'environnement
4. Déployez !

### Frontend (Vercel, Netlify)
1. Build le projet : `npm run build`
2. Déployez le dossier `dist`
3. Configurez l'URL de l'API backend

### Base de données (MongoDB Atlas)
1. Créez un cluster gratuit sur MongoDB Atlas
2. Obtenez l'URL de connexion
3. Mettez à jour `MONGODB_URI` avec cette URL

## Support

Pour toute question ou problème :
1. Vérifiez que MongoDB est bien lancé
2. Vérifiez les logs du serveur dans le terminal
3. Ouvrez la console du navigateur (F12) pour les erreurs frontend

## Bon jeu ! 🥊
