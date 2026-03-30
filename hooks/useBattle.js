/**
 * =============================================================================
 * HOOK REACT: useBattle
 * =============================================================================
 * 
 * Hook personnalisé pour gérer l'état et la logique d'un combat
 * Encapsule les appels API et la gestion d'état pour simplifier les composants
 * 
 * @returns {Object} État et fonctions pour gérer le combat
 */

import { useState } from 'react';
import gameService from '../services/gameService';

export const useBattle = () => {
  // État du combat (contient player, enemy, turnNumber, battleLog, etc.)
  const [battleState, setBattleState] = useState(null);
  
  // Indicateur de chargement (true pendant les appels API)
  const [loading, setLoading] = useState(false);
  
  // Message d'erreur en cas de problème
  const [error, setError] = useState(null);

  /**
   * Initialise un nouveau combat avec un personnage
   * 
   * @param {String} characterId - ID du personnage du joueur
   * @returns {Promise<Object>} État initial du combat
   */
  const initBattle = async (characterId) => {
    setLoading(true);  // Active l'indicateur de chargement
    setError(null);    // Réinitialise les erreurs précédentes
    
    try {
      // Appel API pour initialiser le combat
      const state = await gameService.initBattle(characterId);
      
      // Mise à jour de l'état avec les données reçues
      setBattleState(state);
      
      return state;
    } catch (err) {
      // En cas d'erreur, on la stocke et on la propage
      setError(err.message || 'Erreur lors de l\'initialisation du combat');
      throw err;
    } finally {
      // Désactive le chargement dans tous les cas (succès ou erreur)
      setLoading(false);
    }
  };

  /**
   * Exécute un tour de combat avec la compétence choisie
   * 
   * @param {Number} skillIndex - Index de la compétence (0-3)
   * @returns {Promise<Object>} Nouvel état du combat après le tour
   */
  const executeTurn = async (skillIndex) => {
    // Vérification qu'un combat est en cours
    if (!battleState) {
      throw new Error('Aucun combat en cours');
    }

    setLoading(true);  // Active le chargement
    setError(null);    // Réinitialise les erreurs
    
    try {
      // Appel API pour exécuter le tour
      // Envoie l'état actuel et l'index de la compétence choisie
      const newState = await gameService.executeTurn(battleState, skillIndex);
      
      // Mise à jour de l'état avec le résultat du tour
      setBattleState(newState);
      
      return newState;
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors de l\'exécution du tour');
      throw err;
    } finally {
      // Désactive le chargement
      setLoading(false);
    }
  };

  /**
   * Réinitialise l'état du combat
   * Utilisé pour nettoyer après la fin d'un combat
   */
  const resetBattle = () => {
    setBattleState(null);  // Supprime l'état du combat
    setError(null);        // Supprime les erreurs
  };

  // Retourne l'état et les fonctions pour utilisation dans les composants
  return {
    battleState,   // État actuel du combat (null si pas de combat)
    loading,       // true pendant les appels API
    error,         // Message d'erreur (null si pas d'erreur)
    initBattle,    // Fonction pour initialiser un combat
    executeTurn,   // Fonction pour exécuter un tour
    resetBattle    // Fonction pour réinitialiser
  };
};