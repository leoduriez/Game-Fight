import axios from 'axios';

const API_URL = '/api/auth';

// Récupérer le token depuis localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Sauvegarder le token dans localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Supprimer le token de localStorage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Sauvegarder l'utilisateur dans localStorage
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Récupérer l'utilisateur depuis localStorage
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Supprimer l'utilisateur de localStorage
const removeUser = () => {
  localStorage.removeItem('user');
};

// Inscription
const register = async (username, email, password, role = 'JOUEUR') => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
      role
    });
    
    if (response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
  }
};

// Connexion
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    
    if (response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la connexion' };
  }
};

// Déconnexion
const logout = () => {
  removeToken();
  removeUser();
};

// Récupérer l'utilisateur connecté
const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) return null;
    
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    setUser(response.data.user);
    return response.data.user;
  } catch (error) {
    removeToken();
    removeUser();
    return null;
  }
};

// Vérifier si l'utilisateur est connecté
const isAuthenticated = () => {
  return !!getToken();
};

// Vérifier si l'utilisateur est admin
const isAdmin = () => {
  const user = getUser();
  return user?.role === 'ADMIN';
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  getToken,
  getUser
};

export default authService;