import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, GitCompare, MessageCircle, Search, ShieldCheck, Calculator, Camera, Handshake } from 'lucide-react';
import { Section, More } from '../components/Layout.jsx';
import CarCard from '../components/CarCard.jsx';
import { api, imgUrl } from '../lib/api.js';
import { HERO } from '../../../shared/photos.js';

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
  return (
    <div className="px-3 sm:px-6 pb-4">
      <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] min-h-[560px] sm:min-h-[620px] flex items-center bg-[#1d2a33]">
        <img
          src={imgUrl(`/hero/${HERO.file}`)}
          alt={`${HERO.car} on a coastal road`}
          className="absolute inset-0 size-full object-cover object-[62%_50%]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/5 sm:via-black/40" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />

        <div className="relative z-10 px-6 sm:px-12 py-14 max-w-2xl text-white">
          <div className="eyebrow !text-white/70 mb-4">India's used car marketplace</div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.02]">
            Buy &amp; sell cars the <span className="text-accent">easy</span> way
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-lg">
            Tata, Mahindra, Maruti Suzuki and more. Find a trusted used car, or list yours and talk to real buyers in minutes.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); nav(`/browse?q=${encodeURIComponent(q)}`); }}
            className="mt-8 flex items-center gap-2 bg-white rounded-full p-1.5 max-w-lg text-ink"
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
            <Link to="/browse" className="btn btn-light">Browse cars <ArrowRight size={16} /></Link>
            <Link to="/sell" className="btn border-white/40 text-white hover:bg-white/10">Sell your car</Link>
          </div>
        </div>

        <a
          href={HERO.credit.page} target="_blank" rel="noreferrer"
          className="absolute z-10 right-4 bottom-4 sm:right-6 sm:bottom-6 chip !bg-white/90 backdrop-blur !text-ink shadow"
          title={`Photo: ${HERO.credit.author} on Unsplash`}
        >
          <BadgeCheck size={14} className="text-emerald-600" /> {HERO.car}
          <span className="hidden sm:inline text-black/50 font-normal">· Photo: {HERO.credit.author}</span>
        </a>
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
