export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function cn(...args) {
  return args.filter(Boolean).join(' ');
}

export function formatNumber(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('pt-BR');
}

export function formatCompact(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1).replace('.0', '') + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1).replace('.0', '') + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1).replace('.0', '') + 'k';
  return String(v);
}

export function timeAgo(ts) {
  if (!ts) return 'nunca';
  const diff = Date.now() - ts;
  if (diff < 0) return 'agora';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '•'.repeat(key.length);
  return `${key.slice(0, 4)}${'•'.repeat(16)}${key.slice(-4)}`;
}

export function normalizeBase(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

export function monthKey(dateStr) {
  return String(dateStr || '').slice(0, 7);
}

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function monthLabel(key) {
  const [y, m] = String(key || '').split('-');
  const idx = Number(m) - 1;
  if (!y || Number.isNaN(idx) || idx < 0 || idx > 11) return key;
  return `${MONTH_NAMES[idx]} ${y}`;
}

export function listOfMonths(usage) {
  const set = new Set(usage.map((u) => monthKey(u.date)).filter(Boolean));
  set.add(new Date().toISOString().slice(0, 7));
  return Array.from(set).sort().reverse();
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch (err) {
      return false;
    }
  }
}
