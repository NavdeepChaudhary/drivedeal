import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Gauge, Info, ShieldCheck, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatPrice, formatRupees } from '../lib/format.js';
import { BRANDS, CITIES } from '../../../shared/cars.js';
import { MODEL_OPTIONS } from '../../../shared/catalog.js';
import { CONDITIONS, THIS_YEAR, estimatePrice } from '../../../shared/pricing.js';

const pct = (p) => `${p > 0 ? '+' : ''}${(p * 100).toFixed(p * 100 % 1 === 0 ? 0 : 1)}%`;

function yearsFor(info) {
  const to = Math.min(info.end ?? THIS_YEAR, THIS_YEAR);
  const from = Math.max(info.launch, 1950);
  return Array.from({ length: to - from + 1 }, (_, i) => to - i);
}

export default function AutoPrice() {
  const [params] = useSearchParams();
  const first = (k, d) => params.get(k) || d;
  const initBrand = BRANDS.includes(first('brand')) ? first('brand') : 'Tata';
  const initModels = MODEL_OPTIONS[initBrand];
  const initModel = initModels.find((m) => m.model === first('model')) || initModels.find((m) => m.model === 'Nexon') || initModels[0];

  const [brand, setBrand] = useState(initBrand);
  const [model, setModel] = useState(initModel.model);
  const info = MODEL_OPTIONS[brand].find((m) => m.model === model) || MODEL_OPTIONS[brand][0];
  const [variant, setVariant] = useState(info.variants.includes(first('variant')) ? first('variant') : info.variants[Math.min(1, info.variants.length - 1)]);
  const years = yearsFor(info);
  const [year, setYear] = useState(years.includes(Number(first('year'))) ? Number(first('year')) : years[Math.min(4, years.length - 1)]);
  const [km, setKm] = useState(Number(first('km')) || 40000);
  const [fuel, setFuel] = useState(info.fuels.includes(first('fuel')) ? first('fuel') : info.fuels[0]);
  const [transmission, setTransmission] = useState(info.transmissions.includes(first('transmission')) ? first('transmission') : info.transmissions[0]);
  const [owners, setOwners] = useState(Number(first('owners')) || 1);
  const [condition, setCondition] = useState('good');
  const [city, setCity] = useState(first('city', 'New Delhi'));
  const [market, setMarket] = useState(null);

  function changeBrand(b) {
    const m = MODEL_OPTIONS[b][0];
    setBrand(b); changeModel(m.model, b);
  }
  function changeModel(name, b = brand) {
    const m = MODEL_OPTIONS[b].find((x) => x.model === name);
    const ys = yearsFor(m);
    setModel(name);
    setVariant(m.variants[Math.min(1, m.variants.length - 1)]);
    setYear((y) => (ys.includes(y) ? y : ys[Math.min(4, ys.length - 1)]));
    setFuel((f) => (m.fuels.includes(f) ? f : m.fuels[0]));
    setTransmission((t) => (m.transmissions.includes(t) ? t : m.transmissions[0]));
  }

  const result = useMemo(
    () => estimatePrice({ brand, model, variant, year, km, fuel, transmission, owners, condition, city }),
    [brand, model, variant, year, km, fuel, transmission, owners, condition, city],
  );

  // what similar cars are listed for on DriveDeal right now
  useEffect(() => {
    let live = true;
    api.cars({ brand, q: model, limit: 60 })
      .then((r) => { if (live) setMarket(r.cars.filter((c) => c.model === model)); })
      .catch(() => live && setMarket([]));
    return () => { live = false; };
  }, [brand, model]);
  const stats = useMemo(() => {
    if (!market || !market.length) return null;
    const prices = market.map((c) => c.price);
    return { n: prices.length, min: Math.min(...prices), max: Math.max(...prices), avg: prices.reduce((a, b) => a + b, 0) / prices.length };
  }, [market]);

  const sellQuery = new URLSearchParams({ brand, model, variant, year, km, fuel, transmission, owners, city, price: result?.estimate ?? '' }).toString();
  const down = (result?.retainedPct ?? 0);
  const rangePos = result ? Math.min(Math.max(((result.estimate - result.low) / (result.high - result.low || 1)) * 100, 4), 96) : 50;

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8">
        <div className="eyebrow mb-3 flex items-center gap-2"><Sparkles size={13} /> AutoPrice</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">What is your car worth?</h1>
        <p className="mt-3 text-black/60 max-w-2xl">Pick your car and get a fair used-car price in seconds. Use it to set the right asking price, or to check a deal before you buy.</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
        <form className="card p-6 sm:p-7 grid sm:grid-cols-2 gap-4 content-start" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="eyebrow block mb-2" htmlFor="ap-brand">Brand</label>
            <select id="ap-brand" className="input" value={brand} onChange={(e) => changeBrand(e.target.value)}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select>
          </div>
          <div>
            <label className="eyebrow block mb-2" htmlFor="ap-model">Model</label>
            <select id="ap-model" className="input" value={model} onChange={(e) => changeModel(e.target.value)}>
              {MODEL_OPTIONS[brand].map((m) => <option key={m.model}>{m.model}</option>)}
            </select>
          </div>
          <div>
            <label className="eyebrow block mb-2" htmlFor="ap-variant">Variant</label>
            <select id="ap-variant" className="input" value={variant} onChange={(e) => setVariant(e.target.value)}>{info.variants.map((v) => <option key={v}>{v}</option>)}</select>
          </div>
          <div>
            <label className="eyebrow block mb-2" htmlFor="ap-year">Year</label>
            <select id="ap-year" className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>{years.map((y) => <option key={y}>{y}</option>)}</select>
          </div>
          <div>
            <label className="eyebrow block mb-2" htmlFor="ap-km">Kilometres driven</label>
            <input id="ap-km" type="number" min="0" step="500" className="input" value={km} onChange={(e) => setKm(Math.max(Number(e.target.value) || 0, 0))} />
          </div>
          <div>
            <label className="eyebrow block mb-2" htmlFor="ap-city">City</label>
            <select id="ap-city" className="input" value={city} onChange={(e) => setCity(e.target.value)}>{CITIES.map((c) => <option key={c.city}>{c.city}</option>)}</select>
          </div>
          <div>
            <div className="eyebrow mb-2">Fuel</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Fuel">
              {info.fuels.map((f) => <button type="button" key={f} aria-pressed={fuel === f} onClick={() => setFuel(f)} className={`chip ${fuel === f ? '!bg-ink !text-white' : ''}`}>{f}</button>)}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Transmission</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Transmission">
              {info.transmissions.map((t) => <button type="button" key={t} aria-pressed={transmission === t} onClick={() => setTransmission(t)} className={`chip ${transmission === t ? '!bg-ink !text-white' : ''}`}>{t}</button>)}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Owners so far</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Owners">
              {[1, 2, 3, 4].map((o) => <button type="button" key={o} aria-pressed={owners === o} onClick={() => setOwners(o)} className={`chip ${owners === o ? '!bg-ink !text-white' : ''}`}>{o === 4 ? '4+' : o}</button>)}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="eyebrow mb-2">Condition</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Condition">
              {CONDITIONS.map((c) => (
                <button type="button" key={c.id} aria-pressed={condition === c.id} onClick={() => setCondition(c.id)}
                  className={`rounded-2xl border px-3 py-2.5 text-left transition-colors ${condition === c.id ? 'border-ink bg-ink text-white' : 'border-black/10 hover:bg-mist'}`}>
                  <div className="font-semibold text-sm">{c.label}</div>
                  <div className={`text-[11px] leading-tight mt-0.5 ${condition === c.id ? 'text-white/70' : 'text-black/50'}`}>{c.note}</div>
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="space-y-5">
          {result && (
            <div className="rounded-[2rem] bg-gradient-to-br from-[#16171c] to-[#0a0a0d] text-white p-7 sm:p-8">
              <div className="eyebrow !text-white/50">Estimated fair price</div>
              <div className="text-5xl sm:text-6xl font-bold tracking-tight mt-2" aria-live="polite">{formatPrice(result.estimate)}</div>
              <div className="text-white/60 text-sm mt-1">{formatRupees(result.estimate)} · {year} {brand} {model} {variant}</div>

              <div className="mt-7">
                <div className="relative h-2 rounded-full bg-white/15">
                  <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-white/25 via-white to-white/25" />
                  <div className="absolute -top-1.5 size-5 rounded-full bg-accent border-2 border-white" style={{ left: `calc(${rangePos}% - 10px)` }} />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-2"><span>{formatPrice(result.low)}</span><span>Likely range</span><span>{formatPrice(result.high)}</span></div>
              </div>

              <dl className="mt-7 grid grid-cols-3 gap-4 text-sm">
                <div><dt className="text-white/50">Quick-sale price</dt><dd className="font-semibold mt-0.5">{formatPrice(result.quickSale)}</dd></div>
                <div><dt className="text-white/50">Of new price</dt><dd className="font-semibold mt-0.5">{down}%</dd></div>
                <div><dt className="text-white/50">Confidence</dt><dd className="font-semibold mt-0.5">{result.confidence}</dd></div>
              </dl>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to={`/sell?${sellQuery}`} className="btn btn-light">List my car at this price <ArrowRight size={16} /></Link>
                <Link to={`/browse?brand=${encodeURIComponent(brand)}&q=${encodeURIComponent(model)}`} className="btn border-white/30 text-white hover:bg-white/10">See similar cars</Link>
              </div>
            </div>
          )}

          {result && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg flex items-center gap-2"><Gauge size={18} /> How we got this price</h2>
              <ul className="mt-4 divide-y divide-black/5 text-sm">
                <li className="py-2.5 flex justify-between gap-3"><span>Original price (ex-showroom, {variant})</span><b>{formatPrice(result.newPrice)}</b></li>
                <li className="py-2.5 flex justify-between gap-3"><span>After {result.age} year{result.age === 1 ? '' : 's'} of depreciation</span><b>{formatPrice(result.baseValue)}</b></li>
                {result.factors.map((f) => (
                  <li key={f.label} className="py-2.5 flex justify-between gap-3">
                    <span>{f.label}<span className="block text-xs text-black/50">{f.note}</span></span>
                    <b className={`shrink-0 flex items-center gap-1 ${f.pct > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {f.pct > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{pct(f.pct)}
                    </b>
                  </li>
                ))}
                <li className="py-2.5 flex justify-between gap-3 font-semibold"><span>Fair price</span><span>{formatPrice(result.estimate)}</span></li>
              </ul>
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-semibold text-lg flex items-center gap-2"><ShieldCheck size={18} /> On DriveDeal right now</h2>
            {!market ? <div className="h-10 mt-3 rounded-xl bg-mist animate-pulse" /> : stats ? (
              <p className="mt-3 text-sm text-black/70">
                <b>{stats.n}</b> {model} {stats.n === 1 ? 'is' : 'are'} listed, from <b>{formatPrice(stats.min)}</b> to <b>{formatPrice(stats.max)}</b>, averaging <b>{formatPrice(stats.avg)}</b>.
              </p>
            ) : <p className="mt-3 text-sm text-black/60">No {model} listed yet. Be the first!</p>}
          </div>

          <details className="card p-6 text-sm text-black/70">
            <summary className="cursor-pointer font-semibold text-ink flex items-center gap-2"><Info size={16} className="inline" /> How AutoPrice works</summary>
            <p className="mt-3">AutoPrice starts from the car's original showroom price, applies a depreciation curve by age, then adjusts for kilometres driven, fuel, gearbox, number of owners, body type, city rules and condition. Every adjustment is shown above, so you can see exactly why you get the number.</p>
            <p className="mt-2">It is a market-style estimate, not an inspection or a guaranteed offer. Real prices also depend on the car's actual condition, service history and local demand.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
