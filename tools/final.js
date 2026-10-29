const p = require('puppeteer');
const OUT = '/root/infinity-forever/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await p.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const pg = await b.newPage();
    await pg.setViewport({ width: 1600, height: 1000 });
    const errors = [];
    pg.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 200)));
    pg.on('console', (m) => {
      if (m.type() === 'error' && !/CORS|ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text().slice(0, 200));
    });

    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2', timeout: 40000 });
    await pg.evaluate(() => {
      const now = Date.now();
      const seed = {
        providers: [
          {
            id: 'seed-groq',
            name: 'Groq',
            catalogId: 'groq',
            prefix: '',
            baseUrl: 'https://api.groq.com/openai/v1',
            apiKey: 'gsk_seed_invalida',
            apiType: 'openai',
            color: '#F55036',
            website: 'https://groq.com',
            apiKeyUrl: 'https://console.groq.com/keys',
            createdAt: now,
            lastTestAt: now - 60000,
            endpointStatus: 'unavailable',
            endpointMessage: 'Autenticação recusada (HTTP 401)',
            models: [
              { id: 'm1', name: 'llama-3.3-70b-versatile', enabled: true, status: 'unavailable', message: 'HTTP 401 — chave recusada', latency: 412, lastTestAt: now - 60000 },
              { id: 'm2', name: 'llama-3.1-8b-instant', enabled: true, status: 'unavailable', message: 'HTTP 401 — chave recusada', latency: 388, lastTestAt: now - 60000 },
              { id: 'm3', name: 'qwen/qwen3-32b', enabled: false, status: 'unavailable', message: 'oculto na aba de modelos', latency: 400, lastTestAt: now - 60000 },
              { id: 'm4', name: 'openai/gpt-oss-120b', enabled: true, status: 'unknown', message: 'detectado automaticamente' },
            ],
          },
          {
            id: 'seed-mock',
            name: 'localhost:3099',
            catalogId: '',
            prefix: '',
            baseUrl: 'http://localhost:3099/v1',
            apiKey: 'mock-key-123',
            apiType: 'openai',
            color: '#8b5cf6',
            website: '',
            apiKeyUrl: '',
            createdAt: now,
            lastTestAt: now - 30000,
            endpointStatus: 'available',
            endpointMessage: 'GET /models respondeu HTTP 200 (19ms)',
            models: [
              { id: 'm5', name: 'mock-alpha', enabled: true, status: 'available', message: 'HTTP 200 — modelo respondeu (12ms)', latency: 12, lastTestAt: now - 30000 },
              { id: 'm6', name: 'mock-beta', enabled: true, status: 'available', message: 'HTTP 200 — modelo respondeu (9ms)', latency: 9, lastTestAt: now - 30000 },
              { id: 'm7', name: 'mock-gamma', enabled: true, status: 'available', message: 'HTTP 200 — modelo respondeu (11ms)', latency: 11, lastTestAt: now - 30000 },
              { id: 'm8', name: 'modelo-que-nao-existe', enabled: false, status: 'unavailable', message: 'modelo removido da lista', latency: null, lastTestAt: now - 30000 },
            ],
          },
        ],
      };
      localStorage.setItem('infinity-forever/v1', JSON.stringify(seed));
    });
    await pg.reload({ waitUntil: 'networkidle2' });
    await sleep(1200);

    const shots = [
      ['/dashboard/providers', 'final_providers'],
      ['/dashboard/modelos', 'final_modelos'],
      ['/dashboard/consumo', 'final_consumo'],
    ];
    for (const [url, name] of shots) {
      await pg.goto('http://localhost:3000' + url, { waitUntil: 'networkidle2', timeout: 40000 });
      await sleep(1800);
      await pg.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    }

    // detalhe do provedor com busca
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(900);
    await pg.evaluate(() => document.querySelector('h3').click());
    await sleep(1400);
    await pg.screenshot({ path: `${OUT}/final_detail.png`, fullPage: true });
    const search = await pg.$('input[placeholder*="Buscar modelo"]');
    if (search) {
      await search.type('mock');
      await sleep(600);
      await pg.screenshot({ path: `${OUT}/final_detail_search.png`, fullPage: true });
      await search.evaluate((el) => { el.value=''; el.dispatchEvent(new Event('input',{bubbles:true})); });
      await sleep(400);
    }

    // modal de resultado do teste geral
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(900);
    await pg.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /testar tudo/i.test(x.innerText));
      if (b) b.click();
    });
    await sleep(14000);
    await pg.screenshot({ path: `${OUT}/final_toast.png` });

    console.log('ERRORS:', errors.length);
    errors.slice(0, 10).forEach((e) => console.log(' -', e));
  } finally {
    await b.close();
  }
})().catch((e) => console.error('ERR', e.message));