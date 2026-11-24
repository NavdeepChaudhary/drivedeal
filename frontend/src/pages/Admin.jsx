import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BadgeCheck, Check, X } from 'lucide-react';
import { api, DEMO } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';
import { CarImage } from '../components/CarCard.jsx';
import { formatPrice, timeAgo } from '../lib/format.js';

export default function Admin() {
  const { user, ready, notify } = useStore();
  const [data, setData] = useState(null);
  const load = () => api.adminOverview().then(setData).catch((e) => notify(e.message, 'err'));
  useEffect(() => { if (user?.role === 'admin') load(); /* eslint-disable-next-line */ }, [user]);

  if (DEMO) return <div className="px-5 sm:px-10 py-24 text-center"><h1 className="text-4xl font-bold">Admin panel</h1><p className="mt-4 text-black/60">Available in the full version.</p></div>;
  if (ready && !user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  if (!user) return null;
  if (user.role !== 'admin') return <div className="px-5 sm:px-10 py-24 text-center"><h1 className="text-4xl font-bold">Admins only</h1><Link to="/" className="btn btn-dark mt-6">Go home</Link></div>;

  const act = async (fn, msg) => { try { await fn(); notify(msg); load(); } catch (e) { notify(e.message, 'err'); } };

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8">
        <div className="eyebrow mb-3">Admin</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Control panel</h1>
      </div>
      {!data ? <div className="card h-40 animate-pulse bg-mist" /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[['Users', data.stats.users], ['Live cars', data.stats.cars], ['Waiting approval', data.stats.pending], ['Messages', data.stats.messages]].map(([k, v]) => (
              <div key={k} className="card p-5"><div className="eyebrow">{k}</div><div className="text-4xl font-bold mt-2">{v}</div></div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Listings waiting for approval</h2>
          {data.pending.length === 0 ? <div className="card p-8 text-black/60">All caught up. Nothing to review.</div> : (
            <div className="grid gap-4">
              {data.pending.map((c) => (
                <div key={c.id} className="card p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
                  <CarImage car={c} className="w-36 aspect-[16/10] rounded-2xl" />
                  <div className="flex-1 min-w-[200px]">
                    <Link to={`/cars/${c.id}`} className="font-semibold text-lg">{c.title}</Link>
                    <div className="text-sm text-black/60">{formatPrice(c.price)} · {c.city} · by {c.seller}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-dark !py-2" onClick={() => act(() => api.adminCar(c.id, 'approve'), 'Approved')}><Check size={15} /> Approve</button>
                    <button className="btn btn-ghost !py-2" onClick={() => act(() => api.adminCar(c.id, 'reject'), 'Rejected')}><X size={15} /> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold mt-12 mb-4">Users &amp; seller verification</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
              <thead><tr className="text-black/50 eyebrow"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Status</th></tr></thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="border-t border-black/5">
                    <td className="p-4 font-medium">{u.name}</td><td className="p-4 text-black/60">{u.email}</td><td className="p-4 text-black/60">{timeAgo(u.created_at)}</td>
                    <td className="p-4">
                      <button className={`chip ${u.verified ? '!bg-emerald-100 !text-emerald-800' : ''}`} onClick={() => act(() => api.adminVerify(u.id, !u.verified), u.verified ? 'Badge removed' : 'Seller verified')}>
                        <BadgeCheck size={14} /> {u.verified ? 'Verified' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Contact messages</h2>
          {data.contacts.length === 0 ? <div className="card p-8 text-black/60">No messages yet.</div> : (
            <div className="grid gap-3">{data.contacts.map((m) => (
              <div key={m.id} className="card p-5"><div className="font-semibold">{m.name} <span className="font-normal text-black/50 text-sm">· {m.email} · {timeAgo(m.created_at)}</span></div><p className="mt-2 text-black/70 whitespace-pre-line">{m.message}</p></div>
            ))}</div>
          )}
        </>
      )}
    </div>
  );
}
