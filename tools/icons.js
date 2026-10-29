const p = require('puppeteer');
const CANDIDATES = ['gauge','speed','pie_chart','donut_small','query_stats','account_balance','trending_up','bar_chart','monitoring','dns','layers','bolt','storefront','key','calendar_month','date_range','deployed_code','science','link','tune','refresh','open_in_new','inbox','search_off','cloud_off','progress_activity','wifi_off','cancel','check_circle','help','error','storage','delete_sweep','menu','playlist_add','edit_note','add_circle','visibility','arrow_back','chevron_right','close','search','edit','delete','add','play_arrow','build','insights','doughnut','savings','payments','inventory_2','hub','api','cell_tower','router','signal_cellular_alt'];
(async () => {
  const b = await p.launch({ args: ['--no-sandbox'] });
  const pg = await b.newPage();
  await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
  await pg.evaluate(() => document.fonts.ready);
  const res = await pg.evaluate((cands) => {
    const out = {};
    for (const name of cands) {
      const s = document.createElement('span');
      s.className = 'material-symbols-outlined';
      s.textContent = name;
      s.style.fontSize = '24px';
      s.style.position = 'absolute';
      s.style.visibility = 'hidden';
      document.body.appendChild(s);
      out[name] = Math.round(s.getBoundingClientRect().width);
      s.remove();
    }
    // referência: string que não é ícone
    const s2 = document.createElement('span');
    s2.className = 'material-symbols-outlined';
    s2.textContent = 'zzzzn existe';
    s2.style.fontSize = '24px';
    s2.style.position = 'absolute';
    out.__ref = Math.round(s2.getBoundingClientRect().width);
    s2.remove();
    return out;
  }, CANDIDATES);
  const missing = Object.entries(res).filter(([k, v]) => k !== '__ref' && v > res.__ref * 0.9);
  console.log('ref (texto puro):', res.__ref);
  console.log('AUSENTES/quebrados:', missing.map(([k, v]) => `${k}(${v})`).join(', ') || 'nenhum');
  await b.close();
})();
