import { useSyncExternalStore } from 'react';
import { uid } from './util';
import { testModelRequest } from './testing';
import { testProviderServer, testAllServer, syncProviders } from './api';

const KEY = 'infinity-forever/v1';

function emptyState() {
  return { providers: [], toasts: [], booted: true };
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.providers)) {
        return {
          providers: parsed.providers.map(normalizeProvider),
          toasts: [],
          booted: true,
        };
      }
    }
  } catch (e) {
    console.warn('Infinity Forever: falha ao ler dados locais', e);
  }
  return emptyState();
}

function normalizeProvider(p) {
  return {
    id: p.id || uid(),
    name: p.name || 'Provedor',
    prefix: p.prefix || '',
    catalogId: p.catalogId || '',
    baseUrl: p.baseUrl || '',
    apiKey: p.apiKey || '',
    apiType: p.apiType === 'anthropic' ? 'anthropic' : 'openai',
    color: p.color || '#8b5cf6',
    logoUrl: p.logoUrl || '',
    website: p.website || '',
    apiKeyUrl: p.apiKeyUrl || '',
    category: p.category || '',
    note: p.note || '',
    createdAt: p.createdAt || Date.now(),
    lastTestAt: p.lastTestAt || null,
    endpointStatus: p.endpointStatus || 'unknown',
    endpointMessage: p.endpointMessage || '',
    testing: false,
    models: Array.isArray(p.models) ? p.models.map(normalizeModel) : [],
  };
}

function normalizeModel(m) {
  return {
    id: m.id || uid(),
    name: m.name || '',
    enabled: m.enabled !== false,
    status: ['available', 'rate-limited', 'unavailable', 'unreachable', 'testing', 'error'].includes(m.status)
      ? m.status
      : 'unknown',
    capabilities: {
      thinking: !!(m.capabilities && m.capabilities.thinking),
      vision: !!(m.capabilities && m.capabilities.vision),
    },
    message: m.message || '',
    latency: typeof m.latency === 'number' ? m.latency : null,
    lastTestAt: m.lastTestAt || null,
    note: m.note || '',
    addedAt: m.addedAt || Date.now(),
  };
}

let state = loadState();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ providers: state.providers }));
  } catch (e) {
    console.warn('Infinity Forever: falha ao salvar dados locais', e);
  }
}

/* Sincroniza provedores com o backend (gateway) — automático a cada mudança. */
let syncTimer = null;
function scheduleSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncProviders(state.providers).catch((err) => {
      console.warn('Infinity Forever: backend indisponível para consumo', err.message);
    });
  }, 400);
}

function commit(next) {
  state = { ...state, ...next };
  persist();
  scheduleSync();
  listeners.forEach((l) => l());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

/* ------------------------------------------------------------------ toasts */
let toastSeq = 0;
export function toast(message, variant = 'default', detail = '') {
  const id = ++toastSeq;
  const item = { id, message, variant, detail };
  state = { ...state, toasts: [...state.toasts, item] };
  listeners.forEach((l) => l());
  setTimeout(() => dismissToast(id), 4200);
  return id;
}

export function dismissToast(id) {
  if (!state.toasts.some((t) => t.id === id)) return;
  state = { ...state, toasts: state.toasts.filter((t) => t.id !== id) };
  listeners.forEach((l) => l());
}

/* ---------------------------------------------------------------- providers */
export function addProvider(data) {
  const provider = normalizeProvider({ ...data, id: uid(), createdAt: Date.now() });
  commit({ providers: [...state.providers, provider] });
  return provider;
}

export function updateProvider(id, patch) {
  commit({
    providers: state.providers.map((p) => (p.id === id ? normalizeProvider({ ...p, ...patch }) : p)),
  });
}

export function deleteProvider(id) {
  commit({ providers: state.providers.filter((p) => p.id !== id) });
}

/* ------------------------------------------------------------------- models */
export function addModel(providerId, name, extra = {}) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  let created = null;
  commit({
    providers: state.providers.map((p) => {
      if (p.id !== providerId) return p;
      if (p.models.some((m) => m.name === clean)) return p;
      created = normalizeModel({ ...extra, name: clean, addedAt: Date.now() });
      return { ...p, models: [...p.models, created] };
    }),
  });
  return created;
}

export function addModelsBulk(providerId, names) {
  const list = Array.from(new Set(names.map((n) => String(n).trim()).filter(Boolean)));
  let added = 0;
  commit({
    providers: state.providers.map((p) => {
      if (p.id !== providerId) return p;
      const existing = new Set(p.models.map((m) => m.name));
      const fresh = list
        .filter((n) => !existing.has(n))
        .map((n) => normalizeModel({ name: n, addedAt: Date.now() }));
      added += fresh.length;
      return fresh.length ? { ...p, models: [...p.models, ...fresh] } : p;
    }),
  });
  return added;
}

export function updateModel(providerId, modelId, patch) {
  commit({
    providers: state.providers.map((p) => {
      if (p.id !== providerId) return p;
      return {
        ...p,
        models: p.models.map((m) => (m.id === modelId ? normalizeModel({ ...m, ...patch }) : m)),
      };
    }),
  });
}

export function deleteModel(providerId, modelId) {
  commit({
    providers: state.providers.map((p) =>
      p.id === providerId ? { ...p, models: p.models.filter((m) => m.id !== modelId) } : p
    ),
  });
}

export function toggleModelEnabled(providerId, modelId) {
  commit({
    providers: state.providers.map((p) =>
      p.id === providerId
        ? {
            ...p,
            models: p.models.map((m) => (m.id === modelId ? { ...m, enabled: !m.enabled } : m)),
          }
        : p
    ),
  });
}

/** Oculta/readiciona um modelo (continua no provedor, só sai/entra na aba "Seus modelos"). */
export function setModelEnabled(providerId, modelId, enabled) {
  commit({
    providers: state.providers.map((p) =>
      p.id === providerId
        ? {
            ...p,
            models: p.models.map((m) => (m.id === modelId ? { ...m, enabled: !!enabled } : m)),
          }
        : p
    ),
  });
}

/** Oculta de uma vez todos os modelos inativos (unavailable/unreachable/error). */
export function hideBrokenModels(providerId = null) {
  let changed = 0;
  commit({
    providers: state.providers.map((p) => {
      if (providerId && p.id !== providerId) return p;
      const models = p.models.map((m) =>
        m.enabled !== false && ['unavailable', 'unreachable', 'error'].includes(m.status)
          ? { ...m, enabled: false }
          : m
      );
      changed += models.filter((m, i) => m.enabled !== p.models[i].enabled).length;
      return models.some((m, i) => m.enabled !== p.models[i].enabled) ? { ...p, models } : p;
    }),
  });
  return changed;
}

/* -------------------------------------------------------------------- tests */
function setModelResult(providerId, modelId, result) {
  commit({
    providers: state.providers.map((p) => {
      if (p.id !== providerId) return p;
      return {
        ...p,
        models: p.models.map((m) =>
          m.id === modelId
            ? {
                ...m,
                status: result.status,
                message: result.message || '',
                latency: typeof result.latency === 'number' ? result.latency : null,
                capabilities: result.capabilities
                  ? { thinking: !!result.capabilities.thinking, vision: !!result.capabilities.vision }
                  : (m.capabilities || { thinking: false, vision: false }),
                lastTestAt: Date.now(),
              }
            : m
        ),
      };
    }),
  });
}

function setProviderTesting(providerId, testing) {
  commit({
    providers: state.providers.map((p) => (p.id === providerId ? { ...p, testing } : p)),
  });
}

function applyProviderTestResult(providerId, summary) {
  commit({
    providers: state.providers.map((p) => {
      if (p.id !== providerId) return p;
      const byName = new Map((summary.results || []).map((r) => [r.model, r]));
      return {
        ...p,
        endpointStatus: summary.endpoint ? summary.endpoint.status : p.endpointStatus,
        endpointMessage: summary.endpoint ? summary.endpoint.message || '' : p.endpointMessage,
        lastTestAt: Date.now(),
        testing: false,
        models: p.models.map((m) => {
          const r = byName.get(m.name);
          if (!r) {
            // modelo que ficou "pendurado" no modo teste volta para não testado
            return m.status === 'testing' ? { ...m, status: 'unknown', message: 'não testado' } : m;
          }
          return {
            ...m,
            status: r.status,
            message: r.message || '',
            latency: typeof r.latency === 'number' ? r.latency : null,
            capabilities: r.capabilities
              ? { thinking: !!r.capabilities.thinking, vision: !!r.capabilities.vision }
              : (m.capabilities || { thinking: false, vision: false }),
            lastTestAt: Date.now(),
          };
        }),
      };
    }),
  });
}

export async function runModelTest(providerId, modelId) {
  const provider = state.providers.find((p) => p.id === providerId);
  const model = provider && provider.models.find((m) => m.id === modelId);
  if (!provider || !model) return null;

  setModelResult(providerId, modelId, { status: 'testing', message: '' });
  const result = await testModelRequest(provider, model.name);
  setModelResult(providerId, modelId, result);
  return result;
}

/** Testa endpoint + todos os modelos do provedor (script no backend). */
export async function runProviderTest(providerId, { includeModels = true } = {}) {
  const provider = state.providers.find((p) => p.id === providerId);
  if (!provider) return null;

  setProviderTesting(providerId, true);
  if (includeModels) {
    commit({
      providers: state.providers.map((p) =>
        p.id === providerId
          ? { ...p, models: p.models.map((m) => ({ ...m, status: 'testing', message: '' })) }
          : p
      ),
    });
  }

  let summary;
  try {
    summary = await testProviderServer(provider, includeModels);
  } catch (err) {
    summary = {
      endpoint: { status: 'unreachable', message: err.message, latency: null },
      results: [],
      passed: 0,
      failed: 0,
      total: 0,
    };
  }
  applyProviderTestResult(providerId, summary);
  return summary;
}

/** Teste geral: todos os provedores + todos os modelos. */
export async function runGlobalTest() {
  const providers = state.providers;
  if (!providers.length) return null;
  commit({
    providers: providers.map((p) => ({
      ...p,
      testing: true,
      models: p.models.map((m) => ({ ...m, status: 'testing', message: '' })),
    })),
  });

  let payload;
  try {
    payload = await testAllServer(providers);
  } catch (err) {
    commit({
      providers: state.providers.map((p) => ({
        ...p,
        testing: false,
        endpointStatus: 'unreachable',
        endpointMessage: err.message,
      })),
    });
    throw err;
  }

  const byProvider = new Map((payload.results || []).map((r) => [r.providerId, r]));
  commit({
    providers: state.providers.map((p) => {
      const summary = byProvider.get(p.id);
      if (!summary) return { ...p, testing: false };
      const byName = new Map((summary.results || []).map((r) => [r.model, r]));
      return {
        ...p,
        testing: false,
        endpointStatus: summary.endpoint ? summary.endpoint.status : p.endpointStatus,
        endpointMessage: summary.endpoint ? summary.endpoint.message || '' : p.endpointMessage,
        lastTestAt: Date.now(),
        models: p.models.map((m) => {
          const r = byName.get(m.name);
          if (!r) {
            return m.status === 'testing' ? { ...m, status: 'unknown', message: 'não testado' } : m;
          }
          return {
            ...m,
            status: r.status,
            message: r.message || '',
            latency: typeof r.latency === 'number' ? r.latency : null,
            capabilities: r.capabilities
              ? { thinking: !!r.capabilities.thinking, vision: !!r.capabilities.vision }
              : (m.capabilities || { thinking: false, vision: false }),
            lastTestAt: Date.now(),
          };
        }),
      };
    }),
  });
  return payload;
}

/* -------------------------------------------------------------------- misc */
export function resetAll() {
  commit({ providers: [] });
}
