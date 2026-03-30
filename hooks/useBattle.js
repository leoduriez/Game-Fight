import { useState } from 'react';
import gameService from '../services/gameService';

export const useBattle = () => {
  const [battleState, setBattleState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initBattle = async (characterId) => {
    setLoading(true);
    setError(null);
    try {
      const state = await gameService.initBattle(characterId);
      setBattleState(state);
      return state;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'initialisation du combat');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executeTurn = async (skillIndex) => {
    if (!battleState) {
      throw new Error('Aucun combat en cours');
    }

    setLoading(true);
    setError(null);
    try {
      const newState = await gameService.executeTurn(battleState, skillIndex);
      setBattleState(newState);
      return newState;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'exécution du tour');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetBattle = () => {
    setBattleState(null);
    setError(null);
  };

  return {
    battleState,
    loading,
    error,
    initBattle,
    executeTurn,
    resetBattle
  };
};