import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBattle } from '../hooks/useBattle';
import AnimatedBattleArena from '../src/components/game/AnimatedBattleArena';

const BattlePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { battleState, loading, error, initBattle, executeTurn, resetBattle } = useBattle();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const characterId = location.state?.characterId;
    
    if (!characterId) {
      navigate('/');
      return;
    }

    const startBattle = async () => {
      try {
        await initBattle(characterId);
      } catch (err) {
        console.error('Erreur initialisation combat:', err);
      } finally {
        setInitializing(false);
      }
    };

    startBattle();
  }, [location.state]);

  const handleSkillSelect = async (skillIndex) => {
    try {
      await executeTurn(skillIndex);
    } catch (err) {
      console.error('Erreur exécution tour:', err);
    }
  };

  const handleBattleEnd = () => {
    resetBattle();
    navigate('/');
  };

  if (initializing) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Initialisation du combat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/')}>Retour</button>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="loading-container">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="battle-page">
      <AnimatedBattleArena
        battleState={battleState}
        onSkillSelect={handleSkillSelect}
        onBattleEnd={handleBattleEnd}
        loading={loading}
      />
    </div>
  );
};

export default BattlePage;
