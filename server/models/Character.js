/**
 * =============================================================================
 * MODÈLE MONGOOSE - CHARACTER (PERSONNAGE)
 * =============================================================================
 * 
 * Définit la structure des personnages dans la base de données MongoDB.
 * Chaque personnage possède des statistiques, des compétences et peut être
 * utilisé par les joueurs ou l'IA dans les combats.
 * 
 * @module models/Character
 */

const mongoose = require('mongoose');

// =============================================================================
// SCHÉMA DES COMPÉTENCES
// =============================================================================

/**
 * Schéma pour une compétence de personnage
 * Chaque personnage possède exactement 4 compétences
 */
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true  // Nom de la compétence (ex: "Boule de feu")
  },
  description: {
    type: String,
    required: true  // Description de la compétence
  },
  power: {
    type: Number,
    required: true,
    min: 0  // Puissance de la compétence (dégâts ou soins)
  },
  manaCost: {
    type: Number,
    required: true,
    min: 0  // Coût en mana pour utiliser la compétence
  },
  type: {
    type: String,
    enum: ['attack', 'special', 'heal', 'defense'],  // Types de compétences disponibles
    required: true
  }
});

// =============================================================================
// SCHÉMA PRINCIPAL DU PERSONNAGE
// =============================================================================

/**
 * Schéma principal pour un personnage
 * Contient toutes les informations nécessaires pour le combat et l'affichage
 */
const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,  // Chaque personnage doit avoir un nom unique
    trim: true     // Supprime les espaces avant/après
  },
  description: {
    type: String,
    required: true  // Description du personnage (lore, background)
  },
  image: {
    type: String,
    default: '🥊'  // Emoji ou URL de l'image du personnage
  },
  // Statistiques du personnage pour le combat
  stats: {
    health: {
      type: Number,
      required: true,
      min: 1,
      max: 200  // Points de vie maximum (PV)
    },
    attack: {
      type: Number,
      required: true,
      min: 1,
      max: 100  // Puissance d'attaque (influence les dégâts infligés)
    },
    defense: {
      type: Number,
      required: true,
      min: 0,
      max: 100  // Défense (réduit les dégâts reçus)
    },
    speed: {
      type: Number,
      required: true,
      min: 1,
      max: 100  // Vitesse (détermine l'ordre d'attaque en combat)
    },
    mana: {
      type: Number,
      required: true,
      min: 0,
      max: 200  // Points de mana maximum (pour utiliser les compétences)
    }
  },
  skills: {
    type: [skillSchema],
    validate: [arrayLimit, 'Un personnage doit avoir exactement 4 compétences']  // Validation : exactement 4 compétences
  },
  isActive: {
    type: Boolean,
    default: true  // Indique si le personnage est disponible pour les combats
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // Référence à l'utilisateur qui a créé le personnage (admin)
  },
  createdAt: {
    type: Date,
    default: Date.now  // Date de création du personnage
  },
  updatedAt: {
    type: Date,
    default: Date.now  // Date de dernière modification
  }
});

// =============================================================================
// VALIDATIONS ET HOOKS
// =============================================================================

/**
 * Fonction de validation pour s'assurer qu'un personnage a exactement 4 compétences
 * @param {Array} val - Tableau des compétences
 * @returns {boolean} true si le personnage a 4 compétences
 */
function arrayLimit(val) {
  return val.length === 4;
}

/**
 * Hook pre-save : Met à jour automatiquement la date de modification
 * avant chaque sauvegarde du personnage
 */
characterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// =============================================================================
// EXPORT DU MODÈLE
// =============================================================================

module.exports = mongoose.model('Character', characterSchema);
