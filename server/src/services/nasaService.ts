import axios from 'axios';

interface CacheEntry {
  timestamp: number;
  data: any;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export async function getMarsRoverPhotos(sol: number = 1, camera?: string): Promise<any> {
  const cacheKey = `photos_sol_${sol}_cam_${camera || 'all'}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/photos?sol=${sol}&api_key=${apiKey}` +
    (camera ? `&camera=${camera}` : '');

  try {
    const response = await axios.get(url, { timeout: 8000 });
    const photos = response.data.photos || [];
    memoryCache.set(cacheKey, { timestamp: Date.now(), data: photos });
    return photos;
  } catch (error) {
    // Fallback offline mock response
    return [
      {
        id: 101,
        sol: sol,
        camera: { name: 'PANCAM', full_name: 'Panoramic Camera' },
        img_src: 'https://mars.nasa.gov/mer/gallery/all/1/p/001/1P128285191EFF0000P2303L5M1.JPG',
        earth_date: '2004-01-25'
      }
    ];
  }
}
