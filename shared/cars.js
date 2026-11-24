// Shared seed data: used by the backend (to fill the database) and by the
// static GitHub Pages demo (as its built-in "database").
// Indian brands only: Tata, Mahindra, Maruti Suzuki, Force Motors, Hindustan Motors.

import { PHOTOS } from './photos.js';
import { MODELS, MODEL_OPTIONS } from './catalog.js';
import { estimatePrice } from './pricing.js';

export const BRANDS = ['Tata', 'Mahindra', 'Maruti Suzuki', 'Force Motors', 'Hindustan Motors', 'Premier'];

export const CITIES = [
  { city: 'New Delhi', state: 'Delhi', rto: 'DL 3C' },
  { city: 'Mumbai', state: 'Maharashtra', rto: 'MH 02' },
  { city: 'Bengaluru', state: 'Karnataka', rto: 'KA 01' },
  { city: 'Hyderabad', state: 'Telangana', rto: 'TS 09' },
  { city: 'Chennai', state: 'Tamil Nadu', rto: 'TN 01' },
  { city: 'Pune', state: 'Maharashtra', rto: 'MH 12' },
  { city: 'Kolkata', state: 'West Bengal', rto: 'WB 02' },
  { city: 'Ahmedabad', state: 'Gujarat', rto: 'GJ 01' },
  { city: 'Jaipur', state: 'Rajasthan', rto: 'RJ 14' },
  { city: 'Lucknow', state: 'Uttar Pradesh', rto: 'UP 32' },
  { city: 'Chandigarh', state: 'Chandigarh', rto: 'CH 01' },
  { city: 'Gurugram', state: 'Haryana', rto: 'HR 26' },
  { city: 'Kochi', state: 'Kerala', rto: 'KL 07' },
  { city: 'Indore', state: 'Madhya Pradesh', rto: 'MP 09' },
  { city: 'Nagpur', state: 'Maharashtra', rto: 'MH 31' },
];

export const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric'];
export const TRANSMISSIONS = ['Manual', 'Automatic'];
export const BODY_TYPES = ['hatchback', 'sedan', 'suv', 'mpv'];

export const COLORS = [
  { name: 'Pearl White', hex: '#f1f1ee' },
  { name: 'Midnight Black', hex: '#16181d' },
  { name: 'Flame Red', hex: '#c8202b' },
  { name: 'Ocean Blue', hex: '#1f4e9c' },
  { name: 'Graphite Grey', hex: '#555a62' },
  { name: 'Silver', hex: '#b9bec6' },
  { name: 'Forest Green', hex: '#2f5d43' },
  { name: 'Sunburst Orange', hex: '#e07a1f' },
];


const FEATURES = [
  'ABS with EBD', 'Dual airbags', 'Touchscreen infotainment', 'Android Auto & Apple CarPlay',
  'Reverse camera', 'Alloy wheels', 'Automatic climate control', 'Keyless entry',
  'Push-button start', 'Rear AC vents', 'Cruise control', 'Sunroof', 'Steering-mounted controls',
  'Power windows', 'Fog lamps', 'Rear parking sensors', 'Hill hold assist', 'Leather seats',
];

const SELLERS = [
  { name: 'Rajesh Kumar', verified: true },
  { name: 'Priya Nair', verified: true },
  { name: 'Amit Verma', verified: false },
  { name: 'Sunita Rao', verified: true },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeedCars() {
  const rnd = mulberry32(20261124);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const cars = [];
  let id = 1;

  for (const [brand, model, body, [minL, maxL], fuels, trans, variants, launch, end] of MODELS) {
    const classic = brand === 'Hindustan Motors' || brand === 'Premier';
    const count = classic ? 2 : rnd() < 0.55 ? 2 : 1;
    for (let n = 0; n < count; n++) {
      const thisYear = 2026;
      let yearMin = classic ? Math.max(launch, 1995) : launch < 2005 ? launch : Math.max(launch, 2013);
      const yearMax = classic ? Math.min(end ?? 2013, 2013) : Math.min(end ?? thisYear - 1, thisYear - 1);
      if (yearMin > yearMax) yearMin = yearMax;
      const year = Math.floor(yearMin + rnd() * (yearMax - yearMin + 1));
      const vintage = classic || year < 2005; // old cars: priced as collectables
      const age = Math.max(thisYear - year, 0);
      const fuel = pick(fuels);
      const transmission = pick(trans);
      const vi = Math.floor(rnd() * variants.length);
      const variant = variants[vi];
      const newLakh = minL + ((maxL - minL) * vi) / Math.max(variants.length - 1, 1);
      const km = vintage
        ? Math.round((40000 + rnd() * 90000) / 500) * 500
        : Math.round((age * (7000 + rnd() * 9000) + 1500) / 500) * 500;
      const priceRand = vintage ? rnd() : 0; // (drawn here so the random sequence of older data is unchanged)
      const loc = pick(CITIES);
      const photo = PHOTOS[`${brand} ${model}`];
      // when a real photo exists, the listing's colour is the colour of the car in that photo
      const color = photo?.color || pick(COLORS);
      if (photo?.color) pick(COLORS); // keep the random sequence stable
      const seller = pick(SELLERS);
      const owners = classic ? 1 + Math.floor(rnd() * 3) : 1 + (rnd() < 0.25 ? 1 : 0) + (rnd() < 0.06 ? 1 : 0);

      // asking price: collectables are priced by feel, everything else by AutoPrice with a little seller-to-seller variation
      let price;
      if (classic) price = (1.2 + priceRand * 3.5) * 100000;
      else if (vintage) price = newLakh * 100000 * (0.15 + priceRand * 0.25);
      else {
        const est = estimatePrice({ brand, model, variant, year, km, fuel, transmission, owners, city: loc.city });
        price = est.estimate * (0.87 + (((year * 31 + Math.round(km / 500) * 7 + vi * 13) % 13) / 12) * 0.28);
      }
      price = Math.max(Math.round(price / 5000) * 5000, 50000);
      const mileage =
        fuel === 'Electric' ? Math.round(240 + rnd() * 200)
        : fuel === 'CNG' ? Math.round(24 + rnd() * 9)
        : fuel === 'Diesel' ? Math.round(14 + rnd() * 6)
        : Math.round(14 + rnd() * 8);
      const featCount = vintage ? 3 : 6 + Math.floor(rnd() * 6);
      const features = [...FEATURES].sort(() => rnd() - 0.5).slice(0, featCount);

      const title = `${year} ${brand} ${model} ${variant}`;
      const description = vintage
        ? `A charming ${year} ${brand} ${model} with ${km.toLocaleString('en-IN')} km on the odometer. A piece of Indian motoring history, kept in running condition, with original paperwork and a smooth ${fuel.toLowerCase()} engine. A real collector's piece.`
        : `Well-maintained ${title} in ${color.name}, driven ${km.toLocaleString('en-IN')} km and registered in ${loc.city} (${loc.rto}). ${owners === 1 ? 'Single owner' : owners + ' owners'}, regular service history, ${fuel.toLowerCase()} ${transmission.toLowerCase()}. Test drives welcome.`;

      cars.push({
        id: id++,
        brand, model, variant, year, price, km, fuel, transmission, owners,
        city: loc.city, state: loc.state, rto: loc.rto,
        color: color.name, colorHex: color.hex, bodyType: body, mileage,
        title, description, features, images: photo ? photo.files.map((f) => `/cars/${f}`) : [],
        seller: seller.name,
        sellerVerified: seller.verified,
        status: 'approved',
        createdAt: new Date(Date.UTC(2026, 9, 1 + Math.floor(rnd() * 50))).toISOString(),
      });
    }
  }
  return cars;
}

export const SELLER_NAMES = SELLERS;

export { MODEL_OPTIONS };
