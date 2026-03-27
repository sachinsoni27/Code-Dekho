/**
 * flowchartGen.js — Generate flowchart nodes and edges from AST analysis.
 * Produces the same format as Groq API's flowchart data.
 */
import { simple } from 'acorn-walk';

/**
 * Generate flowchart data from an AST.
 * @param {Object} ast — Acorn AST
 * @param {string} code — Original source code
 * @returns {{ nodes: Array, edges: Array }}
 */
export function generateFlowchart(ast, code) {
  const lines = code.split('\n');
  const nodes = [];
  const edges = [];
  let idCounter = 0;

  function addNode(type, label, line) {
    const id = 'n' + (idCounter++);
    nodes.push({ id, type, label, line });
    return id;
  }

  // Start node
  const startId = addNode('start', 'Start', 0);
  let prevId = startId;

  // Walk top-level statements
  simple(ast, {
    FunctionDeclaration(node) {
      const line = node.loc.start.line;
      const name = node.id ? node.id.name : 'anonymous';
      const id = addNode('call', `fn ${name}()`, line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    VariableDeclaration(node) {
      const line = node.loc.start.line;
      const snippet = lines[line - 1]?.trim() || 'declare';
      const label = snippet.length > 20 ? snippet.slice(0, 18) + '..' : snippet;
      const id = addNode('process', label, line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    ForStatement(node) {
      const line = node.loc.start.line;
      const id = addNode('loop', 'for loop', line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    ForOfStatement(node) {
      const line = node.loc.start.line;
      const id = addNode('loop', 'for..of loop', line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    ForInStatement(node) {
      const line = node.loc.start.line;
      const id = addNode('loop', 'for..in loop', line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    WhileStatement(node) {
      const line = node.loc.start.line;
      const id = addNode('loop', 'while loop', line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    IfStatement(node) {
      const line = node.loc.start.line;
      const snippet = lines[line - 1]?.trim() || 'if';
      const label = snippet.length > 22 ? snippet.slice(0, 20) + '..' : snippet;
      const id = addNode('decision', label, line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    ReturnStatement(node) {
      const line = node.loc.start.line;
      const id = addNode('return', 'return', line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },

    ExpressionStatement(node) {
      const line = node.loc.start.line;
      const snippet = lines[line - 1]?.trim() || 'expr';
      // Skip if it's a trace call (we injected those)
      if (snippet.startsWith('__trace')) return;
      const label = snippet.length > 20 ? snippet.slice(0, 18) + '..' : snippet;
      const id = addNode('process', label, line);
      edges.push({ from: prevId, to: id });
      prevId = id;
    },
  });

  // End node
  const endId = addNode('end', 'End', 0);
  edges.push({ from: prevId, to: endId });

  return { nodes, edges };
}
