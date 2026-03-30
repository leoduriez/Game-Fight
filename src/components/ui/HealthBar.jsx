import React from 'react';

const HealthBar = ({ current, max, label = 'HP' }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const getColorClass = () => {
    if (percentage > 60) return 'health-high';
    if (percentage > 30) return 'health-medium';
    return 'health-low';
  };

  return (
    <div className="stat-bar-container">
      <div className="stat-bar-label">
        <span>{label}</span>
        <span>{Math.round(current)}/{max}</span>
      </div>
      <div className="stat-bar">
        <div 
          className={`stat-bar-fill ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default HealthBar;