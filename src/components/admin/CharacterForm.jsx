import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const CharacterForm = ({ character, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '🥊',
    stats: {
      health: 100,
      attack: 20,
      defense: 10,
      speed: 15,
      mana: 100
    },
    skills: [
      { name: '', description: '', power: 0, manaCost: 0, type: 'attack' },
      { name: '', description: '', power: 0, manaCost: 0, type: 'special' },
      { name: '', description: '', power: 0, manaCost: 0, type: 'heal' },
      { name: '', description: '', power: 0, manaCost: 0, type: 'defense' }
    ]
  });

  useEffect(() => {
    if (character) {
      setFormData(character);
    }
  }, [character]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatChange = (stat, value) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: parseInt(value) || 0
      }
    }));
  };

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = {
      ...newSkills[index],
      [field]: field === 'power' || field === 'manaCost' ? parseInt(value) || 0 : value
    };
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const skillTypes = [
    { value: 'attack', label: 'Attaque' },
    { value: 'special', label: 'Spéciale' },
    { value: 'heal', label: 'Soin' },
    { value: 'defense', label: 'Défense' }
  ];

  return (
    <form onSubmit={handleSubmit} className="character-form">
      <div className="form-section">
        <h3>Informations générales</h3>
        
        <div className="form-group">
          <label>Nom du personnage *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ex: Guerrier"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Description du personnage..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Emoji/Image</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="🥊"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Caractéristiques</h3>
        
        <div className="stats-grid">
          <div className="form-group">
            <label>Vie (1-200)</label>
            <input
              type="number"
              min="1"
              max="200"
              value={formData.stats.health}
              onChange={(e) => handleStatChange('health', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Attaque (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.stats.attack}
              onChange={(e) => handleStatChange('attack', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Défense (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.stats.defense}
              onChange={(e) => handleStatChange('defense', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Vitesse (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.stats.speed}
              onChange={(e) => handleStatChange('speed', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mana (0-200)</label>
            <input
              type="number"
              min="0"
              max="200"
              value={formData.stats.mana}
              onChange={(e) => handleStatChange('mana', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Compétences (4 requises)</h3>
        
        {formData.skills.map((skill, index) => (
          <div key={index} className="skill-form">
            <h4>Compétence {index + 1}</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                  required
                  placeholder="Ex: Coup de poing"
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={skill.type}
                  onChange={(e) => handleSkillChange(index, 'type', e.target.value)}
                  required
                >
                  {skillTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <input
                type="text"
                value={skill.description}
                onChange={(e) => handleSkillChange(index, 'description', e.target.value)}
                required
                placeholder="Description de la compétence"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Puissance *</label>
                <input
                  type="number"
                  min="0"
                  value={skill.power}
                  onChange={(e) => handleSkillChange(index, 'power', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Coût en mana *</label>
                <input
                  type="number"
                  min="0"
                  value={skill.manaCost}
                  onChange={(e) => handleSkillChange(index, 'manaCost', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <Button type="submit" variant="primary">
          {character ? 'Modifier' : 'Créer'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
};

export default CharacterForm;
