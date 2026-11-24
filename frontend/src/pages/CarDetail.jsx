import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Calendar, Check, Fuel, Gauge, GitCompare, Heart, MapPin, MessageCircle, Settings2, Sparkles, Users, Hash } from 'lucide-react';
import { api, imgUrl, DEMO } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';
import { formatKm, formatPrice, formatRupees, ordinalOwner } from '../lib/format.js';
import { CarImage } from '../components/CarCard.jsx';
import { PHOTOS } from '../../../shared/photos.js';
import { dealRating, estimatePrice } from '../../../shared/pricing.js';

// Credit line for the bundled sample photos (seller uploads have none).
function PhotoCredit({ car, index }) {
  const meta = PHOTOS[`${car.brand} ${car.model}`];
  const cur = car.images[index];
  if (!meta || !cur?.startsWith('/cars/')) return null;
  const cr = meta.credits[meta.files.indexOf(cur.replace('/cars/', ''))];
  return (
    <p className="mt-3 text-xs text-black/50">
      {meta.representative && 'Representative photo of a similar vehicle. '}
      {cr && <>Photo: <a href={cr.page} target="_blank" rel="noreferrer" className="underline">{cr.author}</a> · <a href={cr.licenseUrl} target="_blank" rel="noreferrer" className="underline">{cr.license}</a></>}
    </p>
  );
}

function emi(price) {
  const P = price * 0.8, r = 0.095 / 12, n = 60;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function CarDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, wish, toggleWish, compare, toggleCompare, notify } = useStore();
  const [car, setCar] = useState(null);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(0);
  const [msg, setMsg] = useState('Hi, is this car still available?');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCar(null); setError(''); setPhoto(0);
    api.car(id).then((r) => setCar(r.car)).catch((e) => setError(e.message));
  }, [id]);

  if (error) return (
    <div className="px-5 sm:px-10 py-24 text-center">
      <h1 className="text-4xl font-bold">{error}</h1>
      <Link to="/browse" className="btn btn-dark mt-6">Back to all cars</Link>
    </div>
  );
  if (!car) return <div className="px-5 sm:px-10 py-10"><div className="h-[480px] rounded-[2rem] bg-mist animate-pulse" /></div>;

  // AutoPrice check (skipped when we can't be confident, e.g. collectable classics)
  const est = estimatePrice({ brand: car.brand, model: car.model, variant: car.variant, year: car.year, km: car.km, fuel: car.fuel, transmission: car.transmission, owners: car.owners, city: car.city });
  const check = est && est.confidence !== 'Low' ? { est, rating: dealRating(car.price, est.estimate) } : null;
  const saved = wish.includes(car.id);
  const comparing = compare.includes(car.id);
  const isOwner = user && user.id === car.sellerId;
  const specs = [
    [Calendar, 'Year', car.year], [Gauge, 'Driven', formatKm(car.km)], [Fuel, 'Fuel', car.fuel],
    [Settings2, 'Transmission', car.transmission], [Users, 'Owners', ordinalOwner(car.owners)],
    [Hash, 'RTO', car.rto || '-'], [MapPin, 'Location', `${car.city}${car.state ? ', ' + car.state : ''}`],
    [Fuel, car.fuel === 'Electric' ? 'Range' : 'Mileage', car.mileage ? `${car.mileage} ${car.fuel === 'Electric' ? 'km' : car.fuel === 'CNG' ? 'km/kg' : 'km/l'}` : '-'],
  ];

  async function contact(e) {
    e.preventDefault();
    if (DEMO) return notify('Chat is available in the full version', 'err');
    if (!user) return nav('/login', { state: { from: `/cars/${car.id}` } });
    setSending(true);
    try {
      await api.send(car.id, msg);
      nav(`/messages/${car.id}/${user.id}`);
    } catch (err) { notify(err.message, 'err'); } finally { setSending(false); }
  }

  return (
    <div className="px-5 sm:px-10 pb-16">
      <nav className="text-sm text-black/50 pb-5" aria-label="Breadcrumb">
        <Link to="/browse" className="hover:text-ink">Cars</Link> / <Link to={`/browse?brand=${encodeURIComponent(car.brand)}`} className="hover:text-ink">{car.brand}</Link> / <span className="text-ink">{car.model}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div>
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#f7f7f9] to-[#e3e6eb]">
            <CarImage car={{ ...car, images: car.images.slice(photo) }} className="w-full aspect-[16/10]" />
          </div>
          <PhotoCredit car={car} index={photo} />
          {car.images.length > 1 && (
            <div className="flex gap-3 mt-3 overflow-x-auto">
              {car.images.map((im, i) => (
                <button key={im} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} className={`shrink-0 rounded-xl overflow-hidden border-2 ${photo === i ? 'border-ink' : 'border-transparent'}`}>
                  <img src={imgUrl(im)} alt="" className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold">Specifications</h2>
            <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {specs.map(([Icon, k, v]) => (
                <div key={k} className="card p-4">
                  <Icon size={18} className="text-black/40" />
                  <dt className="eyebrow mt-3">{k}</dt>
                  <dd className="font-semibold mt-1">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {car.features.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold">Features</h2>
              <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {car.features.map((f) => <li key={f} className="flex items-center gap-2"><Check size={16} className="text-emerald-600 shrink-0" /> {f}</li>)}
              </ul>
            </div>
          )}

          {car.description && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold">About this car</h2>
              <p className="mt-4 text-black/70 leading-relaxed whitespace-pre-line">{car.description}</p>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 self-start space-y-4">
          <div className="card p-6">
            {car.status !== 'approved' && <div className="chip !bg-amber-100 !text-amber-800 mb-3">Status: {car.status}</div>}
            <h1 className="text-2xl font-bold leading-tight">{car.title}</h1>
            <div className="mt-4 text-4xl font-bold tracking-tight">{formatPrice(car.price)}</div>
            <div className="text-sm text-black/50 mt-1">{formatRupees(car.price)}</div>
            {check && (
              <div className={`mt-4 rounded-2xl p-3 text-sm flex items-start gap-2.5 ${check.rating.id === 'great' ? 'bg-emerald-50 text-emerald-900' : check.rating.id === 'high' ? 'bg-amber-50 text-amber-900' : 'bg-mist'}`}>
                <Sparkles size={16} className="mt-0.5 shrink-0" />
                <div>
                  <b>{check.rating.label}</b>
                  <span className="block text-xs opacity-80 mt-0.5">
                    AutoPrice estimates {formatPrice(check.est.estimate)}{' '}
                    ({check.rating.id === 'fair' ? 'within 8% of this price' : `${Math.abs(Math.round(check.rating.pct * 100))}% ${check.rating.pct < 0 ? 'below' : 'above'}`}).{' '}
                    <Link to={`/autoprice?${new URLSearchParams({ brand: car.brand, model: car.model, variant: car.variant || '', year: car.year, km: car.km, fuel: car.fuel, transmission: car.transmission, owners: car.owners, city: car.city })}`} className="underline">See why</Link>
                  </span>
                </div>
              </div>
            )}
            <div className="mt-4 p-3 rounded-2xl bg-mist text-sm">
              EMI from <b>{formatRupees(emi(car.price))}</b>/month <span className="text-black/50">(20% down, 5 yrs, 9.5%)</span>
              <Link to={`/emi?price=${car.price}`} className="block mt-1 underline font-medium">Customise EMI</Link>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => toggleWish(car.id)} aria-pressed={saved} className="btn btn-ghost flex-1 !px-3"><Heart size={16} className={saved ? 'fill-red-500 text-red-500' : ''} /> {saved ? 'Saved' : 'Save'}</button>
              <button onClick={() => toggleCompare(car.id)} aria-pressed={comparing} className={`btn flex-1 !px-3 ${comparing ? 'btn-dark' : 'btn-ghost'}`}><GitCompare size={16} /> {comparing ? 'In compare' : 'Compare'}</button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-11 rounded-full bg-ink text-white font-semibold">{car.seller?.[0]}</span>
              <div>
                <div className="font-semibold">{car.seller}</div>
                {car.sellerVerified
                  ? <div className="text-sm text-emerald-700 flex items-center gap-1"><BadgeCheck size={14} /> Verified seller</div>
                  : <div className="text-sm text-black/50">Individual seller</div>}
              </div>
            </div>
            {isOwner ? (
              <p className="mt-4 text-sm text-black/60">This is your listing. Manage it from your <Link to="/dashboard" className="underline">dashboard</Link>.</p>
            ) : (
              <form onSubmit={contact} className="mt-5">
                <label htmlFor="msg" className="eyebrow block mb-2">Message the seller</label>
                <textarea id="msg" rows={3} className="input resize-none" value={msg} onChange={(e) => setMsg(e.target.value)} required maxLength={1000} />
                <button className="btn btn-dark w-full mt-3" disabled={sending}><MessageCircle size={16} /> {sending ? 'Sending…' : 'Chat with seller'}</button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
