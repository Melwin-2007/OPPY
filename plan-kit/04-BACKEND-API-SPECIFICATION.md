# OPPY'S LAST DANCE — Backend API & Service Specification
**Document ID:** `PLANKIT-BACKEND-04`  
**Version:** `1.0.0`  
**Runtime:** Node.js `v20+` / TypeScript / Express `^4.19` / SQLite (`better-sqlite3`)  

---

## 1. REST API Endpoint Overview

| Method | Endpoint | Description | Cache Policy |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & uptime | No-Cache |
| `GET` | `/api/phases` | All 6 mission story phases with scientific metadata | `public, max-age=86400` |
| `GET` | `/api/phases/:id` | Specific story phase details & landmark telemetry | `public, max-age=86400` |
| `GET` | `/api/hardware` | Complete engineering specs for the 6 rover subsystems | `public, max-age=86400` |
| `GET` | `/api/nasa/photos` | Proxied NASA Mars Rover Photos query (by Sol / camera) | `public, max-age=43200` (12h) |
| `GET` | `/api/tributes` | Paginated list of approved community tributes | `public, max-age=60` |
| `POST` | `/api/tributes` | Submit a new tribute message to Opportunity | Rate-limited (5/hour per IP) |
| `GET` | `/api/models/:file` | Byte-range streaming for `.glb` 3D flight models | `public, max-age=31536000` |

---

## 2. Data Models & Schemas

### 2.1 Mission Phase Schema (JSON & TypeScript)

```typescript
// server/src/types/phase.ts
export interface MissionPhase {
  id: number;
  slug: string;
  phaseNumber: string; // "PHASE // 01"
  title: string;       // "The Beginning"
  period: string;      // "2003"
  solRange: [number, number]; // [0, 0] or [1, 90]
  odometerKm: number;  // Distance at end of phase
  headline: string;
  narrativeText: string;
  scienceObjectives: string[];
  discoveries: {
    title: string;
    description: string;
    instrument: string; // "APXS", "Mössbauer", "Pancam"
    nasaPhotoUrl?: string;
  }[];
  environment: {
    modelFile: string; // "env_phase3_eagle_crater.glb"
    atmosphereColor: [number, number, number];
    dustOpacity: number; // 0.0 to 1.0
    sunIntensity: number;
  };
  cameraTarget: {
    camPos: [number, number, number];
    lookAt: [number, number, number];
  };
}
```

---

### 2.2 Community Tribute Guestbook Database (SQLite Schema)

```sql
-- server/src/data/schema.sql
CREATE TABLE IF NOT EXISTS tributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_name TEXT NOT NULL CHECK(length(visitor_name) <= 50),
    location TEXT CHECK(length(location) <= 60),
    message TEXT NOT NULL CHECK(length(message) >= 5 AND length(message) <= 300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved INTEGER DEFAULT 1 -- Moderation flag
);

CREATE INDEX IF NOT EXISTS idx_tributes_approved ON tributes(is_approved, created_at DESC);
```

---

## 3. NASA Open API Caching Proxy Implementation

To protect against external rate-limits ($1,000\text{ requests/hour}$ on NASA DEMO_KEY), the backend caches external responses in an in-memory TTL map:

```typescript
// server/src/services/nasaService.ts
import axios from 'axios';

interface CacheEntry {
  timestamp: number;
  data: any;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export async function fetchMarsPhotos(sol: number, camera?: string): Promise<any> {
  const cacheKey = `sol_${sol}_cam_${camera || 'all'}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/photos?sol=${sol}&api_key=${apiKey}` +
    (camera ? `&camera=${camera}` : '');

  try {
    const response = await axios.get(url, { timeout: 8000 });
    cache.set(cacheKey, { timestamp: Date.now(), data: response.data.photos });
    return response.data.photos;
  } catch (error) {
    // Graceful offline fallback to bundled static fixtures
    return getOfflinePhotosFixture(sol);
  }
}
```

---

## 4. High-Performance 3D Asset Streaming Controller

```typescript
// server/src/controllers/modelController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export function streamModelFile(req: Request, res: Response): void {
  const filename = req.params.file;
  const filePath = path.join(__dirname, '../../public/models', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: '3D model file not found' });
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.setHeader('Content-Type', 'model/gltf-binary');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Accept-Ranges', 'bytes');

  // Support HTTP 206 Partial Content for progressive parallel downloading
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunksize,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': fileSize });
    fs.createReadStream(filePath).pipe(res);
  }
}
```
