# 📚 Documentation Complète du Code - Game Fight

## Table des Matières

1. [Architecture Générale](#architecture-générale)
2. [Backend - Serveur](#backend---serveur)
3. [Frontend - Client](#frontend---client)
4. [Système de Combat](#système-de-combat)
5. [Base de Données](#base-de-données)
6. [Services API](#services-api)

---

## Architecture Générale

### Stack Technologique

**Backend:**
- Node.js + Express (serveur API REST)
- MongoDB + Mongoose (base de données)
- JWT (authentification)
- bcryptjs (hashage des mots de passe)

**Frontend:**
- React 18 (interface utilisateur)
- Vite (build tool)
- React Router (navigation)
- Axios (requêtes HTTP)

**Système de Combat:**
- TurnBasedCombat.js (moteur de combat modulaire)
- AnimatedBattleArena.jsx (animations séquentielles)
- CSS Animations (effets visuels)

---

## Backend - Serveur

### 📁 `server/server.js`

**Rôle:** Point d'entrée principal du serveur Express

**Fonctionnalités:**
- Configuration du serveur Express
- Connexion à MongoDB
- Middleware CORS et JSON
- Routes API montées
- Gestion des erreurs

**Variables d'environnement:**
```javascript
MONGODB_URI  // URI de connexion MongoDB
JWT_SECRET   // Secret pour signer les tokens JWT
PORT         // Port du serveur (défaut: 5001)
```

---

### 📁 `server/models/Character.js`

**Rôle:** Modèle Mongoose pour les personnages

**Structure du Schéma:**

```javascript
Character {
  name: String (unique)           // Nom du personnage
  description: String             // Description/lore
  image: String                   // Emoji ou URL d'image
  
  stats: {
    health: Number (1-200)        // Points de vie maximum
    attack: Number (1-100)        // Puissance d'attaque
    defense: Number (0-100)       // Défense
    speed: Number (1-100)         // Vitesse (ordre d'attaque)
    mana: Number (0-200)          // Mana maximum
  }
  
  skills: [Skill] (4 exactement)  // Compétences du personnage
  isActive: Boolean               // Disponible pour combat?
  createdBy: ObjectId             // Référence User (admin)
  createdAt: Date                 // Date de création
  updatedAt: Date                 // Date de modification
}

Skill {
  name: String                    // Nom de la compétence
  description: String             // Description
  power: Number (min: 0)          // Puissance (dégâts/soins)
  manaCost: Number (min: 0)       // Coût en mana
  type: String                    // 'attack', 'special', 'heal', 'defense'
}
```

**Validations:**
- Nom unique obligatoire
- Exactement 4 compétences par personnage
- Statistiques dans les limites min/max

**Hooks:**
- `pre('save')`: Met à jour `updatedAt` automatiquement

---

### 📁 `server/models/User.js`

**Rôle:** Modèle Mongoose pour les utilisateurs

**Structure du Schéma:**

```javascript
User {
  username: String (unique)       // Nom d'utilisateur
  email: String (unique)          // Email
  password: String                // Mot de passe hashé (bcrypt)
  role: String                    // 'ADMIN' ou 'PLAYER'
  createdAt: Date                 // Date d'inscription
}
```

**Méthodes:**
- `pre('save')`: Hash automatique du mot de passe avec bcrypt
- Validation email avec regex

---

### 📁 `server/utils/TurnBasedCombat.js`

**Rôle:** ⭐ Moteur principal du système de combat tour par tour

**Classes Exportées:**

#### 1. `Combatant`
Représente un combattant en combat

**Propriétés:**
```javascript
{
  id, name, image, role           // Identité
  stats: { health, attack, defense, speed, mana }
  skills: [...]                   // Compétences disponibles
  currentHealth, maxHealth        // PV actuels/max
  currentMana, maxMana            // Mana actuel/max
  statusEffects: []               // Buffs/debuffs (futur)
  totalDamageDealt               // Statistiques
  totalDamageTaken
  criticalHits
}
```

**Méthodes:**
- `isAlive()`: Vérifie si le combattant est vivant
- `canUseSkill(skill)`: Vérifie si assez de mana
- `getAvailableSkills()`: Retourne les compétences utilisables
- `takeDamage(amount)`: Applique des dégâts
- `heal(amount)`: Soigne le combattant
- `consumeMana(amount)`: Consomme du mana
- `regenerateMana()`: Régénère du mana
- `toJSON()`: Exporte l'état pour le frontend

#### 2. `ActionResult`
Encapsule le résultat d'une action de combat

**Propriétés:**
```javascript
{
  attackerName, defenderName      // Noms des combattants
  skillName, skillType            // Compétence utilisée
  success: boolean                // Action réussie?
  damage: number                  // Dégâts infligés
  healAmount: number              // Soins effectués
  isCritical: boolean             // Coup critique?
  defenderRemainingHealth         // PV restants du défenseur
  defenderDefeated: boolean       // Défenseur K.O.?
  message: string                 // Message de log
}
```

**Méthodes:**
- `generateMessage(turnNumber)`: Génère le message de log formaté

#### 3. `TurnBasedCombatManager`
Gestionnaire principal du combat

**Propriétés:**
```javascript
{
  player: Combatant               // Combattant joueur
  enemy: Combatant                // Combattant ennemi
  turnNumber: number              // Numéro du tour actuel
  battleLog: string[]             // Journal de combat
  isOver: boolean                 // Combat terminé?
  winner: string                  // 'player' ou 'enemy'
  turnHistory: []                 // Historique des tours
  currentPhase: string            // Phase actuelle
}
```

**Méthodes Principales:**

##### `determineAttackOrder()`
Détermine qui attaque en premier basé sur la vitesse

**Logique:**
1. Calcule vitesse effective avec variance (10%)
2. Si différence < 5% → ordre aléatoire 50/50
3. Sinon → le plus rapide attaque en premier

**Retour:** `{ first: Combatant, second: Combatant }`

##### `determineStrictAttackOrder()`
Version stricte sans variance (pour affichage prédictif)

**Retour:** `{ first: 'player'|'enemy'|'tie', second: ... }`

##### `rollCriticalHit()`
Vérifie si l'attaque est critique (10% de chance)

##### `calculateDamage(attacker, defender, skill)`
Calcule les dégâts d'une attaque

**Formule:**
```javascript
baseDamage = skill.power + (attacker.attack × 0.5)
defenseReduction = defender.defense × 0.3
damage = max(1, baseDamage - defenseReduction)

Si critique: damage × 2
```

**Retour:** `{ damage: number, isCritical: boolean }`

##### `executeAction(attacker, defender, skill)`
Exécute une action de combat

**Processus:**
1. Consomme le mana
2. Selon le type de compétence:
   - `heal`: Soigne l'attaquant
   - `defense`: Boost défense (actuellement = petit soin)
   - `attack`/`special`: Calcule et applique dégâts
3. Génère le message de log

**Retour:** `ActionResult`

##### `aiChooseSkill()`
IA choisit une compétence

**Stratégie:**
1. Si santé < 25% → priorité au soin
2. Sinon → attaque la plus puissante
3. Fallback → compétence aléatoire

**Retour:** `Skill` ou `null`

##### `executeTurn(playerSkillIndex)`
⭐ **Méthode principale** - Exécute un tour complet

**Processus:**
1. Validation (combat pas terminé, compétence valide, mana suffisant)
2. Incrémente le numéro de tour
3. IA choisit sa compétence
4. Détermine l'ordre d'attaque (vitesse)
5. **PHASE 1:** Premier attaquant agit
   - Exécute l'action
   - Vérifie si adversaire K.O.
   - Si oui → fin du combat
6. **PHASE 2:** Second attaquant agit (si vivant)
   - Exécute l'action
   - Vérifie si adversaire K.O.
7. Enregistre le tour dans l'historique

**Retour:**
```javascript
{
  success: boolean,
  message: string,
  battleState: Object
}
```

##### `endCombat(winner)`
Termine le combat et déclare le vainqueur

##### `getState()`
Retourne l'état complet du combat pour le frontend

**Retour:**
```javascript
{
  player: {...},
  enemy: {...},
  turnNumber: number,
  battleLog: string[],
  isOver: boolean,
  winner: string,
  currentPhase: string,
  speedComparison: {
    playerSpeed: number,
    enemySpeed: number,
    expectedFirst: string
  }
}
```

##### `static fromState(battleState)`
Crée une instance à partir d'un état existant (pour reprendre un combat)

**Constantes de Combat:**
```javascript
COMBAT_CONSTANTS = {
  CRITICAL_HIT_CHANCE: 0.1,        // 10% de chance
  CRITICAL_HIT_MULTIPLIER: 2.0,    // Dégâts × 2
  ATTACK_SCALING: 0.5,             // Coefficient attaque
  DEFENSE_SCALING: 0.3,            // Coefficient défense
  MIN_DAMAGE: 1,                   // Dégâts minimum
  MANA_REGEN_PER_TURN: 5,          // Régén mana (désactivée)
  SPEED_VARIANCE: 0.1              // Variance vitesse 10%
}
```

---

### 📁 `server/routes/game.js`

**Rôle:** Routes API pour le système de combat

#### Route: `POST /api/battle/init`

**Authentification:** Requise (JWT)

**Body:**
```javascript
{
  playerCharacterId: String  // ID du personnage du joueur
}
```

**Processus:**
1. Récupère le personnage du joueur depuis MongoDB
2. Sélectionne un ennemi aléatoire (différent du joueur)
3. Crée un `TurnBasedCombatManager`
4. Génère l'état initial du combat
5. Ajoute messages d'introduction au log

**Réponse:**
```javascript
{
  message: "Combat initialisé.",
  battleState: {...}  // État complet du combat
}
```

#### Route: `POST /api/battle/turn`

**Authentification:** Requise (JWT)

**Body:**
```javascript
{
  battleState: Object,        // État actuel du combat
  playerSkillIndex: Number    // Index de la compétence choisie (0-3)
}
```

**Processus:**
1. Validation des entrées
2. Recrée le `TurnBasedCombatManager` depuis l'état
3. Exécute le tour avec `executeTurn()`
4. Retourne le nouvel état

**Réponse:**
```javascript
{
  message: "Tour exécuté.",
  battleState: {...}  // Nouvel état après le tour
}
```

#### Route: `POST /api/battle/speed-info`

**Authentification:** Requise (JWT)

**Body:**
```javascript
{
  battleState: Object
}
```

**Réponse:**
```javascript
{
  playerSpeed: Number,
  enemySpeed: Number,
  expectedFirst: String,  // 'player', 'enemy', ou 'tie'
  explanation: String     // Explication textuelle
}
```

---

### 📁 `server/routes/auth.js`

**Rôle:** Routes d'authentification

#### Route: `POST /api/auth/register`

**Body:**
```javascript
{
  username: String,
  email: String,
  password: String,
  role: String  // 'ADMIN' ou 'PLAYER'
}
```

**Processus:**
1. Validation des données
2. Vérification unicité username/email
3. Hashage du mot de passe (bcrypt)
4. Création de l'utilisateur
5. Génération du token JWT

**Réponse:**
```javascript
{
  message: "Inscription réussie.",
  token: String,  // JWT token
  user: {
    id, username, email, role
  }
}
```

#### Route: `POST /api/auth/login`

**Body:**
```javascript
{
  email: String,
  password: String
}
```

**Processus:**
1. Recherche de l'utilisateur par email
2. Vérification du mot de passe (bcrypt.compare)
3. Génération du token JWT

**Réponse:**
```javascript
{
  message: "Connexion réussie.",
  token: String,
  user: {...}
}
```

---

### 📁 `server/routes/characters.js`

**Rôle:** Routes CRUD pour les personnages

#### Route: `GET /api/characters`

**Authentification:** Requise

**Réponse:** Liste de tous les personnages actifs

#### Route: `GET /api/characters/:id`

**Authentification:** Requise

**Réponse:** Détails d'un personnage spécifique

#### Route: `POST /api/characters`

**Authentification:** Requise (ADMIN uniquement)

**Body:** Données du personnage (name, description, stats, skills, image)

**Validation:**
- Exactement 4 compétences
- Stats dans les limites
- Nom unique

#### Route: `PUT /api/characters/:id`

**Authentification:** Requise (ADMIN uniquement)

**Body:** Données à mettre à jour

#### Route: `DELETE /api/characters/:id`

**Authentification:** Requise (ADMIN uniquement)

**Action:** Désactive le personnage (soft delete)

---

### 📁 `server/middleware/auth.js`

**Rôle:** Middleware d'authentification JWT

#### Fonction: `authenticate(req, res, next)`

**Processus:**
1. Extrait le token du header `Authorization: Bearer <token>`
2. Vérifie et décode le token JWT
3. Attache `req.user` avec les infos utilisateur
4. Appelle `next()` si valide

**Erreurs:**
- 401: Token manquant ou invalide

#### Fonction: `requireAdmin(req, res, next)`

**Processus:**
1. Vérifie que `req.user.role === 'ADMIN'`
2. Appelle `next()` si admin

**Erreurs:**
- 403: Accès refusé (pas admin)

---

## Frontend - Client

### 📁 `src/App.jsx`

**Rôle:** Composant racine de l'application

**Fonctionnalités:**
- Configuration du router React Router
- Gestion du contexte d'authentification
- Routes protégées avec `ProtectedRoute`

**Routes:**
```javascript
/                    → Login
/register            → Register
/character-select    → CharacterSelect (protégée)
/battle              → BattlePage (protégée)
/admin               → AdminDashboard (protégée, admin)
```

---

### 📁 `src/components/game/AnimatedBattleArena.jsx`

**Rôle:** ⭐ Arène de combat avec animations séquentielles

**État Local:**
```javascript
{
  displayState: Object,           // État affiché (peut différer de battleState)
  animationPhase: String,         // 'idle', 'player-attacking', 'enemy-attacking', 'waiting'
  playerAnimating: boolean,       // Animation d'attaque joueur
  enemyAnimating: boolean,        // Animation d'attaque ennemi
  playerTakingDamage: boolean,    // Animation dégâts joueur
  enemyTakingDamage: boolean,     // Animation dégâts ennemi
  isAnimating: boolean,           // Bloque les interactions
  currentPhaseMessage: String     // Message de phase actuelle
}
```

**Composant: SpeedIndicator**

Affiche les vitesses et l'ordre d'attaque prévu

**Props:**
- `player`: Données du joueur
- `enemy`: Données de l'ennemi
- `speedComparison`: Comparaison des vitesses

**Fonction: `animateTurnSequence(prevState, newState)`**

⭐ **Fonction principale** - Anime la séquence complète d'un tour

**Processus:**

1. **Détermination de l'ordre** (basé sur vitesse)
2. **PHASE 1: Premier attaquant**
   - Message "X attaque !" (0.6s)
   - Animation d'attaque
   - Animation de dégâts sur défenseur (0.3s)
   - Barre de vie descend progressivement (1s)
3. **PAUSE** (2 secondes) ⏸️
4. **PHASE 2: Second attaquant**
   - Message "X contre-attaque !" (0.6s)
   - Animation d'attaque
   - Animation de dégâts (0.3s)
   - Barre de vie descend (1s)
5. **FIN** - Retour à l'état idle

**Durée totale:** ~6 secondes

**Fonction: `animateHealthChange(startHealth, endHealth, updateCallback)`**

Anime la diminution progressive des PV

**Processus:**
- 20 étapes de 50ms chacune
- Durée totale: 1 seconde
- Mise à jour progressive de la barre de vie

**Fonction: `sleep(ms)`**

Utilitaire pour créer des pauses asynchrones

```javascript
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
```

**useEffect: Détection de changement de tour**

```javascript
useEffect(() => {
  if (prevState.turnNumber !== newState.turnNumber) {
    animateTurnSequence(prevState, newState);
  }
}, [battleState]);
```

**Rendu:**
- Indicateur de vitesse
- Sprites des personnages avec animations
- Boutons de compétences (désactivés pendant animation)
- Journal de combat
- Écran de résultat (victoire/défaite)

---

### 📁 `src/components/game/CharacterSprite.jsx`

**Rôle:** Affiche un personnage dans l'arène

**Props:**
```javascript
{
  character: Object,        // Données du personnage
  isPlayer: boolean,        // true = joueur, false = ennemi
  isActiveTurn: boolean,    // true = tour actif
  isAttacking: boolean,     // true = animation d'attaque
  isTakingDamage: boolean   // true = animation de dégâts
}
```

**Classes CSS Appliquées:**
- `.character-sprite`
- `.player` ou `.enemy`
- `.active-turn` (si tour actif)
- `.attacking` (pendant attaque)
- `.taking-damage` (pendant dégâts)

**Affichage:**
- Nom du personnage
- Image/emoji
- Barre de vie (HealthBar)
- Barre de mana (ManaBar)
- Statistiques (⚔️ Attaque, 🛡️ Défense, ⚡ Vitesse)

---

### 📁 `src/components/game/SkillButtons.jsx`

**Rôle:** Affiche les boutons de compétences

**Props:**
```javascript
{
  skills: Array,            // Liste des compétences
  currentMana: Number,      // Mana actuel
  onSkillSelect: Function,  // Callback sélection
  disabled: boolean         // Désactive tous les boutons
}
```

**Logique:**
- Bouton désactivé si mana insuffisant
- Affiche le coût en mana
- Affiche la puissance
- Icône selon le type de compétence

---

### 📁 `src/components/game/BattleLog.jsx`

**Rôle:** Journal de combat avec mise en forme contextuelle

**Props:**
```javascript
{
  logs: Array  // Messages de combat
}
```

**Fonction: `getLogEntryClass(log)`**

Détermine la classe CSS selon le contenu du message

**Classes appliquées:**
- `.turn-separator`: Messages de tour ("━━━ Tour X ━━━")
- `.victory`: Messages de victoire (🏆)
- `.defeat`: Messages de défaite (💀)
- `.critical-hit`: Coups critiques (💥)

**Fonctionnalités:**
- Auto-scroll vers le bas
- Mise en forme colorée selon le type de message

---

### 📁 `pages/BattlePage.jsx`

**Rôle:** Page principale du combat

**Hook: `useBattle()`**

Gère l'état du combat

**État:**
```javascript
{
  battleState: Object,      // État actuel du combat
  loading: boolean,         // Chargement en cours
  error: String            // Message d'erreur
}
```

**Fonctions:**
- `initBattle(characterId)`: Initialise un combat
- `executeTurn(skillIndex)`: Exécute un tour
- `resetBattle()`: Réinitialise l'état

**Processus:**
1. Récupère `characterId` depuis `location.state`
2. Initialise le combat au montage
3. Passe les callbacks à `AnimatedBattleArena`
4. Gère la fin du combat (redirection)

---

### 📁 `pages/CharacterSelect.jsx`

**Rôle:** Sélection du personnage avant le combat

**Processus:**
1. Charge tous les personnages disponibles
2. Affiche une grille de cartes
3. Au clic → navigation vers `/battle` avec `characterId`

---

### 📁 `pages/Login.jsx` & `pages/Register.jsx`

**Rôle:** Authentification des utilisateurs

**Fonctionnalités:**
- Formulaires de connexion/inscription
- Validation des champs
- Gestion des erreurs
- Stockage du token JWT
- Redirection après succès

---

## Services API

### 📁 `services/gameService.js`

**Rôle:** Service pour les appels API de combat

#### `initBattle(playerCharacterId)`

```javascript
POST /api/battle/init
Body: { playerCharacterId }
Retour: { battleState }
```

#### `executeTurn(battleState, playerSkillIndex)`

```javascript
POST /api/battle/turn
Body: { battleState, playerSkillIndex }
Retour: { battleState }
```

---

### 📁 `services/characterService.js`

**Rôle:** Service pour les appels API personnages

#### Fonctions:
- `getAllCharacters()`: GET /api/characters
- `getCharacterById(id)`: GET /api/characters/:id
- `createCharacter(data)`: POST /api/characters
- `updateCharacter(id, data)`: PUT /api/characters/:id
- `deleteCharacter(id)`: DELETE /api/characters/:id

---

### 📁 `services/authService.js`

**Rôle:** Service pour l'authentification

#### Fonctions:
- `register(userData)`: POST /api/auth/register
- `login(credentials)`: POST /api/auth/login
- `logout()`: Supprime le token local
- `getCurrentUser()`: Retourne l'utilisateur depuis le token
- `getToken()`: Retourne le token JWT stocké

---

## Styles CSS

### 📁 `styles/main.css`

**Sections principales:**

#### 1. Variables CSS
```css
:root {
  --primary: #1e6bff;
  --secondary: #ff8a00;
  --success: #00d68f;
  --danger: #ff3d71;
  --dark: #1a1a1f;
  --grey: #2e2e38;
  --grey-light: #8f9bb3;
  --border: #3a3a4a;
  --glow-primary: 0 0 20px rgba(30, 107, 255, 0.5);
  --glow-orange: 0 0 20px rgba(255, 138, 0, 0.5);
}
```

#### 2. Animations de Combat

**`.attacking`** - Animation d'attaque
```css
@keyframes attackAnimation {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(30px); }
  50%  { transform: translateX(-10px); }
  75%  { transform: translateX(10px); }
  100% { transform: translateX(0); }
}
```

**`.taking-damage`** - Animation de dégâts
```css
@keyframes damageFlash {
  0%, 100% { filter: brightness(1); }
  50% { 
    filter: brightness(1.5) saturate(0.5);
    transform: scale(0.95);
  }
}
```

**`.active-turn`** - Indicateur de tour actif
```css
.active-turn::before {
  content: "⚡ VOTRE TOUR";
  animation: pulse 1.5s ease-in-out infinite;
}
```

#### 3. Indicateur de Vitesse
```css
.speed-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(...);
  border: 2px solid var(--primary);
  border-radius: 1rem;
}
```

#### 4. Phase de Tour
```css
.turn-phase-indicator {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(...);
  border: 2px solid var(--orange);
  animation: phaseGlow 1.5s ease-in-out infinite;
}
```

#### 5. Journal de Combat
```css
.log-entry.turn-separator {
  background: linear-gradient(...);
  color: var(--primary);
  font-weight: 700;
}

.log-entry.critical-hit {
  background: linear-gradient(...);
  color: var(--orange);
  animation: criticalPulse 0.5s ease-out;
}
```

---

## Flux de Données

### Initialisation d'un Combat

```
1. USER clique sur un personnage
   ↓
2. CharacterSelect → navigate('/battle', { state: { characterId } })
   ↓
3. BattlePage.useEffect()
   ↓
4. useBattle.initBattle(characterId)
   ↓
5. gameService.initBattle(characterId)
   ↓
6. POST /api/battle/init
   ↓
7. TurnBasedCombatManager créé
   ↓
8. battleState retourné au frontend
   ↓
9. AnimatedBattleArena affiche l'arène
```

### Exécution d'un Tour

```
1. USER clique sur une compétence
   ↓
2. SkillButtons.onSkillSelect(index)
   ↓
3. BattlePage.handleSkillSelect(index)
   ↓
4. useBattle.executeTurn(index)
   ↓
5. gameService.executeTurn(battleState, index)
   ↓
6. POST /api/battle/turn
   ↓
7. TurnBasedCombatManager.fromState(battleState)
   ↓
8. manager.executeTurn(index)
   ↓
9. Nouveau battleState retourné
   ↓
10. AnimatedBattleArena détecte changement turnNumber
   ↓
11. animateTurnSequence() lance les animations
   ↓
12. Séquence de 6 secondes avec pauses
   ↓
13. Retour à l'état idle
```

---

## Constantes et Configurations

### Durées d'Animation (ms)

```javascript
ATTACK_ANIMATION: 600        // Animation d'attaque
DAMAGE_DELAY: 300           // Délai avant dégâts
HEALTH_ANIMATION_STEP: 50   // Étape animation PV
HEALTH_ANIMATION_TOTAL: 1000 // Total animation PV
PAUSE_BETWEEN_ATTACKS: 2000  // Pause entre attaques
TOTAL_TURN_DURATION: ~6000   // Durée totale d'un tour
```

### Formules de Combat

```javascript
// Dégâts
baseDamage = skill.power + (attacker.attack × 0.5)
defenseReduction = defender.defense × 0.3
finalDamage = max(1, baseDamage - defenseReduction)
if (critical) finalDamage × 2

// Ordre d'attaque
effectiveSpeed = speed + (random() × speed × 0.1)
if (speedDiff < 5%) → random 50/50
else → fastest first

// Coup critique
chance = 10%
multiplier = 2.0
```

---

## Points Clés du Système

### ✅ Tour par Tour Strict
- Un personnage attaque, puis l'autre
- Jamais d'actions simultanées
- Vérification K.O. après chaque attaque

### ⚡ Vitesse Détermine l'Ordre
- Le plus rapide attaque en premier
- Variance de 10% pour variété
- Égalité → ordre aléatoire

### 🎬 Animations Séquentielles
- Pause de 2 secondes entre attaques
- Barre de vie descend progressivement
- Blocage des interactions pendant animation

### 🎯 Système Modulaire
- Backend: Classes séparées et réutilisables
- Frontend: Composants React indépendants
- État centralisé et sérialisable

---

## Améliorations Futures Possibles

1. **Système de Buffs/Debuffs**
   - Poison, brûlure, paralysie
   - Boost temporaire attaque/défense
   - Durée en nombre de tours

2. **Régénération de Mana**
   - Actuellement désactivée
   - Configurable par tour

3. **Compétences Avancées**
   - Attaques multi-cibles
   - Compétences de contre
   - Esquive basée sur vitesse

4. **Mode Multijoueur**
   - Combat PvP en temps réel
   - WebSockets pour synchronisation

5. **Système de Progression**
   - Expérience et niveaux
   - Déblocage de compétences
   - Évolution des personnages

6. **Replay de Combat**
   - Enregistrement complet
   - Rejouable avec animations

---

## Glossaire

**PV**: Points de Vie (Health)
**Mana**: Énergie pour utiliser les compétences
**K.O.**: Knock Out (vaincu, 0 PV)
**Critique**: Coup critique (dégâts × 2)
**IA**: Intelligence Artificielle (ennemi contrôlé par ordinateur)
**JWT**: JSON Web Token (authentification)
**CRUD**: Create, Read, Update, Delete
**API**: Application Programming Interface
**REST**: Representational State Transfer

---

**Dernière mise à jour:** 30 Mars 2026
**Version:** 1.0.0
**Auteur:** Léo Duriez
