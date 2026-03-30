/**
 * =============================================================================
 * SERVICE: GAME (COMBAT)
 * =============================================================================
 * 
 * Service pour gérer les appels API liés au système de combat
 * Encapsule les requêtes HTTP avec axios et gère l'authentification JWT
 */

import axios from 'axios';  // Bibliothèque pour les requêtes HTTP
import authService from './authService';  // Service pour récupérer le token JWT

// URL de base pour les routes de combat
const API_URL = '/api/game';

// =============================================================================
// FONCTION UTILITAIRE: HEADERS D'AUTHENTIFICATION
// =============================================================================
/**
 * Génère les headers HTTP avec le token JWT pour les requêtes authentifiées
 * 
 * @returns {Object} Configuration des headers avec Authorization
 */
const getAuthHeaders = () => {
  // Récupère le token JWT depuis le localStorage via authService
  const token = authService.getToken();
  
  // Retourne un objet de configuration pour axios
  // Format: { headers: { Authorization: "Bearer <token>" } }
  return {
    headers: {
      Authorization: `Bearer ${token}`  // Format requis par le backend
    }
  };
};

// =============================================================================
// FONCTION: INITIALISER UN COMBAT
// =============================================================================
/**
 * Initialise un nouveau combat avec un personnage choisi
 * 
 * @param {String} playerCharacterId - ID du personnage du joueur
 * @returns {Promise<Object>} État initial du combat
 * @throws {Object} Erreur avec message si la requête échoue
 */
const initBattle = async (playerCharacterId) => {
  try {
    // Requête POST vers /api/game/battle/init
    const response = await axios.post(
      `${API_URL}/battle/init`,
      { playerCharacterId },  // Corps de la requête
      getAuthHeaders()        // Headers avec token JWT
    );
    
    // Retourne uniquement l'état du combat (sans le message)
    return response.data.battleState;
  } catch (error) {
    // En cas d'erreur, propage les données d'erreur du serveur
    // error.response?.data contient le message d'erreur du backend
    throw error.response?.data || { message: 'Erreur lors de l\'initialisation du combat' };
  }
};

// =============================================================================
// FONCTION: EXÉCUTER UN TOUR DE COMBAT
// =============================================================================
/**
 * Exécute un tour de combat avec la compétence choisie par le joueur
 * 
 * @param {Object} battleState - État actuel du combat
 * @param {Number} playerSkillIndex - Index de la compétence choisie (0-3)
 * @returns {Promise<Object>} Nouvel état du combat après le tour
 * @throws {Object} Erreur avec message si la requête échoue
 */
const executeTurn = async (battleState, playerSkillIndex) => {
  try {
    // Requête POST vers /api/game/battle/turn
    const response = await axios.post(
      `${API_URL}/battle/turn`,
      { 
        battleState,        // État actuel du combat
        playerSkillIndex    // Compétence choisie
      },
      getAuthHeaders()      // Headers avec token JWT
    );
    
    // Retourne le nouvel état du combat après le tour
    return response.data.battleState;
  } catch (error) {
    // Gestion des erreurs (ex: mana insuffisant, combat terminé, etc.)
    throw error.response?.data || { message: 'Erreur lors de l\'exécution du tour' };
  }
};

// =============================================================================
// EXPORT DU SERVICE
// =============================================================================
/**
 * Objet gameService exporté avec toutes les fonctions disponibles
 */
const gameService = {
  initBattle,   // Initialiser un combat
  executeTurn   // Exécuter un tour
};

export default gameService;
