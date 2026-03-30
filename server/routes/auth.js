const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Vérification des champs requis
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email ou nom d\'utilisateur existe déjà.' });
    }

    // Création de l'utilisateur
    const user = new User({
      username,
      email,
      password,
      role: role || 'JOUEUR'
    });

    await user.save();

    // Génération du token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Vérification du mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Génération du token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

// Récupérer l'utilisateur connecté
router.get('/me', authenticate, async (req, res) => {
  try {
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

module.exports = router;
