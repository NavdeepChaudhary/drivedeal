import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Car, GitCompare, Heart, Menu, X, ArrowRight, Info } from 'lucide-react';
import { useStore } from '../context/Store.jsx';
import { DEMO } from '../lib/api.js';

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-xl tracking-tight">
      <span className={`grid place-items-center size-8 rounded-full ${light ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
        <Car size={17} strokeWidth={2.4} />
      </span>
      <span className={light ? 'text-white' : ''}>DriveDeal</span>
    </Link>
  );
}

const links = [
  ['/browse', 'Buy cars'],
  ['/sell', 'Sell your car'],
  ['/emi', 'EMI calculator'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, compare } = useStore();
  const nav = useNavigate();
  const cls = ({ isActive }) => `text-sm font-medium hover:opacity-100 ${isActive ? 'opacity-100' : 'opacity-70'}`;
  return (
    <header className="relative z-20">
      <div className="flex items-center justify-between px-5 sm:px-10 py-5">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
          {links.map(([to, label]) => <NavLink key={to} to={to} className={cls}>{label}</NavLink>)}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/compare" className="btn btn-ghost !px-3 !py-2 relative" aria-label="Compare cars">
            <GitCompare size={17} />
            {compare.length > 0 && <span className="absolute -top-1 -right-1 grid place-items-center size-5 rounded-full bg-accent text-white text-[11px]">{compare.length}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost !py-2"><Heart size={16} /> {user.name.split(' ')[0]}</Link>
              <button className="btn btn-dark !py-2" onClick={() => { logout(); nav('/'); }}>Log out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-dark !py-2">Log in</Link>
          )}
        </div>
        <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden px-5 pb-5 flex flex-col gap-1 border-t border-black/5" onClick={() => setOpen(false)}>
          {[...links, ['/compare', `Compare (${compare.length})`], ...(user ? [['/dashboard', 'My dashboard'], ['/messages', 'Messages']] : [['/login', 'Log in']])].map(([to, label]) => (
            <NavLink key={to} to={to} className="py-3 font-medium border-b border-black/5">{label}</NavLink>
          ))}
          {user && <button className="btn btn-dark mt-3" onClick={() => { logout(); nav('/'); }}>Log out</button>}
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="px-5 sm:px-10 pb-10 pt-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-black/60">India's simple way to buy and sell cars from Tata, Mahindra, Maruti Suzuki, Force Motors and Hindustan Motors.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <span className="eyebrow">Explore</span>
          <Link to="/browse">Buy cars</Link><Link to="/sell">Sell your car</Link><Link to="/compare">Compare</Link><Link to="/emi">EMI calculator</Link>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <span className="eyebrow">Company</span>
          <Link to="/about">About us</Link><Link to="/contact">Contact</Link><Link to="/dashboard">My dashboard</Link>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-black/10 flex flex-wrap justify-between gap-3 text-xs text-black/50">
        <span>© {new Date().getFullYear()} DriveDeal. Made for India 🇮🇳</span>
        <span>Prices shown are for used cars and are set by sellers.</span>
      </div>
    </footer>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div role="status" aria-live="polite" className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm font-medium shadow-xl ${toast.kind === 'err' ? 'bg-red-600 text-white' : 'bg-ink text-white'}`}>
      {toast.msg}
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="p-2 sm:p-5">
      <div className="mx-auto max-w-[1280px] bg-white rounded-[1.75rem] sm:rounded-[2.5rem] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] overflow-hidden">
        {DEMO && (
          <div className="bg-ink text-white text-xs sm:text-sm px-5 py-2.5 flex items-center justify-center gap-2 text-center">
            <Info size={15} className="shrink-0" />
            <span>Demo preview: browsing, filters, compare and EMI work here. Login, selling, chat and admin need the full version.</span>
          </div>
        )}
        <Navbar />
        <main key={pathname}><Outlet /></main>
        <Footer />
      </div>
      <Toast />
    </div>
  );
}

export function Section({ eyebrow, title, children, className = '', action }) {
  return (
    <section className={`px-5 sm:px-10 py-12 sm:py-16 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function More({ to, children }) {
  return <Link to={to} className="btn btn-ghost">{children} <ArrowRight size={16} /></Link>;
}
