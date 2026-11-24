import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { api, DEMO } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';

export default function Auth({ mode }) {
  const signup = mode === 'signup';
  const { user, authed, notify } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const from = loc.state?.from || '/dashboard';

  if (user) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const res = signup ? await api.register(f) : await api.login({ email: f.email, password: f.password });
      authed(res);
      notify(`Welcome${signup ? '' : ' back'}, ${res.user.name.split(' ')[0]}!`);
      nav(from, { replace: true });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }

  return (
    <div className="px-5 sm:px-10 py-10 sm:py-16 grid place-items-center">
      <div className="w-full max-w-md">
        <div className="eyebrow mb-3">{signup ? 'Join DriveDeal' : 'Welcome back'}</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{signup ? 'Create account' : 'Log in'}</h1>
        {DEMO && (
          <div className="mt-6 p-4 rounded-2xl bg-mist text-sm flex gap-3"><Info className="shrink-0" size={18} />
            Accounts only work in the full version, which runs on your computer. This online preview has no server.
          </div>
        )}
        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          {signup && (
            <div><label className="eyebrow block mb-2" htmlFor="name">Full name</label>
              <input id="name" className="input" value={f.name} onChange={set('name')} required autoComplete="name" /></div>
          )}
          <div><label className="eyebrow block mb-2" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={f.email} onChange={set('email')} required autoComplete="email" /></div>
          {signup && (
            <div><label className="eyebrow block mb-2" htmlFor="phone">Phone (optional)</label>
              <input id="phone" type="tel" className="input" value={f.phone} onChange={set('phone')} autoComplete="tel" /></div>
          )}
          <div><label className="eyebrow block mb-2" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={f.password} onChange={set('password')} required minLength={8}
              autoComplete={signup ? 'new-password' : 'current-password'} />
            {signup && <p className="text-xs text-black/50 mt-1.5">At least 8 characters.</p>}</div>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <button className="btn btn-dark w-full" disabled={busy || DEMO}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button>
        </form>
        <p className="mt-6 text-sm text-black/60">
          {signup ? 'Already have an account?' : 'New to DriveDeal?'}{' '}
          <Link to={signup ? '/login' : '/signup'} state={loc.state} className="font-semibold text-ink underline">{signup ? 'Log in' : 'Create one'}</Link>
        </p>
      </div>
    </div>
  );
}
