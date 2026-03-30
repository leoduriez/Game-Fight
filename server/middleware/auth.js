/**
 * =============================================================================
 * MIDDLEWARE D'AUTHENTIFICATION JWT
 * =============================================================================
 * 
 * Fournit des middlewares pour protéger les routes et vérifier les permissions
 * Utilise JSON Web Tokens (JWT) pour l'authentification
 */

const jwt = require('jsonwebtoken');  // Bibliothèque pour gérer les JWT
const User = require('../models/User');  // Modèle utilisateur MongoDB

// =============================================================================
// MIDDLEWARE: AUTHENTIFICATION JWT
// =============================================================================
/**
 * Vérifie qu'un token JWT valide est présent dans le header Authorization
 * Si valide, attache l'utilisateur à req.user pour les routes suivantes
 * 
 * Utilisation: router.get('/protected', authenticate, (req, res) => {...})
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
const authenticate = async (req, res, next) => {
  try {
    // Extraction du token du header Authorization
    // Format attendu: "Authorization: Bearer <token>"
    // Le ?. (optional chaining) évite une erreur si le header n'existe pas
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Vérification que le token est présent
    if (!token) {
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    // Vérification et décodage du token JWT
    // jwt.verify() lance une erreur si le token est invalide ou expiré
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Recherche de l'utilisateur dans la base de données
    // .select('-password') exclut le mot de passe du résultat pour la sécurité
    const user = await User.findById(decoded.userId).select('-password');
    
    // Vérification que l'utilisateur existe toujours
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    // Attachement des informations utilisateur à la requête
    // Ces données seront accessibles dans les routes suivantes via req.user
    req.user = user;
    req.userId = decoded.userId;
    
    // Passage au middleware/route suivant
    next();
  } catch (error) {
    // Gestion des erreurs (token invalide, expiré, ou erreur serveur)
    res.status(401).json({ message: 'Token invalide.' });
  }
};

// =============================================================================
// MIDDLEWARE: VÉRIFICATION DU RÔLE ADMIN
// =============================================================================
/**
 * Vérifie que l'utilisateur authentifié a le rôle ADMIN
 * Doit être utilisé APRÈS le middleware authenticate
 * 
 * Utilisation: router.post('/admin-only', authenticate, isAdmin, (req, res) => {...})
 * 
 * @param {Object} req - Requête Express (doit contenir req.user)
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
const isAdmin = (req, res, next) => {
  // Vérification du rôle de l'utilisateur
  if (req.user.role !== 'ADMIN') {
    // Code 403 Forbidden: l'utilisateur est authentifié mais n'a pas les droits
    return res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
  }
  
  // L'utilisateur est admin, on continue
  next();
};

// Export des middlewares pour utilisation dans les routes
module.exports = { authenticate, isAdmin };
