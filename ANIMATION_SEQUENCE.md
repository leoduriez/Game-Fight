# Séquence d'Animation du Combat Tour par Tour

## Diagramme de flux

```
┌─────────────────────────────────────────────────────────────┐
│                    DÉBUT DU TOUR                             │
│              Joueur sélectionne compétence                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend : TurnBasedCombatManager                │
│  1. Détermine ordre selon vitesse (player vs enemy)         │
│  2. Exécute action du 1er attaquant                         │
│  3. Vérifie si adversaire K.O.                              │
│  4. Si vivant → Exécute action du 2ème attaquant            │
│  5. Retourne état complet du combat                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Frontend : AnimatedBattleArena                     │
│              Détecte changement de turnNumber                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Qui est plus rapide? │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    JOUEUR RAPIDE                   ENNEMI RAPIDE
         │                               │
         ▼                               ▼
```

## Cas 1 : Joueur plus rapide (Speed Player > Speed Enemy)

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1 : ATTAQUE DU JOUEUR                                  │
│ Durée : 1.9 secondes                                         │
├─────────────────────────────────────────────────────────────┤
│ T+0.0s  : Message "Joueur attaque !"                        │
│ T+0.0s  : playerAnimating = true                            │
│           → Animation CSS .attacking (translation)           │
│ T+0.6s  : playerAnimating = false                           │
│ T+0.6s  : enemyTakingDamage = true                          │
│           → Animation CSS .taking-damage (flash rouge)       │
│ T+0.9s  : Début diminution PV ennemi (20 étapes)           │
│           → Barre de vie descend progressivement             │
│ T+1.9s  : enemyTakingDamage = false                         │
│           → PV ennemi à la valeur finale                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PAUSE : EN ATTENTE DE LA RIPOSTE                            │
│ Durée : 2 secondes ⏸️                                        │
├─────────────────────────────────────────────────────────────┤
│ T+1.9s  : Message "En attente de la riposte..."            │
│ T+1.9s  : animationPhase = 'waiting'                        │
│           → Affichage spinner + message                      │
│ T+3.9s  : Fin de la pause                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2 : CONTRE-ATTAQUE DE L'ENNEMI                        │
│ Durée : 1.9 secondes                                         │
├─────────────────────────────────────────────────────────────┤
│ T+3.9s  : Message "Ennemi contre-attaque !"                 │
│ T+3.9s  : enemyAnimating = true                             │
│           → Animation CSS .attacking (translation inverse)   │
│ T+4.5s  : enemyAnimating = false                            │
│ T+4.5s  : playerTakingDamage = true                         │
│           → Animation CSS .taking-damage (flash rouge)       │
│ T+4.8s  : Début diminution PV joueur (20 étapes)           │
│           → Barre de vie descend progressivement             │
│ T+5.8s  : playerTakingDamage = false                        │
│           → PV joueur à la valeur finale                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ FIN DU TOUR                                                  │
│ T+5.8s  : animationPhase = 'idle'                           │
│           isAnimating = false                                │
│           → Joueur peut sélectionner une nouvelle action     │
└─────────────────────────────────────────────────────────────┘
```

## Cas 2 : Ennemi plus rapide (Speed Enemy > Speed Player)

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1 : ATTAQUE DE L'ENNEMI                               │
│ Durée : 1.9 secondes                                         │
├─────────────────────────────────────────────────────────────┤
│ T+0.0s  : Message "Ennemi attaque !"                        │
│ T+0.0s  : enemyAnimating = true                             │
│ T+0.6s  : enemyAnimating = false                            │
│ T+0.6s  : playerTakingDamage = true                         │
│ T+0.9s  : Début diminution PV joueur                        │
│ T+1.9s  : playerTakingDamage = false                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PAUSE : EN ATTENTE DE VOTRE RIPOSTE                         │
│ Durée : 2 secondes ⏸️                                        │
├─────────────────────────────────────────────────────────────┤
│ T+1.9s  : Message "En attente de votre riposte..."         │
│ T+3.9s  : Fin de la pause                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2 : CONTRE-ATTAQUE DU JOUEUR                          │
│ Durée : 1.9 secondes                                         │
├─────────────────────────────────────────────────────────────┤
│ T+3.9s  : Message "Joueur contre-attaque !"                 │
│ T+3.9s  : playerAnimating = true                            │
│ T+4.5s  : playerAnimating = false                           │
│ T+4.5s  : enemyTakingDamage = true                          │
│ T+4.8s  : Début diminution PV ennemi                        │
│ T+5.8s  : enemyTakingDamage = false                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ FIN DU TOUR                                                  │
│ T+5.8s  : Joueur peut agir à nouveau                        │
└─────────────────────────────────────────────────────────────┘
```

## Animations CSS appliquées

### 1. Animation d'attaque (`.attacking`)
```css
@keyframes attackAnimation {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(30px); }   /* Élan */
  50%  { transform: translateX(-10px); }  /* Impact */
  75%  { transform: translateX(10px); }   /* Rebond */
  100% { transform: translateX(0); }      /* Retour */
}
```

### 2. Animation de dégâts (`.taking-damage`)
```css
@keyframes damageFlash {
  0%, 100% { filter: brightness(1); }
  50%      { 
    filter: brightness(1.5) saturate(0.5);
    transform: scale(0.95);
  }
}
```

### 3. Indicateur de tour actif (`.active-turn::before`)
```
Affiche : "⚡ VOTRE TOUR"
Animation : Pulse continu
```

## États React pendant l'animation

| État | Valeur pendant animation | Effet |
|------|--------------------------|-------|
| `isAnimating` | `true` | Bloque les interactions |
| `animationPhase` | `'player-attacking'` / `'enemy-attacking'` / `'waiting'` | Détermine le message affiché |
| `playerAnimating` | `true` pendant 0.6s | Applique `.attacking` au joueur |
| `enemyAnimating` | `true` pendant 0.6s | Applique `.attacking` à l'ennemi |
| `playerTakingDamage` | `true` pendant 1.3s | Applique `.taking-damage` au joueur |
| `enemyTakingDamage` | `true` pendant 1.3s | Applique `.taking-damage` à l'ennemi |
| `currentPhaseMessage` | Texte dynamique | Affiché dans `.turn-phase-indicator` |

## Fonction clé : `animateHealthChange()`

```javascript
// Anime la diminution des PV en 20 étapes sur 1 seconde
const animateHealthChange = async (startHealth, endHealth, updateCallback) => {
  const steps = 20;
  const difference = startHealth - endHealth;
  const stepValue = difference / steps;
  
  for (let i = 0; i < steps; i++) {
    const currentHealth = Math.max(
      endHealth, 
      startHealth - (stepValue * (i + 1))
    );
    updateCallback(Math.round(currentHealth));
    await sleep(50); // 50ms × 20 = 1 seconde
  }
  
  updateCallback(endHealth);
};
```

## Gestion des cas spéciaux

### Cas 1 : Un combattant est K.O. après la première attaque
```
Phase 1 : Attaquant A → Défenseur B tombe à 0 PV
→ Pas de Phase 2
→ Affichage immédiat du résultat (Victoire/Défaite)
→ Pas de pause de 5 secondes
```

### Cas 2 : Égalité de vitesse
```
Backend calcule : Math.random() < 0.5 ? 'player' : 'enemy'
→ Ordre aléatoire 50/50
→ Frontend suit l'ordre déterminé par le backend
```

## Messages affichés

| Phase | Message |
|-------|---------|
| Attaque joueur | `"{Nom joueur} attaque !"` |
| Attaque ennemi | `"{Nom ennemi} attaque !"` |
| Pause après joueur | `"En attente de la riposte..."` |
| Pause après ennemi | `"En attente de votre riposte..."` |
| Contre-attaque joueur | `"{Nom joueur} contre-attaque !"` |
| Contre-attaque ennemi | `"{Nom ennemi} contre-attaque !"` |
| Animation en cours | `"Combat en cours... Veuillez patienter"` |

## Timing total

```
┌──────────────────────────────────────────────┐
│ DURÉE TOTALE D'UN TOUR COMPLET               │
├──────────────────────────────────────────────┤
│ Phase 1 (attaque)        : 1.9 secondes      │
│ Pause                    : 2 secondes ⏸️      │
│ Phase 2 (contre-attaque) : 1.9 secondes      │
├──────────────────────────────────────────────┤
│ TOTAL                    : ~6 secondes       │
└──────────────────────────────────────────────┘
```

## Blocage des interactions

Pendant `isAnimating === true` :
- ✅ Boutons de compétences désactivés
- ✅ Affichage du spinner "Combat en cours"
- ✅ Message "Veuillez patienter"
- ✅ `pointer-events: none` sur `.battle-controls`
