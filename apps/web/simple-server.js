import { createServer } from 'http';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { sendOTP, verifyOTP } from './src/lib/simple-auth.js';

// Configuration Neon
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_kdlGjJbUo2T5@ep-purple-fog-amwsyc3j-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:3000`);
  
  try {
    if (url.pathname === '/') {
      // Servir le fichier HTML de test
      const html = readFileSync('./test-auth.html', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else if (url.pathname === '/api/auth/send-otp' && req.method === 'POST') {
      // API send-otp
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const { phone } = JSON.parse(body);
        const result = await sendOTP(phone);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    } else if (url.pathname === '/api/auth/verify-otp' && req.method === 'POST') {
      // API verify-otp
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const { phone, otp } = JSON.parse(body);
        const result = await verifyOTP(phone, otp);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur OMNI lancé sur http://localhost:${PORT}`);
  console.log(`📱 Test d'auth: http://localhost:${PORT}`);
  console.log(`🔧 API send-otp: http://localhost:${PORT}/api/auth/send-otp`);
  console.log(`🔧 API verify-otp: http://localhost:${PORT}/api/auth/verify-otp`);
});
