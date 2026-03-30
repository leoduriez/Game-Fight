/**
 * =============================================================================
 * ROUTES D'AUTHENTIFICATION
 * =============================================================================
 * 
 * Gère l'inscription, la connexion et la récupération des informations
 * utilisateur avec JWT (JSON Web Tokens)
 */

const express = require('express');  // Framework web
const jwt = require('jsonwebtoken');  // Génération et vérification de tokens JWT
const User = require('../models/User');  // Modèle utilisateur MongoDB
const { authenticate } = require('../middleware/auth');  // Middleware d'authentification

const router = express.Router();

// =============================================================================
// ROUTE: INSCRIPTION D'UN NOUVEL UTILISATEUR
// =============================================================================
/**
 * POST /api/auth/register
 * Crée un nouveau compte utilisateur et retourne un token JWT
 */
router.post('/register', async (req, res) => {
  try {
    // Extraction des données du corps de la requête
    const { username, email, password, role } = req.body;

    // Vérification des champs requis (username, email, password obligatoires)
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérification si l'utilisateur existe déjà (email OU username)
    // $or permet de chercher soit par email soit par username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email ou nom d\'utilisateur existe déjà.' });
    }

    // Création d'une nouvelle instance utilisateur
    // Le mot de passe sera automatiquement hashé par le hook pre('save') du modèle
    const user = new User({
      username,
      email,
      password,  // Sera hashé automatiquement avec bcrypt
      role: role || 'JOUEUR'  // Rôle par défaut: JOUEUR (peut être ADMIN)
    });

    // Sauvegarde de l'utilisateur dans MongoDB
    await user.save();

    // Génération d'un token JWT pour l'authentification
    // Le token contient l'ID utilisateur et son rôle
    const token = jwt.sign(
      { userId: user._id, role: user.role },  // Payload du token
      process.env.JWT_SECRET,  // Clé secrète pour signer le token
      { expiresIn: '7d' }  // Le token expire après 7 jours
    );

    // Réponse avec code 201 (Created)
    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      token,  // Token JWT pour les futures requêtes authentifiées
      user: {  // Informations utilisateur (sans le mot de passe)
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Gestion des erreurs (ex: problème de connexion MongoDB)
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
  }
});

// =============================================================================
// ROUTE: CONNEXION D'UN UTILISATEUR EXISTANT
// =============================================================================
/**
 * POST /api/auth/login
 * Authentifie un utilisateur et retourne un token JWT
 */
router.post('/login', async (req, res) => {
  try {
    // Extraction de l'email et du mot de passe
    const { email, password } = req.body;

    // Vérification que les champs sont présents
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    // Recherche de l'utilisateur par email dans MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      // Message volontairement vague pour la sécurité (ne pas révéler si l'email existe)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Vérification du mot de passe avec bcrypt
    // comparePassword est une méthode définie dans le modèle User
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Génération d'un nouveau token JWT pour cette session
    const token = jwt.sign(
      { userId: user._id, role: user.role },  // Payload: ID et rôle
      process.env.JWT_SECRET,  // Clé secrète
      { expiresIn: '7d' }  // Expiration: 7 jours
    );

    // Réponse avec le token et les infos utilisateur
    res.json({
      message: 'Connexion réussie.',
      token,  // Token à stocker côté client (localStorage/sessionStorage)
      user: {  // Informations utilisateur pour l'UI
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Gestion des erreurs serveur
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

// =============================================================================
// ROUTE: RÉCUPÉRER LES INFORMATIONS DE L'UTILISATEUR CONNECTÉ
// =============================================================================
/**
 * GET /api/auth/me
 * Retourne les informations de l'utilisateur authentifié
 * Nécessite un token JWT valide dans le header Authorization
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.user est ajouté par le middleware authenticate
    // Il contient les infos de l'utilisateur décodées du token JWT
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Export du router pour l'utiliser dans server.js
module.exports = router;
