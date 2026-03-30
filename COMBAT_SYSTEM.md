# Système de Combat Tour par Tour - Style Pokémon

## Vue d'ensemble

Le système de combat implémente une mécanique **strictement tour par tour** inspirée de Pokémon, où chaque personnage attaque l'un après l'autre avec des **pauses de 5 secondes** entre chaque action pour une meilleure expérience visuelle.

## Architecture

### Backend (`server/utils/TurnBasedCombat.js`)

#### Classes principales

1. **`Combatant`**
   - Représente un combattant (joueur ou ennemi)
   - Gère les PV, mana, statistiques
   - Méthodes : `takeDamage()`, `heal()`, `consumeMana()`, `regenerateMana()`

2. **`ActionResult`**
   - Encapsule le résultat d'une action de combat
   - Contient : dégâts, soins, critique, message

3. **`TurnBasedCombatManager`**
   - Gestionnaire principal du combat
   - Méthodes clés :
     - `determineAttackOrder()` - Détermine qui attaque en premier selon la vitesse
     - `executeAction()` - Exécute une action de combat
     - `executeTurn()` - Exécute un tour complet
     - `aiChooseSkill()` - IA pour choisir une compétence

### Frontend (`src/components/game/AnimatedBattleArena.jsx`)

#### Système d'animation séquentielle

Le composant `AnimatedBattleArena` gère les animations avec les phases suivantes :

1. **Détection du changement de tour**
   - Compare `turnNumber` entre l'ancien et le nouvel état

2. **Séquence d'animation** (fonction `animateTurnSequence`)
   ```
   Si joueur plus rapide :
     1. Joueur attaque (0.6 sec)
     2. Animation dégâts ennemi (1.3 sec)
     3. PAUSE 2 SECONDES ⏸️
     4. Ennemi contre-attaque (0.6 sec)
     5. Animation dégâts joueur (1.3 sec)
   
   Si ennemi plus rapide :
     1. Ennemi attaque (0.6 sec)
     2. Animation dégâts joueur (1.3 sec)
     3. PAUSE 2 SECONDES ⏸️
     4. Joueur contre-attaque (0.6 sec)
     5. Animation dégâts ennemi (1.3 sec)
   ```

3. **Animation des PV**
   - Diminution progressive en 20 étapes (50ms chaque)
   - Total : 1 seconde pour voir la barre de vie descendre

## Règles du combat

| Règle | Implémentation |
|-------|----------------|
| **Tour par tour strict** | ✅ Actions séquentielles, jamais simultanées |
| **Vitesse → Ordre** | ✅ Le personnage avec la vitesse la plus élevée attaque en premier |
| **Égalité de vitesse** | ✅ Ordre aléatoire (50/50) avec légère variance (10%) |
| **Pause entre attaques** | ✅ 2 secondes entre chaque attaque |
| **Vérification K.O.** | ✅ Après chaque attaque, le combat s'arrête si un combattant tombe |
| **Animation des dégâts** | ✅ Barre de vie diminue progressivement (1 sec) |

## Constantes de combat

```javascript
COMBAT_CONSTANTS = {
  CRITICAL_HIT_CHANCE: 0.1,        // 10% de chance de coup critique
  CRITICAL_HIT_MULTIPLIER: 2.0,    // Dégâts x2 en critique
  ATTACK_SCALING: 0.5,             // Coefficient d'attaque
  DEFENSE_SCALING: 0.3,            // Coefficient de défense
  MIN_DAMAGE: 1,                   // Dégâts minimum garantis
  MANA_REGEN_PER_TURN: 5,          // Régénération mana (désactivée)
  SPEED_VARIANCE: 0.1              // Variance de vitesse (10%)
}
```

## Formule de dégâts

```
Dégâts de base = Puissance compétence + (Attaque × 0.5)
Réduction défense = Défense adversaire × 0.3
Dégâts finaux = max(1, Dégâts de base - Réduction défense)

Si coup critique : Dégâts finaux × 2
```

## États d'animation

Le composant `AnimatedBattleArena` utilise plusieurs états :

- **`animationPhase`** : `'idle'`, `'player-attacking'`, `'enemy-attacking'`, `'waiting'`
- **`playerAnimating`** : Animation d'attaque du joueur
- **`enemyAnimating`** : Animation d'attaque de l'ennemi
- **`playerTakingDamage`** : Animation de dégâts du joueur
- **`enemyTakingDamage`** : Animation de dégâts de l'ennemi
- **`isAnimating`** : Bloque les interactions pendant l'animation

## Chronologie d'un tour

```
T+0s    : Joueur sélectionne une compétence
T+0s    : Requête envoyée au backend
T+0.1s  : Backend calcule le tour complet
T+0.2s  : Frontend reçoit le résultat
T+0.2s  : Début animation 1er attaquant
T+0.8s  : Animation dégâts sur défenseur
T+2.1s  : Fin animation dégâts
T+2.1s  : ⏸️ PAUSE 2 SECONDES
T+4.1s  : Début animation 2ème attaquant
T+4.7s  : Animation dégâts sur défenseur
T+6.0s  : Fin animation dégâts
T+6.0s  : Retour à l'état idle, joueur peut agir
```

**Durée totale d'un tour : ~6 secondes**

## Fichiers modifiés/créés

### Backend
- ✅ `server/utils/TurnBasedCombat.js` (NOUVEAU)
- ✅ `server/routes/game.js` (MODIFIÉ)
- ✅ `server/utils/gameLogic.js` (CONSERVÉ pour compatibilité)

### Frontend
- ✅ `src/components/game/AnimatedBattleArena.jsx` (NOUVEAU)
- ✅ `src/components/game/BattleArena.jsx` (CONSERVÉ)
- ✅ `src/components/game/CharacterSprite.jsx` (MODIFIÉ)
- ✅ `src/components/game/BattleLog.jsx` (MODIFIÉ)
- ✅ `pages/BattlePage.jsx` (MODIFIÉ)

### Styles
- ✅ `styles/main.css` (MODIFIÉ - ajout section combat tour par tour)

## Utilisation

Le système est automatiquement actif. Lors d'un combat :

1. Le joueur sélectionne une compétence
2. Le système détermine l'ordre basé sur la vitesse
3. Les animations se déroulent séquentiellement avec pause de 5 secondes
4. Le joueur peut agir à nouveau une fois l'animation terminée

## Améliorations futures possibles

- [ ] Ajouter des effets de particules lors des attaques
- [ ] Sons pour chaque action (attaque, dégâts, critique)
- [ ] Animations de compétences spécifiques selon le type
- [ ] Système de buffs/debuffs persistants
- [ ] Régénération de mana en fin de tour (actuellement désactivée)
- [ ] Mode rapide (réduire les pauses à 2 secondes)

## Notes techniques

- Les animations utilisent `async/await` avec `setTimeout` pour les pauses
- L'état d'affichage (`displayState`) est séparé de l'état réel (`battleState`)
- Les interactions sont bloquées pendant `isAnimating === true`
- Le système détecte automatiquement les changements de tour via `useEffect`
