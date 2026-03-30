const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier le token JWT
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide.' });
  }
};

// Middleware pour vérifier le rôle ADMIN
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
};

module.exports = { authenticate, isAdmin };
