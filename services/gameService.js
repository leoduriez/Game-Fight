import axios from 'axios';
import authService from './authService';

const API_URL = '/api/game';

// Configuration des headers avec token
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Initialiser un combat
const initBattle = async (playerCharacterId) => {
  try {
    const response = await axios.post(
      `${API_URL}/battle/init`,
      { playerCharacterId },
      getAuthHeaders()
    );
    return response.data.battleState;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de l\'initialisation du combat' };
  }
};

// Exécuter un tour de combat
const executeTurn = async (battleState, playerSkillIndex) => {
  try {
    const response = await axios.post(
      `${API_URL}/battle/turn`,
      { battleState, playerSkillIndex },
      getAuthHeaders()
    );
    return response.data.battleState;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de l\'exécution du tour' };
  }
};

const gameService = {
  initBattle,
  executeTurn
};

export default gameService;
