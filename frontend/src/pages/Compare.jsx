import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';
import { CarImage } from '../components/CarCard.jsx';
import { formatKm, formatPrice, ordinalOwner } from '../lib/format.js';

const ROWS = [
  ['Price', (c) => formatPrice(c.price)],
  ['Year', (c) => c.year],
  ['Kilometres', (c) => formatKm(c.km)],
  ['Fuel', (c) => c.fuel],
  ['Transmission', (c) => c.transmission],
  ['Owners', (c) => ordinalOwner(c.owners)],
  ['Body type', (c) => c.bodyType],
  ['Mileage / range', (c) => (c.mileage ? `${c.mileage} ${c.fuel === 'Electric' ? 'km' : c.fuel === 'CNG' ? 'km/kg' : 'km/l'}` : '-')],
  ['City', (c) => c.city],
  ['Seller', (c) => (c.sellerVerified ? `${c.seller} ✓` : c.seller)],
];

export default function Compare() {
  const { compare, toggleCompare, clearCompare } = useStore();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = compare.join(',');

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all(compare.map((id) => api.car(id).then((r) => r.car).catch(() => null)))
      .then((list) => live && setCars(list.filter(Boolean)))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line
  }, [key]);

  const best = (label, fn) => {
    if (cars.length < 2) return null;
    const vals = cars.map((c) => c[fn]);
    return label === 'Price' || label === 'Kilometres' ? Math.min(...vals) : null;
  };

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-3">Side by side</div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Compare cars</h1>
        </div>
        {compare.length > 0 && <button className="btn btn-ghost" onClick={clearCompare}>Clear all</button>}
      </div>

      {compare.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-2xl font-semibold">Nothing to compare yet</div>
          <p className="text-black/60 mt-2">Tap “Compare” on up to 3 cars to see them here.</p>
          <Link to="/browse" className="btn btn-dark mt-6">Browse cars</Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
            <caption className="sr-only">Car comparison</caption>
            <thead>
              <tr>
                <th className="w-40" />
                {loading ? <th className="p-4 text-black/40 font-normal">Loading…</th> : cars.map((c) => (
                  <th key={c.id} className="p-3 align-top font-normal">
                    <div className="card overflow-hidden relative">
                      <button onClick={() => toggleCompare(c.id)} aria-label={`Remove ${c.title}`} className="absolute top-2 right-2 z-10 size-7 rounded-full bg-white/90 grid place-items-center shadow"><X size={14} /></button>
                      <Link to={`/cars/${c.id}`}><CarImage car={c} className="w-full aspect-[16/10]" /></Link>
                      <Link to={`/cars/${c.id}`} className="block p-3 font-semibold leading-snug">{c.title}</Link>
                    </div>
                  </th>
                ))}
                {!loading && cars.length < 3 && (
                  <th className="p-3 align-top font-normal">
                    <Link to="/browse" className="rounded-3xl border-2 border-dashed border-black/15 h-full min-h-[200px] grid place-items-center text-black/50 hover:bg-mist">
                      <span className="flex flex-col items-center gap-2"><Plus /> Add a car</span>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, fn]) => (
                <tr key={label}>
                  <th scope="row" className="eyebrow py-4 pr-4 border-t border-black/5 font-medium">{label}</th>
                  {cars.map((c) => {
                    const isBest = (label === 'Price' && c.price === best('Price', 'price')) || (label === 'Kilometres' && c.km === best('Kilometres', 'km'));
                    return <td key={c.id} className={`py-4 px-3 border-t border-black/5 capitalize ${isBest ? 'font-bold text-emerald-700' : 'font-medium'}`}>{fn(c)}{isBest && <span className="ml-2 text-[10px] uppercase tracking-wider">best</span>}</td>;
                  })}
                  {cars.length < 3 && <td className="border-t border-black/5" />}
                </tr>
              ))}
              <tr>
                <th scope="row" className="eyebrow py-4 pr-4 border-t border-black/5 align-top font-medium">Features</th>
                {cars.map((c) => (
                  <td key={c.id} className="py-4 px-3 border-t border-black/5 text-sm align-top">
                    <ul className="space-y-1">{c.features.slice(0, 8).map((f) => <li key={f}>• {f}</li>)}</ul>
                  </td>
                ))}
                {cars.length < 3 && <td className="border-t border-black/5" />}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
