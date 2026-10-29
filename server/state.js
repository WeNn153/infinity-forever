/**
 * Estado do servidor: provedores sincronizados do frontend + log de consumo.
 * Persistência em server/data.json (escrita atômica).
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const MAX_USAGE = 20000;

let state = { providers: [], usage: [], savedAt: 0 };

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      state = {
        providers: Array.isArray(raw.providers) ? raw.providers : [],
        usage: Array.isArray(raw.usage) ? raw.usage : [],
        savedAt: 0,
      };
    }
  } catch (err) {
    console.warn('[state] falha ao ler data.json:', err.message);
  }
}

let saveTimer = null;
function persist() {
  // debounce para não thrashar disco em syncs rápidos
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const tmp = DATA_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify({ providers: state.providers, usage: state.usage }, null, 1));
      fs.renameSync(tmp, DATA_FILE);
    } catch (err) {
      console.warn('[state] falha ao salvar data.json:', err.message);
    }
  }, 250);
}

function syncProviders(providers) {
  if (!Array.isArray(providers)) return;
  state.providers = providers;
  persist();
}

function getProviders() {
  return state.providers;
}

function recordUsage(entry) {
  const ts = typeof entry.ts === 'number' ? entry.ts : Date.now();
  const input = Math.max(0, Math.round(Number(entry.input) || 0));
  const output = Math.max(0, Math.round(Number(entry.output) || 0));
  if (input === 0 && output === 0) return;
  state.usage.push({
    ts,
    providerId: entry.providerId || '',
    providerName: entry.providerName || '',
    model: String(entry.model || '').slice(0, 200),
    input,
    output,
    source: entry.source || 'gateway',
  });
  if (state.usage.length > MAX_USAGE) state.usage = state.usage.slice(-MAX_USAGE);
  persist();
}

function normalizeProviderKey(u) {
  const id = String(u && u.providerId || '').trim();
  const name = String(u && u.providerName || '').trim().toLowerCase();
  return id || name;
}

function isRegistered(u) {
  const keys = new Set(
    state.providers.map((p) => String(p.id || '').trim())
      .concat(state.providers.map((p) => String(p.name || '').trim().toLowerCase()))
  );
  if (keys.has(String(u?.providerId || '').trim())) return true;
  return keys.has(String(u?.providerName || '').trim().toLowerCase());
}

function usageSince(days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return state.usage.filter((u) => u.ts >= cutoff && isRegistered(u));
}

function usageStats(days) {
  const rows = usageSince(days);
  let input = 0;
  let output = 0;
  const byModel = new Map();
  const byProvider = new Map();
  for (const r of rows) {
    input += r.input;
    output += r.output;
    const total = r.input + r.output;

    const m = byModel.get(r.model) || { name: r.model, input: 0, output: 0, total: 0, requests: 0 };
    m.input += r.input;
    m.output += r.output;
    m.total += total;
    m.requests += 1;
    byModel.set(r.model, m);

    const key = r.providerName || r.providerId || 'desconhecido';
    const p = byProvider.get(key) || {
      id: r.providerId,
      name: key,
      input: 0,
      output: 0,
      total: 0,
      requests: 0,
    };
    p.input += r.input;
    p.output += r.output;
    p.total += total;
    p.requests += 1;
    byProvider.set(key, p);
  }
  const sortDesc = (a, b) => b.total - a.total;
  return {
    period: `${days}d`,
    input,
    output,
    total: input + output,
    requests: rows.length,
    byModel: [...byModel.values()].sort(sortDesc),
    byProvider: [...byProvider.values()].sort(sortDesc),
  };
}

function clearUsage() {
  state.usage = [];
  persist();
}

load();

module.exports = { syncProviders, getProviders, recordUsage, usageStats, clearUsage };
