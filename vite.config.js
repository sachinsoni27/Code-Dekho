import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin to handle /api/groq locally during development
function groqApiPlugin() {
  let apiKey = null;

  return {
    name: 'groq-api-proxy',
    configureServer(server) {
      // Read API key from .env file directly
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/^GROQ_API_KEY=(.+)$/m);
        if (match) apiKey = match[1].trim();
        console.log('[groq-proxy] API key loaded:', apiKey ? 'YES' : 'NO');
      } catch (e) {
        console.error('[groq-proxy] Could not read .env file:', e.message);
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/groq') || req.method !== 'POST') {
          return next();
        }

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'GROQ_API_KEY not found in .env file' }));
          return;
        }

        // Read request body
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const body = Buffer.concat(chunks).toString();

        try {
          console.log('[groq-proxy] Forwarding request to Groq API...');
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body
          });

          const data = await response.text();
          console.log('[groq-proxy] Response status:', response.status);
          res.writeHead(response.ok ? 200 : response.status, { 'Content-Type': 'application/json' });
          res.end(data);
        } catch (error) {
          console.error('[groq-proxy] Fetch error:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Groq API request failed: ${error.message}` }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), groqApiPlugin()],
})