import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Mail, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { api, DEMO } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';
import { Section } from '../components/Layout.jsx';

function About() {
  return (
    <>
      <div className="px-5 sm:px-10 pt-4 pb-6">
        <div className="eyebrow mb-3">About DriveDeal</div>
        <h1 className="text-4xl sm:text-7xl font-bold tracking-tight leading-[1.03] max-w-3xl">A simpler way to buy and sell Indian cars</h1>
        <p className="mt-6 text-lg text-black/65 max-w-2xl">
          DriveDeal connects people who want to sell a car with people who want to buy one. No dealers in the middle, no confusing forms: just real cars, real prices and a chat window.
        </p>
      </div>
      <Section eyebrow="What we believe" title="Built around trust">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            [BadgeCheck, 'Verified sellers', 'Sellers can earn a verified badge so you know who you are talking to.'],
            [ShieldCheck, 'Every listing reviewed', 'New listings are checked by an admin before anyone sees them.'],
            [Zap, 'Made for India', 'Tata, Mahindra, Maruti Suzuki, Force and Hindustan Motors, with prices in ₹ and RTO codes.'],
          ].map(([Icon, t, d]) => (
            <div key={t} className="card p-7"><Icon size={26} /><h3 className="mt-5 text-2xl font-semibold">{t}</h3><p className="mt-2 text-black/60">{d}</p></div>
          ))}
        </div>
      </Section>
      <section className="px-5 sm:px-10 pb-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#16171c] to-[#0a0a0d] text-white text-center px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to find your next car?</h2>
          <div className="mt-6 flex gap-3 justify-center flex-wrap"><Link to="/browse" className="btn btn-light">Browse cars</Link><Link to="/sell" className="btn border-white/30 text-white hover:bg-white/10">Sell your car</Link></div>
        </div>
      </section>
    </>
  );
}

function Contact() {
  const { notify } = useStore();
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try { await api.contact(f); setDone(true); setF({ name: '', email: '', message: '' }); } catch (err) { notify(err.message, 'err'); } finally { setBusy(false); }
  }
  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8">
        <div className="eyebrow mb-3">We'd love to hear from you</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Contact us</h1>
      </div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {done ? (
          <div className="card p-10"><div className="text-2xl font-semibold">Thank you!</div><p className="mt-2 text-black/60">We got your message and will reply soon.</p>
            <button className="btn btn-ghost mt-6" onClick={() => setDone(false)}>Send another</button></div>
        ) : (
          <form onSubmit={submit} className="card p-7 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label htmlFor="cn" className="eyebrow block mb-2">Name</label><input id="cn" required className="input" value={f.name} onChange={set('name')} /></div>
              <div><label htmlFor="ce" className="eyebrow block mb-2">Email</label><input id="ce" type="email" required className="input" value={f.email} onChange={set('email')} /></div>
            </div>
            <div><label htmlFor="cm" className="eyebrow block mb-2">Message</label><textarea id="cm" required rows={6} maxLength={2000} className="input resize-none" value={f.message} onChange={set('message')} /></div>
            <button className="btn btn-dark" disabled={busy || DEMO}>{busy ? 'Sending…' : 'Send message'}</button>
            {DEMO && <p className="text-sm text-black/50">The contact form needs the full version.</p>}
          </form>
        )}
        <aside className="space-y-4">
          <div className="card p-6 flex gap-4"><Mail className="shrink-0" /><div><div className="font-semibold">Email</div><div className="text-black/60 text-sm">support@drivedeal.in</div></div></div>
          <div className="card p-6 flex gap-4"><MapPin className="shrink-0" /><div><div className="font-semibold">Made in India</div><div className="text-black/60 text-sm">Serving buyers and sellers across 15+ cities.</div></div></div>
        </aside>
      </div>
    </div>
  );
}

export default function Static({ page }) {
  return page === 'about' ? <About /> : <Contact />;
}
