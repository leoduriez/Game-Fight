import React from 'react';
import HealthBar from '../ui/HealthBar';
import ManaBar from '../ui/ManaBar';

/**
 * CharacterSprite - Affiche un personnage dans l'arène de combat
 * Gère les animations d'attaque, de dégâts et l'indicateur de tour actif
 * 
 * @param {Object} character - Données du personnage
 * @param {boolean} isPlayer - true si c'est le joueur, false si c'est l'ennemi
 * @param {boolean} isActiveTurn - true si c'est le tour de ce personnage
 * @param {boolean} isAttacking - true pendant l'animation d'attaque
 * @param {boolean} isTakingDamage - true pendant l'animation de dégâts
 */
const CharacterSprite = ({ 
  character, 
  isPlayer, 
  isActiveTurn = false,
  isAttacking = false,
  isTakingDamage = false 
}) => {
  const isImageFile = character.image && character.image.startsWith('/');
  
  // Construction des classes CSS pour les animations
  const spriteClasses = [
    'character-sprite',
    isPlayer ? 'player' : 'enemy',
    isActiveTurn && isPlayer ? 'active-turn' : '',
    isAttacking ? 'attacking' : '',
    isTakingDamage ? 'taking-damage' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={spriteClasses}>
      <div className="character-info">
        <h3>{character.name}</h3>
        <div className="character-emoji-large">
          {isImageFile ? (
            <img src={character.image} alt={character.name} className="character-image" />
          ) : (
            character.image
          )}
        </div>
        <div className="character-stats">
          <HealthBar 
            current={character.currentHealth} 
            max={character.maxHealth} 
          />
          <ManaBar 
            current={character.currentMana} 
            max={character.maxMana} 
          />
        </div>
        <div className="character-details">
          <span title="Attaque">⚔️ {character.stats.attack}</span>
          <span title="Défense">🛡️ {character.stats.defense}</span>
          <span title="Vitesse (détermine l'ordre d'attaque)">⚡ {character.stats.speed}</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterSprite;
