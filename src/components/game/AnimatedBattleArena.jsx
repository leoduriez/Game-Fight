/**
 * =============================================================================
 * ANIMATED BATTLE ARENA - Arène de Combat avec Animations Séquentielles
 * =============================================================================
 * 
 * Ce composant gère l'affichage du combat avec des animations strictement
 * séquentielles style Pokémon :
 * - Pause de 2 secondes entre chaque attaque
 * - Animations d'attaque et de dégâts fluides
 * - Barre de vie qui descend progressivement
 * - Blocage des interactions pendant les animations
 * 
 * Durée totale d'un tour : ~6 secondes
 * 
 * @component
 */

import React, { useState, useEffect, useRef } from 'react';
import CharacterSprite from './CharacterSprite';
import SkillButtons from './SkillButtons';
import BattleLog from './BattleLog';
import Button from '../ui/Button';

// =============================================================================
// COMPOSANT INDICATEUR DE VITESSE
// =============================================================================

/**
 * SpeedIndicator - Affiche les statistiques de vitesse et l'ordre d'attaque prévu
 * 
 * @param {Object} player - Données du joueur
 * @param {Object} enemy - Données de l'ennemi
 * @param {Object} speedComparison - Comparaison des vitesses
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
 * AnimatedBattleArena - Arène de combat avec animations séquentielles
 * Gère les pauses de 5 secondes entre chaque attaque pour un vrai tour par tour
 */
const AnimatedBattleArena = ({ battleState, onSkillSelect, onBattleEnd, loading }) => {
  // État local pour gérer les animations
  const [displayState, setDisplayState] = useState(battleState);
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle', 'player-attacking', 'enemy-attacking', 'waiting'
  const [playerAnimating, setPlayerAnimating] = useState(false);
  const [enemyAnimating, setEnemyAnimating] = useState(false);
  const [playerTakingDamage, setPlayerTakingDamage] = useState(false);
  const [enemyTakingDamage, setEnemyTakingDamage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPhaseMessage, setCurrentPhaseMessage] = useState('');
  
  const previousBattleStateRef = useRef(battleState);

  /**
   * Détecte quand un nouveau tour a été exécuté et lance les animations
   */
  useEffect(() => {
    const prevState = previousBattleStateRef.current;
    const newState = battleState;

    // Si le tour a changé, on lance l'animation séquentielle
    if (prevState && newState && prevState.turnNumber !== newState.turnNumber) {
      animateTurnSequence(prevState, newState);
    } else {
      // Sinon on met à jour directement
      setDisplayState(newState);
    }

    previousBattleStateRef.current = newState;
  }, [battleState]);

  /**
   * Anime la séquence complète d'un tour avec pauses de 5 secondes
   */
  const animateTurnSequence = async (prevState, newState) => {
    setIsAnimating(true);
    
    // Déterminer qui attaque en premier basé sur la vitesse
    const playerSpeed = prevState.player.stats.speed;
    const enemySpeed = prevState.enemy.stats.speed;
    const playerFirst = playerSpeed >= enemySpeed;

    // Calculer les changements de PV
    const playerHealthChange = prevState.player.currentHealth - newState.player.currentHealth;
    const enemyHealthChange = prevState.enemy.currentHealth - newState.enemy.currentHealth;

    if (playerFirst) {
      // ===== PHASE 1 : Le joueur attaque =====
      setCurrentPhaseMessage(`${prevState.player.name} attaque !`);
      setAnimationPhase('player-attacking');
      setPlayerAnimating(true);
      
      // Attendre 0.6 seconde pour l'animation d'attaque
      await sleep(600);
      setPlayerAnimating(false);
      
      // L'ennemi prend des dégâts
      if (enemyHealthChange > 0) {
        setEnemyTakingDamage(true);
        await sleep(300);
        
        // Diminuer progressivement les PV de l'ennemi
        await animateHealthChange(prevState.enemy.currentHealth, newState.enemy.currentHealth, (health) => {
          setDisplayState(prev => ({
            ...prev,
            enemy: { ...prev.enemy, currentHealth: health }
          }));
        });
        
        setEnemyTakingDamage(false);
      }
      
      // Pause de 2 secondes avant l'attaque de l'ennemi
      setCurrentPhaseMessage('En attente de la riposte...');
      setAnimationPhase('waiting');
      await sleep(2000);
      
      // ===== PHASE 2 : L'ennemi attaque (si encore en vie) =====
      if (newState.enemy.currentHealth > 0 && !newState.isOver) {
        setCurrentPhaseMessage(`${prevState.enemy.name} contre-attaque !`);
        setAnimationPhase('enemy-attacking');
        setEnemyAnimating(true);
        
        await sleep(600);
        setEnemyAnimating(false);
        
        // Le joueur prend des dégâts
        if (playerHealthChange > 0) {
          setPlayerTakingDamage(true);
          await sleep(300);
          
          await animateHealthChange(prevState.player.currentHealth, newState.player.currentHealth, (health) => {
            setDisplayState(prev => ({
              ...prev,
              player: { ...prev.player, currentHealth: health }
            }));
          });
          
          setPlayerTakingDamage(false);
        }
      }
    } else {
      // ===== PHASE 1 : L'ennemi attaque =====
      setCurrentPhaseMessage(`${prevState.enemy.name} attaque !`);
      setAnimationPhase('enemy-attacking');
      setEnemyAnimating(true);
      
      await sleep(600);
      setEnemyAnimating(false);
      
      if (playerHealthChange > 0) {
        setPlayerTakingDamage(true);
        await sleep(300);
        
        await animateHealthChange(prevState.player.currentHealth, newState.player.currentHealth, (health) => {
          setDisplayState(prev => ({
            ...prev,
            player: { ...prev.player, currentHealth: health }
          }));
        });
        
        setPlayerTakingDamage(false);
      }
      
      // Pause de 2 secondes avant l'attaque du joueur
      setCurrentPhaseMessage('En attente de votre riposte...');
      setAnimationPhase('waiting');
      await sleep(2000);
      
      // ===== PHASE 2 : Le joueur attaque (si encore en vie) =====
      if (newState.player.currentHealth > 0 && !newState.isOver) {
        setCurrentPhaseMessage(`${prevState.player.name} contre-attaque !`);
        setAnimationPhase('player-attacking');
        setPlayerAnimating(true);
        
        await sleep(600);
        setPlayerAnimating(false);
        
        if (enemyHealthChange > 0) {
          setEnemyTakingDamage(true);
          await sleep(300);
          
          await animateHealthChange(prevState.enemy.currentHealth, newState.enemy.currentHealth, (health) => {
            setDisplayState(prev => ({
              ...prev,
              enemy: { ...prev.enemy, currentHealth: health }
            }));
          });
          
          setEnemyTakingDamage(false);
        }
      }
    }

    // Fin de l'animation
    setAnimationPhase('idle');
    setCurrentPhaseMessage('');
    setDisplayState(newState);
    setIsAnimating(false);
  };

  /**
   * Anime la diminution progressive des PV
   */
  const animateHealthChange = async (startHealth, endHealth, updateCallback) => {
    const steps = 20; // Nombre d'étapes pour l'animation
    const difference = startHealth - endHealth;
    const stepValue = difference / steps;
    
    for (let i = 0; i < steps; i++) {
      const currentHealth = Math.max(endHealth, startHealth - (stepValue * (i + 1)));
      updateCallback(Math.round(currentHealth));
      await sleep(50); // 50ms entre chaque étape = 1 seconde au total
    }
    
    updateCallback(endHealth); // S'assurer qu'on arrive exactement à la valeur finale
  };

  /**
   * Fonction utilitaire pour créer des pauses
   */
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  if (!displayState) {
    return <div>Chargement du combat...</div>;
  }

  // Déterminer si le joueur peut agir
  const canPlayerAct = !displayState.isOver && !loading && !isAnimating;

  return (
    <div className={`battle-arena ${!displayState.isOver ? 'battle-in-progress' : ''}`}>
      <div className="battle-header">
        <h2>⚔️ Combat - Tour {displayState.turnNumber || 'Début'}</h2>
      </div>

      {/* Indicateur de vitesse */}
      <SpeedIndicator 
        player={displayState.player}
        enemy={displayState.enemy}
        speedComparison={displayState.speedComparison}
      />

      {/* Message de phase actuelle pendant l'animation */}
      {isAnimating && currentPhaseMessage && (
        <div className="turn-phase-indicator">
          <h4>⚔️ {currentPhaseMessage}</h4>
          <p>Animation en cours...</p>
        </div>
      )}

      <div className="battle-field">
        <CharacterSprite
          character={displayState.player}
          isPlayer={true}
          isActiveTurn={canPlayerAct}
          isAttacking={playerAnimating}
          isTakingDamage={playerTakingDamage}
        />

        <div className="vs-indicator">VS</div>

        <CharacterSprite
          character={displayState.enemy}
          isPlayer={false}
          isActiveTurn={false}
          isAttacking={enemyAnimating}
          isTakingDamage={enemyTakingDamage}
        />
      </div>

      {displayState.isOver ? (
        <div className="battle-result">
          <h2 className={displayState.winner === 'player' ? 'victory' : 'defeat'}>
            {displayState.winner === 'player' ? '🏆 Victoire !' : '💀 Défaite...'}
          </h2>
          <Button onClick={onBattleEnd} variant="primary">
            Retour à la sélection
          </Button>
        </div>
      ) : (
        <div className="battle-controls">
          {!isAnimating && (
            <>
              <div className="turn-phase-indicator">
                <h4>⚡ Votre Tour</h4>
                <p>Sélectionnez une compétence pour attaquer</p>
              </div>
              <SkillButtons
                skills={displayState.player.skills}
                currentMana={displayState.player.currentMana}
                onSkillSelect={onSkillSelect}
                disabled={!canPlayerAct}
              />
            </>
          )}
          {isAnimating && (
            <div className="animation-in-progress">
              <div className="loading-spinner"></div>
              <p>Combat en cours... Veuillez patienter</p>
            </div>
          )}
        </div>
      )}

      <BattleLog logs={displayState.battleLog} />
    </div>
  );
};

export default AnimatedBattleArena;
