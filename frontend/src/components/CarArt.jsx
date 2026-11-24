// Lightweight side-view car illustration, tinted with the listing's colour.
// Used on cards (no WebGL needed for dozens of cards) and as a photo fallback.
const SHAPES = {
  hatchback: {
    body: 'M28 132 L28 108 Q30 94 54 90 L108 82 Q132 52 176 50 L238 50 Q272 52 292 84 L346 92 Q374 98 374 118 L374 132 Z',
    glass: 'M122 82 Q142 60 178 58 L232 58 Q258 60 274 84 Z',
    wheels: [98, 304],
  },
  sedan: {
    body: 'M20 132 L20 110 Q22 98 48 94 L122 86 Q150 56 196 54 L254 54 Q290 58 310 86 L360 92 Q384 98 384 118 L384 132 Z',
    glass: 'M138 86 Q158 64 198 62 L250 62 Q276 64 294 86 Z',
    wheels: [96, 312],
  },
  suv: {
    body: 'M26 134 L26 102 Q28 88 52 84 L98 78 Q110 42 152 40 L292 40 Q320 44 332 80 L362 86 Q380 92 380 118 L380 134 Z',
    glass: 'M114 78 Q122 52 154 50 L290 50 Q312 52 322 78 Z',
    wheels: [100, 308],
  },
  mpv: {
    body: 'M20 134 L20 104 Q22 90 48 86 L96 80 Q108 44 150 42 L300 42 Q334 46 346 84 L368 88 Q386 94 386 118 L386 134 Z',
    glass: 'M112 80 Q120 54 152 52 L298 52 Q326 54 336 82 Z',
    wheels: [98, 316],
  },
};

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt * (amt < 0 ? v : 255 - v))));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

let uid = 0;
export default function CarArt({ type = 'hatchback', color = '#c8202b', className = '' }) {
  const s = SHAPES[type] || SHAPES.hatchback;
  const id = `ca${++uid}`;
  const dark = shade(color, -0.35);
  const light = shade(color, 0.3);
  return (
    <svg viewBox="0 0 400 180" className={className} role="img" aria-label={`${type} car illustration`}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbe9f5" />
          <stop offset="1" stopColor="#5b7388" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="168" rx="170" ry="8" fill="#000" opacity="0.12" />
      <path d={s.body} fill={`url(#${id}b)`} />
      <path d={s.glass} fill={`url(#${id}g)`} opacity="0.92" />
      <line x1="200" y1="58" x2="200" y2="86" stroke={dark} strokeWidth="3" opacity="0.7" />
      <path d={`M${s.wheels[0] + 40} 106 L${s.wheels[1] - 40} 106`} stroke={dark} strokeWidth="1.5" opacity="0.5" />
      <rect x="368" y="104" width="12" height="7" rx="3" fill="#fff6d6" />
      <rect x="20" y="104" width="9" height="7" rx="3" fill="#ff4a4a" />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="134" r="32" fill="#12141a" />
          <circle cx={x} cy="134" r="25" fill="#1d2027" />
          <circle cx={x} cy="134" r="15" fill="#c9ced6" />
          <circle cx={x} cy="134" r="5" fill="#6b717c" />
          {[0, 72, 144, 216, 288].map((a) => (
            <line key={a} x1={x} y1="134" x2={x + 14 * Math.cos((a * Math.PI) / 180)} y2={134 + 14 * Math.sin((a * Math.PI) / 180)} stroke="#6b717c" strokeWidth="2" />
          ))}
        </g>
      ))}
    </svg>
  );
}
