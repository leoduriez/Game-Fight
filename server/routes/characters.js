const express = require('express');
const Character = require('../models/Character');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les personnages actifs (accessible à tous les utilisateurs connectés)
router.get('/', authenticate, async (req, res) => {
  try {
    const characters = await Character.find({ isActive: true })
      .select('-createdBy')
      .sort({ createdAt: -1 });
    
    res.json({ characters });
  } catch (error) {
    console.error('Erreur récupération personnages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des personnages.' });
  }
});

// Récupérer tous les personnages (admin seulement)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const characters = await Character.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ characters });
  } catch (error) {
    console.error('Erreur récupération personnages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des personnages.' });
  }
});

// Récupérer un personnage par ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Personnage non trouvé.' });
    }
    
    res.json({ character });
  } catch (error) {
    console.error('Erreur récupération personnage:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du personnage.' });
  }
});

// Créer un nouveau personnage (admin seulement)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, image, stats, skills } = req.body;

    // Validation
    if (!name || !description || !stats || !skills) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    if (skills.length !== 4) {
      return res.status(400).json({ message: 'Un personnage doit avoir exactement 4 compétences.' });
    }

    // Vérifier si le nom existe déjà
    const existingCharacter = await Character.findOne({ name });
    if (existingCharacter) {
      return res.status(400).json({ message: 'Un personnage avec ce nom existe déjà.' });
    }

    const character = new Character({
      name,
      description,
      image: image || '🥊',
      stats,
      skills,
      createdBy: req.userId
    });

    await character.save();

    res.status(201).json({
      message: 'Personnage créé avec succès.',
      character
    });
  } catch (error) {
    console.error('Erreur création personnage:', error);
    res.status(500).json({ message: 'Erreur lors de la création du personnage.' });
  }
});

// Modifier un personnage (admin seulement)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, image, stats, skills, isActive } = req.body;

    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Personnage non trouvé.' });
    }

    // Vérifier si le nouveau nom existe déjà (si changé)
    if (name && name !== character.name) {
      const existingCharacter = await Character.findOne({ name });
      if (existingCharacter) {
        return res.status(400).json({ message: 'Un personnage avec ce nom existe déjà.' });
      }
    }

    // Validation des compétences
    if (skills && skills.length !== 4) {
      return res.status(400).json({ message: 'Un personnage doit avoir exactement 4 compétences.' });
    }

    // Mise à jour
    if (name) character.name = name;
    if (description) character.description = description;
    if (image) character.image = image;
    if (stats) character.stats = stats;
    if (skills) character.skills = skills;
    if (typeof isActive !== 'undefined') character.isActive = isActive;

    await character.save();

    res.json({
      message: 'Personnage modifié avec succès.',
      character
    });
  } catch (error) {
    console.error('Erreur modification personnage:', error);
    res.status(500).json({ message: 'Erreur lors de la modification du personnage.' });
  }
});

// Désactiver un personnage (admin seulement)
router.patch('/:id/deactivate', authenticate, isAdmin, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Personnage non trouvé.' });
    }

    character.isActive = false;
    await character.save();

    res.json({
      message: 'Personnage désactivé avec succès.',
      character
    });
  } catch (error) {
    console.error('Erreur désactivation personnage:', error);
    res.status(500).json({ message: 'Erreur lors de la désactivation du personnage.' });
  }
});

// Supprimer un personnage (admin seulement)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Personnage non trouvé.' });
    }

    res.json({ message: 'Personnage supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur suppression personnage:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du personnage.' });
  }
});

module.exports = router;
