import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ImagePlus, Info, Sparkles, X } from 'lucide-react';
import { api, DEMO } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';
import CarArt from '../components/CarArt.jsx';
import { formatPrice } from '../lib/format.js';
import { BRANDS, CITIES, COLORS, FUELS, MODEL_OPTIONS, TRANSMISSIONS } from '../../../shared/cars.js';
import { estimatePrice } from '../../../shared/pricing.js';

const FEATURES = ['ABS with EBD', 'Dual airbags', 'Touchscreen infotainment', 'Reverse camera', 'Alloy wheels', 'Automatic climate control', 'Sunroof', 'Cruise control', 'Keyless entry', 'Leather seats', 'Rear parking sensors', 'Android Auto & Apple CarPlay'];

export default function Sell() {
  const { user, ready, notify } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  // the AutoPrice page can send people here with their car already filled in
  const [f, setF] = useState(() => {
    const q = (k, d) => params.get(k) || d;
    const brand = BRANDS.includes(q('brand')) ? q('brand') : '';
    const m = (MODEL_OPTIONS[brand] || []).find((x) => x.model === q('model'));
    return {
      brand, model: m ? m.model : '', variant: m ? q('variant', '') : '', year: Number(q('year', 2020)) || 2020,
      price: q('price', ''), km: q('km', ''), fuel: m && m.fuels.includes(q('fuel')) ? q('fuel') : m ? m.fuels[0] : 'Petrol',
      transmission: m && m.transmissions.includes(q('transmission')) ? q('transmission') : m ? m.transmissions[0] : 'Manual',
      owners: Number(q('owners', 1)) || 1, city: CITIES.some((c) => c.city === q('city')) ? q('city') : '',
      color: COLORS[0].name, bodyType: m ? m.bodyType : 'hatchback', description: '', features: [],
    };
  });
  const suggestion = useMemo(() => {
    if (!f.brand || !f.model || f.km === '' || Number(f.km) < 0) return null;
    return estimatePrice({ ...f, condition: 'good' });
  }, [f]);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const models = MODEL_OPTIONS[f.brand] || [];
  const color = COLORS.find((c) => c.name === f.color) || COLORS[0];
  const previews = useMemo(() => files.map((x) => URL.createObjectURL(x)), [files]);

  if (!DEMO && ready && !user) {
    return (
      <div className="px-5 sm:px-10 py-24 text-center">
        <div className="eyebrow mb-3">Sell your car</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Log in to list your car</h1>
        <p className="mt-4 text-black/60">It's free and takes a minute.</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/login" state={{ from: `/sell${params.toString() ? `?${params}` : ''}` }} className="btn btn-dark">Log in</Link>
          <Link to="/signup" state={{ from: `/sell${params.toString() ? `?${params}` : ''}` }} className="btn btn-ghost">Create account</Link>
        </div>
      </div>
    );
  }

  function pickModel(name) {
    const m = models.find((x) => x.model === name);
    setF((s) => ({ ...s, model: name, ...(m ? { bodyType: m.bodyType, fuel: m.fuels[0], transmission: m.transmissions[0] } : {}) }));
  }
  function addFiles(list) {
    const ok = [...list].filter((x) => ['image/jpeg', 'image/png', 'image/webp'].includes(x.type) && x.size <= 5 * 1024 * 1024);
    if (ok.length < list.length) notify('Only JPG, PNG or WebP photos under 5 MB are accepted', 'err');
    setFiles((cur) => [...cur, ...ok].slice(0, 6));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      Object.entries({ ...f, colorHex: color.hex, state: CITIES.find((c) => c.city === f.city)?.state || '', rto: CITIES.find((c) => c.city === f.city)?.rto || '' })
        .forEach(([k, v]) => fd.append(k, k === 'features' ? JSON.stringify(v) : v));
      files.forEach((x) => fd.append('photos', x));
      const { car } = await api.createCar(fd);
      notify(car.status === 'approved' ? 'Your car is live!' : 'Submitted! It will go live once an admin approves it.');
      nav('/dashboard');
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8">
        <div className="eyebrow mb-3">Sell your car</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">List it in minutes</h1>
        <p className="mt-3 text-black/60 max-w-xl">Listing is free. An admin reviews every listing before it goes live, to keep DriveDeal trustworthy.</p>
      </div>
      {DEMO && <div className="mb-6 p-4 rounded-2xl bg-mist text-sm flex gap-3"><Info className="shrink-0" size={18} />Selling is available in the full version. You can explore the form here.</div>}

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-8">
          <fieldset className="card p-6 grid sm:grid-cols-2 gap-4">
            <legend className="sr-only">Car details</legend>
            <div><label className="eyebrow block mb-2" htmlFor="brand">Brand</label>
              <select id="brand" required className="input" value={f.brand} onChange={(e) => setF((s) => ({ ...s, brand: e.target.value, model: '' }))}>
                <option value="">Select brand</option>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select></div>
            <div><label className="eyebrow block mb-2" htmlFor="model">Model</label>
              <input id="model" required className="input" list="models" value={f.model} onChange={(e) => pickModel(e.target.value)} placeholder="e.g. Nexon" />
              <datalist id="models">{models.map((m) => <option key={m.model} value={m.model} />)}</datalist></div>
            <div><label className="eyebrow block mb-2" htmlFor="variant">Variant</label>
              <input id="variant" className="input" value={f.variant} onChange={(e) => set('variant', e.target.value)} placeholder="e.g. XZ+" /></div>
            <div><label className="eyebrow block mb-2" htmlFor="year">Year</label>
              <select id="year" className="input" value={f.year} onChange={(e) => set('year', e.target.value)}>
                {Array.from({ length: 70 }, (_, i) => 2026 - i).map((y) => <option key={y}>{y}</option>)}</select></div>
            <div><label className="eyebrow block mb-2" htmlFor="price">Asking price (₹)</label>
              <input id="price" required type="number" min="10000" className="input" value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 650000" /></div>
            <div><label className="eyebrow block mb-2" htmlFor="km">Kilometres driven</label>
              <input id="km" required type="number" min="0" className="input" value={f.km} onChange={(e) => set('km', e.target.value)} /></div>
            <div><label className="eyebrow block mb-2" htmlFor="fuel">Fuel</label>
              <select id="fuel" className="input" value={f.fuel} onChange={(e) => set('fuel', e.target.value)}>{FUELS.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="eyebrow block mb-2" htmlFor="tr">Transmission</label>
              <select id="tr" className="input" value={f.transmission} onChange={(e) => set('transmission', e.target.value)}>{TRANSMISSIONS.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="eyebrow block mb-2" htmlFor="owners">Owners</label>
              <select id="owners" className="input" value={f.owners} onChange={(e) => set('owners', e.target.value)}>{[1, 2, 3, 4].map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="eyebrow block mb-2" htmlFor="city">City</label>
              <select id="city" required className="input" value={f.city} onChange={(e) => set('city', e.target.value)}>
                <option value="">Select city</option>{CITIES.map((c) => <option key={c.city}>{c.city}</option>)}</select></div>
            <div className="sm:col-span-2"><div className="eyebrow mb-2">Colour</div>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Colour">
                {COLORS.map((c) => (
                  <button type="button" key={c.name} onClick={() => set('color', c.name)} aria-pressed={f.color === c.name} aria-label={c.name}
                    className={`size-9 rounded-full border border-black/15 ${f.color === c.name ? 'ring-2 ring-offset-2 ring-ink' : ''}`} style={{ background: c.hex }} />
                ))}
              </div></div>
          </fieldset>

          <fieldset className="card p-6">
            <legend className="eyebrow px-1">Features</legend>
            <div className="flex flex-wrap gap-2 mt-2">
              {FEATURES.map((x) => {
                const on = f.features.includes(x);
                return <button type="button" key={x} aria-pressed={on} onClick={() => set('features', on ? f.features.filter((y) => y !== x) : [...f.features, x])} className={`chip ${on ? '!bg-ink !text-white' : ''}`}>{x}</button>;
              })}
            </div>
          </fieldset>

          <div className="card p-6">
            <label className="eyebrow block mb-2" htmlFor="desc">Description</label>
            <textarea id="desc" rows={5} maxLength={2000} className="input resize-none" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Service history, condition, why you're selling…" />
            <div className="eyebrow mt-6 mb-2">Photos (up to 6)</div>
            <div className="flex flex-wrap gap-3">
              {previews.map((p, i) => (
                <div key={p} className="relative">
                  <img src={p} alt={`Upload ${i + 1}`} className="h-24 w-32 object-cover rounded-xl" />
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove photo" className="absolute -top-2 -right-2 size-6 rounded-full bg-ink text-white grid place-items-center"><X size={13} /></button>
                </div>
              ))}
              {files.length < 6 && (
                <label className="h-24 w-32 rounded-xl border-2 border-dashed border-black/20 grid place-items-center cursor-pointer hover:bg-mist text-black/50 text-sm">
                  <span className="flex flex-col items-center gap-1"><ImagePlus size={20} /> Add photo</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                </label>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 self-start space-y-4">
          <div className="card p-5">
            <div className="eyebrow mb-2">Preview</div>
            <div className="rounded-2xl bg-gradient-to-b from-[#f4f5f7] to-[#e6e8ec] grid place-items-center py-4">
              {previews[0] ? <img src={previews[0]} alt="" className="w-full aspect-[16/10] object-cover rounded-2xl" /> : <CarArt type={f.bodyType} color={color.hex} className="w-[85%]" />}
            </div>
            <div className="mt-3 font-semibold">{f.year} {f.brand} {f.model} {f.variant}</div>
            <div className="text-sm text-black/50">{f.fuel} · {f.transmission}{f.city ? ` · ${f.city}` : ''}</div>
          </div>
          {suggestion && (
            <div className="card p-5">
              <div className="eyebrow mb-2 flex items-center gap-1.5"><Sparkles size={13} /> AutoPrice</div>
              <div className="text-2xl font-bold tracking-tight">{formatPrice(suggestion.low)} – {formatPrice(suggestion.high)}</div>
              <p className="text-sm text-black/60 mt-1">Fair price for a car in good condition: <b>{formatPrice(suggestion.estimate)}</b>. Confidence: {suggestion.confidence}.</p>
              <button type="button" className="btn btn-ghost w-full mt-3 !py-2" onClick={() => set('price', suggestion.estimate)}>Use {formatPrice(suggestion.estimate)} as my price</button>
              <Link to={`/autoprice?${new URLSearchParams({ brand: f.brand, model: f.model, variant: f.variant, year: f.year, km: f.km, fuel: f.fuel, transmission: f.transmission, owners: f.owners, city: f.city })}`} className="block text-center text-sm underline mt-3">See how this was worked out</Link>
            </div>
          )}
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <button className="btn btn-dark w-full" disabled={busy || DEMO}>{busy ? 'Submitting…' : 'Submit listing'}</button>
        </aside>
      </form>
    </div>
  );
}
