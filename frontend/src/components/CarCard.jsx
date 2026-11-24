import { Link } from 'react-router-dom';
import { BadgeCheck, GitCompare, Heart, MapPin } from 'lucide-react';
import CarArt from './CarArt.jsx';
import { useStore } from '../context/Store.jsx';
import { imgUrl } from '../lib/api.js';
import { formatKm, formatPrice } from '../lib/format.js';

export function CarImage({ car, className = '' }) {
  const photo = car.images?.[0];
  return photo ? (
    <img src={imgUrl(photo)} alt={car.title} loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`grid place-items-center bg-gradient-to-b from-[#f4f5f7] to-[#e6e8ec] ${className}`}>
      <CarArt type={car.bodyType} color={car.colorHex} className="w-[88%]" />
    </div>
  );
}

export default function CarCard({ car }) {
  const { wish, toggleWish, compare, toggleCompare } = useStore();
  const saved = wish.includes(car.id);
  const comparing = compare.includes(car.id);
  return (
    <article className="card overflow-hidden group transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.3)]">
      <div className="relative">
        <Link to={`/cars/${car.id}`} aria-label={car.title}>
          <CarImage car={car} className="w-full aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]" />
        </Link>
        <button
          onClick={() => toggleWish(car.id)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved' : 'Save car'}
          className="absolute top-3 right-3 grid place-items-center size-9 rounded-full bg-white/90 backdrop-blur shadow"
        >
          <Heart size={17} className={saved ? 'fill-red-500 text-red-500' : ''} />
        </button>
        {car.sellerVerified && (
          <span className="absolute top-3 left-3 chip !bg-white/90 backdrop-blur text-emerald-700"><BadgeCheck size={14} /> Verified seller</span>
        )}
      </div>
      <div className="p-5">
        <Link to={`/cars/${car.id}`} className="block">
          <h3 className="font-semibold text-lg leading-snug line-clamp-1">{car.title}</h3>
        </Link>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-black/60">
          <span>{formatKm(car.km)}</span><span>·</span><span>{car.fuel}</span><span>·</span><span>{car.transmission}</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <div className="text-2xl font-bold tracking-tight">{formatPrice(car.price)}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-black/50"><MapPin size={12} /> {car.city} · {car.rto}</div>
          </div>
          <button
            onClick={() => toggleCompare(car.id)}
            aria-pressed={comparing}
            className={`chip ${comparing ? '!bg-ink !text-white' : ''}`}
          >
            <GitCompare size={13} /> {comparing ? 'Added' : 'Compare'}
          </button>
        </div>
      </div>
    </article>
  );
}
