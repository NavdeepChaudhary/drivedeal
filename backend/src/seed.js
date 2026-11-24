import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from './db.js';
import { buildSeedCars, SELLER_NAMES } from '../../shared/cars.js';

const reset = process.argv.includes('--reset');

// Keeps the sample listings up to date in an existing database: adds listings for new models and refreshes
// the price, photos and colour of the sample cars. It only touches cars owned by the sample sellers,
// so real users' listings and photos are never changed.
export function syncSeedCars() {
  const byName = Object.fromEntries(db.prepare("SELECT id, name FROM users WHERE role = 'user'").all().map((r) => [r.name, r.id]));
  const sellerIds = SELLER_NAMES.map((s) => byName[s.name]).filter(Boolean);
  if (!sellerIds.length) return;
  const have = new Map(
    db.prepare(`SELECT id, title FROM cars WHERE seller_id IN (${sellerIds.map(() => '?').join(',')})`).all(...sellerIds).map((r) => [r.title, r.id]),
  );
  const ins = db.prepare(`INSERT INTO cars
    (seller_id,brand,model,variant,year,price,km,fuel,transmission,owners,city,state,rto,color,color_hex,
     body_type,mileage,title,description,features,images,status,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const upd = db.prepare('UPDATE cars SET price = ?, images = ?, color = ?, color_hex = ?, description = ? WHERE id = ?');
  let added = 0, updated = 0;
  db.exec('BEGIN');
  for (const c of buildSeedCars()) {
    const id = have.get(c.title);
    if (id) {
      updated += Number(upd.run(c.price, JSON.stringify(c.images), c.color, c.colorHex, c.description, id).changes);
    } else {
      ins.run(byName[c.seller], c.brand, c.model, c.variant, c.year, c.price, c.km, c.fuel,
        c.transmission, c.owners, c.city, c.state, c.rto, c.color, c.colorHex, c.bodyType, c.mileage,
        c.title, c.description, JSON.stringify(c.features), JSON.stringify(c.images), 'approved',
        c.createdAt.slice(0, 19).replace('T', ' '));
      added++;
    }
  }
  db.exec('COMMIT');
  if (added) console.log(`Added ${added} sample listings.`);
  return { added, updated };
}

export function seedIfEmpty() {
  if (reset) {
    db.exec('DELETE FROM messages; DELETE FROM wishlist; DELETE FROM cars; DELETE FROM users;');
  }
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM users').get();
  if (n > 0) { syncSeedCars(); return false; }

  const adminPass = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
  const insUser = db.prepare(
    'INSERT INTO users (name,email,phone,password_hash,role,verified) VALUES (?,?,?,?,?,?)'
  );
  insUser.run('DriveDeal Admin', process.env.ADMIN_EMAIL || 'admin@drivedeal.in', null,
    bcrypt.hashSync(adminPass, 10), 'admin', 1);

  SELLER_NAMES.forEach((s, i) => {
    const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}@example.in`;
    insUser.run(s.name, email, `98765${String(43210 + i)}`,
      bcrypt.hashSync(crypto.randomBytes(12).toString('base64url'), 10), 'user', s.verified ? 1 : 0);
  });

  syncSeedCars();
  console.log(`Seeded database. Admin login: ${process.env.ADMIN_EMAIL || 'admin@drivedeal.in'} / ${process.env.ADMIN_PASSWORD ? '(password from .env)' : adminPass}`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedIfEmpty();
}
