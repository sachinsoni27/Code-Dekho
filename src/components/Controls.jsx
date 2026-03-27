import React from 'react';

const Controls = ({
  speed, setSpeed, zoom, setZoom, cur, totalSteps, lang, setLang, onExample, onView, onOk, onPlay, onStop, playing, onPrev, onNext, onRestart, code
}) => {
  return (
    <div className="controls-panel">
      <div className="slider-group">
        <label>Speed <span className="slider-val">{speed}</span></label>
        <input type="range" min="1" max="5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
      </div>
      <div className="slider-group">
        <label>Zoom</label>
        <input type="range" min="1" max="5" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
      </div>
      <div className="step-indicator">
        <label>Step</label>
        <div className="step-counter">{cur >= 0 ? cur + 1 : 0} / {totalSteps}</div>
      </div>

      <div className="play-controls">
        <button onClick={onPrev} title="Step Back">◀</button>
        <button onClick={playing ? onStop : onPlay} className={playing ? 'playing' : ''}>{playing ? '⏸ Pause' : '▶ Play'}</button>
        <button onClick={onNext} title="Step Forward">▶</button>
        <button onClick={onRestart} title="Restart">⟲</button>
      </div>

      <div className="controls-actions">
        <button className="action-btn" onClick={onExample}>Example codes</button>
        <button className="action-btn" onClick={onView}>View</button>
      </div>

      <div className="config-section">
        <h4>Configuration</h4>
        <label>Code Language</label>
        <div className="lang-buttons">
          <button className={lang === 'javascript' ? 'active' : ''} onClick={() => setLang('javascript')}>javascript</button>
          <button className={lang === 'python' ? 'active' : ''} onClick={() => setLang('python')}>python</button>
          <button className={lang === 'java' ? 'active' : ''} onClick={() => setLang('java')}>java</button>
          <button className={lang === 'c' ? 'active' : ''} onClick={() => setLang('c')}>c/c++ (in Dev)</button>
        </div>
      </div>

      <div className="code-preview">
        <h4>Code</h4>
        <pre className="preview-code">{code || ''}</pre>
        <button className="ok-btn" onClick={onOk}>OK</button>
      </div>
    </div>
  );
};

export default Controls;