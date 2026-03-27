import React from 'react';

/**
 * StatusBar — Shows execution status, console output, complexity info, and errors.
 */
const StatusBar = ({ statusText, consoleOutput, timeComplexity, spaceComplexity, error }) => {

  // Error state
  if (error) {
    return (
      <div className="status-bar status-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="status-bar-enhanced">
      {/* Status text */}
      {statusText && (
        <div className="sb-status">
          <span className="sb-dot"></span>
          {statusText}
        </div>
      )}

      {/* Console output */}
      {consoleOutput && (
        <div className="sb-console">
          <span className="sb-label">Output</span>
          <code className="sb-output">{consoleOutput}</code>
        </div>
      )}

      {/* Complexity info */}
      {(timeComplexity || spaceComplexity) && (
        <div className="sb-complexity">
          {timeComplexity && (
            <span className="sb-badge sb-time">
              ⏱ {timeComplexity}
            </span>
          )}
          {spaceComplexity && (
            <span className="sb-badge sb-space">
              💾 {spaceComplexity}
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {!statusText && !consoleOutput && !timeComplexity && (
        <div className="sb-idle">Ready to analyze</div>
      )}
    </div>
  );
};

export default StatusBar;