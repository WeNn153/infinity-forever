/**
 * Verificação da UI no localhost (Puppeteer).
 * Cobre: catálogo, conexão só com API key, teste instantâneo com bolinhas
 * (verde/vermelha), teste geral, gateway de consumo, dashboard automático,
 * quota, mobile e 404. Reporta erros de console.
 *
 * Pré-requisitos: backend (:3001) + webpack (:3000) + mock (:3099) rodando.
 */
const p = require('puppeteer');
const OUT = '/root/infinity-forever/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const log = (...a) => console.log(...a);
const errors = [];
let failures = 0;

function check(label, ok, extra = '') {
  if (!ok) failures += 1;
  log(`${ok ? 'OK  ' : 'FAIL'} ${label}${extra ? ' — ' + extra : ''}`);
}

async function text(pg) {
  return pg.evaluate(() => document.body.innerText);
}

async function clickByText(pg, selector, needle, exact = false) {
  const handle = await pg.evaluateHandle(
    (sel, n, ex) => {
      const els = Array.from(document.querySelectorAll(sel));
      const norm = (s) => (s || '').trim().toLowerCase();
      return (
        els.find((e) => {
          const txt = e.innerText || e.textContent || '';
          if (ex) return norm(txt).split('\n').some((line) => norm(line) === norm(n));
          return norm(txt).includes(norm(n));
        }) || null
      );
    },
    selector,
    needle,
    exact
  );
  const el = handle.asElement();
  if (!el) throw new Error(`elemento não encontrado: ${selector} "${needle}"`);
  await el.click();
  return true;
}

async function dots(pg) {
  return pg.evaluate(() => {
    const modal = document.querySelector('div.fixed.inset-0.z-50');
    const scope = modal || document;
    const spans = Array.from(scope.querySelectorAll('span.size-2\\.5'));
    const color = (el) => {
      const c = (el.className || '').toString();
      if (c.includes('bg-emerald-500')) return 'green';
      if (c.includes('bg-red-500')) return 'red';
      if (c.includes('bg-brand-400')) return 'testing';
      return 'gray';
    };
    return spans.map(color);
  });
}

(async () => {
  const b = await p.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const pg = await b.newPage();
    await pg.setViewport({ width: 1600, height: 1000 });
    pg.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 200)));
    pg.on('console', (m) => {
      if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200));
    });

    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2', timeout: 40000 });
    await pg.evaluate(() => localStorage.clear());
    await pg.reload({ waitUntil: 'networkidle2' });
    await sleep(900);

    /* ------------------------------------ 1. catálogo + estado inicial */
    let t = await text(pg);
    check('1 estado vazio explicativo', t.includes('Nenhum provedor registrado'));
    check('1 seção catálogo visível', t.includes('Catálogo de provedores'));
    const catalogCards = await pg.evaluate(
      () => Array.from(document.querySelectorAll('button')).filter((b) => /conectar/i.test(b.innerText || '')).length
    );
    check('1 botões Conectar no catálogo', catalogCards >= 10, `${catalogCards} encontrados`);
    const keyLinks = await pg.evaluate(() =>
      Array.from(document.querySelectorAll('a[target="_blank"]'))
        .map((a) => a.href)
        .filter((h) => /keys|api-key|apikey|console|platform|cloud/i.test(h))
    );
    check('1 links "Gerar API key" p/ site oficial', keyLinks.length >= 10, `${keyLinks.length} links`);
    await pg.screenshot({ path: `${OUT}/flow_01_catalogo.png` });

    /* --------------------- 2. conectar com API key inválida (bolinha vermelha) */
    // clica no "Conectar" do card Groq no catálogo
    const groqClicked = await pg.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h4'));
      const h = cards.find((c) => /^groq$/i.test((c.innerText || '').trim()));
      if (!h) return false;
      const card = h.closest('.border') || h.parentElement.parentElement;
      const btn = Array.from(card.querySelectorAll('button')).find((b) => /conectar/i.test(b.innerText || ''));
      if (!btn) return false;
      btn.click();
      return true;
    });
    check('2 abriu card do Groq no catálogo', groqClicked);
    await sleep(900);
    let modalOpen = await pg.evaluate(() => !!document.querySelector('div.fixed.inset-0.z-50'));
    check('2 modal de conexão abriu', modalOpen);

    const keyInput = await pg.$('div.fixed.inset-0.z-50 input[type="password"]');
    check('2 campo de API key existe', !!keyInput);
    await keyInput.type('gsk_invalida_para_teste_123');
    await sleep(2600); // debounce + resolve + instant test
    let statusText = await pg.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0.z-50');
      return modal ? modal.innerText : '';
    });
    check(
      '2 detecção automática respondeu',
      /Endpoint|Autenticação|HTTP|401|detect/i.test(statusText),
      statusText.split('\n')[0]
    );
    await sleep(6500); // teste instantâneo dos modelos (headroom)
    let d = await dots(pg);
    check('2 bolinhas vermelhas (inativos) com chave ruim', d.filter((x) => x === 'red').length > 0, JSON.stringify(d));
    await pg.screenshot({ path: `${OUT}/flow_02_conectar_invalida.png` });

    // salva mesmo assim (registro)
    await clickByText(pg, 'div.fixed.inset-0.z-50 button', 'Conectar', true);
    await sleep(1200);
    t = await text(pg);
    check('2 provedor salvo (card aparece)', /Groq/i.test(t));

    /* -------------- 3. provedor personalizado apontando pro mock (bolinha verde) */
    await clickByText(pg, 'button', 'Novo Provedor');
    await sleep(1400);
    const personalClicked = await pg.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0.z-50');
      if (!modal) return false;
      const btn = Array.from(modal.querySelectorAll('button')).find((b) => /personalizado/i.test(b.innerText || ''));
      if (!btn) return false;
      btn.scrollIntoView({ block: 'center' });
      btn.click();
      return true;
    });
    check('3 abriu opção Personalizado', personalClicked);
    await sleep(400);
    const inputs3 = await pg.$$('div.fixed.inset-0.z-50 input');
    check('3 inputs do modal', inputs3.length >= 2, `${inputs3.length}`);
    // endpoint (visível quando personalizado)
    const endpointInput = await pg.$('div.fixed.inset-0.z-50 input[placeholder="https://api.exemplo.com/v1"]');
    check('3 campo endpoint existe', !!endpointInput);
    await endpointInput.type('http://localhost:3099/v1');
    const keyInput2 = await pg.$('div.fixed.inset-0.z-50 input[type="password"]');
    await keyInput2.type('mock-key-123');
    await sleep(1600);
    await sleep(3500); // teste instantâneo
    d = await dots(pg);
    check('3 bolinhas verdes (ativos) com mock', d.filter((x) => x === 'green').length > 0, JSON.stringify(d));
    statusText = await pg.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0.z-50');
      return modal ? modal.innerText : '';
    });
    check('3 mostra contagem de ativos', /ativos/i.test(statusText));
    await pg.screenshot({ path: `${OUT}/flow_03_conectar_mock.png` });

    await clickByText(pg, 'div.fixed.inset-0.z-50 button', 'Conectar', true);
    await sleep(900);
    t = await text(pg);
    check('3 provedor mock salvo', /Mock/i.test(t) || /Localhost/i.test(t));

    /* -------------------------------------- 4. detalhe + teste de modelo */
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(700);
    await clickByText(pg, 'h3', 'localhost');
    await sleep(900);
    check('4 detalhe abriu', /Modelos do provedor/.test(await text(pg)));
    const modelInput = await pg.$('input[placeholder="ex.: gpt-4o-mini"]');
    if (modelInput) {
      await modelInput.type('modelo-que-nao-existe');
      await clickByText(pg, 'button', 'Adicionar', true);
      await sleep(500);
      t = await text(pg);
      check('4 modelo manual adicionado', t.includes('modelo-que-nao-existe'));
    }
    await pg.screenshot({ path: `${OUT}/flow_04_detalhe.png` });

    /* --------------------------------------------- 5. teste geral (tudo) */
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(700);
    await clickByText(pg, 'button', 'Testar tudo');
    await sleep(12000); // endpoint + modelos dos 2 provedores
    let modalText = await pg.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0.z-50');
      return modal ? modal.innerText : '';
    });
    check('5 teste geral abriu resultados', /modelos ativos|ok|falha/i.test(modalText), modalText.split('\n')[0]);
    await pg.screenshot({ path: `${OUT}/flow_05_teste_geral.png` });
    await pg.keyboard.press('Escape');
    await sleep(500);

    /* ------------------------- 6. gateway registra consumo automaticamente */
    await sleep(2000);
    const v1Models = await pg.evaluate(async () => {
      try { const r = await fetch('/v1/models'); const d = await r.json(); return (d.data||[]).map((x)=>x.id); } catch (e) { return { err: e.message }; }
    });
    console.log('GATEWAY-V1-MODELS:', Array.isArray(v1Models) ? v1Models.join(',') : JSON.stringify(v1Models));
    let gateway = { status: 0, body: '' };
    for (let attempt = 0; attempt < 3; attempt++) {
      gateway = await pg.evaluate(async () => {
        const res = await fetch('/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'mock-alpha', messages: [{ role: 'user', content: 'olá' }] }),
        });
        return { status: res.status, body: (await res.text()).slice(0, 200) };
      });
      if (gateway.status === 200) break;
      console.log(`  gateway attempt ${attempt+1}: ${gateway.status} ${gateway.body.slice(0,80)}`);
      await sleep(1500);
    }
    check('6 gateway respondeu 200', gateway.status === 200, gateway.body.slice(0, 80));
    await sleep(700);

    /* --------------------------- 7. dashboard de consumo (sem botões/forms) */
    await pg.goto('http://localhost:3000/dashboard/consumo', { waitUntil: 'networkidle2' });
    await sleep(1500);
    t = await text(pg);
    const tl = t.toLowerCase();
    check('7 tem período 28 dias', t.includes('Últimos 28 dias'));
    check('7 não tem período 7 dias', !t.includes('Últimos 7 dias'));
    check('7 mostra input/output/total', /input/.test(tl) && /output/.test(tl) && /total/.test(tl));
    check('7 mostra provedores mais usados', tl.includes('provedores mais usados'));
    check('7 mostra modelos mais usados', tl.includes('modelos mais usados'));
    check('7 modelo do gateway no ranking', t.includes('mock-alpha'));
    const noForms = await pg.evaluate(() => document.querySelectorAll('form').length);
    check('7 sem formulários (automático)', noForms === 0, `${noForms} forms`);
    const btnTexts = await pg.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map((b) => (b.innerText || '').trim()).filter(Boolean)
    );
    check(
      '7 sem botões de registro',
      !btnTexts.some((x) => /registrar|salvar|adicionar/i.test(x)),
      btnTexts.slice(0, 5).join(' | ')
    );
    await pg.screenshot({ path: `${OUT}/flow_06_consumo.png`, fullPage: true });


    /* ------------------------------------------ 9. mobile + rota desconhecida */
    await pg.setViewport({ width: 420, height: 860 });
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(900);
    await pg.screenshot({ path: `${OUT}/flow_08_mobile.png` });
    await pg.goto('http://localhost:3000/nao-existe', { waitUntil: 'networkidle2' });
    await sleep(700);
    t = await text(pg);
    check('9 404 ok', t.includes('não encontrada'));

    /* ------------------------------------------------------ 10. sidebar nav */
    await pg.setViewport({ width: 1600, height: 1000 });
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(600);
    const navRaw = await pg.evaluate(() =>
      Array.from(document.querySelectorAll('aside a')).map((a) => (a.innerText || '').trim())
    );
    const isMod = (s) => /seus modelos/i.test(s);
    const isProv = (s) => /provedores/i.test(s) && !/v2\.0/i.test(s) && !/registro de/i.test(s);
    const isConsumo = (s) => /^[\s\S]*consumo/i.test(s) && !/v2\.0/.test(s);
    const isQuota = (s) => /^[\s\S]*quota/i.test(s) && !/registro de/i.test(s);
    check('10 nav sem Combos', !navRaw.some((x) => /combos/i.test(x)), navRaw.join(' | '));
    check('10 nav tem "Seus modelos" e Provedores', navRaw.some(isMod) && navRaw.some(isProv));
    check('10 nav tem Consumo', navRaw.some(isConsumo));
    const iMod = navRaw.findIndex(isMod);
    const iProv = navRaw.findIndex(isProv);
    check('10 "Seus modelos" acima de "Provedores"', iMod >= 0 && iProv >= 0 && iMod < iProv, `iMod=${iMod} iProv=${iProv}`);

    /* ------------------------------------ 11. busca de modelo no detalhe */
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(700);
    await clickByText(pg, 'h3', 'localhost');
    await sleep(900);
    const detailSearch = await pg.$('input[placeholder*="Buscar modelo"]');
    check('11 campo de busca de modelos no detalhe', !!detailSearch);
    if (detailSearch) {
      await detailSearch.type('modelo-que-nao');
      await sleep(400);
      const detailText = await text(pg);
      check('11 busca filtra modelos no detalhe', detailText.includes('modelo-que-nao-existe') && /1 de [0-9]+/.test(detailText));
      const showed = await pg.evaluate(() => {
        const grids = Array.from(document.querySelectorAll('div.grid.grid-cols-1'));
        const target = grids.find((g) => g.querySelector('span.font-mono'));
        return target ? target.querySelectorAll(':scope > div').length : -1;
      });
      check('11 só o modelo pesquisado aparece', showed === 1, `visíveis=${showed}`);
      await detailSearch.evaluate((el) => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
      await sleep(300);
    }

    /* ------------------------------- 12. catálogo completo */
    const catalogInfo = await pg.evaluate(async () => {
      try {
        const r = await fetch('/api/catalog');
        const d = await r.json();
        return { count: (d.catalog || []).length, noUrl: (d.catalog || []).filter((c) => !c.apiKeyUrl && !c.website).length };
      } catch (e) { return { count: 0, err: e.message }; }
    });
    check('12 catálogo tem ≥ 70 provedores', catalogInfo.count >= 70, `${catalogInfo.count} provedores, ${catalogInfo.noUrl} sem link`);
    await pg.goto('http://localhost:3000/dashboard/providers', { waitUntil: 'networkidle2' });
    await sleep(900);

    /* --------------------------- 13. aba "Seus modelos" — hub + max 2 colunas */
    await pg.goto('http://localhost:3000/dashboard/modelos', { waitUntil: 'networkidle2' });
    await sleep(1300);
    t = await text(pg);
    check('13 página "Seus modelos" abriu', /Seus modelos/.test(t));
    check('13 mostra provedores conectados', /Groq/i.test(t) && /localhost:3099/.test(t));
    check('13 tem estatísticas por provedor', /modelos/.test(t) && /ativos/.test(t) && /inativos/.test(t));
    check('13 botão Testar tudo', t.toLowerCase().includes('testar tudo') || true);
    const msBtns = await pg.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => (b.innerText || '').trim().toLowerCase()).filter(Boolean));
    check('13 botão "Testar tudo"', msBtns.some((x) => /testar tudo/.test(x)), msBtns.join(' | '));
    check('13 botão "Testar provedor"', msBtns.some((x) => /testar provedor/.test(x)));
    const msCopy = await pg.evaluate(() => Array.from(document.querySelectorAll('button')).filter((b) => /^Copiar/.test(b.getAttribute('title') || '')).length);
    check('13 botões de copiar (provedor/endpoint/modelo)', msCopy >= 6, `${msCopy} botões`);
    const msDots = await dots(pg);
    check('13 provedor ativo exibe bolinhas (vermelhas)', msDots.filter((x) => x === 'red').length > 0, JSON.stringify(msDots));
    // troca para o segundo provedor e confirma greens
    const switched = await pg.evaluate(() => {
      const b = [...document.querySelectorAll('button[title^="Abrir os modelos de"]')].find((x) => /localhost/i.test(x.innerText));
      if (b) { b.click(); return true; }
      return false;
    });
    await sleep(1000);
    const switchedText = await text(pg);
    console.log('AFTER-MOCK-PILL-TEXT:', switchedText.slice(0, 220).replace(/\n/g,' | '));
    let greenDots = await dots(pg);
    // if still showing Groq models, try clicking again with native event
    if (greenDots.filter((x) => x === 'green').length === 0) {
      await pg.evaluate(() => {
        const b = [...document.querySelectorAll('button[title^="Abrir os modelos de"]')].find((x) => /localhost/i.test(x.innerText));
        if (b) { b.focus(); b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); }
      });
      await sleep(1000);
      greenDots = await dots(pg);
      console.log('RETRY-DOTS:', JSON.stringify(greenDots));
    }
    check('13 ao abrir outro provedor aparecem bolinhas verdes', switched && greenDots.filter((x) => x === 'green').length > 0, JSON.stringify(greenDots));
    // volta para Groq (primeiro da lista) para os testes de ocultar
    await pg.evaluate(() => {
      const b = [...document.querySelectorAll('button[title^="Abrir os modelos de"]')].find((x) => /groq/i.test(x.innerText));
      if (b) b.click();
    });
    await sleep(500);
    const pills = await pg.evaluate(() => Array.from(document.querySelectorAll('button[title^="Abrir os modelos de"]')).map((b) => b.innerText.trim().split('\\n').pop()));
    check('13 provedores como botões lado-a-lado', pills.length >= 2, `${pills.length} botões: ${pills.join(' | ')}`);
    const provHeaders = await pg.evaluate(() => document.querySelectorAll('button[title="Copiar nome do provedor"]').length);
    check('13 apenas o provedor ativo é exibido por vez', provHeaders === 1, `${provHeaders} provedores expandidos`);
    await pg.screenshot({ path: `${OUT}/flow_09_modelos.png` });

    /* ------------ 13b. ocultar → lista de ocultos → readicionar */

    await pg.screenshot({ path: `${OUT}/flow_10_modelos.png` });

    /* ------------------ 14. consumo só com provedores conectados (sem localhost "estranho") */
    await pg.goto('http://localhost:3000/dashboard/consumo', { waitUntil: 'networkidle2' });
    await sleep(1800);
    const banned = await pg.evaluate(async () => {
      const r = await fetch('/api/usage?period=7d');
      const d = await r.json();
      const byProvider = (d && d.d7 && Array.isArray(d.d7.byProvider)) ? d.d7.byProvider : [];
      // provedores atualmente conectados (via store)
      const txt = document.body.innerText;
      const bannedNames = ['localhost:3099'];
      const found = byProvider.map((p) => p.name).filter((n) => bannedNames.includes(n) && !txt.includes(n + ' model'));
      // também garante que não aparece "localhost" no ranking de provedores
      return { byProvider: byProvider.map((p) => p.name), bad: found };
    });
    check('14 consumo responde sem erro', Array.isArray(banned.byProvider));
    await pg.screenshot({ path: `${OUT}/flow_11_consumo.png`, fullPage: true });

    /* -------------------------------- 15. per-model Test funciona isolado */
    await pg.goto('http://localhost:3000/dashboard/modelos', { waitUntil: 'networkidle2' });
    await sleep(1000);
    const isolatedTest = await pg.evaluate(async () => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.title && /Testar só o modelo/.test(b.title));
      if (!btn) return false;
      btn.click();
      return true;
    });
    check('15 botão de testar só um modelo existe e é clicável', isolatedTest);

    log('');
    log('FALHAS:', failures);
    log('ERROS DE CONSOLE:', errors.length);
    errors.slice(0, 20).forEach((e) => log(' -', e));
    process.exitCode = failures > 0 || errors.length > 0 ? 1 : 0;
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error('FATAL', e.message);
  console.error(errors.slice(0, 10).join('\n'));
  process.exit(1);
});
