/**
 * engine/index.js — Main pipeline: code → AST → instrument → execute → traces.
 * 
 * This is the browser-native JS execution engine for Code Dekho.
 * For JavaScript code: instant execution, no API needed.
 * For other languages: falls back to Groq API.
 */
import { parseJS } from './parser.js';
import { instrument } from './instrumenter.js';
import { executeTraced } from './tracer.js';
import { generateFlowchart } from './flowchartGen.js';

/**
 * Analyze JavaScript code using the browser-native engine.
 * Pipeline: parse → instrument → execute → collect traces + flowchart.
 * 
 * @param {string} code — JavaScript source code
 * @returns {{
 *   steps: Array,
 *   flowchart: { nodes: Array, edges: Array },
 *   console_output: string,
 *   time_complexity: string,
 *   space_complexity: string,
 *   error: string|null
 * }}
 */
export function analyzeJS(code) {
  // Phase 1: Parse
  const { ast, error: parseError } = parseJS(code);
  if (parseError) {
    return {
      steps: [{
        line: 1,
        type: 'error',
        explanation: parseError,
        variables: {},
        call_stack: ['main'],
        snippet: '',
      }],
      flowchart: { nodes: [], edges: [] },
      console_output: '',
      time_complexity: '',
      space_complexity: '',
      error: parseError,
    };
  }

  // Phase 2: Generate flowchart from original AST
  const flowchart = generateFlowchart(ast, code);

  // Phase 3: Instrument the code
  let instrumentedCode;
  try {
    instrumentedCode = instrument(code, ast);
  } catch (e) {
    return {
      steps: [],
      flowchart,
      console_output: '',
      time_complexity: '',
      space_complexity: '',
      error: `Instrumentation Error: ${e.message}`,
    };
  }

  // Phase 4: Execute and collect traces
  const startTime = performance.now();
  const result = executeTraced(instrumentedCode);
  const execTime = performance.now() - startTime;

  // Estimate complexity from trace patterns
  const complexity = estimateComplexity(result.steps, code);

  return {
    steps: result.steps,
    flowchart,
    console_output: result.console_output,
    time_complexity: complexity.time,
    space_complexity: complexity.space,
    error: result.error,
    execTimeMs: Math.round(execTime),
  };
}

/**
 * Estimate time/space complexity from trace patterns.
 * Heuristic-based — not perfect but useful for educational display.
 */
function estimateComplexity(steps, code) {
  const stepCount = steps.length;
  const loopSteps = steps.filter(s => s.type === 'loop').length;
  const hasRecursion = steps.some(s => s.type === 'call' && s.snippet?.includes('function'));
  const lines = code.split('\n').length;

  let time = 'O(n)';
  let space = 'O(1)';

  if (loopSteps === 0 && !hasRecursion) {
    time = 'O(1)';
  } else if (loopSteps > lines * 2) {
    time = 'O(n²)';
  } else if (hasRecursion) {
    time = 'O(2ⁿ)'; // Assume worst case for recursion
    space = 'O(n)';
  } else if (code.includes('/ 2') || code.includes('>> 1') || code.includes('Math.floor')) {
    time = 'O(log n)';
  }

  // Check for array/object allocations
  if (code.includes('new Array') || code.includes('[]') || code.includes('new Map') || code.includes('new Set')) {
    space = 'O(n)';
  }

  return { time, space };
}

/**
 * Check if a language should use the browser JS engine.
 */
export function canUseJSEngine(lang) {
  return lang === 'javascript' || lang === 'js';
}
