const p = require('puppeteer');
const OUT = '/root/infinity-forever/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await p.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const pg = await b.newPage();
    await pg.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
    const errors = [];
    pg.on('console', (m) => {
      if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300));
    });
    pg.on('pageerror', (e) => errors.push('pageerror: ' + String(e.message).slice(0, 300)));

    const shots = [
      ['/dashboard/providers', 'app_providers'],
      ['/dashboard/consumo', 'app_consumo'],
      ['/dashboard/modelos', 'app_modelos'],
    ];
    for (const [url, name] of shots) {
      await pg.goto('http://localhost:3000' + url, { waitUntil: 'networkidle2', timeout: 40000 });
      await sleep(1500);
      await pg.screenshot({ path: `${OUT}/${name}.png` });
      console.log('shot', name, '->', pg.url());
    }

    console.log('ERRORS:', errors.length);
    errors.slice(0, 15).forEach((e) => console.log(' -', e));
  } finally {
    await b.close();
  }
})().catch((e) => console.error('ERR', e.message));
