import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../data/tributes.db');
const schemaPath = path.join(__dirname, '../../data/schema.sql');

let db: Database.Database;

try {
  db = new Database(dbPath);
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
} catch (err) {
  console.warn('SQLite initialization warning, fallback to memory DB:', err);
  db = new Database(':memory:');
}

export interface TributeItem {
  id?: number;
  visitor_name: string;
  location?: string;
  message: string;
  created_at?: string;
}

export function getAllTributes(limit: number = 50): TributeItem[] {
  const stmt = db.prepare('SELECT id, visitor_name, location, message, created_at FROM tributes WHERE is_approved = 1 ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit) as TributeItem[];
}

export function createTribute(tribute: TributeItem): { success: boolean; id?: number | bigint; error?: string } {
  if (!tribute.visitor_name || tribute.visitor_name.trim().length === 0) {
    return { success: false, error: 'Visitor name is required.' };
  }
  if (!tribute.message || tribute.message.trim().length < 3) {
    return { success: false, error: 'Message must be at least 3 characters.' };
  }

  const cleanName = tribute.visitor_name.slice(0, 50).trim();
  const cleanLoc = (tribute.location || '').slice(0, 60).trim();
  const cleanMsg = tribute.message.slice(0, 300).trim();

  try {
    const stmt = db.prepare('INSERT INTO tributes (visitor_name, location, message) VALUES (?, ?, ?)');
    const result = stmt.run(cleanName, cleanLoc, cleanMsg);
    return { success: true, id: result.lastInsertRowid };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
