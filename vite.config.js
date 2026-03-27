import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to handle /api/groq locally during development
function groqApiPlugin() {
  return {
    name: 'groq-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/groq' || req.method !== 'POST') {
          return next();
        }

        const env = loadEnv('development', process.cwd(), '');
        const apiKey = env.GROQ_API_KEY;

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'GROQ_API_KEY not set in .env' }));
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
          console.error('[groq-proxy] Error:', error.message);
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