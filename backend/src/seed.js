import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from './db.js';
import { buildSeedCars, SELLER_NAMES } from '../../shared/cars.js';

const reset = process.argv.includes('--reset');

export function seedIfEmpty() {
  if (reset) {
    db.exec('DELETE FROM messages; DELETE FROM wishlist; DELETE FROM cars; DELETE FROM users;');
  }
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM users').get();
  if (n > 0) return false;

  const adminPass = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
  const insUser = db.prepare(
    'INSERT INTO users (name,email,phone,password_hash,role,verified) VALUES (?,?,?,?,?,?)'
  );
  insUser.run('DriveDeal Admin', process.env.ADMIN_EMAIL || 'admin@drivedeal.in', null,
    bcrypt.hashSync(adminPass, 10), 'admin', 1);

  const sellerIds = {};
  SELLER_NAMES.forEach((s, i) => {
    const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}@example.in`;
    const r = insUser.run(s.name, email, `98765${String(43210 + i)}`,
      bcrypt.hashSync(crypto.randomBytes(12).toString('base64url'), 10), 'user', s.verified ? 1 : 0);
    sellerIds[s.name] = Number(r.lastInsertRowid);
  });

  const insCar = db.prepare(`INSERT INTO cars
    (seller_id,brand,model,variant,year,price,km,fuel,transmission,owners,city,state,rto,color,color_hex,
     body_type,mileage,title,description,features,images,status,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.exec('BEGIN');
  for (const c of buildSeedCars()) {
    insCar.run(sellerIds[c.seller], c.brand, c.model, c.variant, c.year, c.price, c.km, c.fuel,
      c.transmission, c.owners, c.city, c.state, c.rto, c.color, c.colorHex, c.bodyType, c.mileage,
      c.title, c.description, JSON.stringify(c.features), '[]', 'approved', c.createdAt.slice(0, 19).replace('T', ' '));
  }
  db.exec('COMMIT');
  console.log(`Seeded database. Admin login: ${process.env.ADMIN_EMAIL || 'admin@drivedeal.in'} / ${process.env.ADMIN_PASSWORD ? '(password from .env)' : adminPass}`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedIfEmpty();
}
