import React from 'react';

/**
 * Timeline — Execution timeline slider for scrubbing through steps.
 * Shows step progress, current step info, and allows click-to-seek.
 */
const Timeline = ({ cur, totalSteps, onSeek, stepInfo }) => {
  if (totalSteps === 0) return null;

  const progress = totalSteps > 1 ? (cur / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="timeline-panel">
      <div className="tl-bar">
        <div className="tl-track" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          const idx = Math.round(pct * (totalSteps - 1));
          onSeek(Math.max(0, Math.min(idx, totalSteps - 1)));
        }}>
          <div className="tl-fill" style={{ width: progress + '%' }}></div>
          <div className="tl-thumb" style={{ left: progress + '%' }}></div>
          {/* Step dots */}
          {totalSteps <= 30 && Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={'tl-dot' + (i === cur ? ' tl-dot-active' : i < cur ? ' tl-dot-done' : '')}
              style={{ left: (totalSteps > 1 ? (i / (totalSteps - 1)) * 100 : 0) + '%' }}
              onClick={(e) => { e.stopPropagation(); onSeek(i); }}
            />
          ))}
        </div>
      </div>
      <div className="tl-info">
        <span className="tl-step">Step {cur + 1} / {totalSteps}</span>
        {stepInfo && <span className="tl-desc">{stepInfo}</span>}
      </div>
    </div>
  );
};

export default Timeline;
