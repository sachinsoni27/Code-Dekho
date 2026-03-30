import React from 'react';

const VariableCards = ({ variables }) => {
  return (
    <div className="variable-cards">
      {Object.entries(variables).map(([key, value]) => (
        <div key={key} className="var-card">
          <div className="var-label">{key}</div>
          <div className="var-value">{typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}</div>
        </div>
      ))}
    </div>
  );
};

export default VariableCards;