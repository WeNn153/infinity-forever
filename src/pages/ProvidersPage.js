import React, { useEffect, useMemo, useState } from 'react';
import Topbar from '../components/Topbar';
import ProviderForm from '../components/ProviderForm';
import { Button, Card, CopyButton, EmptyState, Input, ConfirmModal } from '../components/ui';
import { ProviderLogo } from '../components/Brand';
import { StatusBadge, TestResultsModal } from '../components/Status';
import { Link, navigate } from '../router';
import { useStore, deleteProvider, runProviderTest, runGlobalTest, toast } from '../lib/store';
import { fetchCatalog } from '../lib/api';
import { cn, timeAgo } from '../lib/util';

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'has-models', label: 'Com modelos' },
  { value: 'empty', label: 'Sem modelos' },
];

function Badge({ chip, tone = 'default' }) {
  const tones = {
    default: 'bg-surface-2 text-text-muted',
    purple: 'bg-primary/10 text-brand-300',
    success: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    error: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', tones[tone])}>
      {chip}
    </span>
  );
}

function ProviderCard({ provider, onEdit, onDelete }) {
  const [busy, setBusy] = useState(false);
  const modelCount = provider.models.length;
  const available = provider.models.filter((m) => m.status === 'available').length;

  const runTest = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setBusy(true);
    const summary = await runProviderTest(provider.id);
    setBusy(false);
    if (summary) {
      window.dispatchEvent(
        new CustomEvent('infinity:test-results', {
          detail: { providerName: provider.name, summary },
        })
      );
      if (summary.total > 0 && summary.passed === summary.total) {
        toast(`${provider.name}: todos os modelos ativos`, 'success');
      } else if (summary.total > 0) {
        toast(`${provider.name}: ${summary.passed}/${summary.total} modelos ativos`, 'warning');
      } else if (summary.endpoint.status === 'available') {
        toast(`${provider.name}: endpoint respondendo`, 'success');
      } else {
        toast(`${provider.name}: endpoint sem resposta`, 'error', summary.endpoint.message);
      }
    }
  };

  return (
    <Card
      padding="xs"
      hover
      onClick={() => navigate(`/dashboard/providers/${provider.id}`)}
      className={cn('group min-w-0 transition-colors', provider.testing && 'border-primary/40')}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <Link to={`/dashboard/providers/${provider.id}`} className="flex min-w-0 items-center gap-3 flex-1 min-w-0">
          <ProviderLogo provider={provider} size={36} />
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-text-main">{provider.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
              <span className="font-mono truncate">{provider.baseUrl || 'sem endpoint'}</span>
              {provider.baseUrl && <CopyButton value={provider.baseUrl} label="Copiar endpoint" />}
            </div>
          </div>
        </Link>
        <StatusBadge status={provider.endpointStatus} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        <Badge chip={`${modelCount} modelos`} />
        <Badge chip={provider.apiType === 'anthropic' ? 'Anthropic' : 'OpenAI'} tone="purple" />
        {provider.lastTestAt ? <Badge chip={`Testado ${timeAgo(provider.lastTestAt)}`} /> : <Badge chip="Nunca testado" />}
        {modelCount > 0 && <Badge chip={`${available}/${modelCount} ativos`} tone={available ? 'success' : 'default'} />}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3">
        <a
          href={provider.apiKeyUrl || provider.website || '#'}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'inline-flex items-center gap-1 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0',
            provider.apiKeyUrl ? 'text-brand-300 hover:text-brand-200' : 'text-text-muted hover:text-text-main'
          )}
          title={provider.apiKeyUrl ? 'Abrir a página oficial para gerar a API key' : 'Site do provedor'}
        >
          Gerar API key
          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
        </a>
        <div className="flex items-center gap-1.5">
          <Button size="xs" variant="purple" icon="science" loading={busy || provider.testing} onClick={runTest}>
            Test
          </Button>
          <Button
            size="xs"
            variant="ghost"
            icon="edit"
            title="Editar provedor"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
          />
          <Button
            size="xs"
            variant="ghost"
            icon="delete"
            title="Remover provedor"
            className="hover:text-red-400"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          />
        </div>
      </div>
    </Card>
  );
}

/* Cartão do catálogo — lista de provedores para se conectar */
function CatalogCard({ entry, connected, onConnect }) {
  return (
    <Card padding="sm" className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="size-8 rounded-lg shrink-0 grid place-items-center text-[11px] font-bold text-black/80"
          style={{ background: entry.color }}
        >
          {entry.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-text-main text-sm">{entry.name}</h4>
          <span className="text-[11px] text-text-muted">{entry.category}</span>
        </div>
        {connected && <Badge chip="conectado" tone="success" />}
      </div>
      <p className="text-xs text-text-muted line-clamp-2 min-h-[32px]">{entry.description}</p>
      <div className="flex items-center gap-2 mt-auto pt-1">
        <Button size="xs" variant="primary" icon="add" onClick={onConnect} disabled={connected} className="flex-1">
          {connected ? 'Já conectado' : 'Conectar'}
        </Button>
        {entry.apiKeyUrl ? (
          <a
            href={entry.apiKeyUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'inline-flex items-center justify-center gap-1 h-6 px-2.5 text-[11px] font-semibold rounded-[6px] transition-all',
              'border border-border text-text-main hover:bg-surface-2 hover:border-brand-500/50'
            )}
            title={`Gerar API key em ${entry.apiKeyUrl}`}
          >
            Gerar API key
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        ) : entry.website ? (
          <a
            href={entry.website}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'inline-flex items-center justify-center gap-1 h-6 px-2.5 text-[11px] font-semibold rounded-[6px] transition-all',
              'border border-border text-text-muted hover:bg-surface-2 hover:border-brand-500/50'
            )}
            title="Este provedor usa login no site oficial (sem API key)"
          >
            Abrir site
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        ) : null}
      </div>
    </Card>
  );
}

export default function ProvidersPage() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [presetId, setPresetId] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [results, setResults] = useState(null);
  const [testingAll, setTestingAll] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [showAllCatalog, setShowAllCatalog] = useState(false);

  useEffect(() => {
    const handler = () => {
      setEditing(null);
      setPresetId('');
      setShowForm(true);
    };
    window.addEventListener('infinity:new-provider', handler);
    return () => window.removeEventListener('infinity:new-provider', handler);
  }, []);

  /* os resultados de teste de um card abrem no modal global (App.js) */

  useEffect(() => {
    fetchCatalog()
      .then((d) => setCatalog(d.catalog || []))
      .catch((err) => setCatalogError(err.message));
  }, []);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return store.providers.filter((p) => {
      if (filter === 'has-models' && p.models.length === 0) return false;
      if (filter === 'empty' && p.models.length > 0) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.prefix || '').toLowerCase().includes(q) ||
        (p.baseUrl || '').toLowerCase().includes(q) ||
        p.models.some((m) => m.name.toLowerCase().includes(q))
      );
    });
  }, [store.providers, search, filter]);

  const catalogList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [catalog, search]);
  const catalogShown = showAllCatalog ? catalogList : catalogList.slice(0, 24);

  const connectedIds = useMemo(
    () => new Set(store.providers.map((p) => p.catalogId).filter(Boolean)),
    [store.providers]
  );

  const testAll = async () => {
    if (!store.providers.length) {
      toast('Cadastre ao menos um provedor para testar', 'warning');
      return;
    }
    setTestingAll(true);
    try {
      const payload = await runGlobalTest();
      const rows = (payload.results || []).map((r) => ({
        model: r.providerName,
        status:
          r.total > 0
            ? r.passed > 0
              ? 'available'
              : 'unavailable'
            : r.endpoint
            ? r.endpoint.status
            : 'unknown',
        message: `${r.passed}/${r.total} modelos ativos${
          r.endpoint && r.endpoint.message ? ` · ${r.endpoint.message}` : ''
        }`,
        latency: r.endpoint ? r.endpoint.latency : null,
      }));
      const passedModels = (payload.results || []).reduce((acc, r) => acc + (r.passed || 0), 0);
      const totalModels = (payload.results || []).reduce((acc, r) => acc + (r.total || 0), 0);
      setResults({
        title: 'Teste geral — todos os provedores e modelos',
        endpoint: null,
        results: rows,
        passed: passedModels,
        failed: totalModels - passedModels,
        total: totalModels,
      });
      toast(
        `Teste geral concluído: ${passedModels}/${totalModels} modelos ativos`,
        passedModels ? 'success' : 'error'
      );
    } catch (err) {
      toast('Teste geral falhou', 'error', err.message);
    } finally {
      setTestingAll(false);
    }
  };

  const openConnect = (catalogId) => {
    setEditing(null);
    setPresetId(catalogId || '');
    setShowForm(true);
  };

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <Topbar
        icon="dns"
        title="Provedores"
        description="Registre provedores com só a API key — endpoint e modelos são detectados sozinhos."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative w-[150px] sm:w-[220px] hidden sm:block">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar provedores..."
                className="w-full h-8 pl-7 pr-7 rounded-lg border border-border bg-surface/70 text-sm text-text-main placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 rounded"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              icon="bolt"
              loading={testingAll}
              disabled={store.providers.length === 0}
              onClick={testAll}
              title="Testar todos os provedores e todos os modelos"
            >
              <span className="hidden sm:inline">Testar tudo</span>
            </Button>
            <Button size="sm" variant="primary" icon="add" onClick={() => openConnect('')}>
              <span className="hidden sm:inline">Novo Provedor</span>
            </Button>
          </div>
        }
      />

      {/* provedores registrados */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 leading-tight">
            <span className="material-symbols-outlined text-primary text-[20px]">dns</span>
            Seus provedores
            <span className="text-sm font-normal text-text-muted">({list.length})</span>
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Clique num provedor para ver os modelos com bolinha verde (ativo) e vermelha (inativo).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="sm:hidden w-full">
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filtrar provedores"
            className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-text-main outline-none transition-colors hover:bg-surface-2 cursor-pointer"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {store.providers.length === 0 ? (
        <EmptyState
          icon="dns"
          title="Nenhum provedor registrado"
          description="Cole a API key de um provedor abaixo e o endpoint + modelos são detectados sozinhos."
          action={
            <Button icon="add" onClick={() => openConnect('')}>
              Conectar provedor
            </Button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState icon="search_off" title="Nenhum provedor corresponde à busca ou filtro" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              onEdit={() => {
                setEditing(p);
                setPresetId('');
                setShowForm(true);
              }}
              onDelete={() => setDeleting(p)}
            />
          ))}
        </div>
      )}

      {/* catálogo de provedores para conectar */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-border-subtle">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 leading-tight">
            <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
            Catálogo de provedores
            <span className="text-sm font-normal text-text-muted">({catalogList.length})</span>
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Escolha um provedor, gere a API key no site oficial e cole aqui — o resto a gente detecta.
          </p>
        </div>
      </div>

      {catalogError ? (
        <EmptyState
          icon="cloud_off"
          title="Backend offline"
          description={`Não foi possível carregar o catálogo (${catalogError}). Inicie com "npm start".`}
        />
      ) : catalogList.length === 0 ? (
        <EmptyState icon="search_off" title="Nenhum provedor corresponde à busca" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogShown.map((c) => (
              <CatalogCard
                key={c.id}
                entry={c}
                connected={connectedIds.has(c.id)}
                onConnect={() => openConnect(c.id)}
              />
            ))}
          </div>
          {catalogList.length > catalogShown.length && (
            <div className="flex justify-center">
              <Button
                size="sm"
                variant="outline"
                icon="expand_more"
                onClick={() => setShowAllCatalog(true)}
              >
                Mostrar mais ({catalogList.length - catalogShown.length} provedores)
              </Button>
            </div>
          )}
          {showAllCatalog && catalogList.length > 24 && (
            <div className="flex justify-center">
              <Button size="sm" variant="ghost" icon="expand_less" onClick={() => setShowAllCatalog(false)}>
                Mostrar menos
              </Button>
            </div>
          )}
        </>
      )}

      <ProviderForm
        isOpen={showForm}
        provider={editing}
        presetCatalogId={presetId}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
          setPresetId('');
        }}
      />

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteProvider(deleting.id);
            toast(`Provedor "${deleting.name}" removido`, 'warning');
          }
          setDeleting(null);
        }}
        title="Remover provedor"
        message={
          deleting
            ? `Remover "${deleting.name}"? Os modelos e a API key dele saem do registro e do gateway de consumo.`
            : ''
        }
        confirmText="Remover"
      />

      <TestResultsModal
        isOpen={!!results}
        onClose={() => setResults(null)}
        title={results ? results.title : 'Resultados'}
        endpoint={results ? results.endpoint : null}
        results={results ? results.results : []}
        summary={results ? { passed: results.passed, failed: results.failed, total: results.total } : null}
      />
    </div>
  );
}
