/* Cliente do backend local (porta 3001 via proxy do dev server). */

async function request(path, options = {}, timeoutMs = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = { error: text.slice(0, 200) };
    }
    if (!res.ok) {
      const msg = (data && (data.error?.message || data.error)) || `HTTP ${res.status}`;
      throw new Error(typeof msg === 'string' ? msg : `HTTP ${res.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchCatalog() {
  return request('/api/catalog');
}

export function resolveProvider(payload) {
  return request('/api/resolve', { method: 'POST', body: JSON.stringify(payload) }, 30000);
}

export function testProviderServer(provider, includeModels = true) {
  return request(
    '/api/test/provider',
    { method: 'POST', body: JSON.stringify({ provider, includeModels }) },
    180000
  );
}

export function testModelServer(provider, model) {
  return request(
    '/api/test/model',
    { method: 'POST', body: JSON.stringify({ provider, model }) },
    60000
  );
}

export function testAllServer(providers) {
  return request(
    '/api/test/all',
    { method: 'POST', body: JSON.stringify({ providers }) },
    15 * 60 * 1000
  );
}

export function fetchUsage() {
  return request('/api/usage?period=7d', {}, 30000);
}

export function syncProviders(providers) {
  return request(
    '/api/sync',
    { method: 'POST', body: JSON.stringify({ providers }) },
    20000
  );
}
