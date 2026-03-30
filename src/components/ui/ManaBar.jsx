import React from 'react';

const ManaBar = ({ current, max, label = 'MP' }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="stat-bar-container">
      <div className="stat-bar-label">
        <span>{label}</span>
        <span>{Math.round(current)}/{max}</span>
      </div>
      <div className="stat-bar">
        <div 
          className="stat-bar-fill mana-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ManaBar;