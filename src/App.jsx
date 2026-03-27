import React, { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeCode } from './services/groqApi.js';
import { analyzeJS, canUseJSEngine } from './engine/index.js';
import Header from './components/Header.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import VariableCards from './components/VariableCards.jsx';
import FlowChart from './components/FlowChart.jsx';
import CallStack from './components/CallStack.jsx';
import DSAVisualizer from './components/DSAVisualizer.jsx';
import MemoryView from './components/MemoryView.jsx';
import StatusBar from './components/StatusBar.jsx';
import Controls from './components/Controls.jsx';
import Timeline from './components/Timeline.jsx';
import SampleTemplates from './components/SampleTemplates.jsx';
import './styles/global.css';

const DEFAULT_CODE = `// Binary Search — O(log n)
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

let arr = [1, 3, 5, 7, 9, 11, 13];
let result = binarySearch(arr, 7);
console.log("Found at index:", result);`;

const App = () => {
  // Editor state
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE);

  // Execution state
  const [steps, setSteps] = useState([]);
  const [cur, setCur] = useState(-1);
  const [hoverLine, setHoverLine] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [spd, setSpd] = useState(3);
  const [zoom, setZoom] = useState(3);

  // Variable / visualization state
  const [pv, setPv] = useState({});
  const [activeCell, setActiveCell] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [visitedCells, setVisitedCells] = useState([]);
  const [flowData, setFlowData] = useState(null);

  // UI state
  const [spinning, setSpinning] = useState(false);
  const [abt, setAbt] = useState('Analyze');
  const [showTemplates, setShowTemplates] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [engineMode, setEngineMode] = useState('');  // 'js-engine' or 'groq-api'

  // Analysis result state
  const [consoleOutput, setConsoleOutput] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [analysisError, setAnalysisError] = useState('');

  // Refs for stale closure avoidance
  const curRef = useRef(cur);
  const stepsRef = useRef(steps);
  curRef.current = cur;
  stepsRef.current = steps;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  // Navigate to a step
  const go = useCallback((idx, stepsArray) => {
    const s = stepsArray || stepsRef.current;
    if (!s.length) return;
    idx = Math.max(0, Math.min(idx, s.length - 1));
    setCur(idx);
    const step = s[idx];
    setPv({ ...step.variables });
    setActiveCell(step?.activeCell || null);
    setStatusText(step?.statusText || '');
    setVisitedCells(prev => {
      if (step?.activeCell) {
        const already = prev.some(c => c.row === step.activeCell.row && c.col === step.activeCell.col);
        if (!already) return [...prev, step.activeCell];
      }
      return prev;
    });
  }, []);

  // Analyze code — hybrid: JS engine for JavaScript, Groq API for others
  const analyze = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    setSpinning(true);
    setPlaying(false);
    setCur(-1);
    setPv({});
    setVisitedCells([]);
    setFlowData(null);
    setConsoleOutput('');
    setTimeComplexity('');
    setSpaceComplexity('');
    setAnalysisError('');

    if (canUseJSEngine(lang)) {
      // ⚡ Browser-native JS engine — instant execution!
      setAbt('Executing...');
      setEngineMode('js-engine');
      try {
        // Use setTimeout(0) to let the UI update before blocking
        await new Promise(resolve => setTimeout(resolve, 10));
        const result = analyzeJS(trimmedCode);
        if (result.error && result.steps.length === 0) {
          setAnalysisError(result.error);
          setAbt('Retry');
        } else {
          setSteps(result.steps);
          if (result.flowchart) setFlowData(result.flowchart);
          if (result.console_output) setConsoleOutput(result.console_output);
          if (result.time_complexity) setTimeComplexity(result.time_complexity);
          if (result.space_complexity) setSpaceComplexity(result.space_complexity);
          if (result.error) setAnalysisError(result.error);
          go(0, result.steps);
          console.log(`⚡ JS Engine: ${result.steps.length} steps in ${result.execTimeMs || 0}ms`);
        }
      } catch (e) {
        setAnalysisError(e.message);
        setAbt('Retry');
      } finally {
        setSpinning(false);
        setAbt('Run');
      }
    } else {
      // 🌐 Groq API for Python/Java/C++
      setAbt('Analyzing...');
      setEngineMode('groq-api');
      try {
        const result = await analyzeCode(trimmedCode, lang);
        const newSteps = result.steps;
        setSteps(newSteps);
        if (result.flowchart) setFlowData(result.flowchart);
        if (result.console_output) setConsoleOutput(result.console_output);
        if (result.time_complexity) setTimeComplexity(result.time_complexity);
        if (result.space_complexity) setSpaceComplexity(result.space_complexity);
        go(0, newSteps);
      } catch (e) {
        console.error('Analysis failed:', e.message);
        setAnalysisError(e.message);
        setAbt('Retry');
      } finally {
        setSpinning(false);
        setAbt('Analyze');
      }
    }
  };

  // Playback controls
  const onPrev = useCallback(() => { if (curRef.current > 0) go(curRef.current - 1); }, [go]);
  const onNext = useCallback(() => {
    if (curRef.current < stepsRef.current.length - 1) go(curRef.current + 1);
    else setPlaying(false);
  }, [go]);
  const onPlay = useCallback(() => {
    if (curRef.current >= stepsRef.current.length - 1) go(0);
    setPlaying(true);
  }, [go]);
  const onStop = useCallback(() => setPlaying(false), []);
  const onRestart = useCallback(() => { setVisitedCells([]); go(0); }, [go]);
  const onSeek = useCallback((idx) => go(idx), [go]);

  // Active step info
  const hoverStep = steps.find(s => s.line === hoverLine);
  const activeStep = hoverStep || steps[cur] || null;

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (playing && stepsRef.current.length > 0) {
      const delay = 2400 / spd;
      timer = setInterval(() => {
        if (curRef.current >= stepsRef.current.length - 1) setPlaying(false);
        else go(curRef.current + 1);
      }, delay);
    }
    return () => clearInterval(timer);
  }, [playing, spd, go]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      // Don't intercept when typing in editor or inputs
      const tag = document.activeElement?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || document.activeElement?.closest('.cm-editor')) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          playing ? onStop() : onPlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); onRestart(); }
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playing, onPlay, onStop, onNext, onPrev, onRestart]);

  return (
    <div className={'wrap theme-' + theme}>
      {/* ── Header ── */}
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAnalyze={analyze}
        spinning={spinning}
      />

      {/* ── Main Layout ── */}
      <div className="app-layout">
        {/* LEFT: Code Editor */}
        <div className="left-panel">
          <CodeEditor
            lang={lang} setLang={setLang}
            code={code} setCode={setCode}
            onAnalyze={analyze} spinning={spinning} abt={abt}
            currentLine={steps[cur]?.line}
          />
        </div>

        {/* CENTER: Visualization */}
        <div className="center-panel" style={{ zoom: 0.6 + (zoom - 1) * 0.2 }}>
          {/* Variable cards */}
          <VariableCards variables={pv} />

          {/* DSA Visualization */}
          <DSAVisualizer variables={pv} activeCell={activeCell} />

          {/* Flow Chart + Call Stack side by side */}
          <div className="vis-row">
            <div className="vis-flow">
              <FlowChart flowData={flowData} currentStep={steps[cur]} />
            </div>
            <div className="vis-stack">
              <CallStack currentStep={steps[cur]} />
            </div>
          </div>

          {/* Code Trace */}
          <div className="code-trace">
            {code.split('\n').map((line, idx) => {
              const lineNum = idx + 1;
              const isActive = activeStep?.line === lineNum;
              const isHovered = hoverLine === lineNum;
              const stepForLine = steps.find(s => s.line === lineNum);
              return (
                <div
                  key={lineNum}
                  className={`trace-line ${isActive ? 'active-line' : ''} ${isHovered ? 'hover-line' : ''}`}
                  onMouseEnter={() => setHoverLine(lineNum)}
                  onMouseLeave={() => setHoverLine(null)}
                  onClick={() => stepForLine && go(steps.indexOf(stepForLine))}
                  title={stepForLine ? stepForLine.explanation : ''}
                >
                  {isActive && <span className="flow-arrow">▶</span>}
                  <span className="line-number">{lineNum}</span>
                  <span className="code-text">{line || '\u00a0'}</span>
                  {stepForLine && isActive && (
                    <span className="step-tooltip">{stepForLine.explanation}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Bar */}
          <StatusBar
            statusText={statusText}
            consoleOutput={consoleOutput}
            timeComplexity={timeComplexity}
            spaceComplexity={spaceComplexity}
            error={analysisError}
          />
        </div>

        {/* RIGHT: Controls */}
        <div className="right-panel">
          <Controls
            speed={spd} setSpeed={setSpd} zoom={zoom} setZoom={setZoom}
            cur={cur} totalSteps={steps.length} lang={lang} setLang={setLang}
            onExample={() => setShowTemplates(true)} onView={() => {}} onOk={() => {}}
            onPlay={onPlay} onStop={onStop} playing={playing}
            onPrev={onPrev} onNext={onNext} onRestart={onRestart}
            code={code}
          />

          {/* Timeline */}
          <Timeline
            cur={cur}
            totalSteps={steps.length}
            onSeek={onSeek}
            stepInfo={steps[cur]?.explanation || ''}
          />
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <SampleTemplates
          lang={lang}
          onSelect={(newCode) => setCode(newCode)}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default App;