import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, DEMO, getToken, setToken } from '../lib/api.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(DEMO || !getToken());
  const [wish, setWish] = useState(() => (DEMO ? read('dd_wish', []) : []));
  const [compare, setCompare] = useState(() => read('dd_compare', []));
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, kind = 'ok') => {
    setToast({ msg, kind, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // restore session
  useEffect(() => {
    if (DEMO || !getToken()) return;
    api.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);

  // load wishlist for logged-in users
  useEffect(() => {
    if (DEMO) return;
    if (!user) { setWish([]); return; }
    api.wishlist().then((r) => setWish(r.ids)).catch(() => {});
  }, [user]);

  const authed = useCallback((res) => { setToken(res.token); setUser(res.user); }, []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const toggleWish = useCallback(async (id) => {
    const has = wish.includes(id);
    if (DEMO) {
      const next = has ? wish.filter((x) => x !== id) : [...wish, id];
      setWish(next); write('dd_wish', next);
      notify(has ? 'Removed from saved cars' : 'Saved to your list');
      return;
    }
    if (!user) { notify('Log in to save cars', 'err'); return false; }
    try {
      if (has) await api.removeWish(id); else await api.addWish(id);
      setWish(has ? wish.filter((x) => x !== id) : [...wish, id]);
      notify(has ? 'Removed from saved cars' : 'Saved to your list');
    } catch (e) { notify(e.message, 'err'); }
  }, [wish, user, notify]);

  const toggleCompare = useCallback((id) => {
    setCompare((cur) => {
      if (cur.includes(id)) { const n = cur.filter((x) => x !== id); write('dd_compare', n); return n; }
      if (cur.length >= 3) { notify('You can compare up to 3 cars', 'err'); return cur; }
      const n = [...cur, id]; write('dd_compare', n); notify('Added to compare'); return n;
    });
  }, [notify]);
  const clearCompare = useCallback(() => { setCompare([]); write('dd_compare', []); }, []);

  const value = useMemo(() => ({
    user, ready, authed, logout, wish, toggleWish, compare, toggleCompare, clearCompare, notify, toast,
  }), [user, ready, authed, logout, wish, toggleWish, compare, toggleCompare, clearCompare, notify, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
