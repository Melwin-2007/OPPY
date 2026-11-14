import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(compression());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Static Asset Streaming for 3D Models
const modelsPath = path.join(__dirname, '../../client/public/models');
app.use('/models', express.static(modelsPath, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`[OPPY SERVER] Running on port ${PORT}`);
  console.log(`[OPPY SERVER] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[OPPY SERVER] Phases endpoint: http://localhost:${PORT}/api/phases`);
  console.log(`[OPPY SERVER] Hardware endpoint: http://localhost:${PORT}/api/hardware`);
});
