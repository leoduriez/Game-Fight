const express = require('express');
const Character = require('../models/Character');
const { authenticate } = require('../middleware/auth');
const { TurnBasedCombatManager } = require('../utils/TurnBasedCombat');
// Import des anciennes fonctions pour compatibilité
const {
  calculateDamage,
  applyHeal,
  determineFirstAttacker,
  aiChooseSkill,
  generateTurnComment
} = require('../utils/gameLogic');

const router = express.Router();

// =============================================================================
// INITIALISER UN COMBAT - SYSTÈME TOUR PAR TOUR STYLE POKÉMON
// =============================================================================
/**
 * Initialise un nouveau combat entre le joueur et un ennemi IA
 * Utilise le TurnBasedCombatManager pour gérer le combat
 */
router.post('/battle/init', authenticate, async (req, res) => {
  try {
    const { playerCharacterId } = req.body;

    if (!playerCharacterId) {
      return res.status(400).json({ message: 'ID du personnage joueur requis.' });
    }

    // Récupérer le personnage du joueur
    const playerCharacter = await Character.findById(playerCharacterId);
    if (!playerCharacter || !playerCharacter.isActive) {
      return res.status(404).json({ message: 'Personnage non trouvé ou inactif.' });
    }

    // Sélectionner un personnage aléatoire pour l'IA (différent du joueur)
    const enemyCharacters = await Character.find({
      isActive: true,
      _id: { $ne: playerCharacterId }
    });

    if (enemyCharacters.length === 0) {
      return res.status(400).json({ message: 'Aucun adversaire disponible.' });
    }

    const enemyCharacter = enemyCharacters[Math.floor(Math.random() * enemyCharacters.length)];

    // Préparer les données des personnages pour le combat
    const playerData = {
      id: playerCharacter._id,
      name: playerCharacter.name,
      image: playerCharacter.image,
      stats: playerCharacter.stats,
      skills: playerCharacter.skills
    };

    const enemyData = {
      id: enemyCharacter._id,
      name: enemyCharacter.name,
      image: enemyCharacter.image,
      stats: enemyCharacter.stats,
      skills: enemyCharacter.skills
    };

    // Créer le gestionnaire de combat
    const combatManager = new TurnBasedCombatManager(playerData, enemyData);
    
    // Récupérer l'état initial du combat
    const battleState = combatManager.getState();

    // Ajouter un message d'introduction au combat
    const introMessage = `⚔️ ${playerCharacter.name} (Vitesse: ${playerCharacter.stats.speed}) affronte ${enemyCharacter.name} (Vitesse: ${enemyCharacter.stats.speed}) !`;
    battleState.battleLog.push(introMessage);
    
    // Indiquer qui devrait attaquer en premier
    const speedInfo = battleState.speedComparison;
    let firstAttackerMsg;
    if (speedInfo.expectedFirst === 'player') {
      firstAttackerMsg = `📊 ${playerCharacter.name} est plus rapide et attaquera en premier !`;
    } else if (speedInfo.expectedFirst === 'enemy') {
      firstAttackerMsg = `📊 ${enemyCharacter.name} est plus rapide et attaquera en premier !`;
    } else {
      firstAttackerMsg = `📊 Vitesses égales ! L'ordre sera déterminé aléatoirement à chaque tour.`;
    }
    battleState.battleLog.push(firstAttackerMsg);

    res.json({
      message: 'Combat initialisé.',
      battleState
    });
  } catch (error) {
    console.error('Erreur initialisation combat:', error);
    res.status(500).json({ message: 'Erreur lors de l\'initialisation du combat.' });
  }
});

// =============================================================================
// EXÉCUTER UN TOUR DE COMBAT - SYSTÈME TOUR PAR TOUR STYLE POKÉMON
// =============================================================================
/**
 * Exécute un tour complet de combat suivant la logique Pokémon :
 * 1. Détermination de l'ordre des attaquants selon la vitesse
 * 2. Attaque du premier personnage
 * 3. Vérification si l'adversaire est encore en vie
 * 4. Si oui, attaque du second personnage
 * 5. Fin du tour
 */
router.post('/battle/turn', authenticate, async (req, res) => {
  try {
    const { battleState, playerSkillIndex } = req.body;

    // Validation des entrées
    if (!battleState || typeof playerSkillIndex !== 'number') {
      return res.status(400).json({ message: 'État du combat et compétence requis.' });
    }

    // Vérifier si le combat est déjà terminé
    if (battleState.isOver) {
      return res.status(400).json({ message: 'Le combat est déjà terminé.' });
    }

    // Recréer le gestionnaire de combat à partir de l'état existant
    const combatManager = TurnBasedCombatManager.fromState(battleState);

    // Exécuter le tour avec la compétence choisie par le joueur
    const result = combatManager.executeTurn(playerSkillIndex);

    // Vérifier si l'exécution a réussi
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Renvoyer le nouvel état du combat
    res.json({
      message: result.message,
      battleState: result.battleState
    });
  } catch (error) {
    console.error('Erreur exécution tour:', error);
    res.status(500).json({ message: 'Erreur lors de l\'exécution du tour.' });
  }
});

// =============================================================================
// OBTENIR LES INFORMATIONS DE VITESSE
// =============================================================================
/**
 * Route pour obtenir les informations de vitesse et l'ordre d'attaque prévu
 * Utile pour l'UI afin d'afficher qui attaquera en premier
 */
router.post('/battle/speed-info', authenticate, (req, res) => {
  try {
    const { battleState } = req.body;

    if (!battleState) {
      return res.status(400).json({ message: 'État du combat requis.' });
    }

    const playerSpeed = battleState.player.stats.speed;
    const enemySpeed = battleState.enemy.stats.speed;

    let expectedFirst;
    let explanation;

    if (playerSpeed > enemySpeed) {
      expectedFirst = 'player';
      explanation = `${battleState.player.name} (${playerSpeed}) est plus rapide que ${battleState.enemy.name} (${enemySpeed})`;
    } else if (enemySpeed > playerSpeed) {
      expectedFirst = 'enemy';
      explanation = `${battleState.enemy.name} (${enemySpeed}) est plus rapide que ${battleState.player.name} (${playerSpeed})`;
    } else {
      expectedFirst = 'tie';
      explanation = `Vitesses égales (${playerSpeed}) - L'ordre sera aléatoire`;
    }

    res.json({
      playerSpeed,
      enemySpeed,
      expectedFirst,
      explanation
    });
  } catch (error) {
    console.error('Erreur récupération info vitesse:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des informations.' });
  }
});

module.exports = router;
