/**
 * parser.js — Parse JavaScript source code into an AST using Acorn.
 * Returns the AST with location info for line mapping.
 */
import * as acorn from 'acorn';

/**
 * Parse JavaScript code into an AST.
 * @param {string} code — Source code
 * @returns {{ ast: Object, error: string|null }}
 */
export function parseJS(code) {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: 'script',
      locations: true,       // Line/column info
      ranges: true,          // Start/end offsets
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: false,
    });
    return { ast, error: null };
  } catch (e) {
    return { ast: null, error: `Syntax Error at line ${e.loc?.line || '?'}: ${e.message}` };
  }
}
