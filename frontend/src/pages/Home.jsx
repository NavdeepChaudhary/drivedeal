import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, GitCompare, MessageCircle, Search, ShieldCheck, Calculator, Camera, Handshake } from 'lucide-react';
import { Section, More } from '../components/Layout.jsx';
import CarCard from '../components/CarCard.jsx';
import CarArt from '../components/CarArt.jsx';
import { api } from '../lib/api.js';
import { COLORS } from '../../../shared/cars.js';

const Car3D = lazy(() => import('../components/Car3D.jsx'));

const BODY = ['hatchback', 'sedan', 'suv', 'mpv'];
const BRAND_NOTE = {
  Tata: 'Nexon, Punch, Harrier',
  Mahindra: 'Thar, XUV700, Scorpio',
  'Maruti Suzuki': 'Swift, Brezza, Ertiga',
  'Force Motors': 'Gurkha, Trax',
  'Hindustan Motors': 'Ambassador classics',
};

function Hero() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [body, setBody] = useState('suv');
  const [color, setColor] = useState(COLORS[2]);
  return (
    <div className="grid lg:grid-cols-2 gap-6 px-5 sm:px-10 pt-6 pb-14 items-center">
      <div className="order-2 lg:order-1 min-w-0">
        <div className="eyebrow mb-4">India's used car marketplace</div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.02]">
          Buy &amp; sell cars the <span className="text-accent">easy</span> way
        </h1>
        <p className="mt-6 text-lg text-black/65 max-w-lg">
          Tata, Mahindra, Maruti Suzuki and more. Find a trusted used car, or list yours and talk to real buyers in minutes.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); nav(`/browse?q=${encodeURIComponent(q)}`); }}
          className="mt-8 flex items-center gap-2 bg-mist rounded-full p-1.5 max-w-lg"
          role="search"
        >
          <Search size={18} className="ml-4 text-black/40 shrink-0" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Try “Nexon”, “Swift” or a city…"
            className="flex-1 bg-transparent outline-none py-2.5 px-1 min-w-0"
            aria-label="Search cars"
          />
          <button className="btn btn-dark !py-2.5">Search</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/browse" className="btn btn-dark">Browse cars <ArrowRight size={16} /></Link>
          <Link to="/sell" className="btn btn-ghost">Sell your car</Link>
        </div>
      </div>

      <div className="order-1 lg:order-2 relative min-w-0">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#f7f7f9] via-[#eceef2] to-[#e0e3e9] overflow-hidden relative">
          <Suspense fallback={<div className="h-[380px] grid place-items-center"><CarArt type={body} color={color.hex} className="w-3/4" /></div>}>
            <Car3D type={body} color={color.hex} height={400} />
          </Suspense>
          <span className="chip absolute top-4 left-4 !bg-white shadow"><BadgeCheck size={14} className="text-emerald-600" /> Verified sellers</span>
          <span className="chip absolute top-4 right-4 !bg-ink !text-white">Drag to rotate</span>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5 bg-white/90 backdrop-blur rounded-full p-1" role="group" aria-label="Body type">
              {BODY.map((b) => (
                <button key={b} onClick={() => setBody(b)} aria-pressed={body === b}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${body === b ? 'bg-ink text-white' : ''}`}>{b}</button>
              ))}
            </div>
            <div className="flex gap-2 bg-white/90 backdrop-blur rounded-full px-3 py-2" role="group" aria-label="Car colour">
              {COLORS.map((c) => (
                <button key={c.name} onClick={() => setColor(c)} aria-label={c.name} aria-pressed={color.name === c.name}
                  className={`size-5 rounded-full border border-black/15 ${color.name === c.name ? 'ring-2 ring-offset-1 ring-ink' : ''}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  [BadgeCheck, 'Verified sellers', 'Sellers get a verified badge after our team checks their identity.'],
  [MessageCircle, 'Chat with sellers', 'Ask questions and negotiate in a live chat, right on the car page.'],
  [GitCompare, 'Compare side by side', 'Put up to 3 cars next to each other: price, km, fuel, features.'],
  [Calculator, 'EMI calculator', 'Plan your monthly payment before you visit the showroom.'],
  [ShieldCheck, 'Reviewed listings', 'Every new listing is approved by an admin before it goes live.'],
  [Camera, 'Photos & full details', 'Owners, RTO, km driven, features: everything in one place.'],
];

export default function Home() {
  const [cars, setCars] = useState(null);
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    api.cars({ limit: 8, sort: 'newest' }).then((r) => setCars(r.cars)).catch(() => setCars([]));
    api.meta().then((m) => setBrands(m.brands)).catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      <Section eyebrow="Shop by brand" title="Made in India">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {brands.map(({ brand, n }) => (
            <Link key={brand} to={`/browse?brand=${encodeURIComponent(brand)}`} className="card p-5 hover:bg-mist transition-colors group">
              <div className="text-xl font-semibold">{brand}</div>
              <div className="text-sm text-black/50 mt-1">{BRAND_NOTE[brand]}</div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="chip">{n} cars</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Taking care of every buyer & seller" title="Key features">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {FEATURES.map(([Icon, t, d]) => (
            <div key={t}>
              <span className="grid place-items-center size-12 rounded-2xl bg-mist"><Icon size={22} /></span>
              <h3 className="mt-4 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-black/60">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Just listed" title="Fresh on DriveDeal" action={<More to="/browse">See all cars</More>}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(cars || Array.from({ length: 4 })).map((c, i) => c ? <CarCard key={c.id} car={c} /> : <div key={i} className="card h-72 animate-pulse bg-mist" />)}
        </div>
      </Section>

      <Section eyebrow="Simple as 1-2-3" title="How it works">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            [Search, '1. Find your car', 'Filter by brand, budget, city, fuel and more. Save the ones you like.'],
            [MessageCircle, '2. Talk to the seller', 'Chat directly, ask for details and agree on a fair price.'],
            [Handshake, '3. Close the deal', 'Meet, test drive and finish the paperwork. Sellers list for free.'],
          ].map(([Icon, t, d]) => (
            <div key={t} className="card p-7">
              <Icon size={26} />
              <h3 className="mt-5 text-2xl font-semibold">{t}</h3>
              <p className="mt-2 text-black/60">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="px-5 sm:px-10 pb-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#16171c] to-[#0a0a0d] text-white text-center px-6 py-16 sm:py-20 shadow-[0_30px_50px_-20px_rgba(0,0,0,0.5)]">
          <div className="absolute -right-24 -top-24 size-96 rounded-full border border-white/10" aria-hidden />
          <div className="absolute -right-4 top-10 size-72 rounded-full border border-white/10" aria-hidden />
          <h2 className="relative text-3xl sm:text-5xl font-bold tracking-tight">Drive with DriveDeal today</h2>
          <p className="relative mt-4 text-white/70 max-w-md mx-auto">Looking for your next car, or ready to sell your current one? It takes just a few minutes.</p>
          <div className="relative mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/browse" className="btn btn-light">Browse cars</Link>
            <Link to="/sell" className="btn border-white/30 text-white hover:bg-white/10">Sell your car</Link>
          </div>
        </div>
      </section>
    </>
  );
}
