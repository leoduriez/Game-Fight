import React from 'react';
import { Edit, Trash2, Power, PowerOff } from 'lucide-react';
import Button from '../ui/Button';

const CharacterTable = ({ characters, onEdit, onDelete, onToggleActive }) => {
  if (!characters || characters.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucun personnage créé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="character-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Stats</th>
            <th>Compétences</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((character) => {
            const isImageFile = character.image && character.image.startsWith('/');
            return (
              <tr key={character._id}>
                <td>
                  <div className="character-name">
                    <span className="character-emoji">
                      {isImageFile ? (
                        <img src={character.image} alt={character.name} />
                      ) : (
                        character.image
                      )}
                    </span>
                    <div>
                    <strong>{character.name}</strong>
                    <p className="character-description">{character.description}</p>
                  </div>
                </div>
              </td>
              <td>
                <div className="stats-summary">
                  <span>❤️ {character.stats.health}</span>
                  <span>⚔️ {character.stats.attack}</span>
                  <span>🛡️ {character.stats.defense}</span>
                  <span>⚡ {character.stats.speed}</span>
                  <span>✨ {character.stats.mana}</span>
                </div>
              </td>
              <td>
                <div className="skills-summary">
                  {character.skills.map((skill, index) => (
                    <span key={index} className="skill-badge">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <span className={`status-badge ${character.isActive ? 'active' : 'inactive'}`}>
                  {character.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="icon-btn"
                    onClick={() => onEdit(character)}
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => onToggleActive(character)}
                    title={character.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {character.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => onDelete(character._id)}
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CharacterTable;
