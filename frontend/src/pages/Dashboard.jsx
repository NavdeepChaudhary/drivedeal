import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MessageCircle, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { api, DEMO } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';
import CarCard, { CarImage } from '../components/CarCard.jsx';
import { formatPrice } from '../lib/format.js';

const STATUS = { approved: 'bg-emerald-100 text-emerald-800', pending: 'bg-amber-100 text-amber-800', rejected: 'bg-red-100 text-red-800' };

export default function Dashboard() {
  const { user, ready, wish, notify } = useStore();
  const [mine, setMine] = useState(null);
  const [saved, setSaved] = useState(null);
  const [tab, setTab] = useState('mine');

  useEffect(() => {
    if (!user) return;
    api.myCars().then((r) => setMine(r.cars)).catch((e) => notify(e.message, 'err'));
  }, [user, notify]);
  useEffect(() => {
    if (!user) return;
    api.wishlist().then((r) => setSaved(r.cars)).catch(() => setSaved([]));
  }, [user, wish]);

  if (DEMO) {
    return (
      <div className="px-5 sm:px-10 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-4 text-black/60 max-w-md mx-auto">Your listings, saved cars and messages live here in the full version. In this preview, saved cars are kept in your browser.</p>
        <Link to="/browse" className="btn btn-dark mt-8">Browse cars</Link>
      </div>
    );
  }
  if (ready && !user) return <Navigate to="/login" state={{ from: '/dashboard' }} replace />;
  if (!user) return null;

  async function remove(id) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try { await api.deleteCar(id); setMine(mine.filter((c) => c.id !== id)); notify('Listing deleted'); } catch (e) { notify(e.message, 'err'); }
  }

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-3">My dashboard</div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 text-black/60">{user.verified ? 'Your seller account is verified ✓' : 'Chat with buyers and manage your cars here.'}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/messages" className="btn btn-ghost"><MessageCircle size={16} /> Messages</Link>
          {user.role === 'admin' && <Link to="/admin" className="btn btn-ghost"><ShieldCheck size={16} /> Admin</Link>}
          <Link to="/sell" className="btn btn-dark"><Plus size={16} /> Sell a car</Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6" role="tablist">
        {[['mine', `My listings${mine ? ` (${mine.length})` : ''}`], ['saved', `Saved cars${saved ? ` (${saved.length})` : ''}`]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn !py-2 ${tab === k ? 'btn-dark' : 'btn-ghost'}`}>{l}</button>
        ))}
      </div>

      {tab === 'mine' && (
        !mine ? <div className="h-40 card animate-pulse bg-mist" /> :
        mine.length === 0 ? (
          <div className="card p-10 text-center"><div className="text-xl font-semibold">You haven't listed a car yet</div>
            <Link to="/sell" className="btn btn-dark mt-5">List your first car</Link></div>
        ) : (
          <div className="grid gap-4">
            {mine.map((c) => (
              <div key={c.id} className="card p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
                <Link to={`/cars/${c.id}`}><CarImage car={c} className="w-36 aspect-[16/10] rounded-2xl" /></Link>
                <div className="flex-1 min-w-[180px]">
                  <Link to={`/cars/${c.id}`} className="font-semibold text-lg">{c.title}</Link>
                  <div className="text-black/60 text-sm">{formatPrice(c.price)} · {c.city}</div>
                  <span className={`chip mt-2 capitalize ${STATUS[c.status]}`}>{c.status === 'pending' ? 'Waiting for approval' : c.status}</span>
                </div>
                <button onClick={() => remove(c.id)} className="btn btn-ghost !px-3" aria-label={`Delete ${c.title}`}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )
      )}
      {tab === 'saved' && (
        !saved ? <div className="h-40 card animate-pulse bg-mist" /> :
        saved.length === 0 ? (
          <div className="card p-10 text-center"><div className="text-xl font-semibold">No saved cars yet</div>
            <p className="text-black/60 mt-2">Tap the heart on any car to save it.</p><Link to="/browse" className="btn btn-dark mt-5">Browse cars</Link></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{saved.map((c) => <CarCard key={c.id} car={c} />)}</div>
        )
      )}
    </div>
  );
}
