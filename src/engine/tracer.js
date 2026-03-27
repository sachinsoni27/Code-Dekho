/**
 * tracer.js — Execute instrumented JavaScript code in a sandboxed environment.
 * Collects trace events and produces steps compatible with the existing visualizer.
 */

const STEP_LIMIT = 5000;
const MAX_DEPTH = 50;

/**
 * Execute instrumented code and collect traces.
 * @param {string} instrumentedCode — JS code with __trace() calls injected
 * @returns {{ steps: Array, error: string|null, console_output: string }}
 */
export function executeTraced(instrumentedCode) {
  const traces = [];
  const consoleLines = [];
  let stepCount = 0;
  let callStackDepth = 0;
  let callStack = ['main'];
  let error = null;

  // The __trace function that gets injected into the code
  function __trace(line, type, variables, snippet) {
    if (stepCount >= STEP_LIMIT) {
      throw new Error(`Step limit (${STEP_LIMIT}) exceeded — possible infinite loop`);
    }
    stepCount++;

    // Build explanation from type + snippet
    const explanations = {
      declare: `Declare: ${snippet}`,
      assign: `Assign: ${snippet}`,
      update: `Update: ${snippet}`,
      loop: `Loop: ${snippet}`,
      branch: `Condition: ${snippet}`,
      return: `Return: ${snippet}`,
      call: `Call: ${snippet}`,
      process: `Execute: ${snippet}`,
    };

    // Detect call stack changes
    if (type === 'call' && snippet.includes('function ')) {
      const match = snippet.match(/function\s+(\w+)/);
      if (match) {
        callStack = [...callStack, match[1]];
        callStackDepth++;
        if (callStackDepth > MAX_DEPTH) {
          throw new Error(`Max recursion depth (${MAX_DEPTH}) exceeded`);
        }
      }
    }
    if (type === 'return') {
      if (callStack.length > 1) {
        callStack = callStack.slice(0, -1);
        callStackDepth--;
      }
    }

    traces.push({
      line,
      type,
      explanation: explanations[type] || `Line ${line}: ${snippet}`,
      variables: { ...variables },
      call_stack: [...callStack],
      snippet,
    });
  }

  // Mock console for capturing output
  const mockConsole = {
    log: (...args) => {
      consoleLines.push(args.map(a => {
        if (typeof a === 'object') {
          try { return JSON.stringify(a); } catch { return String(a); }
        }
        return String(a);
      }).join(' '));
    },
    warn: (...args) => mockConsole.log('[WARN]', ...args),
    error: (...args) => mockConsole.log('[ERROR]', ...args),
    info: (...args) => mockConsole.log('[INFO]', ...args),
  };

  try {
    // Create sandboxed execution using Function constructor
    // Provide __trace and mock console, block dangerous globals
    const safeCode = `
      ${instrumentedCode}
    `;

    const executor = new Function(
      '__trace', 'console', 'alert', 'fetch', 'XMLHttpRequest',
      'WebSocket', 'Worker', 'importScripts', '_eval',
      safeCode
    );

    // Execute with sandboxed globals
    executor(
      __trace,        // Our trace collector
      mockConsole,    // Safe console
      undefined,      // Block alert
      undefined,      // Block fetch
      undefined,      // Block XMLHttpRequest
      undefined,      // Block WebSocket
      undefined,      // Block Worker
      undefined,      // Block importScripts
      undefined,      // Block eval
    );
  } catch (e) {
    if (e.message.includes('Step limit') || e.message.includes('Max recursion')) {
      error = e.message;
    } else {
      error = `Runtime Error: ${e.message}`;
      // Still add a trace for the error
      traces.push({
        line: 0,
        type: 'error',
        explanation: `❌ ${e.message}`,
        variables: traces.length > 0 ? traces[traces.length - 1].variables : {},
        call_stack: ['main'],
        snippet: '',
      });
    }
  }

  return {
    steps: traces,
    error,
    console_output: consoleLines.join('\n'),
  };
}
