/**
 * Infinity Forever — backend local (porta 3001)
 * - Testes server-side de provedores/modelos (Node)
 * - Resolve automático de endpoint + modelos a partir da API key
 * - Gateway OpenAI-compatível (/v1) que grava o consumo automaticamente
 * - Dashboard de consumo (7d/28d) + quota de provedores
 */
const http = require('http');
const { URL } = require('url');
const { CATALOG, getCatalogEntry } = require('./catalog');
const state = require('./state');
const { probeModels, pingModel, resolveProvider, testProvider, testAll } = require('./testing');

const PORT = Number(process.env.PORT || 3001);
const REQUEST_TIMEOUT = 15 * 60 * 1000; // chamadas de gateway podem demorar

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key, X-Provider, X-Model, anthropic-version',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) {
        reject(new Error('payload muito grande'));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeBase(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

/* ---------------------------------------------------------- quota handlers */

async function quotaGroq(provider) {
  const base = normalizeBase(provider.baseUrl) || 'https://api.groq.com/openai/v1';
  const res = await fetch(`${base}/models`, {
    headers: { Authorization: `Bearer ${provider.apiKey}` },
    signal: AbortSignal.timeout(12000),
  });
  const pick = (name) => (res.headers.get(name) || '').trim();
  const limitR = pick('x-ratelimit-limit-requests');
  const remR = pick('x-ratelimit-remaining-requests');
  const limitT = pick('x-ratelimit-limit-tokens');
  const remT = pick('x-ratelimit-remaining-tokens');
  const reset = pick('x-ratelimit-reset-requests');
  if (!limitR && !limitT) {
    if (res.status === 401 || res.status === 403) throw new Error(`Chave recusada (HTTP ${res.status})`);
    throw new Error(`Sem headers de rate limit (HTTP ${res.status})`);
  }
  const rows = [];
  if (limitR) {
    rows.push({
      label: 'Requisições',
      used: Math.max(0, Number(limitR) - Number(remR || 0)),
      limit: Number(limitR),
      remaining: Number(remR || 0),
      unit: 'req',
      reset,
    });
  }
  if (limitT) {
    rows.push({
      label: 'Tokens',
      used: Math.max(0, Number(limitT) - Number(remT || 0)),
      limit: Number(limitT),
      remaining: Number(remT || 0),
      unit: 'tok',
      reset,
    });
  }
  return { provider: 'groq', rows };
}

async function quotaDeepseek(provider) {
  const res = await fetch('https://api.deepseek.com/user/balance', {
    headers: { Authorization: `Bearer ${provider.apiKey}` },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Balance API HTTP ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data.balance_infos) ? data.balance_infos : [];
  const rows = list
    .filter((b) => b && b.currency)
    .map((b) => ({
      label: `Saldo (${b.currency})`,
      used: null,
      limit: null,
      remaining: Number(b.total_balance || 0),
      unit: b.currency,
      detail: `granted ${b.granted_balance ?? '?'} · top-up ${b.topped_up_balance ?? '?'}`,
    }));
  if (!rows.length) throw new Error('Sem informações de saldo');
  return { provider: 'deepseek', rows };
}

async function quotaOpenrouter(provider) {
  const res = await fetch('https://openrouter.ai/api/v1/credits', {
    headers: { Authorization: `Bearer ${provider.apiKey}` },
    signal: AbortSignal.timeout(12000),
  });
  if (res.status === 401 || res.status === 403) throw new Error(`Chave recusada (HTTP ${res.status})`);
  if (!res.ok) throw new Error(`Credits API HTTP ${res.status}`);
  const data = await res.json();
  const d = data?.data || {};
  const total = Number(d.total_credit || d.totalCredits || 0);
  const used = Number(d.total_usage || d.totalUsage || 0);
  return {
    provider: 'openrouter',
    rows: [
      {
        label: 'Créditos',
        used,
        limit: total || null,
        remaining: Math.max(0, total - used),
        unit: 'USD',
      },
    ],
  };
}

async function quotaOllama(provider) {
  const headers = { Authorization: `Bearer ${provider.apiKey}`, Accept: 'application/json' };
  const usageRes = await fetch('https://ollama.com/api/usage', { headers, signal: AbortSignal.timeout(12000) });
  if (usageRes.status === 401 || usageRes.status === 403) throw new Error(`Chave recusada (HTTP ${usageRes.status})`);
  const usage = usageRes.ok ? await usageRes.json().catch(() => null) : null;
  const limits = (usage && usage.limits && typeof usage.limits === 'object') ? usage.limits : {};
  const rows = [];
  for (const [key, label] of [['session','Sessão (5h)'], ['weekly','Semanal (7d)'], ['monthly','Mensal']]) {
    const raw = limits?.[key]?.usage ?? null;
    if (raw === undefined || raw === null) continue;
    const ratio = Number(raw);
    if (Number.isNaN(ratio)) continue;
    const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
    rows.push({ label, used: pct, limit: 100, remaining: 100 - pct, unit: '%', reset: limits?.[key]?.resets_at || null });
  }
  // fallback: balance API
  if (!rows.length) {
    const bal = await fetch('https://ollama.com/api/balance', { headers, signal: AbortSignal.timeout(12000) });
    if (bal.ok) {
      const b = await bal.json().catch(() => ({}));
      const inc = b?.included;
      if (inc?.session || inc?.weekly) {
        if (inc.session) {
          const rem = Number(inc.session.remaining_percent);
          const remPct = Number.isFinite(rem) ? Math.max(0,Math.min(100,rem)) : 100;
          rows.push({ label: 'Sessão (5h)', used: 100-remPct, limit: 100, remaining: remPct, unit: '%', reset: inc.session.resets_at || null });
        }
        if (inc.weekly) {
          const rem = Number(inc.weekly.remaining_percent);
          const remPct = Number.isFinite(rem) ? Math.max(0,Math.min(100,rem)) : 100;
          rows.push({ label: 'Semanal (7d)', used: 100-remPct, limit: 100, remaining: remPct, unit: '%', reset: inc.weekly.resets_at || null });
        }
      }
      if (!rows.length && inc?.balance_usd !== undefined && inc?.allowance_usd !== undefined) {
        const allowance = Number(inc.allowance_usd) || 0;
        const balance = Number(inc.balance_usd) || 0;
        rows.push({ label: 'Allowance', used: Math.max(0, allowance-balance), limit: allowance, remaining: balance, unit: 'USD' });
      }
      if (Number(b?.purchased?.balance_usd) > 0) {
        rows.push({ label: 'Créditos comprados', used: 0, limit: Number(b.purchased.balance_usd), remaining: Number(b.purchased.balance_usd), unit: 'USD' });
      }
    }
  }
  if (!rows.length) {
    return { provider: 'ollama', rows: [{ label: 'Quota', used: null, limit: null, remaining: null, unit: null, detail: 'Sem limites reportados' }] };
  }
  return { provider: 'ollama', rows };
}
const QUOTA_HANDLERS = { groq: quotaGroq, deepseek: quotaDeepseek, openrouter: quotaOpenrouter, ollama: quotaOllama };
const _ollama_ignore = null;
_ollama_ignore;
async function getQuota() {
  const providers = state.getProviders().filter((p) => p.apiKey);
  const out = [];
  for (const p of providers) {
    const entry = getCatalogEntry(p.catalogId) || getCatalogEntry(p.id);
    const handlerId = entry && entry.quota;
    if (!handlerId || !QUOTA_HANDLERS[handlerId]) continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await QUOTA_HANDLERS[handlerId](p);
      out.push({ id: p.id, name: p.name, ok: true, ...result });
    } catch (err) {
      out.push({ id: p.id, name: p.name, ok: false, error: err.message, rows: [] });
    }
  }
  return { quotas: out };
}

/* -------------------------------------------------------------- gateway */

function findProviderForModel(model, headerProvider) {
  const providers = state.getProviders().filter((p) => p.apiKey && p.baseUrl);
  if (headerProvider) {
    const hit = providers.find(
      (p) => p.id === headerProvider || p.name === headerProvider || p.catalogId === headerProvider
    );
    if (hit) return hit;
  }
  // "provider/model" (openrouter style)
  const slash = String(model || '').indexOf('/');
  if (slash > 0) {
    const prefix = model.slice(0, slash);
    const hit = providers.find((p) => (p.catalogId || p.id) === prefix || p.prefix === prefix);
    if (hit) return hit;
  }
  // provedor cuja lista contém o modelo
  const hit = providers.find(
    (p) => Array.isArray(p.models) && p.models.some((m) => (typeof m === 'string' ? m : m.name) === model)
  );
  if (hit) return hit;
  // provedor único cadastrado
  if (providers.length === 1) return providers[0];
  return null;
}

function extractTokens(json) {
  const u = json && json.usage;
  if (u && typeof u === 'object') {
    const input = Number(u.prompt_tokens ?? u.input_tokens ?? u.input ?? 0) || 0;
    const output = Number(u.completion_tokens ?? u.output_tokens ?? u.output ?? 0) || 0;
    if (input || output) return { input, output };
  }
  return null;
}

async function gatewayChat(req, res, body) {
  const model = String(body.model || '').trim();
  const headerProvider = req.headers['x-provider'] ? String(req.headers['x-provider']) : '';
  if (!model) return send(res, 400, { error: { message: 'campo "model" é obrigatório' } });

  const provider = findProviderForModel(model, headerProvider);
  if (!provider) {
    return send(res, 404, {
      error: {
        message: `Nenhum provedor cadastrado atende o modelo "${model}". Cadastre um provedor com essa chave de API.`,
      },
    });
  }

  const base = normalizeBase(provider.baseUrl);
  const isAnthropic = provider.apiType === 'anthropic';
  const url = isAnthropic ? `${base}/messages` : `${base}/chat/completions`;
  const headers = { 'Content-Type': 'application/json' };
  if (isAnthropic) {
    headers['x-api-key'] = provider.apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers.Authorization = `Bearer ${provider.apiKey}`;
  }

  let upstream;
  const started = Date.now();
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
  } catch (err) {
    const msg =
      err.name === 'TimeoutError' || err.name === 'AbortError'
        ? 'Tempo limite excedido ao esperar o provedor'
        : `Falha ao contatar ${provider.name}: ${err.cause?.code || err.message}`;
    return send(res, 502, { error: { message: msg }, provider: provider.name });
  }

  const text = await upstream.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    /* corpo não-JSON */
  }

  if (upstream.ok) {
    const tokens = extractTokens(json) || { input: 0, output: 0 };
    state.recordUsage({
      providerId: provider.id,
      providerName: provider.name,
      model,
      input: tokens.input,
      output: tokens.output,
      source: 'gateway',
    });
  }

  res.writeHead(upstream.status, {
    'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  if (json) {
    // Anthropic → OpenAI shape (básico) para clientes OpenAI-compatíveis
    if (isAnthropic && !json.choices && Array.isArray(json.content)) {
      const textOut = json.content
        .map((c) => (c && c.type === 'text' ? c.text : ''))
        .join('');
      const conv = {
        id: json.id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: json.model || model,
        choices: [
          { index: 0, message: { role: 'assistant', content: textOut }, finish_reason: json.stop_reason || 'stop' },
        ],
        usage: {
          prompt_tokens: json.usage?.input_tokens || 0,
          completion_tokens: json.usage?.output_tokens || 0,
          total_tokens: (json.usage?.input_tokens || 0) + (json.usage?.output_tokens || 0),
        },
      };
      return res.end(JSON.stringify(conv));
    }
    return res.end(text);
  }
  return res.end(text || JSON.stringify({ error: { message: `HTTP ${upstream.status}` } }));
}

async function gatewayModels(res) {
  const providers = state.getProviders().filter((p) => p.apiKey && p.baseUrl);
  const data = [];
  const seen = new Set();
  for (const p of providers) {
    for (const m of p.models || []) {
      if (m && m.enabled === false) continue; // modelos ocultos ficam de fora
      const id = typeof m === 'string' ? m : m.name;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      data.push({ id, object: 'model', owned_by: p.name, provider: p.name });
    }
  }
  send(res, 200, { object: 'list', data });
}

/* ---------------------------------------------------------------- router */

async function handle(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const route = url.pathname;

  if (req.method === 'OPTIONS') return send(res, 204, {});

  // catálogo
  if (req.method === 'GET' && route === '/api/catalog') return send(res, 200, { catalog: CATALOG });

  // sincroniza provedores do frontend
  if (req.method === 'POST' && route === '/api/sync') {
    const body = await readBody(req);
    state.syncProviders(body.providers || []);
    return send(res, 200, { ok: true, count: (body.providers || []).length });
  }

  // resolve automático endpoint + modelos
  if (req.method === 'POST' && route === '/api/resolve') {
    const body = await readBody(req);
    const result = await resolveProvider(body);
    return send(res, 200, result);
  }

  // teste de um provedor (endpoint + modelos)
  if (req.method === 'POST' && route === '/api/test/provider') {
    const body = await readBody(req);
    const provider = body.provider || {};
    const result = await testProvider(provider, { includeModels: body.includeModels !== false });
    return send(res, 200, result);
  }

  // teste de um modelo específico
  if (req.method === 'POST' && route === '/api/test/model') {
    const body = await readBody(req);
    const result = await pingModel(body.provider || {}, body.model);
    return send(res, 200, { model: body.model, ...result });
  }

  // teste geral: todos os provedores + modelos
  if (req.method === 'POST' && route === '/api/test/all') {
    const body = await readBody(req);
    const providers = Array.isArray(body.providers) && body.providers.length ? body.providers : state.getProviders();
    const result = await testAll(providers);
    return send(res, 200, { results: result, testedAt: new Date().toISOString() });
  }

  // quota
  if (req.method === 'GET' && route === '/api/quota') {
    const result = await getQuota();
    return send(res, 200, result);
  }

  // consumo
  if (req.method === 'GET' && route === '/api/usage') {
    const period = url.searchParams.get('period') || '7d';
    const days = period === '28d' ? 28 : 7;
    return send(res, 200, { d7: state.usageStats(7), d28: state.usageStats(28), period: `${days}d` });
  }
  if (req.method === 'POST' && route === '/api/usage/clear') {
    state.clearUsage();
    return send(res, 200, { ok: true });
  }

  // gateway OpenAI-compatível
  if (req.method === 'GET' && route === '/v1/models') return gatewayModels(res);
  if (req.method === 'POST' && route === '/v1/chat/completions') {
    const body = await readBody(req);
    return gatewayChat(req, res, body);
  }

  send(res, 404, { error: `Rota não encontrada: ${route}` });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error('[server] erro:', err);
    if (!res.headersSent) send(res, 500, { error: err.message });
    else res.end();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[infinity] backend em http://localhost:${PORT}`);
  console.log(`[infinity] gateway OpenAI: http://localhost:${PORT}/v1/chat/completions`);
});
