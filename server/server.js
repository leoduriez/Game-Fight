require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import des routes
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const gameRoutes = require('./routes/game');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connecté à MongoDB');
})
.catch((error) => {
  console.error('❌ Erreur de connexion à MongoDB:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/game', gameRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
});
