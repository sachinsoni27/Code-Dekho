/**
 * instrumenter.js — Walk the AST and inject __trace() calls at key points.
 * This is the heart of the engine — transforms user code into traced code.
 * 
 * Strategy: Instead of modifying the AST (complex), we use a line-based
 * approach: split code into lines, and insert trace statements before
 * key lines (assignments, function calls, loops, conditionals, returns).
 */
import { simple } from 'acorn-walk';

/**
 * Analyze the AST to find all interesting lines and their types.
 * @param {Object} ast — Acorn AST
 * @param {string} code — Original source code
 * @returns {Array} — Array of { line, type, snippet, column }
 */
function analyzeLines(ast, code) {
  const lines = code.split('\n');
  const lineInfo = new Map(); // line -> { type, snippet }

  simple(ast, {
    VariableDeclaration(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'declare',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    AssignmentExpression(node) {
      const line = node.loc.start.line;
      if (!lineInfo.has(line)) {
        lineInfo.set(line, {
          type: 'assign',
          snippet: lines[line - 1]?.trim() || '',
        });
      }
    },

    UpdateExpression(node) {
      const line = node.loc.start.line;
      if (!lineInfo.has(line)) {
        lineInfo.set(line, {
          type: 'update',
          snippet: lines[line - 1]?.trim() || '',
        });
      }
    },

    ForStatement(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'loop',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    ForInStatement(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'loop',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    ForOfStatement(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'loop',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    WhileStatement(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'loop',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    DoWhileStatement(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'loop',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    IfStatement(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'branch',
        snippet: lines[line - 1]?.trim() || '',
      });
      // Also mark else
      if (node.alternate && node.alternate.loc) {
        const elseLine = node.alternate.loc.start.line;
        if (!lineInfo.has(elseLine)) {
          lineInfo.set(elseLine, {
            type: 'branch',
            snippet: lines[elseLine - 1]?.trim() || '',
          });
        }
      }
    },

    ReturnStatement(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'return',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    FunctionDeclaration(node) {
      const line = node.loc.start.line;
      lineInfo.set(line, {
        type: 'call',
        snippet: lines[line - 1]?.trim() || '',
      });
    },

    CallExpression(node) {
      const line = node.loc.start.line;
      if (!lineInfo.has(line)) {
        lineInfo.set(line, {
          type: 'call',
          snippet: lines[line - 1]?.trim() || '',
        });
      }
    },

    ExpressionStatement(node) {
      const line = node.loc.start.line;
      if (!lineInfo.has(line)) {
        lineInfo.set(line, {
          type: 'process',
          snippet: lines[line - 1]?.trim() || '',
        });
      }
    },
  });

  return lineInfo;
}

/**
 * Generate instrumented JavaScript code with __trace() calls.
 * Inserts trace calls before each significant line.
 * 
 * @param {string} code — Original source
 * @param {Object} ast — Parsed AST
 * @returns {string} — Instrumented code ready for sandboxed execution
 */
export function instrument(code, ast) {
  const lineInfo = analyzeLines(ast, code);
  const lines = code.split('\n');
  const output = [];

  // Build variable extraction list by scanning the AST
  const varNames = new Set();
  simple(ast, {
    VariableDeclarator(node) {
      if (node.id && node.id.name) varNames.add(node.id.name);
    },
    AssignmentExpression(node) {
      if (node.left && node.left.name) varNames.add(node.left.name);
    },
    FunctionDeclaration(node) {
      if (node.id && node.id.name) varNames.add(node.id.name);
      // Also add params
      node.params.forEach(p => { if (p.name) varNames.add(p.name); });
    },
  });

  // Generate the var snapshot code
  const varList = [...varNames];
  const snapshotCode = varList.length > 0
    ? `(function(){var __v={};${varList.map(v => 
        `try{if(typeof ${v}!== 'undefined')__v['${v}']=JSON.parse(JSON.stringify(${v}))}catch(e){__v['${v}']='<uninitialized_or_unserializable>'}`
      ).join(';')};return __v})()`
    : '{}';

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines, comments, closing braces
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed === '}' || trimmed === '};' || trimmed === '{') {
      output.push(line);
      continue;
    }

    const info = lineInfo.get(lineNum);
    if (info) {
      // Insert trace BEFORE the line
      output.push(`__trace(${lineNum},'${info.type}',${snapshotCode},${JSON.stringify(info.snippet)});`);
    }

    output.push(line);
  }

  return output.join('\n');
}

/**
 * Get the analyzed line info map (used by flowchart generator).
 */
export function getLineInfo(ast, code) {
  return analyzeLines(ast, code);
}
