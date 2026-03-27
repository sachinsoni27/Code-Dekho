import React, { useRef, useEffect } from 'react';

// ── Constants ──
const NODE_W = 160;
const NODE_H = 40;
const GAP_Y = 24;
const PAD = 20;

// ── Node type colors ──
const TYPE_COLORS = {
  start:    { bg: '#10b981', border: '#059669', text: '#fff' },
  end:      { bg: '#ef4444', border: '#dc2626', text: '#fff' },
  process:  { bg: '#1e293b', border: '#3b82f6', text: '#e2e8f0' },
  decision: { bg: '#1e293b', border: '#f59e0b', text: '#e2e8f0' },
  loop:     { bg: '#1e293b', border: '#8b5cf6', text: '#e2e8f0' },
  call:     { bg: '#1e293b', border: '#06b6d4', text: '#e2e8f0' },
  return:   { bg: '#1e293b', border: '#22c55e', text: '#e2e8f0' },
};

// ── Helper: truncate text ──
function truncate(text, max) {
  max = max || 22;
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

// ── Helper: compute node positions (pure function, no hooks) ──
function computePositions(count) {
  var arr = [];
  for (var i = 0; i < count; i++) {
    arr.push({
      x: PAD + NODE_W / 2,
      y: PAD + i * (NODE_H + GAP_Y) + NODE_H / 2
    });
  }
  return arr;
}

// ── Helper: render node shape ──
function renderShape(node, x, y, isActive) {
  var colors = TYPE_COLORS[node.type] || TYPE_COLORS.process;
  var glow = isActive ? 'drop-shadow(0 0 8px ' + colors.border + ')' : 'none';
  var strokeW = isActive ? 2.5 : 1.5;
  var halfW = NODE_W / 2;
  var halfH = NODE_H / 2;

  if (node.type === 'decision') {
    var pts = x + ',' + (y - halfH) + ' ' + (x + halfW) + ',' + y + ' ' + x + ',' + (y + halfH) + ' ' + (x - halfW) + ',' + y;
    return React.createElement('g', { style: { filter: glow } },
      React.createElement('polygon', { points: pts, fill: colors.bg, stroke: colors.border, strokeWidth: strokeW })
    );
  }

  if (node.type === 'start' || node.type === 'end') {
    return React.createElement('g', { style: { filter: glow } },
      React.createElement('rect', { x: x - halfW, y: y - halfH, width: NODE_W, height: NODE_H, rx: NODE_H / 2, fill: colors.bg, stroke: colors.border, strokeWidth: strokeW })
    );
  }

  return React.createElement('g', { style: { filter: glow } },
    React.createElement('rect', { x: x - halfW, y: y - halfH, width: NODE_W, height: NODE_H, rx: 6, fill: colors.bg, stroke: colors.border, strokeWidth: strokeW })
  );
}

// ── FlowChart Component ──
const FlowChart = ({ flowData, currentStep }) => {
  const containerRef = useRef(null);
  const prevActiveRef = useRef(-1);

  // Always extract data (no conditional hooks)
  const nodes = (flowData && flowData.nodes) ? flowData.nodes : [];
  const edges = (flowData && flowData.edges) ? flowData.edges : [];
  const hasData = nodes.length > 0;

  // Compute positions (pure function, no hooks)
  const positions = computePositions(nodes.length);

  // Find active node
  const activeIdx = (currentStep && currentStep.line)
    ? nodes.findIndex(function(n) { return n.line === currentStep.line; })
    : -1;

  // Auto-scroll to active node (useEffect always called, same order)
  useEffect(() => {
    if (activeIdx >= 0 && activeIdx !== prevActiveRef.current && containerRef.current) {
      prevActiveRef.current = activeIdx;
      const nodeY = positions[activeIdx] ? positions[activeIdx].y : 0;
      const container = containerRef.current;
      const targetScroll = nodeY - container.clientHeight / 3;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  });

  // Empty state
  if (!hasData) {
    return (
      <div className="flow-chart-empty">
        <div className="flow-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="8" y="16" width="8" height="5" rx="1" />
            <line x1="6.5" y1="8" x2="6.5" y2="13" stroke="#6b7280" strokeWidth="1" />
            <line x1="17.5" y1="8" x2="17.5" y2="13" stroke="#6b7280" strokeWidth="1" />
            <line x1="6.5" y1="13" x2="12" y2="16" stroke="#6b7280" strokeWidth="1" />
            <line x1="17.5" y1="13" x2="12" y2="16" stroke="#6b7280" strokeWidth="1" />
          </svg>
          <span>Click <b>Analyze</b> to generate flow chart</span>
        </div>
      </div>
    );
  }

  const svgWidth = NODE_W + PAD * 2;
  const svgHeight = nodes.length * (NODE_H + GAP_Y) + PAD;

  return (
    <div className="flow-chart-board" ref={containerRef}>
      <svg width={svgWidth} height={svgHeight} className="flow-svg">
        <defs>
          <marker id="fc-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#4b5563" />
          </marker>
          <marker id="fc-arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(function(edge, i) {
          var fromIdx = nodes.findIndex(function(n) { return n.id === edge.from; });
          var toIdx = nodes.findIndex(function(n) { return n.id === edge.to; });
          if (fromIdx < 0 || toIdx < 0) return null;
          var from = positions[fromIdx];
          var to = positions[toIdx];
          var isActive = fromIdx === activeIdx || toIdx === activeIdx;
          var color = isActive ? '#22c55e' : '#4b5563';
          var width = isActive ? 2 : 1;
          var marker = isActive ? 'url(#fc-arrow-active)' : 'url(#fc-arrow)';

          if (toIdx === fromIdx + 1) {
            return <line key={'e' + i} x1={from.x} y1={from.y + NODE_H / 2} x2={to.x} y2={to.y - NODE_H / 2} stroke={color} strokeWidth={width} markerEnd={marker} />;
          }

          var offset = Math.abs(toIdx - fromIdx) * 8 + 20;
          var d = 'M' + (from.x + NODE_W/2) + ',' + from.y +
                  ' C' + (from.x + NODE_W/2 + offset) + ',' + from.y +
                  ' ' + (to.x + NODE_W/2 + offset) + ',' + to.y +
                  ' ' + (to.x + NODE_W/2) + ',' + to.y;
          return <path key={'e' + i} d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={toIdx < fromIdx ? '4,3' : 'none'} markerEnd={marker} />;
        })}

        {/* Nodes */}
        {nodes.map(function(node, i) {
          var pos = positions[i];
          var isActive = i === activeIdx;
          var colors = TYPE_COLORS[node.type] || TYPE_COLORS.process;

          return (
            <g key={node.id || i}>
              {renderShape(node, pos.x, pos.y, isActive)}
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={isActive ? '#fff' : colors.text} fontSize="11"
                    fontFamily="'Space Mono', monospace" fontWeight={isActive ? 'bold' : 'normal'}>
                {truncate(node.label)}
              </text>
              <text x={pos.x - NODE_W/2 + 4} y={pos.y - NODE_H/2 - 4}
                    fill={colors.border} fontSize="8" fontFamily="'Space Mono', monospace" opacity="0.7">
                {node.type}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default FlowChart;
