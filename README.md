# 🎮 Game Fight - Combat Tour par Tour Style Pokémon

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

Application de combat tour par tour **strictement séquentiel** inspirée de Pokémon, avec gestion de personnages, authentification JWT, système d'IA et animations fluides.

## ✨ Fonctionnalités Principales

### 🎯 Système de Combat Tour par Tour (Style Pokémon)
- ⚡ **Ordre basé sur la vitesse** : Le personnage le plus rapide attaque en premier
- 🔄 **Combat strictement séquentiel** : Un personnage attaque, puis l'autre (jamais simultané)
- ⏸️ **Pause de 2 secondes** entre chaque attaque pour suivre l'action
- 💥 **Animations fluides** : Attaque (0.6s) + Dégâts (1.3s) avec barre de vie qui descend progressivement
- 🎲 **Coups critiques** : 10% de chance, dégâts x2
- 🛡️ **Vérification K.O.** après chaque attaque

### 🔐 Authentification & Gestion
- 🔑 **JWT Authentication** avec rôles (ADMIN, JOUEUR)
- 👤 **Gestion des personnages** par l'admin (CRUD complet)
- 📊 **Statistiques** : Vie, Attaque, Défense, Vitesse, Mana
- 🎯 **Compétences variées** : Attaque, Spécial, Soin, Défense
- 🤖 **IA intelligente** qui choisit les meilleures compétences

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

## 🛠️ Technologies

### Backend
- **Node.js** + **Express** - Serveur API REST
- **MongoDB** + **Mongoose** - Base de données
- **JWT** - Authentification sécurisée
- **bcryptjs** - Hashage des mots de passe

### Frontend
- **React 18** - Interface utilisateur
- **Vite** - Build tool ultra-rapide
- **React Router** - Navigation
- **Axios** - Requêtes HTTP
- **Lucide React** - Icônes modernes

### Système de Combat
- **TurnBasedCombat.js** - Moteur de combat modulaire
- **AnimatedBattleArena.jsx** - Animations séquentielles avec async/await
- **CSS Animations** - Effets visuels fluides

## 📁 Structure du Projet

```
├── server/
│   ├── models/
│   │   ├── Character.js        # Modèle personnage
│   │   └── User.js             # Modèle utilisateur
│   ├── routes/
│   │   ├── auth.js             # Routes authentification
│   │   ├── characters.js       # Routes CRUD personnages
│   │   └── game.js             # Routes combat (/battle/init, /battle/turn)
│   ├── utils/
│   │   ├── TurnBasedCombat.js  # ⭐ Moteur de combat tour par tour
│   │   └── gameLogic.js        # Logique de jeu (legacy)
│   ├── middleware/
│   │   └── auth.js             # Middleware JWT
│   └── server.js               # Point d'entrée serveur
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── AnimatedBattleArena.jsx  # ⭐ Arène avec animations
│   │   │   ├── BattleArena.jsx          # Arène simple
│   │   │   ├── CharacterSprite.jsx      # Sprite personnage
│   │   │   ├── SkillButtons.jsx         # Boutons compétences
│   │   │   └── BattleLog.jsx            # Journal de combat
│   │   ├── admin/              # Composants admin
│   │   ├── auth/               # Composants auth
│   │   └── ui/                 # Composants UI réutilisables
│   ├── App.jsx                 # Composant principal
│   └── main.jsx                # Point d'entrée React
├── pages/
│   ├── BattlePage.jsx          # Page de combat
│   ├── CharacterSelect.jsx     # Sélection personnage
│   ├── Login.jsx               # Connexion
│   └── Register.jsx            # Inscription
├── services/
│   ├── gameService.js          # Service API combat
│   ├── characterService.js     # Service API personnages
│   └── authService.js          # Service API auth
├── styles/
│   ├── main.css                # Styles principaux + animations combat
│   └── animations.css          # Animations générales
├── COMBAT_SYSTEM.md            # 📖 Documentation système de combat
├── ANIMATION_SEQUENCE.md       # 📖 Diagrammes d'animation
└── CHANGELOG_TIMINGS.md        # 📖 Historique des durées
```

## Comptes par défaut

Après le premier lancement, vous pouvez créer un compte admin via l'inscription avec le rôle ADMIN.

## ⚔️ Système de Combat - Détails Techniques

### Chronologie d'un Tour (~6 secondes)

```
T+0.0s  → 1er attaquant attaque (0.6s)
T+0.6s  → Animation dégâts (1.3s)
T+1.9s  → ⏸️ PAUSE 2 SECONDES
T+3.9s  → 2ème attaquant contre-attaque (0.6s)
T+4.5s  → Animation dégâts (1.3s)
T+5.8s  → Fin du tour ✅
```

### Règles du Combat

| Règle | Implémentation |
|-------|----------------|
| **Tour par tour strict** | ✅ Actions séquentielles, jamais simultanées |
| **Vitesse → Ordre** | ✅ Le plus rapide attaque en premier |
| **Égalité de vitesse** | ✅ Ordre aléatoire (50/50) |
| **Pause entre attaques** | ✅ 2 secondes |
| **Vérification K.O.** | ✅ Après chaque attaque |
| **Animation des dégâts** | ✅ Barre de vie descend en 1 seconde |

### Formule de Dégâts

```javascript
Dégâts de base = Puissance compétence + (Attaque × 0.5)
Réduction défense = Défense adversaire × 0.3
Dégâts finaux = max(1, Dégâts de base - Réduction défense)

Si coup critique : Dégâts finaux × 2
```

## 📚 Documentation

- **[COMBAT_SYSTEM.md](./COMBAT_SYSTEM.md)** - Documentation complète du système de combat
- **[ANIMATION_SEQUENCE.md](./ANIMATION_SEQUENCE.md)** - Diagrammes détaillés des animations
- **[CHANGELOG_TIMINGS.md](./CHANGELOG_TIMINGS.md)** - Historique des modifications de durées

## 🚀 Déploiement

Le projet peut être déployé sur :
- **Backend** : Render, Railway, Heroku
- **Frontend** : Vercel, Netlify
- **Database** : MongoDB Atlas

### Variables d'environnement requises

```env
MONGODB_URI=mongodb://localhost:27017/game-fight
JWT_SECRET=votre_secret_jwt
PORT=5001
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésite pas à ouvrir une issue ou une pull request.

## 📝 License

MIT License - voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

**Léo Duriez** - [GitHub](https://github.com/leoduriez)

---

⭐ Si ce projet t'a plu, n'hésite pas à lui donner une étoile sur GitHub !
