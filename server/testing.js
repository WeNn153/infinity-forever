/**
 * Testes server-side de provedores e modelos.
 * Valida a chave com GET /models (ou probe),
 * e testa modelos com um chat completion mínimo (ping).
 * Sem CORS — fetch direto do Node.
 */
const { getCatalogEntry } = require('./catalog');
const state = require('./state');

/* Tempo de resposta curto + paralelismo: cada teste (modelo ou provedor)
 * termina em ~10s ou menos, mesmo com muitos modelos. */
const PROBE_TIMEOUT = 6000;
const MODEL_TIMEOUT = 7000;
const MODEL_CONCURRENCY = 8;
const PROVIDER_CONCURRENCY = 3;

/** Executa `fn` sobre `items` com no máximo `limit` em paralelo, mantendo a ordem. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = new Array(Math.max(1, Math.min(limit, items.length)))
    .fill(0)
    .map(async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        // eslint-disable-next-line no-await-in-loop
        out[i] = await fn(items[i], i);
      }
    });
  await Promise.all(workers);
  return out;
}

function classify(res, latency, detail) {
  const code = res.status;
  if (res.ok) return { status: 'available', message: `HTTP ${code}`, latency };
  if (code === 401 || code === 403)
    return { status: 'unavailable', message: `Autenticação recusada (HTTP ${code})`, latency };
  if (code === 404)
    return { status: 'unavailable', message: `Endpoint/modelo não encontrado (404)`, latency };
  if (code === 429)
    return { status: 'rate-limited', message: 'Ativo — rate limit (HTTP 429)', latency };
  if (code >= 500)
    return { status: 'unavailable', message: `Erro do servidor (HTTP ${code})`, latency };
  return {
    status: 'unavailable',
    message: detail ? `HTTP ${code}: ${detail}` : `HTTP ${code}`,
    latency,
  };
}

function shorten(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  try {
    const json = JSON.parse(clean);
    const msg = (json && (json.error?.message || json.message || json.error)) || clean;
    return String(typeof msg === 'string' ? msg : JSON.stringify(msg)).slice(0, 180);
  } catch (e) {
    return clean.slice(0, 180);
  }
}

async function shortBody(res) {
  try {
    return shorten(await res.text());
  } catch (e) {
    return '';
  }
}

function buildHeaders(provider) {
  const headers = { 'Content-Type': 'application/json' };
  const key = String(provider.apiKey || '').trim();
  if (provider.apiType === 'anthropic') {
    if (key) headers['x-api-key'] = key;
    headers['anthropic-version'] = '2023-06-01';
  } else if (key) {
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

function normalizeBase(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

/** GET /models — valida endpoint + chave e retorna a lista de modelos quando existir. */
async function probeModels(provider) {
  const base = normalizeBase(provider.baseUrl);
  if (!base) return { status: 'unavailable', message: 'Endpoint não configurado', latency: null, models: [] };

  const headers = buildHeaders(provider);
  const started = Date.now();
  let res;
  try {
    res = await fetch(`${base}/models`, { headers, signal: AbortSignal.timeout(PROBE_TIMEOUT) });
  } catch (err) {
    const msg = err.name === 'TimeoutError' || err.name === 'AbortError'
      ? `Sem resposta em ${PROBE_TIMEOUT / 1000}s (timeout)`
      : `Sem resposta — offline ou bloqueado: ${err.cause?.code || err.message}`;
    return { status: 'unreachable', message: msg, latency: null, models: [] };
  }
  const latency = Date.now() - started;

  if (!res.ok) {
    return { ...classify(res, latency, await shortBody(res)), models: [] };
  }

  let models = [];
  try {
    const data = await res.json();
    const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
    models = raw
      .map((m) => (typeof m === 'string' ? m : m?.id || m?.name || ''))
      .filter(Boolean);
  } catch (e) {
    /* corpo não-JSON: endpoint válido mas sem lista parseável */
  }
  return { status: 'available', message: `GET /models respondeu HTTP 200 (${latency}ms)`, latency, models };
}

/** Ping real de um modelo (chat completion mínimo). */
async function pingModel(provider, modelName) {
  const base = normalizeBase(provider.baseUrl);
  const model = String(modelName || '').trim();
  if (!base) return { status: 'unavailable', message: 'Endpoint não configurado', latency: null };
  if (!model) return { status: 'unavailable', message: 'Modelo sem identificador', latency: null };

  const headers = buildHeaders(provider);
  const isAnthropic = provider.apiType === 'anthropic';
  const url = isAnthropic ? `${base}/messages` : `${base}/chat/completions`;
  const bodyOpenAI = { model, max_tokens: 16, stream: false, messages: [{ role: 'user', content: 'oi' }] };
const body = isAnthropic
    ? { model, max_tokens: 16, messages: [{ role: 'user', content: 'oi' }] }
    : bodyOpenAI;
  const started = Date.now();
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(MODEL_TIMEOUT),
    });
  } catch (err) {
    const msg = err.name === 'TimeoutError' || err.name === 'AbortError'
      ? `Sem resposta em ${MODEL_TIMEOUT / 1000}s (timeout)`
      : `Sem resposta — offline ou bloqueado: ${err.cause?.code || err.message}`;
    return { status: 'unreachable', message: msg, latency: null };
  }
  const latency = Date.now() - started;
  const rawText = await res.text().catch(() => '');
  const detail = shorten(rawText);
  if (!res.ok) return classify(res, latency, detail);

  // 200: confirma que há conclusão/uso — alguns provedores devolvem 200 com corpo estranho
  let ok = true;
  let json = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    json = null;
  }
  if (json && typeof json === 'object') {
    const hasChoices = Array.isArray(json.choices) && json.choices.length > 0;
    const hasContent = Array.isArray(json.content) && json.content.length > 0;
    const hasError = !!json.error;
    if (hasError) ok = false;
    else if ('choices' in json && !hasChoices) ok = false;
    else if ('content' in json && !hasContent && !json.stop_reason) ok = false;
  }
  if (!ok) return { status: 'unavailable', message: detail || 'Resposta 200 sem conclusão', latency };

  const capabilities = { thinking: false, vision: false };

  if (json && typeof json === 'object') {
    const reasoning = json.usage?.completion_tokens_details?.reasoning_tokens;
    const text = JSON.stringify(json).slice(0, 4000);
    if (Number(reasoning) > 0 || /thinking|reasoning|thought/i.test(text)) {
      capabilities.thinking = true;
    }
  }
  // scanner real: tenta enviar uma imagem mínima (1x1 PNG) para detectar suporte a visão.
  // Executa sempre que o modelo respondeu texto, independentemente do nome.
  if (res.ok) {
    try {
      const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const vbody = isAnthropic
        ? {
            model,
            max_tokens: 4,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'oi' },
                  { type: 'image', source: { type: 'base64', media_type: 'image/png', data: tinyPng } },
                ],
              },
            ],
          }
        : {
            model,
            max_tokens: 4,
            stream: false,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'oi' },
                  { type: 'image_url', image_url: { url: `data:image/png;base64,${tinyPng}` } },
                ],
              },
            ],
          };
      const vr = await fetch(url, { method: 'POST', headers, body: JSON.stringify(vbody), signal: AbortSignal.timeout(MODEL_TIMEOUT) });
      const vtext = await vr.text().catch(() => '');
      let hadAnswer = false;
      if (vr.ok) {
        try {
          const vj = vtext ? JSON.parse(vtext) : null;
          if (vj) {
            const hasChoices = Array.isArray(vj.choices) && vj.choices.length > 0;
            const hasContent = Array.isArray(vj.content) && vj.content.length > 0;
            hadAnswer = hasChoices || hasContent || (!vj.error && (vj.response?.length || 0) > 0);
          } else { hadAnswer = true; }
        } catch (e) { hadAnswer = true; }
      }
      capabilities.vision = vr.ok && hadAnswer;
    } catch (e) {
      capabilities.vision = false;
    }
  }
  // Inferência adicional por nome ( fallback para provedores que não expõem rejeição tipada )
  if (!capabilities.vision && /vision|\bvl\b|gpt-?4o|gpt-4\.1|gemini|claude|pixtral|omni|llava|moondream|llama-?[34]\.\d+.*vision/i.test(modelName)) {
    capabilities.vision = true; // soft
  }

  // consumo do teste
  const u = (json && json.usage) || {};
  const input = Number(u.prompt_tokens ?? u.input_tokens ?? 0) || 0;
  const output = Number(u.completion_tokens ?? u.output_tokens ?? 0) || 0;
  if (input || output) {
    state.recordUsage({
      providerId: provider.id,
      providerName: provider.name || provider.catalogId || '',
      model,
      input,
      output,
      source: 'test',
    });
  }
  return { status: 'available', message: `HTTP 200 — modelo respondeu (${latency}ms)`, latency, capabilities };
}

/**
 * Resolve endpoint + modelos de um provedor a partir da API key.
 * Usa o catálogo quando houver entry; senão testa o baseUrl fornecido.
 * Retorna { baseUrl, apiType, models, endpoint: {status,...} }.
 */
async function resolveProvider({ catalogId, baseUrl, apiKey, apiType }) {
  const entry = catalogId ? getCatalogEntry(catalogId) : null;
  const provider = {
    baseUrl: normalizeBase(baseUrl) || (entry ? entry.baseUrl : ''),
    apiKey: String(apiKey || '').trim(),
    apiType: apiType || (entry ? entry.apiType : 'openai'),
    catalogId: entry ? entry.id : '',
  };
  if (!provider.baseUrl) {
    return {
      ok: false,
      error: 'Informe o endpoint ou escolha um provedor do catálogo.',
      baseUrl: '',
      apiType: provider.apiType,
      models: [],
      endpoint: { status: 'unavailable', message: 'Endpoint não configurado', latency: null },
    };
  }

  const probe = await probeModels(provider);
  const models = probe.models.length
    ? probe.models
    : entry
    ? entry.defaultModels
    : [];

  return {
    ok: probe.status === 'available',
    baseUrl: provider.baseUrl,
    apiType: provider.apiType,
    models,
    endpoint: { status: probe.status, message: probe.message, latency: probe.latency },
    listedModels: probe.models.length > 0,
  };
}

/** Testa endpoint + todos os modelos de um provedor (paralelo, ~10s no máximo). */
async function testProvider(provider, { includeModels = true } = {}) {
  const names =
    includeModels && Array.isArray(provider.models)
      ? provider.models.map((m) => (typeof m === 'string' ? m : m.name)).filter(Boolean)
      : [];

  // probe do endpoint e ping dos modelos rodam JUNTOS
  const [endpoint, results] = await Promise.all([
    probeModels(provider),
    mapLimit(names, MODEL_CONCURRENCY, async (name) => ({
      model: name,
      ...(await pingModel(provider, name)),
    })),
  ]);

  const passed = results.filter((r) => r.status === 'available').length;
  return {
    endpoint,
    results,
    passed,
    failed: results.length - passed,
    total: results.length,
    testedAt: new Date().toISOString(),
  };
}

/** Testa todos os provedores (endpoint + modelos) — provedores em paralelo. */
async function testAll(providers) {
  return mapLimit(providers, PROVIDER_CONCURRENCY, async (p) => {
    const summary = await testProvider(p, { includeModels: true });
    return { providerId: p.id, providerName: p.name, ...summary };
  });
}

module.exports = { probeModels, pingModel, resolveProvider, testProvider, testAll };
