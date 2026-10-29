import React, { useEffect, useMemo, useState } from 'react';
import Topbar from '../components/Topbar';
import { Badge, Button, Card, CopyButton, EmptyState, Spinner } from '../components/ui';
import { ProviderLogo } from '../components/Brand';
import { StatusBadge, HubExplainModal, TestResultsModal } from '../components/Status';
import { Link } from '../router';
import { useStore, addModel, runModelTest, runProviderTest, toast } from '../lib/store';
import { cn, maskKey } from '../lib/util';

const STATUS_RANK = { available: 0, testing: 1, unknown: 2, 'rate-limited': 3, unavailable: 4, unreachable: 5, error: 6 };

function sortModels(models) {
  return [...models].sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) || a.name.localeCompare(b.name));
}

function Dot({ status }) {
  const color =
    status === 'available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.75)]' :
    status === 'testing' ? 'bg-brand-400 animate-pulse' :
    status === 'rate-limited' ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]' :
    status === 'unavailable' || status === 'unreachable' || status === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' :
    'bg-gray-500';
  return <span className={cn('size-2.5 rounded-full shrink-0', color)} aria-hidden="true" />;
}

function ModelLine({ provider, model, onExplain }) {
  const [busy, setBusy] = useState(false);
  const test = async () => {
    setBusy(true);
    const res = await runModelTest(provider.id, model.id);
    setBusy(false);
    if (res) {
      toast(
        `${model.name}: ${res.status === 'available' ? 'online' : res.status === 'rate-limited' ? 'rate limit' : 'offline'}`,
        res.status === 'available' ? 'success' : 'error',
        res.message
      );
    }
  };
  const ok = model.status === 'available';

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-[10px] border px-2.5 py-1.5 min-w-0 transition-colors',
        ok && 'border-emerald-500/25 bg-emerald-500/[0.04]',
        model.status === 'rate-limited' && 'border-amber-500/25 bg-amber-500/[0.04]',
        ['unavailable', 'unreachable', 'error'].includes(model.status) && 'border-red-500/25 bg-red-500/[0.04]',
        model.status === 'testing' && 'border-primary/40',
        model.status === 'unknown' && 'border-border-subtle bg-surface-2/40'
      )}
      title={model.message || model.name}
    >
      <button type="button" onClick={() => onExplain && onExplain(model.status)} className="shrink-0 rounded-full bg-transparent border-0 p-0 cursor-pointer">
        <Dot status={model.status} />
      </button>
      <span className="font-mono text-xs text-text-main truncate flex-1 min-w-0">{model.name}</span>
      {model.status === 'rate-limited' && <span className="text-[10px] uppercase font-semibold text-amber-400 bg-amber-400/10 rounded px-1.5 py-0.5 shrink-0">rate limit</span>}
      {model.capabilities && model.capabilities.thinking && (
        <span title="Thinking/reasoning" className="material-symbols-outlined text-[13px] shrink-0 text-amber-400">lightbulb</span>
      )}
      {model.capabilities && model.capabilities.vision && (
        <span title="Vision" className="material-symbols-outlined text-[13px] shrink-0 text-sky-400">visibility</span>
      )}
      {typeof model.latency === 'number' && model.latency > 0 && (
        <span className={cn('hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0', ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
          {model.latency}ms
        </span>
      )}
      <CopyButton value={model.name} label={`Copiar modelo ${model.name}`} />
      <Button size="xs" variant="purple" icon="science" loading={busy || model.status === 'testing'} onClick={test} title={`Testar só o modelo ${model.name}`} />
    </div>
  );
}

function ProviderBlock({ provider, query, onExplain }) {
  const [busy, setBusy] = useState(false);
  const [newModel, setNewModel] = useState('');
  const visible = useMemo(() => sortModels(provider.models), [provider.models]);
  const q = query.trim().toLowerCase();
  const shown = q ? visible.filter((m) => m.name.toLowerCase().includes(q) || provider.name.toLowerCase().includes(q)) : visible;
  const active = visible.filter((m) => m.status === 'available').length;
  const inactive = visible.filter((m) => ['unavailable', 'unreachable', 'error'].includes(m.status)).length;
  const rateLimited = visible.filter((m) => m.status === 'rate-limited').length;

  const testProvider = async () => {
    setBusy(true);
    const summary = await runProviderTest(provider.id);
    setBusy(false);
    if (summary) {
      toast(`${provider.name}: ${summary.passed}/${summary.total} modelos online`, summary.passed ? 'success' : 'error', summary.endpoint ? summary.endpoint.message : '');
    }
    return summary;
  };
  const submit = (e) => {
    if (e) e.preventDefault();
    const created = addModel(provider.id, newModel);
    if (created) { toast(`Modelo "${created.name}" adicionado ao ${provider.name}`, 'success'); setNewModel(''); }
    else if (newModel.trim()) toast('Esse modelo já está registrado neste provedor', 'warning');
  };

  return (
    <Card padding="sm" className="flex flex-col gap-3 min-w-0">
      <div className="flex items-start gap-2.5 min-w-0">
        <ProviderLogo provider={provider} size={26} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link to={`/dashboard/providers/${provider.id}`} className="truncate font-semibold text-text-main hover:text-brand-300 transition-colors">{provider.name}</Link>
            <CopyButton value={provider.name} label="Copiar nome do provedor" />
          </div>
          <div className="flex items-center gap-1 min-w-0 mt-0.5">
            <code className="font-mono text-[11px] text-text-muted truncate min-w-0" title={provider.baseUrl}>{provider.baseUrl || 'sem endpoint'}</code>
            {provider.baseUrl && <CopyButton value={provider.baseUrl} label="Copiar endpoint" />}
          </div>
          {provider.apiKey && (
            <div className="flex items-center gap-1 min-w-0">
              <code className="font-mono text-[11px] text-text-muted truncate min-w-0">{maskKey(provider.apiKey)}</code>
              <CopyButton value={provider.apiKey} label="Copiar API key" />
            </div>
          )}
        </div>
        <StatusBadge status={provider.endpointStatus} onClick={() => onExplain && onExplain(provider.endpointStatus)} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge size="sm" icon="deployed_code">{provider.models.length} modelos</Badge>
        <Badge size="sm" variant="success" dot>{active} ativos</Badge>
        <Badge size="sm" variant="error" dot>{inactive} inativos</Badge>
        <Badge size="sm" variant="warning" dot>{rateLimited} rate limites</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="purple" icon="science" loading={busy || provider.testing} onClick={testProvider} title={`Testar só o provedor ${provider.name}`} className="flex-1">Testar provedor</Button>
        <Link to={`/dashboard/providers/${provider.id}`} className="inline-flex items-center justify-center gap-1.5 h-7 px-3 text-xs font-semibold rounded-[8px] border border-border text-text-main hover:bg-surface-2 hover:border-brand-500/50 transition-all shrink-0" title="Adicionar modelos no provedor">
          <span className="material-symbols-outlined text-[15px]">edit</span>
          Modelos
        </Link>
      </div>

      <div className="flex flex-col gap-1.5">
        {shown.length === 0 ? (
          <p className="text-xs text-text-muted py-2 text-center border border-dashed border-border rounded-[10px]">Nenhum modelo registrado.</p>
        ) : shown.map((m) => <ModelLine key={m.id} provider={provider} model={m} onExplain={onExplain} />)}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="adicionar modelo…" aria-label={`Adicionar modelo em ${provider.name}`} className="flex-1 min-w-0 h-7 px-2.5 rounded-[8px] bg-surface-2 border border-transparent font-mono text-xs text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all" />
        <Button size="xs" variant="secondary" icon="add" type="submit" disabled={!newModel.trim()}>Add</Button>
      </form>
    </Card>
  );
}

export default function ModelosPage() {
  const store = useStore();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(null);
  const activeProvider = useMemo(() => store.providers.find((p) => p.id === activeId) || store.providers[0] || null, [store.providers, activeId]);
  useEffect(() => { if (activeId && !store.providers.some((p) => p.id === activeId)) setActiveId(null); }, [activeId, store.providers]);
  const [testingAll, setTestingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [explainItem, setExplainItem] = useState(null);

  const stats = useMemo(() => {
    let total = 0, active = 0, inactive = 0, rateLimited = 0;
    for (const p of store.providers) for (const m of p.models) {
      total++;
      if (m.status === 'available') active++;
      else if (['unavailable', 'unreachable', 'error'].includes(m.status)) inactive++;
      else if (m.status === 'rate-limited') rateLimited++;
    }
    return { total, active, inactive, rateLimited };
  }, [store.providers]);

  const testAll = async () => {
    if (!store.providers.length) { toast('Cadastre ao menos um provedor para testar', 'warning'); return; }
    setTestingAll(true); setProgress(0);
    try {
      const rows = []; let passed = 0, total = 0;
      for (let i = 0; i < store.providers.length; i++) {
        const p = store.providers[i];
        // eslint-disable-next-line no-await-in-loop
        const summary = await runProviderTest(p.id);
        if (summary) {
          rows.push({ model: summary.providerName || p.name, status: summary.passed > 0 ? 'available' : (summary.total > 0 ? 'unavailable' : summary.endpoint.status), message: `${summary.passed}/${summary.total} modelos online`, latency: summary.endpoint ? summary.endpoint.latency : null });
          passed += summary.passed || 0;
          total += summary.total || 0;
        }
        setProgress(Math.round(((i + 1) / store.providers.length) * 100));
      }
      setResults({ title: 'Teste geral — todos os provedores e modelos', endpoint: null, results: rows, passed, failed: total - passed, total });
      toast(`Teste geral: ${passed}/${total} modelos online`, passed ? 'success' : 'error');
    } catch (err) { toast('Teste geral falhou', 'error', err.message); }
    finally { setTestingAll(false); setTimeout(() => setProgress(0), 1500); }
  };

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <Topbar icon="hub" title="Seus modelos" description="Hub de todos os modelos dos provedores conectados — copie, teste e filtre online/offline." actions={
        <div className="flex items-center gap-2">
          <div className="relative w-[140px] sm:w-[220px] hidden sm:block">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px] pointer-events-none">search</span>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar modelo ou provedor…" aria-label="Buscar modelo ou provedor" className="w-full h-8 pl-7 pr-7 rounded-lg border border-border bg-surface/70 text-sm text-text-main placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50 transition-colors" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca" className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 rounded"><span className="material-symbols-outlined text-[16px]">close</span></button>}
          </div>
          <Button size="sm" variant="primary" icon="bolt" loading={testingAll} disabled={!store.providers.length} onClick={testAll} title="Testar todos os provedores e modelos de uma vez">
            <span className="hidden sm:inline">Testar tudo</span>
          </Button>
        </div>
      } />

      <div className="flex flex-wrap items-center gap-2 -mt-2">
        <Badge icon="dns">{store.providers.length} provedores</Badge>
        <Badge icon="deployed_code">{stats.total} modelos</Badge>
        <Badge variant="success" dot>{stats.active} ativos</Badge>
        <Badge variant="error" dot>{stats.inactive} offline</Badge>
        <Badge variant="warning" dot>{stats.rateLimited} rate limites</Badge>
        {testingAll && <span className="inline-flex items-center gap-1.5 text-xs text-text-muted"><Spinner size={14} /> testando…</span>}
      </div>

      {testingAll && (
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-mono text-text-muted shrink-0">{progress}%</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle text-[11px]">
        <span className="text-text-muted uppercase font-semibold mr-1">O que isso significa?</span>
        {[
          ['available', 'Online'],
          ['rate-limited', 'Rate limit'],
          ['unavailable', 'Offline'],
        ].map(([st, label]) => (
          <button type="button" key={st} onClick={() => setExplainItem(st)} className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-main cursor-pointer">
            <Dot status={st} />
            <span className="uppercase font-semibold">{label}</span>
          </button>
        ))}
        <button type="button" onClick={() => setExplainItem('thinking')} className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-main cursor-pointer" title="clique para explicar">
          <span className="material-symbols-outlined text-[14px] shrink-0 text-amber-400">lightbulb</span>
          <span className="uppercase font-semibold">Thinking</span>
        </button>
        <button type="button" onClick={() => setExplainItem('vision')} className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-main cursor-pointer" title="clique para explicar">
          <span className="material-symbols-outlined text-[14px] shrink-0 text-sky-400">visibility</span>
          <span className="uppercase font-semibold">Vision</span>
        </button>
      </div>

      {store.providers.length === 0 ? (
        <EmptyState icon="hub" title="Nenhum provedor conectado" description="Registre um provedor com sua API key e todos os modelos dele aparecem aqui, organizados por provedor." action={<Link to="/dashboard/providers"><Button icon="add">Conectar provedor</Button></Link>} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {store.providers.map((p) => {
              const isActive = activeProvider && activeProvider.id === p.id;
              const active = p.models.filter((m) => m.status === 'available').length;
              const inactive = p.models.filter((m) => ['unavailable', 'unreachable', 'error'].includes(m.status)).length;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={cn('flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-sm font-semibold transition-all shrink-0 whitespace-nowrap', isActive ? 'bg-primary/15 border-primary/60 text-brand-300 shadow-sm' : 'border-border bg-surface text-text-muted hover:text-text-main hover:border-brand-500/50')}
                  title={`Abrir os modelos de ${p.name}`}
                >
                  <ProviderLogo provider={p} size={18} />
                  <span className="truncate">{p.name}</span>
                  <span className={cn('size-2 rounded-full shrink-0', active > 0 ? 'bg-emerald-500' : inactive > 0 ? 'bg-red-500' : 'bg-gray-500')} />
                  <span className="text-xs opacity-70">{p.models.length}</span>
                </button>
              );
            })}
          </div>
          {activeProvider && <ProviderBlock key={activeProvider.id} provider={activeProvider} query={query} onExplain={setExplainItem} />}
        </>
      )}

      <HubExplainModal item={explainItem} onClose={() => setExplainItem(null)} />
      <TestResultsModal isOpen={!!results} onClose={() => setResults(null)} title={results ? results.title : 'Resultados'} endpoint={results ? results.endpoint : null} results={results ? results.results : []} summary={results ? { passed: results.passed, failed: results.failed, total: results.total } : null} />
    </div>
  );
}