import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Health check endpoint for system monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'web',
    timestamp: new Date().toISOString(),
  });
});

// SPA fallback: any non-static route serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[MyBigBazaar Web] Production server running on http://localhost:${PORT}`);
});
