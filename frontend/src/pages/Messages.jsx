import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { io } from 'socket.io-client';
import { api, DEMO, getToken } from '../lib/api.js';
import { useStore } from '../context/Store.jsx';
import { timeAgo, formatPrice } from '../lib/format.js';

export default function Messages() {
  const { carId, buyerId } = useParams();
  const { user, ready, notify } = useStore();
  const nav = useNavigate();
  const [chats, setChats] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const bottom = useRef(null);
  const active = carId && buyerId ? { carId: Number(carId), buyerId: Number(buyerId) } : null;
  const activeRef = useRef(active);
  activeRef.current = active;

  const loadChats = () => api.chats().then((r) => setChats(r.chats)).catch((e) => notify(e.message, 'err'));

  useEffect(() => { if (user) loadChats(); /* eslint-disable-next-line */ }, [user]);

  useEffect(() => {
    if (!user || !active) { setThread(null); return; }
    api.thread(active.carId, active.buyerId).then(setThread).catch((e) => { notify(e.message, 'err'); nav('/messages'); });
    // eslint-disable-next-line
  }, [user, carId, buyerId]);

  // live updates
  useEffect(() => {
    if (!user) return;
    const s = io(import.meta.env.VITE_API_URL || undefined, { auth: { token: getToken() } });
    s.on('message', (m) => {
      const a = activeRef.current;
      if (a && m.carId === a.carId && m.buyerId === a.buyerId) {
        setThread((t) => (t && !t.messages.some((x) => x.id === m.id) ? { ...t, messages: [...t.messages, m] } : t));
      }
      loadChats();
    });
    return () => s.disconnect();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread?.messages.length]);

  if (DEMO) return (
    <div className="px-5 sm:px-10 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
      <p className="mt-4 text-black/60 max-w-md mx-auto">Live chat with buyers and sellers is part of the full version, which runs on your computer.</p>
    </div>
  );
  if (ready && !user) return <Navigate to="/login" state={{ from: '/messages' }} replace />;
  if (!user) return null;

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !active) return;
    setText('');
    try {
      const { message } = await api.send(active.carId, body, active.buyerId);
      setThread((t) => (t && !t.messages.some((x) => x.id === message.id) ? { ...t, messages: [...t.messages, message] } : t));
    } catch (err) { notify(err.message, 'err'); setText(body); }
  }

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-6">
        <div className="eyebrow mb-3">Inbox</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Messages</h1>
      </div>
      <div className="grid md:grid-cols-[320px_1fr] gap-5 md:h-[600px]">
        <div className={`card overflow-y-auto ${active ? 'hidden md:block' : ''}`}>
          {!chats ? <div className="p-6 text-black/40">Loading…</div> : chats.length === 0 ? (
            <div className="p-6 text-black/60">No conversations yet. Open a car and tap <b>Chat with seller</b>.<br /><Link to="/browse" className="underline mt-3 inline-block">Browse cars</Link></div>
          ) : chats.map((c) => {
            const on = active && active.carId === c.carId && active.buyerId === c.buyerId;
            return (
              <Link key={`${c.carId}-${c.buyerId}`} to={`/messages/${c.carId}/${c.buyerId}`} className={`block px-5 py-4 border-b border-black/5 ${on ? 'bg-mist' : 'hover:bg-mist/60'}`}>
                <div className="flex justify-between gap-2"><span className="font-semibold line-clamp-1">{c.otherName}</span><span className="text-xs text-black/40 shrink-0">{timeAgo(c.at)}</span></div>
                <div className="text-xs text-black/50 line-clamp-1">{c.title}</div>
                <div className="text-sm text-black/70 line-clamp-1 mt-1">{c.last}</div>
              </Link>
            );
          })}
        </div>

        <div className={`card flex flex-col min-h-[460px] ${active ? '' : 'hidden md:flex'}`}>
          {!thread ? (
            <div className="m-auto text-black/40 p-6 text-center">{active ? 'Loading…' : 'Select a conversation'}</div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between gap-3">
                <div>
                  <Link to="/messages" className="md:hidden text-sm underline">← All chats</Link>
                  <Link to={`/cars/${thread.car.id}`} className="font-semibold block">{thread.car.title}</Link>
                  <div className="text-sm text-black/50">{formatPrice(thread.car.price)} · {thread.car.city}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3" aria-live="polite">
                {thread.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : ''}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[15px] ${m.senderId === user.id ? 'bg-ink text-white rounded-br-md' : 'bg-mist rounded-bl-md'}`}>
                      {m.body}
                      <div className={`text-[10px] mt-1 ${m.senderId === user.id ? 'text-white/50' : 'text-black/40'}`}>{timeAgo(m.createdAt)}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>
              <form onSubmit={send} className="p-3 border-t border-black/5 flex gap-2">
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" maxLength={1000} aria-label="Message" />
                <button className="btn btn-dark !px-4" aria-label="Send"><Send size={17} /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
