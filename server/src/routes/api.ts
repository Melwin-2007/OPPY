import { Router, Request, Response } from 'express';
import { getMarsRoverPhotos } from '../services/nasaService';
import { getAllTributes, createTribute } from '../services/tributeService';
import path from 'path';
import fs from 'fs';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'OPPY API Service', timestamp: new Date().toISOString() });
});

// Mission Phases Data
apiRouter.get('/phases', (req: Request, res: Response) => {
  const filePath = path.join(__dirname, '../../../client/src/data/missionPhases.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.json(data);
  } else {
    res.status(404).json({ error: 'Mission phases data file not found' });
  }
});

// Hardware Subsystems Data
apiRouter.get('/hardware', (req: Request, res: Response) => {
  const filePath = path.join(__dirname, '../../../client/src/data/subsystems.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.json(data);
  } else {
    res.status(404).json({ error: 'Hardware subsystems data file not found' });
  }
});

// Proxied NASA Rover Photos
apiRouter.get('/nasa/photos', async (req: Request, res: Response) => {
  const sol = parseInt(req.query.sol as string, 10) || 1;
  const camera = req.query.camera as string | undefined;
  const photos = await getMarsRoverPhotos(sol, camera);
  res.json({ sol, count: photos.length, photos });
});

// Community Tributes (Guestbook)
apiRouter.get('/tributes', (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 50);
  const tributes = getAllTributes(limit);
  res.json(tributes);
});

apiRouter.post('/tributes', (req: Request, res: Response) => {
  const { visitor_name, location, message } = req.body || {};
  const result = createTribute({ visitor_name, location, message });
  if (!result.success) {
    res.status(400).json({ error: result.error });
  } else {
    res.status(201).json({ success: true, id: result.id });
  }
});
