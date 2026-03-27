import React, { useRef, useEffect, useCallback } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';

// ── Language extension map ──
const langExtensions = {
  python: () => python(),
  javascript: () => javascript(),
  java: () => java(),
  c: () => cpp(),
  cpp: () => cpp(),
  'c++': () => cpp(),
};

// ── Custom theme to match Code Dekho dark look ──
const codeDekhoTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: "'Space Mono', 'Fira Code', monospace",
    height: '100%',
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    caretColor: '#00e5ff',
    padding: '12px 0',
  },
  '.cm-gutters': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRight: '1px solid #1e2230',
    color: '#6b7280',
    minWidth: '40px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(34,197,94,0.25)',
    color: '#fff',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#00e5ff',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(0,229,255,0.15)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(0,229,255,0.12) !important',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: "'Space Mono', monospace",
  },
});

// ── Line highlight decoration for current execution line ──
function createLineHighlight(view, lineNum) {
  if (!lineNum || lineNum < 1 || lineNum > view.state.doc.lines) return [];
  const line = view.state.doc.line(lineNum);
  return [{
    from: line.from,
    to: line.from,
  }];
}

// ── CodeEditor Component ──
const CodeEditor = ({
  code,
  setCode,
  lang,
  setLang,
  onAnalyze,
  spinning,
  abt,
  currentLine,
}) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const codeRef = useRef(code);
  codeRef.current = code;

  // Line highlight extension
  const lineHighlightField = useRef(null);

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    const langExt = langExtensions[lang] || langExtensions.python;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newCode = update.state.doc.toString();
        setCode(newCode);
      }
    });

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, indentWithTab]),
        langExt(),
        oneDark,
        codeDekhoTheme,
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [lang]); // Recreate on language change

  // Sync code from parent (when templates load, etc.)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== code) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: code },
      });
    }
  }, [code]);

  // Highlight the current execution line
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    if (currentLine && currentLine >= 1 && currentLine <= view.state.doc.lines) {
      const line = view.state.doc.line(currentLine);
      // Scroll to the line
      view.dispatch({
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      });
    }
  }, [currentLine]);

  // File extension display
  const fileExtensions = {
    python: 'editor.py',
    javascript: 'editor.js',
    java: 'Editor.java',
    c: 'editor.c',
    cpp: 'editor.cpp',
    'c++': 'editor.cpp',
  };

  const langButtons = [
    { id: 'python', label: 'Python' },
    { id: 'javascript', label: 'JS' },
    { id: 'java', label: 'Java' },
    { id: 'c', label: 'C++' },
  ];

  const lines = code.split('\n').length;
  const chars = code.length;

  return (
    <div className="code-editor-panel">
      {/* Header bar with traffic lights + language buttons */}
      <div className="ce-header">
        <div className="ce-dots">
          <span className="dot dot-r"></span>
          <span className="dot dot-y"></span>
          <span className="dot dot-g"></span>
        </div>
        <span className="ce-filename">{fileExtensions[lang] || 'editor.py'}</span>
        <div className="ce-lang-btns">
          {langButtons.map((lb) => (
            <button
              key={lb.id}
              className={'ce-lang-btn' + (lang === lb.id ? ' active' : '')}
              onClick={() => setLang(lb.id)}
            >
              {lb.label}
            </button>
          ))}
        </div>
      </div>

      {/* CodeMirror editor container */}
      <div
        className={'ce-body' + (currentLine ? ' has-highlight' : '')}
        ref={editorRef}
        data-current-line={currentLine || 0}
      />

      {/* Footer with stats + analyze button */}
      <div className="ce-footer">
        <div className="ce-stats">
          <span className="ce-stat">{lines} lines</span>
          <span className="ce-stat">{lang}</span>
          <span className="ce-stat">{chars} chars</span>
        </div>
        <button className="ce-analyze-btn" onClick={onAnalyze} disabled={spinning}>
          {spinning && <span className="ce-spinner"></span>}
          <span>{abt}</span>
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
