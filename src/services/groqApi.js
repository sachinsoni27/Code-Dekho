const SYSTEM_PROMPT = `You are a code execution analyzer. Given code in any language, produce a step-by-step dry run AND a data flow chart.

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "steps": [
    {
      "line": <1-based line number being executed>,
      "explanation": "<short explanation of what this line does>",
      "code_snippet": "<the actual line of code>",
      "variables": { "<varName>": "<currentValue>", ... },
      "call_stack": ["<function names in call stack>"],
      "activeCell": null,
      "statusText": "<brief status like 'Entering loop' or ''>"
    }
  ],
  "flowchart": {
    "nodes": [
      { "id": "n1", "label": "<short label>", "type": "<start|end|process|decision|loop|call|return>", "line": <line number> }
    ],
    "edges": [
      { "from": "n1", "to": "n2", "label": "" }
    ]
  },
  "console_output": "<what the program prints>",
  "execution_flow": "<one-line summary>",
  "time_complexity": "<Big-O time>",
  "space_complexity": "<Big-O space>"
}

Rules for steps:
- Walk through EVERY executed line in order, including loop iterations
- Track ALL variables and their current values at each step
- Keep explanations concise (under 15 words)
- If the code works with arrays/matrices, use activeCell: {row, col} to highlight the current cell
- Return 10-25 steps for typical code
- Variables object should show ALL currently in-scope variables

Rules for flowchart:
- Create 6-15 nodes showing the logical flow of the code
- Use "start" for the entry point and "end" for the exit/return
- Use "decision" for if/else conditions
- Use "loop" for for/while loops
- Use "call" for function calls
- Use "process" for assignments and computations
- Use "return" for return statements
- Each node "line" should map to the code line it represents
- Connect nodes with edges showing execution flow
- Keep labels very short (max 20 chars)`;

export async function analyzeCode(code, language) {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this ${language} code step by step:\n\n${code}` }
      ],
      temperature: 0.1,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse response — strip markdown fences if model adds them
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const result = JSON.parse(cleaned);
  return result;
}

export async function detectLanguageWithAI(code) {
  try {
    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a programming language detector. Analyze the following code snippet and return ONLY one of these exact words: "Python", "JavaScript", "Java", or "C++". Output nothing else, no markdown, no quotes, no explanation. If unsure, default to "Python".' },
          { role: 'user', content: code.substring(0, 500) } // Send just enough code for detection to save tokens
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    });

    if (!response.ok) return 'Python';

    const data = await response.json();
    let content = data.choices[0].message.content.replace(/['"`]/g, '').trim();

    // Map common alternatives back to our exact keys
    if (content.toLowerCase() === 'js' || content.toLowerCase() === 'javascript') return 'JavaScript';
    if (content.toLowerCase() === 'c++' || content.toLowerCase() === 'cpp') return 'C++';
    if (content.toLowerCase() === 'java') return 'Java';
    
    return 'Python'; // Default fallback
  } catch (err) {
    console.error("Language detection failed:", err);
    return 'Python';
  }
}
