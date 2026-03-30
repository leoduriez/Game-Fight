import React, { useEffect, useRef } from 'react';

/**
 * BattleLog - Journal de combat avec mise en forme contextuelle
 * Affiche les actions de combat avec des styles différents selon le type
 * (séparateur de tour, action joueur, action ennemi, coup critique, victoire/défaite)
 */
const BattleLog = ({ logs }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll vers le bas quand de nouveaux logs arrivent
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /**
   * Détermine la classe CSS appropriée pour un message de log
   * Basé sur le contenu du message pour le système tour par tour
   */
  const getLogEntryClass = (log) => {
    const classes = ['log-entry'];
    
    // Séparateur de tour (ex: "━━━ Tour 1 ━━━")
    if (log.includes('━━━ Tour') || log.includes('Tour') && log.includes('agit en premier')) {
      classes.push('turn-separator');
    }
    // Victoire
    else if (log.includes('🏆') || log.includes('Victoire')) {
      classes.push('victory');
    }
    // Défaite
    else if (log.includes('💀') || log.includes('Défaite') || log.includes('vaincu')) {
      classes.push('defeat');
    }
    // Coup critique
    else if (log.includes('CRITIQUE') || log.includes('💥')) {
      classes.push('critical-hit');
    }
    // Message d'introduction ou info vitesse
    else if (log.includes('⚔️') || log.includes('📊')) {
      classes.push('turn-separator');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="battle-log">
      <h3>📜 Journal de combat</h3>
      <div className="log-content">
        {logs.length === 0 ? (
          <p className="log-empty">Le combat va commencer...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={getLogEntryClass(log)}>
              {log}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default BattleLog;
