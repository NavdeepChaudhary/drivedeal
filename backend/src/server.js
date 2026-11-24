import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Server as IOServer } from 'socket.io';
import { db, carRow, CAR_SELECT } from './db.js';
import { seedIfEmpty } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) console.warn('[warn] JWT_SECRET not set: logins reset on every restart. Copy .env.example to .env');

const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
seedIfEmpty();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: CLIENT_ORIGIN } });

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '')),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

// ---------- auth helpers ----------
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, verified: !!u.verified });
const sign = (u) => jwt.sign({ id: u.id }, JWT_SECRET, { expiresIn: '7d' });

function auth(required = true) {
  return (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return required ? res.status(401).json({ error: 'Please log in first.' }) : next();
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!u) throw new Error('no user');
      req.user = u;
      next();
    } catch {
      if (required) res.status(401).json({ error: 'Session expired. Please log in again.' });
      else next();
    }
  };
}
const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only.' });

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- auth ----------
app.post('/api/auth/register', wrap((req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name?.trim() || !email?.includes('@') || (password || '').length < 8)
    return res.status(400).json({ error: 'Enter your name, a valid email and a password of 8+ characters.' });
  const lower = email.trim().toLowerCase();
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(lower))
    return res.status(409).json({ error: 'An account with this email already exists.' });
  const r = db.prepare('INSERT INTO users (name,email,phone,password_hash) VALUES (?,?,?,?)')
    .run(name.trim(), lower, phone?.trim() || null, bcrypt.hashSync(password, 10));
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json({ token: sign(u), user: publicUser(u) });
}));

app.post('/api/auth/login', wrap((req, res) => {
  const { email, password } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').trim().toLowerCase());
  if (!u || !bcrypt.compareSync(password || '', u.password_hash))
    return res.status(401).json({ error: 'Wrong email or password.' });
  res.json({ token: sign(u), user: publicUser(u) });
}));

app.get('/api/auth/me', auth(), (req, res) => res.json({ user: publicUser(req.user) }));

// ---------- cars ----------
const SORTS = {
  newest: 'c.created_at DESC, c.id DESC',
  'price-asc': 'c.price ASC',
  'price-desc': 'c.price DESC',
  'km-asc': 'c.km ASC',
  'year-desc': 'c.year DESC',
};

app.get('/api/cars', wrap((req, res) => {
  const q = req.query;
  const where = ["c.status = 'approved'"];
  const args = [];
  const multi = (col, val) => {
    const list = String(val).split(',').filter(Boolean);
    if (list.length) { where.push(`${col} IN (${list.map(() => '?').join(',')})`); args.push(...list); }
  };
  if (q.brand) multi('c.brand', q.brand);
  if (q.fuel) multi('c.fuel', q.fuel);
  if (q.transmission) multi('c.transmission', q.transmission);
  if (q.city) multi('c.city', q.city);
  if (q.bodyType) multi('c.body_type', q.bodyType);
  const num = (v) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
  if (num(q.minPrice) !== null) { where.push('c.price >= ?'); args.push(num(q.minPrice)); }
  if (num(q.maxPrice) !== null) { where.push('c.price <= ?'); args.push(num(q.maxPrice)); }
  if (num(q.minYear) !== null) { where.push('c.year >= ?'); args.push(num(q.minYear)); }
  if (num(q.maxKm) !== null) { where.push('c.km <= ?'); args.push(num(q.maxKm)); }
  if (q.q) {
    where.push('(c.title LIKE ? OR c.brand LIKE ? OR c.model LIKE ? OR c.city LIKE ?)');
    const like = `%${String(q.q).trim()}%`;
    args.push(like, like, like, like);
  }
  if (q.seller) { where.push('c.seller_id = ?'); args.push(Number(q.seller)); }
  const order = SORTS[q.sort] || SORTS.newest;
  const page = Math.max(Number(q.page) || 1, 1);
  const limit = Math.min(Math.max(Number(q.limit) || 12, 1), 60);
  const w = where.join(' AND ');
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM cars c WHERE ${w}`).get(...args);
  const rows = db.prepare(`${CAR_SELECT} WHERE ${w} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...args, limit, (page - 1) * limit);
  res.json({ cars: rows.map(carRow), total, page, pages: Math.ceil(total / limit) });
}));

app.get('/api/cars/meta', (_req, res) => {
  const cities = db.prepare("SELECT DISTINCT city FROM cars WHERE status='approved' ORDER BY city").all().map((r) => r.city);
  const brands = db.prepare("SELECT brand, COUNT(*) AS n FROM cars WHERE status='approved' GROUP BY brand ORDER BY n DESC").all();
  res.json({ cities, brands });
});

app.get('/api/cars/mine', auth(), (req, res) => {
  const rows = db.prepare(`${CAR_SELECT} WHERE c.seller_id = ? ORDER BY c.created_at DESC`).all(req.user.id);
  res.json({ cars: rows.map(carRow) });
});

app.get('/api/cars/:id', auth(false), (req, res) => {
  const r = db.prepare(`${CAR_SELECT} WHERE c.id = ?`).get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Car not found.' });
  const mine = req.user && (req.user.id === r.seller_id || req.user.role === 'admin');
  if (r.status !== 'approved' && !mine) return res.status(404).json({ error: 'Car not found.' });
  res.json({ car: carRow(r) });
});

function validateCar(b) {
  const err = [];
  const s = (v) => (typeof v === 'string' ? v.trim() : '');
  const out = {
    brand: s(b.brand), model: s(b.model), variant: s(b.variant),
    year: Number(b.year), price: Number(b.price), km: Number(b.km),
    fuel: s(b.fuel), transmission: s(b.transmission), owners: Number(b.owners) || 1,
    city: s(b.city), state: s(b.state), rto: s(b.rto), color: s(b.color),
    colorHex: /^#[0-9a-f]{6}$/i.test(b.colorHex || '') ? b.colorHex : '#c8202b',
    bodyType: ['hatchback', 'sedan', 'suv', 'mpv'].includes(b.bodyType) ? b.bodyType : 'hatchback',
    mileage: Number(b.mileage) || null, description: s(b.description).slice(0, 2000),
    features: [],
  };
  try { out.features = (Array.isArray(b.features) ? b.features : JSON.parse(b.features || '[]')).map(String).slice(0, 20); } catch { /* ignore */ }
  if (!['Tata', 'Mahindra', 'Maruti Suzuki', 'Force Motors', 'Hindustan Motors'].includes(out.brand)) err.push('Choose an Indian brand from the list.');
  if (!out.model) err.push('Enter the model.');
  if (!(out.year >= 1950 && out.year <= 2027)) err.push('Enter a valid year.');
  if (!(out.price >= 10000)) err.push('Enter a valid price in rupees.');
  if (!(out.km >= 0 && out.km < 2000000)) err.push('Enter the kilometres driven.');
  if (!['Petrol', 'Diesel', 'CNG', 'Electric'].includes(out.fuel)) err.push('Choose a fuel type.');
  if (!['Manual', 'Automatic'].includes(out.transmission)) err.push('Choose a transmission.');
  if (!out.city) err.push('Enter the city.');
  return { out, err };
}

app.post('/api/cars', auth(), upload.array('photos', 6), wrap((req, res) => {
  const { out, err } = validateCar(req.body);
  if (err.length) return res.status(400).json({ error: err.join(' ') });
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const title = `${out.year} ${out.brand} ${out.model}${out.variant ? ' ' + out.variant : ''}`;
  const status = req.user.role === 'admin' ? 'approved' : 'pending';
  const r = db.prepare(`INSERT INTO cars
    (seller_id,brand,model,variant,year,price,km,fuel,transmission,owners,city,state,rto,color,color_hex,
     body_type,mileage,title,description,features,images,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(req.user.id, out.brand, out.model, out.variant, out.year, out.price, out.km, out.fuel,
      out.transmission, out.owners, out.city, out.state, out.rto, out.color, out.colorHex,
      out.bodyType, out.mileage, title, out.description, JSON.stringify(out.features), JSON.stringify(images), status);
  const row = db.prepare(`${CAR_SELECT} WHERE c.id = ?`).get(r.lastInsertRowid);
  res.status(201).json({ car: carRow(row) });
}));

app.delete('/api/cars/:id', auth(), (req, res) => {
  const r = db.prepare('SELECT * FROM cars WHERE id = ?').get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Car not found.' });
  if (r.seller_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your listing.' });
  for (const img of JSON.parse(r.images || '[]')) {
    const f = path.join(UPLOAD_DIR, path.basename(img));
    fs.promises.unlink(f).catch(() => {});
  }
  db.prepare('DELETE FROM cars WHERE id = ?').run(r.id);
  res.json({ ok: true });
});

// ---------- wishlist ----------
app.get('/api/wishlist', auth(), (req, res) => {
  const rows = db.prepare(`${CAR_SELECT} JOIN wishlist w ON w.car_id = c.id WHERE w.user_id = ? AND c.status='approved'`).all(req.user.id);
  res.json({ cars: rows.map(carRow), ids: rows.map((r) => r.id) });
});
app.post('/api/wishlist/:id', auth(), (req, res) => {
  if (!db.prepare('SELECT 1 FROM cars WHERE id = ?').get(Number(req.params.id))) return res.status(404).json({ error: 'Car not found.' });
  db.prepare('INSERT OR IGNORE INTO wishlist (user_id,car_id) VALUES (?,?)').run(req.user.id, Number(req.params.id));
  res.json({ ok: true });
});
app.delete('/api/wishlist/:id', auth(), (req, res) => {
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND car_id = ?').run(req.user.id, Number(req.params.id));
  res.json({ ok: true });
});

// ---------- chat ----------
function saveMessage(user, carId, body, buyerId) {
  const car = db.prepare('SELECT seller_id FROM cars WHERE id = ?').get(carId);
  if (!car) throw Object.assign(new Error('Car not found.'), { status: 404 });
  const text = String(body || '').trim().slice(0, 1000);
  if (!text) throw Object.assign(new Error('Message is empty.'), { status: 400 });
  let buyer = user.id;
  if (user.id === car.seller_id) {
    buyer = Number(buyerId);
    if (!buyer || !db.prepare('SELECT 1 FROM users WHERE id = ?').get(buyer)) throw Object.assign(new Error('Pick a buyer to reply to.'), { status: 400 });
  }
  if (buyer === car.seller_id) throw Object.assign(new Error('You cannot message yourself.'), { status: 400 });
  const r = db.prepare('INSERT INTO messages (car_id,buyer_id,sender_id,body) VALUES (?,?,?,?)').run(carId, buyer, user.id, text);
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(r.lastInsertRowid);
  const payload = { id: msg.id, carId, buyerId: buyer, senderId: user.id, body: text, createdAt: msg.created_at };
  io.to(`user:${buyer}`).to(`user:${car.seller_id}`).emit('message', payload);
  return payload;
}

app.get('/api/chats', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT m.car_id, m.buyer_id, c.title, c.seller_id,
           MAX(m.id) AS last_id, COUNT(*) AS n
    FROM messages m JOIN cars c ON c.id = m.car_id
    WHERE m.buyer_id = ? OR c.seller_id = ?
    GROUP BY m.car_id, m.buyer_id ORDER BY last_id DESC`).all(req.user.id, req.user.id);
  const out = rows.map((r) => {
    const last = db.prepare('SELECT body, created_at FROM messages WHERE id = ?').get(r.last_id);
    const otherId = r.buyer_id === req.user.id ? r.seller_id : r.buyer_id;
    const other = db.prepare('SELECT name FROM users WHERE id = ?').get(otherId);
    return { carId: r.car_id, buyerId: r.buyer_id, title: r.title, otherName: other?.name || 'User', last: last.body, at: last.created_at };
  });
  res.json({ chats: out });
});

app.get('/api/chats/:carId/:buyerId', auth(), (req, res) => {
  const carId = Number(req.params.carId), buyerId = Number(req.params.buyerId);
  const car = db.prepare(`${CAR_SELECT} WHERE c.id = ?`).get(carId);
  if (!car) return res.status(404).json({ error: 'Car not found.' });
  if (req.user.id !== buyerId && req.user.id !== car.seller_id) return res.status(403).json({ error: 'Not your chat.' });
  const msgs = db.prepare('SELECT * FROM messages WHERE car_id = ? AND buyer_id = ? ORDER BY id').all(carId, buyerId)
    .map((m) => ({ id: m.id, carId, buyerId, senderId: m.sender_id, body: m.body, createdAt: m.created_at }));
  res.json({ car: carRow(car), messages: msgs });
});

app.post('/api/chats/:carId', auth(), wrap((req, res) => {
  res.status(201).json({ message: saveMessage(req.user, Number(req.params.carId), req.body?.body, req.body?.buyerId) });
}));

io.use((socket, next) => {
  try {
    const { id } = jwt.verify(socket.handshake.auth?.token || '', JWT_SECRET);
    socket.userId = id;
    next();
  } catch { next(new Error('unauthorized')); }
});
io.on('connection', (socket) => socket.join(`user:${socket.userId}`));

// ---------- contact ----------
app.post('/api/contact', wrap((req, res) => {
  const { name, email, message } = req.body || {};
  if (!name?.trim() || !email?.includes('@') || !message?.trim()) return res.status(400).json({ error: 'Please fill in all fields.' });
  db.prepare('INSERT INTO contacts (name,email,message) VALUES (?,?,?)').run(name.trim().slice(0, 100), email.trim().slice(0, 150), message.trim().slice(0, 2000));
  res.status(201).json({ ok: true });
}));

// ---------- admin ----------
app.get('/api/admin/overview', auth(), adminOnly, (_req, res) => {
  const count = (sql) => db.prepare(sql).get().n;
  res.json({
    stats: {
      users: count('SELECT COUNT(*) AS n FROM users'),
      cars: count("SELECT COUNT(*) AS n FROM cars WHERE status='approved'"),
      pending: count("SELECT COUNT(*) AS n FROM cars WHERE status='pending'"),
      messages: count('SELECT COUNT(*) AS n FROM messages'),
    },
    pending: db.prepare(`${CAR_SELECT} WHERE c.status='pending' ORDER BY c.created_at`).all().map(carRow),
    users: db.prepare("SELECT id,name,email,phone,role,verified,created_at FROM users WHERE role!='admin' ORDER BY id DESC").all()
      .map((u) => ({ ...u, verified: !!u.verified })),
    contacts: db.prepare('SELECT * FROM contacts ORDER BY id DESC LIMIT 50').all(),
  });
});
app.post('/api/admin/cars/:id/:action', auth(), adminOnly, (req, res) => {
  const status = { approve: 'approved', reject: 'rejected' }[req.params.action];
  if (!status) return res.status(400).json({ error: 'Unknown action.' });
  db.prepare('UPDATE cars SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  res.json({ ok: true });
});
app.post('/api/admin/users/:id/verify', auth(), adminOnly, (req, res) => {
  const v = req.body?.verified ? 1 : 0;
  db.prepare('UPDATE users SET verified = ? WHERE id = ?').run(v, Number(req.params.id));
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: 'Upload failed: ' + err.message });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong on our side.' : err.message });
});

server.listen(PORT, () => console.log(`DriveDeal API running on http://localhost:${PORT}`));
