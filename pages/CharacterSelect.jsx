import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import characterService from '../services/characterService';
import Button from '../src/components/ui/Button';

const CharacterSelect = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const data = await characterService.getActiveCharacters();
      setCharacters(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des personnages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
  };

  const handleStartBattle = () => {
    if (selectedCharacter) {
      navigate('/battle', { state: { characterId: selectedCharacter._id } });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des personnages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Button onClick={loadCharacters}>Réessayer</Button>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="empty-state-container">
        <h2>Aucun personnage disponible</h2>
        <p>Aucun personnage n'est disponible pour le moment.</p>
        <p>Contactez un administrateur pour créer des personnages.</p>
      </div>
    );
  }

  return (
    <div className="character-select-container">
      <h1>🥊 Sélection du personnage</h1>
      <p className="subtitle">Choisissez votre combattant</p>

      <div className="characters-grid">
        {characters.map((character) => {
          const isImageFile = character.image && character.image.startsWith('/');
          return (
            <div
              key={character._id}
              className={`character-card ${selectedCharacter?._id === character._id ? 'selected' : ''}`}
              onClick={() => handleSelectCharacter(character)}
            >
              <div className="character-card-emoji">
                {isImageFile ? (
                  <img src={character.image} alt={character.name} />
                ) : (
                  character.image
                )}
              </div>
              <h3>{character.name}</h3>
            <p className="character-card-description">{character.description}</p>
            
            <div className="character-card-stats">
              <div className="stat-item">
                <span className="stat-label">❤️ Vie</span>
                <span className="stat-value">{character.stats.health}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">⚔️ Attaque</span>
                <span className="stat-value">{character.stats.attack}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">🛡️ Défense</span>
                <span className="stat-value">{character.stats.defense}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">⚡ Vitesse</span>
                <span className="stat-value">{character.stats.speed}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">✨ Mana</span>
                <span className="stat-value">{character.stats.mana}</span>
              </div>
            </div>

            <div className="character-card-skills">
              <h4>Compétences:</h4>
              {character.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <span>{skill.name}</span>
                  <span className="skill-cost">✨ {skill.manaCost}</span>
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>

      {selectedCharacter && (
        <div className="action-bar">
          <Button onClick={handleStartBattle} variant="primary">
            Commencer le combat !
          </Button>
        </div>
      )}
    </div>
  );
};

export default CharacterSelect;
