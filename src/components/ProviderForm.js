import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Button, Input, Spinner, Badge } from './ui';
import { addProvider, updateProvider, toast } from '../lib/store';
import { fetchCatalog, resolveProvider, testProviderServer } from '../lib/api';
import { cn } from '../lib/util';

const MAX_INSTANT_TESTS = 10;

/* Nome usado no preview de testes (antes de salvar) — casa com o nome final. */
function previewName(entry, baseUrl) {
  if (entry) return entry.name;
  try {
    return new URL(baseUrl).host || 'preview';
  } catch (e) {
    return 'preview';
  }
}

/* Bolinha de status: verde = ativo, vermelho = inativo, cinza = não testado */
function Dot({ status }) {
  const color =
    status === 'available'
      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
      : status === 'testing'
      ? 'bg-brand-500 animate-pulse'
      : status === 'rate-limited'
      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.75)]'
      : status === 'unavailable' || status === 'unreachable' || status === 'error'
      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
      : 'bg-gray-500';
  return <span className={cn('size-2.5 rounded-full shrink-0', color)} aria-hidden="true" />;
}

export default function ProviderForm({ isOpen, onClose, provider, presetCatalogId = '' }) {
  const isEdit = !!provider;
  const [catalog, setCatalog] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiType, setApiType] = useState('openai');
  const [custom, setCustom] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveMsg, setResolveMsg] = useState('');
  const [endpoint, setEndpoint] = useState(null); // {status,message,latency}
  const [models, setModels] = useState([]); // subconjunto testado: [{name,status,latency,message}]
  const [allModelNames, setAllModelNames] = useState([]); // TODOS os modelos detectados
  const [testing, setTesting] = useState(false);
  const [testProgress, setTestProgress] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const resolveSeq = useRef(0);

  const entry = useMemo(
    () => catalog.find((c) => c.id === selectedId) || null,
    [catalog, selectedId]
  );

  /* catálogo */
  useEffect(() => {
    if (!isOpen) return;
    fetchCatalog()
      .then((data) => setCatalog(data.catalog || []))
      .catch(() => setCatalog([]));
  }, [isOpen]);

  /* reset / prefill */
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setResolveMsg('');
    setEndpoint(null);
    setModels([]);
    setAllModelNames([]);
    setTesting(false);
    setTestProgress('');
    setResolving(false);
    if (provider) {
      setSelectedId(provider.catalogId || '');
      setApiKey(provider.apiKey || '');
      setName(provider.name || '');
      setBaseUrl(provider.baseUrl || '');
      setApiType(provider.apiType || 'openai');
      setCustom(!provider.catalogId);
      setAllModelNames((provider.models || []).map((m) => m.name));
      setModels(
        (provider.models || []).map((m) => ({
          name: m.name,
          status: m.status === 'testing' ? 'unknown' : m.status,
          latency: m.latency,
          message: m.message,
        }))
      );
      setEndpoint(
        provider.endpointStatus
          ? { status: provider.endpointStatus, message: provider.endpointMessage }
          : null
      );
    } else {
      setSelectedId(presetCatalogId || '');
      setApiKey('');
      setName('');
      setBaseUrl('');
      setApiType('openai');
      setCustom(false);
    }
  }, [isOpen, provider, presetCatalogId]);

  /* detecta o provedor escolhido e aplica dados do catálogo */
  useEffect(() => {
    if (!isOpen || isEdit) return;
    if (entry) {
      setBaseUrl(entry.baseUrl);
      setApiType(entry.apiType);
      setName(entry.name);
      setCustom(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, isOpen]);

  /* resolve automático: colou a API key → acha endpoint + modelos.
     (Somente em modo "conectar"; ao editar não re-executa para não apagar
      os testes/limites já persistidos — o Revalidar manual continua disponível.) */
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) return;
    const key = apiKey.trim();
    const target = custom ? baseUrl.trim() : selectedId;
    if (!target || key.length < 8) {
      setEndpoint(null);
      setModels([]);
      setAllModelNames([]);
      setResolveMsg('');
      return undefined;
    }
    const seq = ++resolveSeq.current;
    setResolving(true);
    setResolveMsg('Detectando endpoint e modelos…');
    const timer = setTimeout(async () => {
      try {
        console.log('RESOLVE-START', seq, 'of', resolveSeq.current);
        const result = await resolveProvider({
          catalogId: custom ? '' : selectedId,
          baseUrl: custom ? baseUrl : '',
          apiKey: key,
          apiType,
        });
        if (seq !== resolveSeq.current) {
          console.log('RESOLVE-BAILED seq', seq, 'current', resolveSeq.current);
          document.title = 'BAILED:' + seq + '/' + resolveSeq.current;
          return;
        }
        if (result.baseUrl) setBaseUrl(result.baseUrl);
        if (result.apiType) setApiType(result.apiType);
        setEndpoint(result.endpoint);
        setResolving(false);
        setResolveMsg(
          result.ok
            ? result.listedModels
              ? `Endpoint ativo · ${result.models.length} modelo(s) encontrado(s)`
              : 'Endpoint ativo · provedor não expôs lista de modelos (usando padrões)'
            : `Endpoint respondeu: ${result.endpoint.message}`
        );
        const names = (result.models || []).slice(0, MAX_INSTANT_TESTS);
        setAllModelNames((prev) => {
          const merged = new Set(result.models || []);
          if (isEdit) prev.forEach((n) => merged.add(n)); // preserva modelos já registrados
          return Array.from(merged);
        });
        setModels(names.map((n) => ({ name: n, status: 'testing', latency: null, message: '' })));
        if (names.length) {
          setTesting(true);
          setTestProgress(`Testando ${names.length} modelo(s)…`);
          const summary = await testProviderServer(
            {
              id: 'preview',
              name: previewName(entry, baseUrl),
              baseUrl: result.baseUrl,
              apiKey: key,
              apiType: result.apiType,
              models: names.map((n) => ({ name: n })),
            },
            true
          );
          if (seq !== resolveSeq.current) return;
          const byName = new Map((summary.results || []).map((r) => [r.model, r]));
          setModels(
            names.map((n) => {
              const r = byName.get(n);
              return {
                name: n,
                status: r ? r.status : 'unknown',
                latency: r ? r.latency : null,
                message: r ? r.message : '',
              };
            })
          );
          setEndpoint(summary.endpoint || result.endpoint);
          setTesting(false);
          setTestProgress('');
          const passed = (summary.results || []).filter((r) => r.status === 'available').length;
          setResolveMsg(
            `${result.models.length} modelo(s) disponíveis · ${passed}/${names.length} testados agora`
          );
        }
      } catch (err) {
        if (seq !== resolveSeq.current) return;
        document.title = 'RESOLVE-ERR:' + err.message;
        setResolving(false);
        setTesting(false);
        setTestProgress('');
        setResolveMsg(`Falha ao detectar: ${err.message}`);
        setEndpoint({ status: 'unreachable', message: err.message, latency: null });
      }
    }, 650);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, selectedId, custom, baseUrl, isEdit, isOpen]);

  const busy = resolving || testing;

  const submit = async (e) => {
    if (e) e.preventDefault();
    const key = apiKey.trim();
    if (!custom && !selectedId) {
      setError('Escolha um provedor da lista.');
      return;
    }
    if (!key && !isEdit) {
      setError('Cole a API key para continuar — o resto é detectado sozinho.');
      return;
    }
    if (!baseUrl.trim()) {
      setError('Informe o endpoint (ou escolha um provedor do catálogo).');
      return;
    }
    setSaving(true);
    let defaultName = 'Provedor';
    if (entry) defaultName = entry.name;
    else if (custom) {
      try {
        defaultName = new URL(baseUrl.trim()).host || defaultName;
      } catch (e) {
        defaultName = baseUrl.trim() || defaultName;
      }
    }
    const payload = {
      name: name.trim() || defaultName,
      catalogId: custom ? '' : selectedId,
      baseUrl: baseUrl.trim(),
      apiKey: key,
      apiType,
      color: entry ? entry.color : '#8b5cf6',
      logoUrl: entry ? entry.logoUrl : '',
      website: entry ? entry.website : '',
      apiKeyUrl: entry ? entry.apiKeyUrl : '',
      category: entry ? entry.category : '',
      endpointStatus: endpoint ? endpoint.status : 'unknown',
      endpointMessage: endpoint && endpoint.message ? endpoint.message : '',
      lastTestAt: endpoint ? Date.now() : null,
      models: (allModelNames.length ? allModelNames : models.map((m) => m.name)).map((modelName) => {
        const r = models.find((m) => m.name === modelName);
        const tested = r && r.status !== 'testing';
        return {
          name: modelName,
          status: tested ? r.status : 'unknown',
          latency: tested ? r.latency || null : null,
          message: tested ? r.message || '' : 'detectado automaticamente',
          lastTestAt: tested ? Date.now() : null,
        };
      }),
    };
    try {
      if (provider) {
        updateProvider(provider.id, payload);
        toast(`${payload.name} atualizado`, 'success');
      } else {
        addProvider(payload);
        toast(`${payload.name} conectado — consumo rastreado automaticamente`, 'success');
      }
      setSaving(false);
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err.message);
    }
  };

  const runAgain = async () => {
    if (!models.length || busy) return;
    setTesting(true);
    setTestProgress(`Testando ${models.length} modelo(s)…`);
    try {
      const summary = await testProviderServer(
        {
          id: 'preview',
          name: previewName(entry, baseUrl),
          baseUrl,
          apiKey: apiKey.trim(),
          apiType,
          models: models.map((m) => ({ name: m.name })),
        },
        true
      );
      const byName = new Map((summary.results || []).map((r) => [r.model, r]));
      setModels((prev) =>
        prev.map((m) => {
          const r = byName.get(m.name);
          return r
            ? { ...m, status: r.status, latency: r.latency, message: r.message }
            : m;
        })
      );
      setEndpoint(summary.endpoint || endpoint);
    } catch (err) {
      setResolveMsg(`Falha no teste: ${err.message}`);
    } finally {
      setTesting(false);
      setTestProgress('');
    }
  };

  const passedCount = models.filter((m) => m.status === 'available').length;
  const inactiveCount = models.filter(
    (m) => m.status === 'unavailable' || m.status === 'unreachable' || m.status === 'error'
  ).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={provider ? `Editar ${provider.name}` : 'Conectar provedor'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon="link"
            loading={saving}
            disabled={busy && !isEdit}
            onClick={submit}
            title="Salvar provedor"
          >
            {provider ? 'Salvar' : 'Conectar'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* passo 1 — provedor */}
        {!isEdit && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-main">
              1. Escolha o provedor<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
              {catalog.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-2 rounded-[10px] border text-left transition-all min-w-0',
                    selectedId === c.id
                      ? 'border-brand-500/70 bg-primary/10'
                      : 'border-border-subtle bg-surface-2/60 hover:border-brand-500/40'
                  )}
                >
                  <span
                    className="size-6 rounded-md shrink-0 grid place-items-center text-[10px] font-bold text-black/80"
                    style={{ background: c.color }}
                  >
                    {c.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex flex-col">
                    <span className="text-xs font-semibold text-text-main truncate">{c.name}</span>
                    <span className="text-[10px] text-text-muted truncate">{c.category}</span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustom(true);
                  setSelectedId('');
                  setBaseUrl('');
                  setName('');
                }}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-2 rounded-[10px] border text-left transition-all',
                  custom
                    ? 'border-brand-500/70 bg-primary/10'
                    : 'border-border-subtle bg-surface-2/60 hover:border-brand-500/40'
                )}
              >
                <span className="size-6 rounded-md shrink-0 grid place-items-center bg-surface-3 text-text-muted">
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                </span>
                <span className="text-xs font-semibold text-text-main">Personalizado</span>
              </button>
            </div>
            {entry && entry.apiKeyUrl && (
              <a
                href={entry.apiKeyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200 transition-colors w-fit"
              >
                Não tem a chave? Gerar API key em {new URL(entry.apiKeyUrl).host}
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            )}
          </div>
        )}

        {/* passo 2 — API key */}
        <Input
          label={isEdit ? 'API key' : '2. Cole a API key'}
          required={!isEdit}
          mono
          type="password"
          autoComplete="off"
          placeholder={entry ? `${entry.name} key…` : 'sk-…'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          hint={
            isEdit
              ? 'Alterar a chave dispara nova detecção automática de endpoint e modelos.'
              : 'Só a API key. Endpoint e modelos são detectados sozinhos ao colar.'
          }
        />

        {/* passo 3 — resultado da detecção */}
        {(resolving || testing || resolveMsg || (isEdit && endpoint)) && (
          <div
            className={cn(
              'rounded-[10px] border px-3 py-2.5 flex items-start gap-2',
              endpoint && endpoint.status === 'available'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : endpoint
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-border-subtle bg-surface-2/60'
            )}
          >
            {resolving || testing ? (
              <Spinner size={16} className="mt-0.5 shrink-0" />
            ) : endpoint && endpoint.status === 'available' ? (
              <span className="material-symbols-outlined text-emerald-400 text-[16px] mt-px">check_circle</span>
            ) : (
              <span className="material-symbols-outlined text-red-400 text-[16px] mt-px">cancel</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-main break-words">
                {testProgress || resolveMsg}
                {endpoint && endpoint.latency ? ` · ${endpoint.latency}ms` : ''}
              </p>
              {endpoint && !endpoint.status.startsWith('available') && (
                <p className="text-[11px] text-red-300/90 mt-0.5 break-words">{endpoint.message}</p>
              )}
              {models.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant="success" size="sm" dot>
                    {passedCount} ativos
                  </Badge>
                  <Badge variant="error" size="sm" dot>
                    {inactiveCount} inativos
                  </Badge>
                  {allModelNames.length > MAX_INSTANT_TESTS && (
                    <span className="text-[10px] text-text-muted">
                      testando os {MAX_INSTANT_TESTS} primeiros — os {allModelNames.length} modelos são salvos
                    </span>
                  )}
                </div>
              )}
            </div>
            {models.length > 0 && !testing && (
              <Button size="xs" variant="outline" icon="refresh" onClick={runAgain} title="Refazer teste instantâneo">
                Revalidar
              </Button>
            )}
          </div>
        )}

        {/* lista com bolinhas */}
        {models.length > 0 && (
          <div className="rounded-[10px] border border-border-subtle bg-surface-2/40 px-3 py-1 max-h-[220px] overflow-y-auto custom-scrollbar">
            {models.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2 py-1.5 border-b border-border-subtle last:border-b-0"
              >
                <Dot status={m.status} />
                <span className="font-mono text-xs text-text-main truncate flex-1 min-w-0" title={m.name}>
                  {m.name}
                </span>
                {typeof m.latency === 'number' && m.latency > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded',
                      m.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    )}
                  >
                    {m.latency}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* endpoint visível quando é provedor personalizado */}
        {custom && (
          <Input
            label="Endpoint (base URL)"
            required
            mono
            placeholder="https://api.exemplo.com/v1"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            hint="Descoberto sozinho quando você escolhe um provedor do catálogo."
          />
        )}

        {/* campos avançados */}
        <details className="rounded-[10px] border border-border-subtle bg-surface-2/40 px-3 py-2">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-text-muted">
            Ajustes avançados (endpoint, nome, tipo)
          </summary>
          <div className="flex flex-col gap-3 pt-3">
            {!custom && (
              <Input
                label="Endpoint (base URL)"
                mono
                placeholder="https://api.exemplo.com/v1"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                hint="Detectado automaticamente — edite apenas se souber o que faz."
              />
            )}
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm text-text-main cursor-pointer">
                <input
                  type="radio"
                  name="apiType"
                  checked={apiType === 'openai'}
                  onChange={() => setApiType('openai')}
                  className="accent-brand-500"
                />
                OpenAI
              </label>
              <label className="flex items-center gap-2 text-sm text-text-main cursor-pointer">
                <input
                  type="radio"
                  name="apiType"
                  checked={apiType === 'anthropic'}
                  onChange={() => setApiType('anthropic')}
                  className="accent-brand-500"
                />
                Anthropic
              </label>
            </div>
            <Input
              label="Nome exibido"
              placeholder={entry ? entry.name : 'Meu provedor'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </details>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        )}

        {/* envio implícito pelos botões do rodapé */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}
