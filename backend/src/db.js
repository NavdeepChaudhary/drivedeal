import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'drivedeal.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS cars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL, model TEXT NOT NULL, variant TEXT,
  year INTEGER NOT NULL, price INTEGER NOT NULL, km INTEGER NOT NULL,
  fuel TEXT NOT NULL, transmission TEXT NOT NULL, owners INTEGER NOT NULL DEFAULT 1,
  city TEXT NOT NULL, state TEXT, rto TEXT,
  color TEXT, color_hex TEXT, body_type TEXT NOT NULL DEFAULT 'hatchback',
  mileage INTEGER, title TEXT NOT NULL, description TEXT,
  features TEXT NOT NULL DEFAULT '[]', images TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS wishlist (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, car_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_msg_thread ON messages(car_id, buyer_id);
`);

export function carRow(r) {
  if (!r) return null;
  return {
    id: r.id, sellerId: r.seller_id, brand: r.brand, model: r.model, variant: r.variant,
    year: r.year, price: r.price, km: r.km, fuel: r.fuel, transmission: r.transmission,
    owners: r.owners, city: r.city, state: r.state, rto: r.rto, color: r.color,
    colorHex: r.color_hex, bodyType: r.body_type, mileage: r.mileage, title: r.title,
    description: r.description, features: JSON.parse(r.features || '[]'),
    images: JSON.parse(r.images || '[]'), status: r.status, createdAt: r.created_at,
    seller: r.seller_name, sellerVerified: !!r.seller_verified,
  };
}

export const CAR_SELECT = `SELECT c.*, u.name AS seller_name, u.verified AS seller_verified
  FROM cars c JOIN users u ON u.id = c.seller_id`;
