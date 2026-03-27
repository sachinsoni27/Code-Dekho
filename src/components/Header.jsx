import React from 'react';

/**
 * Header — App branding bar with logo, controls, and theme toggle.
 */
const Header = ({ lang, setLang, theme, onToggleTheme, onAnalyze, spinning }) => {
  const langOptions = [
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'javascript', label: 'JavaScript', icon: '⚡' },
    { id: 'java', label: 'Java', icon: '☕' },
    { id: 'c', label: 'C++', icon: '⚙️' },
  ];

  return (
    <header className="app-header">
      <div className="hd-left">
        <div className="hd-logo">
          <span className="hd-logo-icon">{'</>'}</span>
          <span className="hd-logo-text">Code Dekho</span>
        </div>
        <span className="hd-tagline">Step-by-Step Code Visualizer</span>
      </div>

      <div className="hd-center">
        <div className="hd-lang-selector">
          {langOptions.map((l) => (
            <button
              key={l.id}
              className={'hd-lang' + (lang === l.id ? ' active' : '')}
              onClick={() => setLang(l.id)}
              title={l.label}
            >
              <span className="hd-lang-icon">{l.icon}</span>
              <span className="hd-lang-label">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hd-right">
        <button className="hd-analyze" onClick={onAnalyze} disabled={spinning}>
          {spinning ? (
            <><span className="hd-spin"></span> Analyzing...</>
          ) : (
            <><span className="hd-bolt">⚡</span> Analyze</>
          )}
        </button>
        <button className="hd-theme" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;
