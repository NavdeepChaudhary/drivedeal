// AutoPrice: estimates a fair used-car price in rupees.
//
// How it works (a transparent market-style model, no black box):
//   1. start from the model/variant's original showroom price,
//   2. apply a depreciation curve by age,
//   3. adjust for kilometres vs a normal 11,000 km a year, fuel, gearbox, owners, body type, city and condition.
// Every adjustment is returned in `factors`, so the page can explain the number.
// It is an estimate, not a valuation: real offers depend on inspection and local demand.
import { MODEL_OPTIONS } from './catalog.js';

export const THIS_YEAR = 2026;
export const CONDITIONS = [
  { id: 'excellent', label: 'Excellent', note: 'Like new, no work needed', adj: 0.04 },
  { id: 'good', label: 'Good', note: 'Normal wear, well kept', adj: 0 },
  { id: 'fair', label: 'Fair', note: 'Visible wear, small repairs due', adj: -0.06 },
  { id: 'poor', label: 'Needs work', note: 'Dents, tyres or servicing due', adj: -0.14 },
];
// Collectable icons keep a higher floor value
const ICONS = new Set(['Ambassador', 'Padmini', 'Contessa', 'Gypsy', '800', 'Gurkha']);

export function findModel(brand, model) {
  return MODEL_OPTIONS[brand]?.find((m) => m.model === model) || null;
}

export function newPriceFor(brand, model, variant) {
  const info = findModel(brand, model);
  if (!info) return null;
  const [min, max] = info.priceRange;
  const i = info.variants.indexOf(variant);
  const t = i < 0 ? 0.5 : info.variants.length > 1 ? i / (info.variants.length - 1) : 0.5;
  return Math.round(((min + (max - min) * t) * 100000) / 1000) * 1000;
}

function ageFactor(age) {
  if (age <= 0) return 0.93;
  if (age <= 10) return 0.86 * Math.pow(0.925, age - 1);
  return 0.86 * Math.pow(0.925, 9) * Math.pow(0.95, age - 10);
}

export function estimatePrice({ brand, model, variant, year, km, fuel, transmission, owners = 1, condition = 'good', city = '' }) {
  const info = findModel(brand, model);
  if (!info) return null;
  const y = Number(year), k = Number(km);
  if (!Number.isFinite(y) || !Number.isFinite(k) || y < 1950 || y > THIS_YEAR + 1 || k < 0) return null;

  const age = Math.max(THIS_YEAR - y, 0);
  const newPrice = newPriceFor(brand, model, variant);
  const icon = ICONS.has(model);
  const vintage = age >= 20 || (icon && age >= 12);
  let base = newPrice * ageFactor(age);
  const floor = newPrice * (icon && age >= 12 ? 0.6 : vintage ? 0.1 : 0.08); // icons are collectables, so they hold value
  base = Math.max(base, floor);

  const factors = [];
  let mult = 1;
  const add = (label, pct, note) => {
    if (Math.abs(pct) < 0.0005) return;
    factors.push({ label, pct, note });
    mult *= 1 + pct;
  };

  // kilometres vs normal use
  const expected = age * 11000;
  const diff = k - expected;
  const kmAdj = Math.max(-0.18, Math.min(0.1, (-diff / 10000) * 0.012));
  add('Kilometres driven', kmAdj, diff > 0
    ? `${Math.round(diff).toLocaleString('en-IN')} km more than a typical ${age}-year-old car`
    : `${Math.round(-diff).toLocaleString('en-IN')} km less than a typical ${age}-year-old car`);

  // fuel
  if (fuel === 'Diesel') {
    if (age <= 7) add('Diesel', 0.03, 'Diesel holds value well in the first years');
    else add('Diesel', -0.05, 'Older diesels face more restrictions and costlier upkeep');
  } else if (fuel === 'Electric') {
    add('Electric', age >= 3 ? -0.08 : -0.03, age >= 3 ? 'Battery age lowers resale value' : 'EV resale is still settling');
  } else if (fuel === 'CNG') add('CNG', -0.03, 'CNG kits slightly lower resale value');

  // gearbox
  if (transmission === 'Automatic' && info.transmissions.includes('Manual')) add('Automatic', 0.04, 'Automatics are in demand in cities');

  // owners
  const o = Number(owners) || 1;
  if (o === 2) add('2nd owner', -0.05, 'Buyers prefer first-owner cars');
  else if (o === 3) add('3rd owner', -0.1, 'Several previous owners');
  else if (o >= 4) add('4th+ owner', -0.15, 'Many previous owners');

  // body type demand
  if (info.bodyType === 'suv') add('SUV demand', 0.03, 'SUVs are the most sought-after used cars');
  else if (info.bodyType === 'sedan' && !vintage) add('Sedan demand', -0.02, 'Sedans sell a little slower than SUVs');

  // city rule: diesels over 10 years can't run in Delhi-NCR
  if (fuel === 'Diesel' && age >= 7 && /delhi|gurugram/i.test(city)) add('Delhi-NCR diesel rule', -0.06, 'Diesel cars over 10 years old are barred in Delhi-NCR');

  // condition
  const cond = CONDITIONS.find((c) => c.id === condition) || CONDITIONS[1];
  add(`${cond.label} condition`, cond.adj, cond.note);

  const raw = base * mult;
  const estimate = Math.max(Math.round(raw / 5000) * 5000, 15000);
  const spread = vintage ? 0.18 : age >= 10 ? 0.12 : 0.07;
  const confidence = vintage || (!info.end && info.launch >= 2024 && age > 1) ? 'Low' : age >= 10 || fuel === 'Electric' ? 'Medium' : 'High';
  const round5 = (v) => Math.round(v / 5000) * 5000;
  return {
    estimate,
    low: round5(estimate * (1 - spread)),
    high: round5(estimate * (1 + spread)),
    quickSale: round5(estimate * 0.94),
    newPrice,
    baseValue: Math.round(base / 1000) * 1000,
    retainedPct: Math.round((estimate / newPrice) * 100),
    age,
    confidence,
    factors,
  };
}

// "Great price" / "Fair price" / "Above market" for an asking price
export function dealRating(asking, estimate) {
  const d = (asking - estimate) / estimate;
  if (d <= -0.08) return { id: 'great', label: 'Great price', pct: d };
  if (d <= 0.08) return { id: 'fair', label: 'Fair price', pct: d };
  return { id: 'high', label: 'Above market', pct: d };
}
