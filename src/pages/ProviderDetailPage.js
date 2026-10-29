import React, { useEffect, useMemo, useState } from 'react';
import Topbar from '../components/Topbar';
import ProviderForm from '../components/ProviderForm';
import { Button, Card, ConfirmModal, CopyButton, EmptyState, Input, Modal, Select, Textarea, Toggle } from '../components/ui';
import { ProviderLogo } from '../components/Brand';
import { StatusBadge, HubExplainModal, TestResultsModal } from '../components/Status';import { Link } from '../router';
import {
  useStore,
  addModel,
  addModelsBulk,
  updateModel,
  deleteModel,
  toggleModelEnabled,
  runModelTest,
  runProviderTest,
  updateProvider,
  toast,
} from '../lib/store';
import { cn, maskKey, timeAgo, formatNumber } from '../lib/util';

const STATUS_OPTIONS = [
  { value: 'unknown', label: 'Não testado' },
  { value: 'available', label: 'Disponível (manual)' },
  { value: 'unavailable', label: 'Indisponível (manual)' },
  { value: 'unreachable', label: 'Sem resposta (manual)' },
];

/* ativos primeiro, depois não testados, depois inativos */
const STATUS_RANK = { available: 0, testing: 1, unknown: 2, 'rate-limited': 3, unavailable: 4, unreachable: 5, error: 6 };

function ModelRow({ provider, model, onEdit, onDelete, onExplain }) {
  const [busy, setBusy] = useState(false);

  const test = async (e) => {
    e.stopPropagation();
    setBusy(true);
    const res = await runModelTest(provider.id, model.id);
    setBusy(false);
    if (res) {
      const tones = {
        available: 'success',
        'rate-limited': 'warning',
        unavailable: 'error',
        unreachable: 'warning',
        error: 'error',
      };
      toast(
        `${model.name}: ${res.status === 'available' ? 'disponível' : res.status === 'unavailable' ? 'indisponível' : 'sem resposta'}`,
        tones[res.status] || 'info',
        res.message
      );
    }
  };

  return (
    <div
      className={cn(
        'rounded-[10px] border bg-surface-2/50 px-3 py-2.5 flex flex-col gap-2 transition-colors',
        model.status === 'available' && 'border-emerald-500/25',
        model.status === 'rate-limited' && 'border-amber-500/25',
        model.status === 'unavailable' && 'border-red-500/25',        model.status === 'unreachable' && 'border-amber-500/25',
        model.status === 'testing' && 'border-primary/50',
        model.status === 'unknown' && 'border-border-subtle',
        !model.enabled && 'opacity-55'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            'size-2 rounded-full shrink-0',
            model.status === 'available' && 'bg-emerald-500',
            model.status === 'rate-limited' && 'bg-amber-500',
            model.status === 'unavailable' && 'bg-red-500',
            model.status === 'unreachable' && 'bg-amber-500',            model.status === 'testing' && 'bg-brand-400 animate-pulse',
            model.status === 'unknown' && 'bg-gray-500'
          )}
        />
        <span className="font-mono text-sm text-text-main truncate flex-1 min-w-0" title={model.name}>
          {model.name}
        </span>
        {model.capabilities && model.capabilities.thinking && (
          <span title="Thinking/reasoning" className="material-symbols-outlined text-[13px] shrink-0 text-amber-400">lightbulb</span>
        )}
        {model.capabilities && model.capabilities.vision && (
          <span title="Vision" className="material-symbols-outlined text-[13px] shrink-0 text-sky-400">visibility</span>
        )}
        <Toggle
          checked={model.enabled}
          size="sm"
          onChange={() => toggleModelEnabled(provider.id, model.id)}
          title={model.enabled ? 'Visível na aba Seus modelos' : 'Oculto da aba Seus modelos'}
        />
      </div>

      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <StatusBadge status={model.status} />
          {model.status === 'rate-limited' && <span className="text-[10px] uppercase font-semibold text-amber-400 bg-amber-400/10 rounded px-1.5 py-0.5">rate limit</span>}
          <span className="text-[11px] text-text-muted truncate">{timeAgo(model.lastTestAt)}</span>
          {typeof model.latency === 'number' && model.latency > 0 && (
            <span className="text-[11px] font-mono text-brand-300">{model.latency}ms</span>
          )}
        </div>
        <Button
          size="xs"
          variant="purple"
          icon="science"
          loading={busy || model.status === 'testing'}
          onClick={test}
          title={`Testar ${model.name}`}
        >
          Test
        </Button>
      </div>

      {model.message && <p className="text-[11px] text-text-muted truncate" title={model.message}>{model.message}</p>}

      <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-1.5">
        <span className="text-[11px] text-text-muted truncate">{model.note || 'sem observação'}</span>
        <div className="flex items-center gap-1 shrink-0">
          <CopyButton value={model.name} label="Copiar ID do modelo" />
          <button
            type="button"
            title="Editar modelo"
            aria-label="Editar modelo"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 rounded-md text-text-muted hover:text-brand-300 hover:bg-surface-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            type="button"
            title="Remover do provedor"
            aria-label="Remover do provedor"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProviderDetailPage({ providerId }) {
  const store = useStore();
  const provider = useMemo(() => store.providers.find((p) => p.id === providerId), [store.providers, providerId]);

  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [newModel, setNewModel] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [editingModel, setEditingModel] = useState(null);
  const [deletingModel, setDeletingModel] = useState(null);
  const [revealKey, setRevealKey] = useState(false);
  const [explainStatus, setExplainStatus] = useState(null);
  const [modelQuery, setModelQuery] = useState('');

  /* busca por modelo + ativos movidos para o topo */
  const shownModels = useMemo(() => {
    if (!provider) return [];
    const q = modelQuery.trim().toLowerCase();
    return provider.models
      .filter((m) => !q || m.name.toLowerCase().includes(q))
      .sort(
        (a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) || a.name.localeCompare(b.name)
      );
  }, [provider, modelQuery]);

  useEffect(() => {
    const handler = () => setShowForm(true);
    window.addEventListener('infinity:new-provider', handler);
    return () => window.removeEventListener('infinity:new-provider', handler);
  }, []);

  if (!provider) {
    return (
      <div className="flex flex-col gap-6 min-w-0">
        <Topbar icon="dns" title="Provedor não encontrado" />
        <EmptyState
          icon="search_off"
          title="Este provedor não existe mais"
          description="Ele pode ter sido removido deste navegador."
          action={<Link to="/dashboard/providers" className="text-brand-400 text-sm">Voltar para Provedores</Link>}
        />
      </div>
    );
  }

  const submitModel = (e) => {
    if (e) e.preventDefault();
    const created = addModel(provider.id, newModel);
    if (created) {
      toast(`Modelo "${created.name}" adicionado`, 'success');
      setNewModel('');
    } else if (newModel.trim()) {
      toast('Esse modelo já está registrado neste provedor', 'warning');
    }
  };

  const submitBulk = () => {
    const names = bulkText.split(/[\s,]+/);
    const added = addModelsBulk(provider.id, names);
    toast(
      added > 0 ? `${added} modelo(s) adicionado(s)` : 'Nenhum modelo novo (todos já existiam)',
      added > 0 ? 'success' : 'warning'
    );
    setBulkText('');
    setBulkOpen(false);
  };

  const testProvider = async () => {
    setTesting(true);
    const summary = await runProviderTest(provider.id);
    setTesting(false);
    if (summary) setResults({ title: `Testes — ${provider.name}`, ...summary });
  };

  const available = provider.models.filter((m) => m.status === 'available').length;
  const rateLimited = provider.models.filter((m) => m.status === 'rate-limited').length;
  const inactive = provider.models.filter((m) => ['unavailable', 'unreachable', 'error'].includes(m.status)).length;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Topbar
        breadcrumbs={[
          { label: 'Provedores', to: '/dashboard/providers' },
          { label: provider.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {(provider.apiKeyUrl || provider.website) && (
              <a
                href={provider.apiKeyUrl || provider.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 h-7 px-3 text-xs font-semibold rounded-[8px] border border-border text-text-main hover:bg-surface-2 hover:border-brand-500/50 transition-all"
                title="Abrir a página oficial para gerar a API key"
              >
                <span className="material-symbols-outlined text-[15px]">key</span>
                <span className="hidden sm:inline">Gerar API key</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            )}
            <Button size="sm" variant="outline" icon="edit" onClick={() => setShowForm(true)}>
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button size="sm" variant="primary" icon="science" loading={testing} onClick={testProvider}>
              Testar modelos
            </Button>
          </div>
        }
      />

      {/* Cabeçalho / identificação */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <ProviderLogo provider={provider} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-text-main truncate">{provider.name}</h2>
              {provider.prefix && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-primary/10 text-brand-300">
                  prefix: {provider.prefix}
                </span>
              )}
              <StatusBadge status={provider.endpointStatus} size="md" />
            </div>
            <p className="text-sm text-text-muted mt-1 break-all">{provider.note || provider.baseUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="purple"
              icon="science"
              loading={testing}
              onClick={testProvider}
              title="Testar endpoint + todos os modelos"
            >
              Test
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-border-subtle">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">API endpoint</p>
            <div className="flex items-center gap-1 min-w-0">
              <code className="font-mono text-xs text-brand-300 truncate">{provider.baseUrl || '—'}</code>
              {provider.baseUrl && <CopyButton value={provider.baseUrl} label="Copiar endpoint" />}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">API key</p>
            <div className="flex items-center gap-1 min-w-0">
              <code className="font-mono text-xs text-text-main truncate">
                {provider.apiKey ? (revealKey ? provider.apiKey : maskKey(provider.apiKey)) : '—'}
              </code>
              {provider.apiKey && (
                <>
                  <button
                    type="button"
                    title={revealKey ? 'Ocultar' : 'Revelar'}
                    aria-label={revealKey ? 'Ocultar API key' : 'Revelar API key'}
                    onClick={() => setRevealKey((v) => !v)}
                    className="p-1 rounded-md text-text-muted hover:text-brand-300 hover:bg-surface-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {revealKey ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <CopyButton value={provider.apiKey} label="Copiar API key" />
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Tipo de API</p>
            <p className="text-sm text-text-main">{provider.apiType === 'anthropic' ? 'Anthropic Messages' : 'OpenAI Chat Completions'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Último teste</p>
            <p className="text-sm text-text-main">
              {provider.lastTestAt ? timeAgo(provider.lastTestAt) : 'nunca'}
              {provider.endpointMessage ? (
                <span className="block text-[11px] text-text-muted truncate" title={provider.endpointMessage}>
                  {provider.endpointMessage}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-text-muted">
            <strong className="text-text-main">{formatNumber(provider.models.length)}</strong> modelos ·{' '}
            <strong className="text-emerald-400">{available}</strong> ativos ·{' '}
            <strong className="text-red-400">{inactive}</strong> inativos ·{' '}
            <strong className="text-amber-400">{rateLimited}</strong> rate limites
          </span>
        </div>
      </Card>

      {/* Modelos em colunas */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">deployed_code</span>
              Modelos do provedor
              <span className="text-sm font-normal text-text-muted">({provider.models.length})</span>
            </h3>
            <p className="text-sm text-text-muted">
              Bolinha <strong className="text-emerald-400">verde</strong> = modelo ativo ·{' '}
              <strong className="text-red-400">vermelha</strong> = inativo. Cada modelo tem o seu botão{' '}
              <strong className="text-brand-300">Test</strong> e o teste roda no servidor (sem bloqueio de CORS).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                placeholder="Buscar modelo…"
                aria-label="Buscar modelo neste provedor"
                className="w-full h-9 pl-7 pr-7 rounded-[10px] border border-border bg-surface text-sm text-text-main placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50 transition-colors"
              />
              {modelQuery && (
                <button
                  type="button"
                  onClick={() => setModelQuery('')}
                  aria-label="Limpar busca de modelo"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 rounded"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <Button size="sm" variant="secondary" icon="playlist_add" onClick={() => setBulkOpen(true)}>
              <span className="hidden sm:inline">Adicionar vários</span>
            </Button>
          </div>
        </div>

        {modelQuery && (
          <p className="text-xs text-text-muted">
            <strong className="text-text-main">{shownModels.length}</strong> de{' '}
            <strong className="text-text-main">{provider.models.length}</strong> modelo(s) com “
            {modelQuery}”. Ativos aparecem primeiro.
          </p>
        )}

        <form onSubmit={submitModel} className="flex flex-col sm:flex-row gap-2 items-end">
          <Input
            className="flex-1"
            label="Novo modelo"
            placeholder="ex.: gpt-4o-mini"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            mono
          />
          <Button type="submit" icon="add" disabled={!newModel.trim()} className="sm:mb-0.5">
            Adicionar
          </Button>
        </form>

        {provider.models.length === 0 ? (
          <EmptyState
            icon="deployed_code"
            title="Nenhum modelo registrado"
            description="Adicione modelos manualmente para marcá-los e testá-los."
          />
        ) : shownModels.length === 0 ? (
          <EmptyState
            icon="search_off"
            title={`Nenhum modelo corresponde à busca "${modelQuery}"`}
            description="Limpe a busca para ver todos os modelos do provedor."
            action={
              <Button size="sm" icon="close" onClick={() => setModelQuery('')}>
                Limpar busca
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {shownModels.map((m) => (
              <ModelRow
                key={m.id}
                provider={provider}
                model={m}
                onExplain={(st) => setExplainStatus(st)}
                onEdit={() => setEditingModel(m)}
                onDelete={() => setDeletingModel(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <ProviderForm isOpen={showForm} provider={provider} onClose={() => setShowForm(false)} />

      <Modal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Adicionar vários modelos"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={submitBulk} disabled={!bulkText.trim()}>
              Adicionar
            </Button>
          </>
        }
      >
        <Textarea
          label="Um modelo por linha (também aceita vírgula)"
          rows={8}
          placeholder={'gpt-4o\ngpt-4o-mini\no4-mini'}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          hint="Modelos já registrados são ignorados."
        />
      </Modal>

      <ModelForm
        model={editingModel}
        onClose={() => setEditingModel(null)}
        onSave={(patch) => {
          updateModel(provider.id, editingModel.id, patch);
          toast(`Modelo "${patch.name || editingModel.name}" atualizado`, 'success');
          setEditingModel(null);
        }}
      />

      <ConfirmModal
        isOpen={!!deletingModel}
        onClose={() => setDeletingModel(null)}
        onConfirm={() => {
          if (deletingModel) {
            deleteModel(provider.id, deletingModel.id);
            toast(`Modelo "${deletingModel.name}" removido do provedor`, 'warning');
          }
          setDeletingModel(null);
        }}
        title="Remover modelo"
        message={
          deletingModel
            ? `Remover "${deletingModel.name}" deste provedor? Ele deixa de aparecer na lista de modelos.`
            : ''
        }
        confirmText="Remover"
      />

      <HubExplainModal item={explainStatus} onClose={() => setExplainStatus(null)} />

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

function ModelForm({ model, onClose, onSave }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('unknown');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (model) {
      setName(model.name);
      setStatus(['unknown', 'available', 'unavailable', 'unreachable'].includes(model.status) ? model.status : 'unknown');
      setNote(model.note || '');
    }
  }, [model]);

  if (!model) return null;

  return (
    <Modal
      isOpen={!!model}
      onClose={onClose}
      title="Editar modelo"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              onSave({
                name: name.trim() || model.name,
                status,
                note,
                message: status === model.status ? model.message : 'Status definido manualmente',
              })
            }
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Model ID" mono required value={name} onChange={(e) => setName(e.target.value)} />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS}
          hint="Use a opção manual quando o endpoint bloquear o teste via navegador (CORS)."
        />
        <Input label="Observação" placeholder="ex.: só responde com streaming" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
}
