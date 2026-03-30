import axios from 'axios';
import authService from './authService';

const API_URL = '/api/characters';

// Configuration des headers avec token
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Récupérer tous les personnages actifs
const getActiveCharacters = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data.characters;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des personnages' };
  }
};

// Récupérer tous les personnages (admin)
const getAllCharacters = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`, getAuthHeaders());
    return response.data.characters;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des personnages' };
  }
};

// Récupérer un personnage par ID
const getCharacterById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data.character;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération du personnage' };
  }
};

// Créer un nouveau personnage (admin)
const createCharacter = async (characterData) => {
  try {
    const response = await axios.post(API_URL, characterData, getAuthHeaders());
    return response.data.character;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la création du personnage' };
  }
};

// Modifier un personnage (admin)
const updateCharacter = async (id, characterData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, characterData, getAuthHeaders());
    return response.data.character;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la modification du personnage' };
  }
};

// Désactiver un personnage (admin)
const deactivateCharacter = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/deactivate`, {}, getAuthHeaders());
    return response.data.character;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la désactivation du personnage' };
  }
};

// Supprimer un personnage (admin)
const deleteCharacter = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la suppression du personnage' };
  }
};

const characterService = {
  getActiveCharacters,
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deactivateCharacter,
  deleteCharacter
};

export default characterService;
