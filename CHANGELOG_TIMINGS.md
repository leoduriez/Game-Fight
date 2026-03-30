# Changelog - Réduction des durées d'animation

## Date : 30 Mars 2026

### Modifications apportées

Les durées d'animation du système de combat tour par tour ont été réduites pour rendre le combat plus dynamique et rapide.

## Comparaison des durées

| Élément | Avant | Après | Réduction |
|---------|-------|-------|-----------|
| **Animation d'attaque** | 1.0s | 0.6s | -40% |
| **Délai avant dégâts** | 0.5s | 0.3s | -40% |
| **Animation PV (par étape)** | 100ms | 50ms | -50% |
| **Animation PV (total)** | 2.0s | 1.0s | -50% |
| **Pause entre attaques** | 5.0s | 2.0s | -60% |
| **Durée totale d'un tour** | ~11s | ~6s | -45% |

## Détail des phases

### Phase 1 : Attaque
- **Avant** : 3 secondes
  - Animation attaque : 1s
  - Délai : 0.5s
  - Animation PV : 2s
  
- **Après** : 1.9 secondes
  - Animation attaque : 0.6s
  - Délai : 0.3s
  - Animation PV : 1s

### Pause entre attaques
- **Avant** : 5 secondes ⏸️
- **Après** : 2 secondes ⏸️

### Phase 2 : Contre-attaque
- **Avant** : 3 secondes
- **Après** : 1.9 secondes

## Chronologie mise à jour

```
AVANT (11 secondes) :
T+0.0s  → Attaque 1er combattant
T+3.0s  → Fin attaque
T+3.0s  → ⏸️ PAUSE 5 SECONDES
T+8.0s  → Attaque 2ème combattant
T+11.0s → Fin du tour

APRÈS (6 secondes) :
T+0.0s  → Attaque 1er combattant
T+1.9s  → Fin attaque
T+1.9s  → ⏸️ PAUSE 2 SECONDES
T+3.9s  → Attaque 2ème combattant
T+5.8s  → Fin du tour
```

## Fichiers modifiés

### Code
- ✅ `/src/components/game/AnimatedBattleArena.jsx`
  - `sleep(1000)` → `sleep(600)` (animation attaque)
  - `sleep(500)` → `sleep(300)` (délai dégâts)
  - `sleep(5000)` → `sleep(2000)` (pause entre attaques)
  - `sleep(100)` → `sleep(50)` (animation PV par étape)

### Documentation
- ✅ `/COMBAT_SYSTEM.md`
- ✅ `/ANIMATION_SEQUENCE.md`

## Impact utilisateur

### Avantages
- ✅ Combat plus dynamique et rapide
- ✅ Moins d'attente entre les actions
- ✅ Meilleure fluidité du gameplay
- ✅ Tours plus courts = plus d'actions par minute

### Conservation
- ✅ Le système reste strictement tour par tour
- ✅ L'ordre basé sur la vitesse est maintenu
- ✅ Les animations restent visibles et compréhensibles
- ✅ La barre de vie descend toujours progressivement

## Temps de jeu estimé

Pour un combat typique de 5 tours :

| Durée | Avant | Après | Gain |
|-------|-------|-------|------|
| **1 tour** | 11s | 6s | -5s |
| **5 tours** | 55s | 30s | -25s |
| **10 tours** | 110s | 60s | -50s |

## Notes techniques

Les nouvelles durées ont été choisies pour :
1. Garder les animations visibles et fluides
2. Laisser le temps au joueur de voir les changements de PV
3. Maintenir une pause suffisante pour comprendre l'ordre des actions
4. Accélérer le rythme sans sacrifier la clarté

## Recommandations futures

Si le combat est encore trop lent, les durées peuvent être ajustées :
- Pause entre attaques : 2s → 1.5s ou 1s
- Animation attaque : 0.6s → 0.4s
- Animation PV : 50ms → 30ms par étape

Si le combat est trop rapide :
- Pause entre attaques : 2s → 3s
- Animation PV : 50ms → 75ms par étape
