import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatRupees } from '../lib/format.js';

function Slider({ id, label, value, min, max, step, onChange, show }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label htmlFor={id} className="font-medium">{label}</label>
        <span className="font-bold text-lg">{show(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-ink" />
      <div className="flex justify-between text-xs text-black/40 mt-1"><span>{show(min)}</span><span>{show(max)}</span></div>
    </div>
  );
}

export default function Emi() {
  const [params] = useSearchParams();
  const initial = Math.min(Math.max(Number(params.get('price')) || 800000, 100000), 5000000);
  const [price, setPrice] = useState(Math.round(initial / 10000) * 10000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(5);

  const r = useMemo(() => {
    const loan = price * (1 - down / 100);
    const m = rate / 1200, n = years * 12;
    const emi = m === 0 ? loan / n : (loan * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1);
    const total = emi * n;
    return { loan, emi, total, interest: total - loan, downAmt: price - loan };
  }, [price, down, rate, years]);
  const pct = Math.round((r.loan / r.total) * 100);

  return (
    <div className="px-5 sm:px-10 pb-16">
      <div className="pt-4 pb-8">
        <div className="eyebrow mb-3">Plan your payment</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">EMI calculator</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-7 space-y-8">
          <Slider id="price" label="Car price" value={price} min={100000} max={5000000} step={10000} onChange={setPrice} show={formatRupees} />
          <Slider id="down" label="Down payment" value={down} min={0} max={80} step={5} onChange={setDown} show={(v) => `${v}%`} />
          <Slider id="rate" label="Interest rate (yearly)" value={rate} min={6} max={18} step={0.1} onChange={(v) => setRate(Math.round(v * 10) / 10)} show={(v) => `${v}%`} />
          <Slider id="years" label="Loan period" value={years} min={1} max={7} step={1} onChange={setYears} show={(v) => `${v} yr${v > 1 ? 's' : ''}`} />
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-[#16171c] to-[#0a0a0d] text-white p-8 flex flex-col">
          <div className="eyebrow !text-white/50">Your monthly EMI</div>
          <div className="text-5xl sm:text-6xl font-bold tracking-tight mt-2" aria-live="polite">{formatRupees(r.emi)}</div>
          <div className="mt-8 h-3 rounded-full bg-white/15 overflow-hidden" role="img" aria-label={`${pct}% principal, ${100 - pct}% interest`}>
            <div className="h-full bg-white" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-2"><span>Principal {pct}%</span><span>Interest {100 - pct}%</span></div>
          <dl className="mt-8 grid grid-cols-2 gap-5">
            {[['Down payment', r.downAmt], ['Loan amount', r.loan], ['Total interest', r.interest], ['Total payable', r.total]].map(([k, v]) => (
              <div key={k}><dt className="text-sm text-white/55">{k}</dt><dd className="text-xl font-semibold mt-1">{formatRupees(v)}</dd></div>
            ))}
          </dl>
          <Link to="/browse" className="btn btn-light mt-auto self-start !mt-10">Find cars in this budget</Link>
        </div>
      </div>
      <p className="mt-6 text-sm text-black/50">This is an estimate. Your bank's final rate and charges may differ.</p>
    </div>
  );
}
