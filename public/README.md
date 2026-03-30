# Assets du jeu

## Structure des dossiers

```
public/
├── images/
│   └── characters/          # Images des personnages (WebP)
│       ├── demon-lord.webp
│       ├── dragon-warrior.webp
│       ├── forest-guardian.webp
│       ├── ice-mage.webp
│       ├── shadow-ninja.webp
│       └── thunder-knight.webp
│
└── videos/
    └── skills/              # Animations vidéo des compétences
        └── demon-lord-flamme-infernal.mp4
```

## Format des images

Toutes les images de personnages sont au format **WebP** pour :
- ✅ Meilleure compression (réduction de ~80% par rapport au PNG)
- ✅ Qualité préservée (85%)
- ✅ Chargement plus rapide
- ✅ Support natif dans tous les navigateurs modernes

## Tailles des fichiers

### Avant (PNG)
- demon-lord.png: 201 KB
- dragon-warrior.png: 203 KB
- forest-guardian.png: 277 KB
- ice-mage.png: 215 KB
- shadow-ninja.png: 148 KB
- thunder-knight.png: 260 KB
**Total: ~1.3 MB**

### Après (WebP)
- demon-lord.webp: 39 KB
- dragon-warrior.webp: 43 KB
- forest-guardian.webp: 57 KB
- ice-mage.webp: 43 KB
- shadow-ninja.webp: 31 KB
- thunder-knight.webp: 50 KB
**Total: ~263 KB**

**Économie: ~80% de réduction !** 🚀

## Utilisation

Les chemins dans la base de données utilisent le format :
```javascript
image: "/images/characters/nom-personnage.webp"
```

Les vidéos de compétences utilisent le format :
```javascript
video: "/videos/skills/nom-competence.mp4"
```
