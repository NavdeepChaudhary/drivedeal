// Shared seed data: used by the backend (to fill the database) and by the
// static GitHub Pages demo (as its built-in "database").
// Indian brands only: Tata, Mahindra, Maruti Suzuki, Force Motors, Hindustan Motors.

export const BRANDS = ['Tata', 'Mahindra', 'Maruti Suzuki', 'Force Motors', 'Hindustan Motors'];

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

// brand, model, body, [minLakh, maxLakh] new price, fuels, transmissions, variants, launch year
const MODELS = [
  ['Tata', 'Tiago', 'hatchback', [5, 8.5], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['XE', 'XT', 'XZ+'], 2016],
  ['Tata', 'Tigor', 'sedan', [6, 9.5], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['XM', 'XZ', 'XZ+'], 2017],
  ['Tata', 'Altroz', 'hatchback', [6.5, 11], ['Petrol', 'Diesel'], ['Manual', 'Automatic'], ['XM', 'XT', 'XZ+'], 2020],
  ['Tata', 'Punch', 'suv', [6, 10], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['Pure', 'Adventure', 'Accomplished'], 2021],
  ['Tata', 'Nexon', 'suv', [8, 15], ['Petrol', 'Diesel'], ['Manual', 'Automatic'], ['XM', 'XZ+', 'Fearless'], 2018],
  ['Tata', 'Nexon EV', 'suv', [14, 17], ['Electric'], ['Automatic'], ['Prime', 'Max', 'Empowered'], 2020],
  ['Tata', 'Harrier', 'suv', [15, 25], ['Diesel'], ['Manual', 'Automatic'], ['XT', 'XZ+', 'Fearless'], 2019],
  ['Tata', 'Safari', 'suv', [16, 27], ['Diesel'], ['Manual', 'Automatic'], ['XZ', 'XZA+', 'Adventure'], 2021],
  ['Tata', 'Tiago EV', 'hatchback', [8, 12], ['Electric'], ['Automatic'], ['XT', 'XZ+'], 2022],
  ['Mahindra', 'Thar', 'suv', [11.5, 17], ['Diesel', 'Petrol'], ['Manual', 'Automatic'], ['AX', 'LX', 'LX Hard Top'], 2020],
  ['Mahindra', 'Scorpio-N', 'suv', [13.5, 24], ['Diesel', 'Petrol'], ['Manual', 'Automatic'], ['Z2', 'Z4', 'Z8L'], 2022],
  ['Mahindra', 'Scorpio Classic', 'suv', [13, 17], ['Diesel'], ['Manual'], ['S', 'S11'], 2022],
  ['Mahindra', 'XUV700', 'suv', [14, 25], ['Diesel', 'Petrol'], ['Manual', 'Automatic'], ['MX', 'AX5', 'AX7 L'], 2021],
  ['Mahindra', 'XUV 3XO', 'suv', [7.5, 15], ['Petrol', 'Diesel'], ['Manual', 'Automatic'], ['MX1', 'MX3', 'AX5'], 2024],
  ['Mahindra', 'Bolero', 'suv', [9, 10.5], ['Diesel'], ['Manual'], ['B4', 'B6', 'B6 Opt'], 2012],
  ['Mahindra', 'XUV400 EV', 'suv', [15, 19], ['Electric'], ['Automatic'], ['EC', 'EL'], 2023],
  ['Mahindra', 'Marazzo', 'mpv', [12, 15], ['Diesel'], ['Manual'], ['M2', 'M4+', 'M6+'], 2018],
  ['Mahindra', 'BE 6', 'suv', [19, 27], ['Electric'], ['Automatic'], ['Pack One', 'Pack Two', 'Pack Three'], 2025],
  ['Maruti Suzuki', 'Alto K10', 'hatchback', [3.9, 5.9], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['Std', 'VXi', 'VXi+'], 2010],
  ['Maruti Suzuki', 'Swift', 'hatchback', [6, 9.5], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['LXi', 'VXi', 'ZXi+'], 2012],
  ['Maruti Suzuki', 'Baleno', 'hatchback', [6.7, 9.9], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['Sigma', 'Delta', 'Alpha'], 2015],
  ['Maruti Suzuki', 'Wagon R', 'hatchback', [5.5, 7.3], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['LXi', 'VXi', 'ZXi'], 2012],
  ['Maruti Suzuki', 'Dzire', 'sedan', [6.8, 9.8], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['LXi', 'VXi', 'ZXi+'], 2012],
  ['Maruti Suzuki', 'Brezza', 'suv', [8.3, 14], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['LXi', 'VXi', 'ZXi+'], 2016],
  ['Maruti Suzuki', 'Ertiga', 'mpv', [8.7, 13], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['LXi', 'VXi', 'ZXi+'], 2012],
  ['Maruti Suzuki', 'Fronx', 'suv', [7.5, 13], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['Sigma', 'Delta+', 'Alpha'], 2023],
  ['Maruti Suzuki', 'Grand Vitara', 'suv', [10.8, 20], ['Petrol', 'CNG'], ['Manual', 'Automatic'], ['Sigma', 'Zeta', 'Alpha'], 2022],
  ['Maruti Suzuki', 'Jimny', 'suv', [12.7, 15], ['Petrol'], ['Manual', 'Automatic'], ['Zeta', 'Alpha'], 2023],
  ['Maruti Suzuki', 'Ciaz', 'sedan', [9, 12], ['Petrol'], ['Manual', 'Automatic'], ['Sigma', 'Delta', 'Alpha'], 2014],
  ['Force Motors', 'Gurkha', 'suv', [15, 17], ['Diesel'], ['Manual'], ['4x4', 'Hard Top'], 2020],
  ['Force Motors', 'Trax Cruiser', 'mpv', [8, 9.5], ['Diesel'], ['Manual'], ['Deluxe', 'Standard'], 2012],
  ['Hindustan Motors', 'Ambassador', 'sedan', [1.5, 6], ['Petrol', 'Diesel'], ['Manual'], ['Classic', 'Grand', 'Avigo'], 1990],
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

  for (const [brand, model, body, [minL, maxL], fuels, trans, variants, launch] of MODELS) {
    const count = brand === 'Hindustan Motors' ? 2 : rnd() < 0.55 ? 2 : 1;
    for (let n = 0; n < count; n++) {
      const classic = brand === 'Hindustan Motors';
      const thisYear = 2026;
      const yearMin = classic ? 1995 : Math.max(launch, 2013);
      const yearMax = classic ? 2013 : thisYear - 1;
      const year = Math.floor(yearMin + rnd() * (yearMax - yearMin + 1));
      const age = Math.max(thisYear - year, 0);
      const fuel = pick(fuels);
      const transmission = pick(trans);
      const vi = Math.floor(rnd() * variants.length);
      const variant = variants[vi];
      const newLakh = minL + ((maxL - minL) * vi) / Math.max(variants.length - 1, 1);
      const km = classic
        ? Math.round((40000 + rnd() * 90000) / 500) * 500
        : Math.round((age * (7000 + rnd() * 9000) + 1500) / 500) * 500;
      let price = classic
        ? (1.2 + rnd() * 3.5) * 100000
        : newLakh * 100000 * Math.pow(0.9, age) * (1 - Math.min(km / 400000, 0.2));
      price = Math.max(Math.round(price / 5000) * 5000, 50000);
      const loc = pick(CITIES);
      const color = pick(COLORS);
      const seller = pick(SELLERS);
      const owners = classic ? 1 + Math.floor(rnd() * 3) : 1 + (rnd() < 0.25 ? 1 : 0) + (rnd() < 0.06 ? 1 : 0);
      const mileage =
        fuel === 'Electric' ? Math.round(240 + rnd() * 200)
        : fuel === 'CNG' ? Math.round(24 + rnd() * 9)
        : fuel === 'Diesel' ? Math.round(14 + rnd() * 6)
        : Math.round(14 + rnd() * 8);
      const featCount = classic ? 3 : 6 + Math.floor(rnd() * 6);
      const features = [...FEATURES].sort(() => rnd() - 0.5).slice(0, featCount);

      const title = `${year} ${brand} ${model} ${variant}`;
      const description = classic
        ? `A charming ${year} Hindustan Ambassador with ${km.toLocaleString('en-IN')} km on the odometer. The icon of Indian roads, kept in running condition, with original paperwork and a smooth ${fuel.toLowerCase()} engine. A real collector's piece.`
        : `Well-maintained ${title} in ${color.name}, driven ${km.toLocaleString('en-IN')} km and registered in ${loc.city} (${loc.rto}). ${owners === 1 ? 'Single owner' : owners + ' owners'}, regular service history, ${fuel.toLowerCase()} ${transmission.toLowerCase()}. Test drives welcome.`;

      cars.push({
        id: id++,
        brand, model, variant, year, price, km, fuel, transmission, owners,
        city: loc.city, state: loc.state, rto: loc.rto,
        color: color.name, colorHex: color.hex, bodyType: body, mileage,
        title, description, features, images: [],
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

// Brand -> list of models (used by the "Sell your car" form)
export const MODEL_OPTIONS = MODELS.reduce((acc, m) => {
  (acc[m[0]] ||= []).push({ model: m[1], bodyType: m[2], fuels: m[4], transmissions: m[5], variants: m[6] });
  return acc;
}, {});
