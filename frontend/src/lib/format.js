export function formatPrice(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
}
export const formatKm = (n) => `${Number(n).toLocaleString('en-IN')} km`;
export const formatRupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
export function ordinalOwner(n) {
  return n === 1 ? '1st owner' : n === 2 ? '2nd owner' : n === 3 ? '3rd owner' : `${n}th owner`;
}
export function timeAgo(iso) {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
  const s = Math.max((Date.now() - d.getTime()) / 1000, 0);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
