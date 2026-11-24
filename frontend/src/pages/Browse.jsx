import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import CarCard from '../components/CarCard.jsx';
import { api } from '../lib/api.js';
import { BRANDS, FUELS, TRANSMISSIONS, BODY_TYPES } from '../../../shared/cars.js';

const LIST_KEYS = ['brand', 'fuel', 'transmission', 'city', 'bodyType'];
const BUDGETS = [
  ['', 'Any budget'], ['0-300000', 'Under ₹3 Lakh'], ['300000-600000', '₹3 – 6 Lakh'],
  ['600000-1000000', '₹6 – 10 Lakh'], ['1000000-2000000', '₹10 – 20 Lakh'], ['2000000-', 'Above ₹20 Lakh'],
];

function Check({ name, options, params, toggle }) {
  const active = params.get(name)?.split(',').filter(Boolean) || [];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={active.includes(o)} onClick={() => toggle(name, o)}
          className={`chip capitalize ${active.includes(o) ? '!bg-ink !text-white' : ''}`}>{o}</button>
      ))}
    </div>
  );
}

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const key = params.toString();

  useEffect(() => { api.meta().then((m) => setCities(m.cities)).catch(() => {}); }, []);
  useEffect(() => {
    let live = true;
    setData(null); setError('');
    const p = Object.fromEntries(params.entries());
    api.cars({ ...p, limit: 9 }).then((r) => live && setData(r)).catch((e) => live && setError(e.message));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = (k, v) => {
    const n = new URLSearchParams(params);
    v ? n.set(k, v) : n.delete(k);
    if (k !== 'page') n.delete('page');
    setParams(n, { replace: true });
  };
  const toggle = (k, v) => {
    const cur = params.get(k)?.split(',').filter(Boolean) || [];
    set(k, (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(','));
  };
  const budget = `${params.get('minPrice') || ''}-${params.get('maxPrice') || ''}`;
  const setBudget = (v) => {
    const [a, b] = v.split('-');
    const n = new URLSearchParams(params);
    a ? n.set('minPrice', a) : n.delete('minPrice');
    b ? n.set('maxPrice', b) : n.delete('maxPrice');
    n.delete('page');
    setParams(n, { replace: true });
  };

  const activeCount = useMemo(() => [...params.keys()].filter((k) => k !== 'sort' && k !== 'page').length, [params]);
  const page = Number(params.get('page')) || 1;

  const Filters = (
    <div className="space-y-7">
      <div>
        <label className="eyebrow block mb-2" htmlFor="q">Search</label>
        <input id="q" className="input" placeholder="Model, city…" defaultValue={params.get('q') || ''} key={params.get('q')}
          onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} onBlur={(e) => e.target.value !== (params.get('q') || '') && set('q', e.target.value)} />
      </div>
      <div><div className="eyebrow mb-2">Brand</div><Check name="brand" options={BRANDS} params={params} toggle={toggle} /></div>
      <div>
        <label className="eyebrow block mb-2" htmlFor="budget">Budget</label>
        <select id="budget" className="input" value={BUDGETS.some(([v]) => v === budget) ? budget : ''} onChange={(e) => setBudget(e.target.value)}>
          {BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div><div className="eyebrow mb-2">Fuel</div><Check name="fuel" options={FUELS} params={params} toggle={toggle} /></div>
      <div><div className="eyebrow mb-2">Transmission</div><Check name="transmission" options={TRANSMISSIONS} params={params} toggle={toggle} /></div>
      <div><div className="eyebrow mb-2">Body type</div><Check name="bodyType" options={BODY_TYPES} params={params} toggle={toggle} /></div>
      <div>
        <label className="eyebrow block mb-2" htmlFor="city">City</label>
        <select id="city" className="input" value={params.get('city') || ''} onChange={(e) => set('city', e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="eyebrow block mb-2" htmlFor="year">Year (from)</label>
        <select id="year" className="input" value={params.get('minYear') || ''} onChange={(e) => set('minYear', e.target.value)}>
          <option value="">Any year</option>
          {Array.from({ length: 14 }, (_, i) => 2026 - i).map((y) => <option key={y} value={y}>{y} or newer</option>)}
        </select>
      </div>
      <div>
        <label className="eyebrow block mb-2" htmlFor="km">Max km driven</label>
        <select id="km" className="input" value={params.get('maxKm') || ''} onChange={(e) => set('maxKm', e.target.value)}>
          <option value="">Any</option>
          {[20000, 40000, 60000, 80000, 100000].map((k) => <option key={k} value={k}>Under {k.toLocaleString('en-IN')} km</option>)}
        </select>
      </div>
      {activeCount > 0 && (
        <button className="btn btn-ghost w-full" onClick={() => setParams({}, { replace: true })}><X size={15} /> Clear all filters</button>
      )}
    </div>
  );

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8">
        <div className="eyebrow mb-3">Used cars in India</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Find your car</h1>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden lg:block">{Filters}</aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="text-black/60 text-sm" aria-live="polite">{data ? `${data.total} car${data.total === 1 ? '' : 's'} found` : 'Loading…'}</div>
            <div className="flex gap-2">
              <button className="btn btn-ghost !py-2 lg:hidden" onClick={() => setShowFilters(true)}>
                <SlidersHorizontal size={16} /> Filters{activeCount ? ` (${activeCount})` : ''}
              </button>
              <select aria-label="Sort by" className="input !w-auto !py-2" value={params.get('sort') || 'newest'} onChange={(e) => set('sort', e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="km-asc">Fewest km</option>
                <option value="year-desc">Newest model year</option>
              </select>
            </div>
          </div>

          {error && <div className="card p-6 text-red-600">{error}</div>}
          {data && data.cars.length === 0 && (
            <div className="card p-10 text-center">
              <div className="text-xl font-semibold">No cars match these filters</div>
              <p className="text-black/60 mt-2">Try removing a filter or widening your budget.</p>
              <button className="btn btn-dark mt-5" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {!data && !error && Array.from({ length: 6 }, (_, i) => <div key={i} className="card h-80 animate-pulse bg-mist" />)}
            {data?.cars.map((c) => <CarCard key={c.id} car={c} />)}
          </div>

          {data && data.pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <button className="btn btn-ghost !py-2" disabled={page <= 1} onClick={() => set('page', page - 1)}>Previous</button>
              <span className="text-sm text-black/60 px-3">Page {page} of {data.pages}</span>
              <button className="btn btn-ghost !py-2" disabled={page >= data.pages} onClick={() => set('page', page + 1)}>Next</button>
            </nav>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)} aria-label="Close filters"><X /></button>
            </div>
            {Filters}
            <button className="btn btn-dark w-full mt-8" onClick={() => setShowFilters(false)}>Show {data?.total ?? ''} cars</button>
          </div>
        </div>
      )}
    </div>
  );
}
