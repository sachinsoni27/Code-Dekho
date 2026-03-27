import React from 'react';

/**
 * MemoryView — Visualizes arrays, objects, and data structures
 * from the current step's variables.
 */
const MemoryView = ({ variables }) => {
  if (!variables || Object.keys(variables).length === 0) {
    return null; // Don't render if no variables
  }

  // Classify variables into categories
  const arrays = [];
  const primitives = [];
  const objects = [];

  Object.entries(variables).forEach(([name, value]) => {
    const strVal = String(value);

    // Detect arrays: "[1, 2, 3]" or "[[1,2],[3,4]]"
    if (strVal.startsWith('[') && strVal.endsWith(']')) {
      try {
        const parsed = JSON.parse(strVal.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          arrays.push({ name, value: parsed, raw: strVal });
          return;
        }
      } catch (e) {
        // Not valid JSON, treat as string
      }
    }

    // Detect objects/dicts: "{key: val}"
    if (strVal.startsWith('{') && strVal.endsWith('}')) {
      try {
        const parsed = JSON.parse(strVal.replace(/'/g, '"'));
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          objects.push({ name, value: parsed, raw: strVal });
          return;
        }
      } catch (e) {}
    }

    primitives.push({ name, value: strVal });
  });

  // Don't render if only primitives (those are shown in VariableCards)
  if (arrays.length === 0 && objects.length === 0) return null;

  return (
    <div className="memory-view">
      <div className="mv-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        Memory
      </div>

      {/* Array visualizations */}
      {arrays.map((arr, i) => (
        <div key={'arr-' + i} className="mv-array">
          <div className="mv-var-name">{arr.name}</div>
          <div className="mv-cells">
            {Array.isArray(arr.value[0]) ? (
              // 2D array
              <div className="mv-2d">
                {arr.value.map((row, ri) => (
                  <div key={ri} className="mv-row">
                    <span className="mv-idx">{ri}</span>
                    {row.map((cell, ci) => (
                      <div key={ci} className="mv-cell">
                        <span className="mv-cell-val">{String(cell)}</span>
                        <span className="mv-cell-idx">{ci}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              // 1D array
              <div className="mv-1d">
                {arr.value.map((val, j) => (
                  <div key={j} className="mv-cell">
                    <span className="mv-cell-val">{String(val)}</span>
                    <span className="mv-cell-idx">{j}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Object/dict visualizations */}
      {objects.map((obj, i) => (
        <div key={'obj-' + i} className="mv-object">
          <div className="mv-var-name">{obj.name}</div>
          <div className="mv-entries">
            {Object.entries(obj.value).map(([k, v], j) => (
              <div key={j} className="mv-entry">
                <span className="mv-entry-key">{k}</span>
                <span className="mv-entry-arrow">→</span>
                <span className="mv-entry-val">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryView;
