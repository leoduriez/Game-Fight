import React from 'react';
import Button from '../ui/Button';

const SkillButtons = ({ skills, currentMana, onSkillSelect, disabled }) => {
  const getSkillIcon = (type) => {
    switch (type) {
      case 'attack': return '⚔️';
      case 'special': return '💥';
      case 'heal': return '💚';
      case 'defense': return '🛡️';
      default: return '✨';
    }
  };

  return (
    <div className="skill-buttons">
      {skills.map((skill, index) => {
        const canUse = currentMana >= skill.manaCost;
        
        return (
          <button
            key={index}
            className={`skill-button ${!canUse ? 'disabled' : ''}`}
            onClick={() => onSkillSelect(index)}
            disabled={disabled || !canUse}
            title={skill.description}
          >
            <div className="skill-icon">{getSkillIcon(skill.type)}</div>
            <div className="skill-info">
              <div className="skill-name">{skill.name}</div>
              <div className="skill-details">
                <span className="skill-power">⚡ {skill.power}</span>
                <span className="skill-mana">✨ {skill.manaCost}</span>
              </div>
            </div>
            {!canUse && <div className="skill-overlay">Mana insuffisant</div>}
          </button>
        );
      })}
    </div>
  );
};

export default SkillButtons;
