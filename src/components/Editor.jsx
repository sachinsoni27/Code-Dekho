import React, { useState, useEffect } from 'react';
import { detectLanguageWithAI } from '../services/groqApi';

const Editor = ({ lang, setLang, code, setCode, onAnalyze, spinning, abt, currentLine }) => {
  const [fname, setFname] = useState('editor.py');
  const [lines, setLines] = useState(22);
  const [chars, setChars] = useState(0);

  const handleSetLang = (button, l, f) => {
    document.querySelectorAll('.lb').forEach(x => x.classList.remove('active'));
    button.classList.add('active');
    setLang(l);
    setFname(f);
  };

  const handleUpdLN = (ta) => {
    const n = ta.value.split('\n').length;
    setLines(n);
    setChars(ta.value.length);
  };

  useEffect(() => {
    handleUpdLN({ value: code });
  }, [code]);

  const [detectingLang, setDetectingLang] = useState(false);

  const handlePaste = async (e) => {
    const pasteData = e.clipboardData.getData('Text');
    if (pasteData && pasteData.trim().length > 10) {
      setDetectingLang(true);
      try {
        const detected = await detectLanguageWithAI(pasteData);
        let f = 'editor.py';
        if (detected === 'JavaScript') f = 'editor.js';
        else if (detected === 'Java') f = 'Editor.java';
        else if (detected === 'C++') f = 'editor.cpp';
        
        document.querySelectorAll('.lb').forEach(x => {
          x.classList.remove('active');
          if (x.textContent.includes(detected) || (detected === 'JavaScript' && x.textContent === 'JS')) {
            x.classList.add('active');
          }
        });
        setLang(detected);
        setFname(f);
      } catch (err) {
        console.error("Auto-detect error:", err);
      } finally {
        setDetectingLang(false);
      }
    }
  };

  return (
    <div className="ep">
      <div className="ph">
        <div className="tls">
          <div className="tl tl-r"></div>
          <div className="tl tl-y"></div>
          <div className="tl tl-g"></div>
        </div>
        <span className="pt" id="fname">{fname}</span>
        <div className="lt">
          <button className="lb active" onClick={(e) => handleSetLang(e.target, 'Python', 'editor.py')}>Python</button>
          <button className="lb" onClick={(e) => handleSetLang(e.target, 'JavaScript', 'editor.js')}>JS</button>
          <button className="lb" onClick={(e) => handleSetLang(e.target, 'Java', 'Editor.java')}>Java</button>
          <button className="lb" onClick={(e) => handleSetLang(e.target, 'C++', 'editor.cpp')}>C++</button>
        </div>
      </div>
      <div className="eb">
        <div className="ln" id="lnums">
          {Array.from({ length: lines }, (_, i) => i + 1).map(num => (
            <div key={num} className={currentLine === num ? 'current-line' : ''}>{num}</div>
          ))}
        </div>
        <div className="editor-area">
          <div className="line-highlight-overlay" aria-hidden="true">
            {code.split('\n').map((line, idx) => (
              <div key={idx} className={`hl-line ${currentLine === idx + 1 ? 'hl-active' : ''}`}>
                {line || '\u00a0'}
              </div>
            ))}
          </div>
          <textarea
            id="ci"
            spellCheck="false"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onPaste={handlePaste}
            onInput={(e) => handleUpdLN(e.target)}
            onScroll={(e) => {
              const overlay = e.target.previousElementSibling;
              if (overlay) overlay.scrollTop = e.target.scrollTop;
            }}
          />
        </div>
      </div>
      <div className="ef">
        <div className="pills">
          <span className="pill" id="lc">{lines} lines</span>
          <span className="pill" id="lp">{detectingLang ? "Detecting AI..." : lang}</span>
          <span className="pill" id="cc">{chars} chars</span>
        </div>
        <button className="btn-a" onClick={onAnalyze}>
          <div className="spin" style={{ display: spinning ? 'block' : 'none' }}></div>
          <span id="abt">{abt}</span>
        </button>
      </div>
    </div>
  );
};

export default Editor;