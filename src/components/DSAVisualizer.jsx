import React from 'react';

/**
 * DSAVisualizer — Renders data structures as interactive visual blocks.
 * Supports: Arrays (1D/2D), Stacks, Queues, Linked Lists, Hashmaps.
 * Auto-detects structure type from variable names and values.
 */

// ── Helper: Try to parse a JSON-like string ──
function tryParse(val) {
  try {
    return JSON.parse(String(val).replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false'));
  } catch (e) {
    return null;
  }
}

// ── Helper: Detect structure type from name/value ──
function detectType(name, value) {
  const n = name.toLowerCase();
  const parsed = tryParse(value);

  if (n.includes('stack') || n === 'stk') return { type: 'stack', data: parsed || [] };
  if (n.includes('queue') || n === 'q') return { type: 'queue', data: parsed || [] };
  if (n.includes('linked') || n.includes('node') || n.includes('head')) return { type: 'linked', data: parsed };
  if (n.includes('tree') || n.includes('root')) return { type: 'tree', data: parsed };

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && Array.isArray(parsed[0])) return { type: 'matrix', data: parsed };
    return { type: 'array', data: parsed };
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return { type: 'hashmap', data: parsed };
  }

  return null;
}

// ── Array Visualization ──
const ArrayVis = ({ name, data, activeIndex }) => (
  <div className="dsa-block">
    <div className="dsa-label">{name} <span className="dsa-type">Array[{data.length}]</span></div>
    <div className="dsa-array">
      {data.map((val, i) => (
        <div key={i} className={'dsa-cell' + (i === activeIndex ? ' dsa-active' : '')}>
          <span className="dsa-val">{String(val)}</span>
          <span className="dsa-idx">{i}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Matrix (2D Array) Visualization ──
const MatrixVis = ({ name, data }) => (
  <div className="dsa-block">
    <div className="dsa-label">{name} <span className="dsa-type">Matrix[{data.length}×{data[0]?.length || 0}]</span></div>
    <div className="dsa-matrix">
      {data.map((row, ri) => (
        <div key={ri} className="dsa-matrix-row">
          <span className="dsa-row-idx">{ri}</span>
          {row.map((cell, ci) => (
            <div key={ci} className="dsa-cell">
              <span className="dsa-val">{String(cell)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ── Stack Visualization ──
const StackVis = ({ name, data }) => (
  <div className="dsa-block">
    <div className="dsa-label">{name} <span className="dsa-type">Stack[{data.length}]</span></div>
    <div className="dsa-stack">
      {data.slice().reverse().map((val, i) => (
        <div key={i} className={'dsa-stack-item' + (i === 0 ? ' dsa-stack-top' : '')}>
          {i === 0 && <span className="dsa-stack-arrow">← TOP</span>}
          <span className="dsa-val">{String(val)}</span>
        </div>
      ))}
      <div className="dsa-stack-base">───</div>
    </div>
  </div>
);

// ── Queue Visualization ──
const QueueVis = ({ name, data }) => (
  <div className="dsa-block">
    <div className="dsa-label">{name} <span className="dsa-type">Queue[{data.length}]</span></div>
    <div className="dsa-queue">
      <span className="dsa-q-label">FRONT →</span>
      {data.map((val, i) => (
        <div key={i} className={'dsa-q-item' + (i === 0 ? ' dsa-q-front' : '') + (i === data.length - 1 ? ' dsa-q-rear' : '')}>
          <span className="dsa-val">{String(val)}</span>
        </div>
      ))}
      <span className="dsa-q-label">← REAR</span>
    </div>
  </div>
);

// ── Linked List Visualization ──
const LinkedListVis = ({ name, data }) => {
  if (!Array.isArray(data)) return null;
  return (
    <div className="dsa-block">
      <div className="dsa-label">{name} <span className="dsa-type">LinkedList</span></div>
      <div className="dsa-linked">
        {data.map((val, i) => (
          <React.Fragment key={i}>
            <div className="dsa-node">
              <span className="dsa-val">{String(val)}</span>
            </div>
            {i < data.length - 1 && <span className="dsa-arrow">→</span>}
          </React.Fragment>
        ))}
        <span className="dsa-null">NULL</span>
      </div>
    </div>
  );
};

// ── Hashmap Visualization ──
const HashmapVis = ({ name, data }) => (
  <div className="dsa-block">
    <div className="dsa-label">{name} <span className="dsa-type">HashMap[{Object.keys(data).length}]</span></div>
    <div className="dsa-hashmap">
      {Object.entries(data).map(([k, v], i) => (
        <div key={i} className="dsa-hm-entry">
          <span className="dsa-hm-key">{k}</span>
          <span className="dsa-hm-sep">:</span>
          <span className="dsa-hm-val">{String(v)}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Main DSA Visualizer Component ──
const DSAVisualizer = ({ variables, activeCell }) => {
  if (!variables || Object.keys(variables).length === 0) return null;

  const structures = [];

  Object.entries(variables).forEach(([name, value]) => {
    const detected = detectType(name, value);
    if (detected) {
      structures.push({ name, ...detected });
    }
  });

  if (structures.length === 0) return null;

  const activeIndex = activeCell ? activeCell.col : undefined;

  return (
    <div className="dsa-visualizer">
      <div className="dsa-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <line x1="8" y1="2" x2="8" y2="22" />
          <line x1="14" y1="2" x2="14" y2="22" />
          <line x1="2" y1="8" x2="22" y2="8" />
          <line x1="2" y1="14" x2="22" y2="14" />
        </svg>
        Data Structures
      </div>
      {structures.map((s, i) => {
        switch (s.type) {
          case 'array': return <ArrayVis key={i} name={s.name} data={s.data} activeIndex={activeIndex} />;
          case 'matrix': return <MatrixVis key={i} name={s.name} data={s.data} />;
          case 'stack': return <StackVis key={i} name={s.name} data={s.data} />;
          case 'queue': return <QueueVis key={i} name={s.name} data={s.data} />;
          case 'linked': return <LinkedListVis key={i} name={s.name} data={s.data} />;
          case 'hashmap': return <HashmapVis key={i} name={s.name} data={s.data} />;
          default: return null;
        }
      })}
    </div>
  );
};

export default DSAVisualizer;
