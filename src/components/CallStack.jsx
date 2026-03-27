import React from 'react';

/**
 * CallStack — Visualizes the function call stack during code execution.
 * Shows stack frames with function name, highlighted for the current frame.
 */
const CallStack = ({ callStack, currentStep }) => {
  // callStack comes from the step data: ["main", "check", "inner"]
  const stack = (currentStep && currentStep.call_stack) ? currentStep.call_stack : (callStack || []);

  if (stack.length === 0) {
    return (
      <div className="call-stack-panel">
        <div className="cs-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="6" rx="2" />
            <rect x="2" y="10" width="20" height="6" rx="2" />
            <rect x="2" y="18" width="20" height="4" rx="2" />
          </svg>
          Call Stack
        </div>
        <div className="cs-empty">No active calls</div>
      </div>
    );
  }

  return (
    <div className="call-stack-panel">
      <div className="cs-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="6" rx="2" />
          <rect x="2" y="10" width="20" height="6" rx="2" />
          <rect x="2" y="18" width="20" height="4" rx="2" />
        </svg>
        Call Stack
        <span className="cs-count">{stack.length}</span>
      </div>
      <div className="cs-frames">
        {stack.slice().reverse().map((frame, i) => {
          const isTop = (i === 0); // Top of visual stack = most recent call
          return (
            <div
              key={i}
              className={'cs-frame' + (isTop ? ' cs-active' : '')}
              style={{ animationDelay: (i * 0.05) + 's' }}
            >
              <span className="cs-frame-icon">{isTop ? '▶' : '│'}</span>
              <span className="cs-frame-name">{frame}()</span>
              <span className="cs-frame-depth">#{stack.length - i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CallStack;
