import React from 'react';
import CharacterSprite from './CharacterSprite';
import SkillButtons from './SkillButtons';
import BattleLog from './BattleLog';
import Button from '../ui/Button';

/**
 * Composant SpeedIndicator - Affiche les informations de vitesse et l'ordre d'attaque
 * Style Pokémon : montre clairement qui attaquera en premier
 */
const SpeedIndicator = ({ player, enemy, speedComparison }) => {
  const getFirstAttackerName = () => {
    if (!speedComparison) return null;
    
    if (speedComparison.expectedFirst === 'player') {
      return player.name;
    } else if (speedComparison.expectedFirst === 'enemy') {
      return enemy.name;
    } else {
      return 'Aléatoire';
    }
  };

  const firstAttacker = getFirstAttackerName();

  return (
    <div className="speed-indicator">
      <div className="speed-info player">
        <span className="speed-icon">⚡</span>
        <span>{player.name}</span>
        <span className="speed-value">{player.stats.speed}</span>
      </div>
      
      <div className="first-attacker-badge">
        <span>🎯</span>
        <span>1er : {firstAttacker}</span>
      </div>
      
      <div className="speed-info enemy">
        <span className="speed-icon">⚡</span>
        <span>{enemy.name}</span>
        <span className="speed-value">{enemy.stats.speed}</span>
      </div>
    </div>
  );
};

/**
 * Composant BattleArena - Arène de combat principale
 * Gère l'affichage du combat tour par tour style Pokémon
 */
const BattleArena = ({ battleState, onSkillSelect, onBattleEnd, loading }) => {
  if (!battleState) {
    return <div>Chargement du combat...</div>;
  }

  // Déterminer si c'est le tour du joueur (le joueur choisit toujours sa compétence)
  const isPlayerTurn = !battleState.isOver && !loading;

  return (
    <div className={`battle-arena ${!battleState.isOver ? 'battle-in-progress' : ''}`}>
      <div className="battle-header">
        <h2>⚔️ Combat - Tour {battleState.turnNumber || 'Début'}</h2>
      </div>

      {/* Indicateur de vitesse - Style Pokémon */}
      <SpeedIndicator 
        player={battleState.player}
        enemy={battleState.enemy}
        speedComparison={battleState.speedComparison}
      />

      <div className="battle-field">
        <CharacterSprite
          character={battleState.player}
          isPlayer={true}
          isActiveTurn={isPlayerTurn}
        />

        <div className="vs-indicator">VS</div>

        <CharacterSprite
          character={battleState.enemy}
          isPlayer={false}
          isActiveTurn={false}
        />
      </div>

      {battleState.isOver ? (
        <div className="battle-result">
          <h2 className={battleState.winner === 'player' ? 'victory' : 'defeat'}>
            {battleState.winner === 'player' ? '🏆 Victoire !' : '💀 Défaite...'}
          </h2>
          <Button onClick={onBattleEnd} variant="primary">
            Retour à la sélection
          </Button>
        </div>
      ) : (
        <div className="battle-controls">
          <div className="turn-phase-indicator">
            <h4>⚡ Votre Tour</h4>
            <p>Sélectionnez une compétence pour attaquer</p>
          </div>
          <SkillButtons
            skills={battleState.player.skills}
            currentMana={battleState.player.currentMana}
            onSkillSelect={onSkillSelect}
            disabled={loading}
          />
        </div>
      )}

      <BattleLog logs={battleState.battleLog} />
    </div>
  );
};

export default BattleArena;
