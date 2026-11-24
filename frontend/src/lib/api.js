// One API layer, two modes:
//  - full mode  : talks to the Express backend (login, selling, chat, admin...)
//  - demo mode  : (GitHub Pages) browses the built-in sample cars, no backend.
export const DEMO = import.meta.env.MODE === 'demo';
const BASE = import.meta.env.VITE_API_URL || '';

// /uploads/... are seller photos served by the API; /cars/... are bundled photos (honour the Pages sub-path).
export const imgUrl = (p) => {
  if (!p) return p;
  if (p.startsWith('/uploads')) return BASE + p;
  if (p.startsWith('/cars/') || p.startsWith('/hero/')) return import.meta.env.BASE_URL + p.slice(1);
  return p;
};
export const getToken = () => { try { return localStorage.getItem('dd_token'); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem('dd_token', t) : localStorage.removeItem('dd_token'); } catch { /* ignore */ } };

const DEMO_MSG = 'This feature needs the full version. Run DriveDeal on your computer (see the README) to log in, sell cars, chat and use the admin panel.';

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o || {}).forEach(([k, v]) => { if (v !== '' && v != null && !(Array.isArray(v) && !v.length)) p.set(k, Array.isArray(v) ? v.join(',') : v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

// ---------- demo backend ----------
let demoCars = null;
async function loadDemo() {
  if (!demoCars) {
    const { buildSeedCars } = await import('../../../shared/cars.js');
    demoCars = buildSeedCars();
  }
  return demoCars;
}
const SORT = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'km-asc': (a, b) => a.km - b.km,
  'year-desc': (a, b) => b.year - a.year,
};
const demoApi = {
  async cars(p = {}) {
    let list = await loadDemo();
    const has = (v) => v !== '' && v != null && !(Array.isArray(v) && !v.length);
    const arr = (v) => (Array.isArray(v) ? v : String(v).split(','));
    if (has(p.brand)) list = list.filter((c) => arr(p.brand).includes(c.brand));
    if (has(p.fuel)) list = list.filter((c) => arr(p.fuel).includes(c.fuel));
    if (has(p.transmission)) list = list.filter((c) => arr(p.transmission).includes(c.transmission));
    if (has(p.city)) list = list.filter((c) => arr(p.city).includes(c.city));
    if (has(p.bodyType)) list = list.filter((c) => arr(p.bodyType).includes(c.bodyType));
    if (has(p.minPrice)) list = list.filter((c) => c.price >= Number(p.minPrice));
    if (has(p.maxPrice)) list = list.filter((c) => c.price <= Number(p.maxPrice));
    if (has(p.minYear)) list = list.filter((c) => c.year >= Number(p.minYear));
    if (has(p.maxKm)) list = list.filter((c) => c.km <= Number(p.maxKm));
    if (has(p.q)) { const q = String(p.q).toLowerCase(); list = list.filter((c) => `${c.title} ${c.city}`.toLowerCase().includes(q)); }
    list = [...list].sort(SORT[p.sort] || SORT.newest);
    const limit = Number(p.limit) || 12, page = Number(p.page) || 1;
    return { cars: list.slice((page - 1) * limit, page * limit), total: list.length, page, pages: Math.ceil(list.length / limit) };
  },
  async car(id) {
    const c = (await loadDemo()).find((x) => x.id === Number(id));
    if (!c) throw new Error('Car not found.');
    return { car: c };
  },
  async meta() {
    const list = await loadDemo();
    const cities = [...new Set(list.map((c) => c.city))].sort();
    const counts = {};
    list.forEach((c) => { counts[c.brand] = (counts[c.brand] || 0) + 1; });
    return { cities, brands: Object.entries(counts).map(([brand, n]) => ({ brand, n })).sort((a, b) => b.n - a.n) };
  },
  async blocked() { throw new Error(DEMO_MSG); },
};

const real = {
  cars: (p) => request('/api/cars' + qs(p)),
  car: (id) => request(`/api/cars/${id}`),
  meta: () => request('/api/cars/meta'),
};

const pick = (name) => (DEMO && demoApi[name] ? demoApi[name] : real[name]);
const gated = (fn) => (DEMO ? demoApi.blocked : fn);

export const api = {
  cars: (p) => pick('cars')(p),
  car: (id) => pick('car')(id),
  meta: () => pick('meta')(),
  register: gated((b) => request('/api/auth/register', { method: 'POST', body: b })),
  login: gated((b) => request('/api/auth/login', { method: 'POST', body: b })),
  me: gated(() => request('/api/auth/me')),
  myCars: gated(() => request('/api/cars/mine')),
  createCar: gated((form) => request('/api/cars', { method: 'POST', form })),
  deleteCar: gated((id) => request(`/api/cars/${id}`, { method: 'DELETE' })),
  wishlist: gated(() => request('/api/wishlist')),
  addWish: gated((id) => request(`/api/wishlist/${id}`, { method: 'POST' })),
  removeWish: gated((id) => request(`/api/wishlist/${id}`, { method: 'DELETE' })),
  chats: gated(() => request('/api/chats')),
  thread: gated((carId, buyerId) => request(`/api/chats/${carId}/${buyerId}`)),
  send: gated((carId, body, buyerId) => request(`/api/chats/${carId}`, { method: 'POST', body: { body, buyerId } })),
  contact: gated((b) => request('/api/contact', { method: 'POST', body: b })),
  adminOverview: gated(() => request('/api/admin/overview')),
  adminCar: gated((id, action) => request(`/api/admin/cars/${id}/${action}`, { method: 'POST' })),
  adminVerify: gated((id, verified) => request(`/api/admin/users/${id}/verify`, { method: 'POST', body: { verified } })),
};
