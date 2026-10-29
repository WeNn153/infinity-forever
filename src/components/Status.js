import React from 'react';
import { Badge, Button, Modal } from './ui';
import { STATUS_META, STATUS_EXPLAIN } from '../lib/testing';
import { cn } from '../lib/util';

export function StatusBadge({ status, size = 'sm', withIcon = true, className = '', onClick }) {
  const meta = STATUS_META[status] || STATUS_META.unknown;
  return (
    <Badge
      variant={meta.variant}
      size={size}
      icon={withIcon ? meta.icon : undefined}
      className={cn(status === 'testing' && 'animate-pulse', onClick && 'cursor-pointer hover:brightness-110', className)}
      onClick={onClick}
    >
      {meta.label}
    </Badge>
  );
}

const HUB_EXPLAIN = {
  thinking: { title: 'Thinking / raciocínio', text: 'O modelo expõe ou usa “chain-of-thought”/raciocínio; a resposta pode conter tokens de pensamento e ser mais lenta.' },
  vision: { title: 'Vision / imagem', text: 'O modelo aceita entradas visuais/mídia em mensagens (ex.: imagem/PNG) além de texto.' },
  ...STATUS_EXPLAIN,
};

export function HubExplainModal({ item, onClose }) {
  const data = HUB_EXPLAIN[item] || STATUS_EXPLAIN.unknown;
  return (
    <Modal isOpen={!!item} onClose={onClose} title={data.title} size="sm">
      <p className="text-text-main text-sm leading-relaxed">{data.text}</p>
      <p className="text-xs text-text-muted mt-3">Clique fora para fechar.</p>
    </Modal>
  );
}

function Row({ name, status, message, latency }) {
  const ok = status === 'available';
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border-subtle last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs text-text-main truncate">{name}</p>
        {message && <p className="text-[11px] text-text-muted truncate">{message}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {typeof latency === 'number' && latency > 0 && (
          <span
            className={cn(
              'text-[11px] font-mono px-1.5 py-0.5 rounded',
              ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            )}
          >
            {latency}ms
          </span>
        )}
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export function TestResultsModal({ isOpen, onClose, title = 'Resultados dos testes', endpoint, results = [], summary }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <Button variant="primary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {summary && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="success" size="lg" icon="check_circle">
              {summary.passed} ok
            </Badge>
            <Badge variant="error" size="lg" icon="error">
              {summary.failed} falha
            </Badge>
            <Badge variant="default" size="lg" icon="analytics">
              {summary.total} modelos
            </Badge>
          </div>
        )}

        {endpoint && (
          <div className="rounded-[10px] border border-border-subtle bg-surface-2/60 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">Endpoint</p>
            <Row name="GET /models" status={endpoint.status} message={endpoint.message} latency={endpoint.latency} />
          </div>
        )}

        {results.length > 0 && (
          <div className="rounded-[10px] border border-border-subtle bg-surface-2/40 px-3 py-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 pt-2">Modelos</p>
            {results.map((r) => (
              <Row key={r.model} name={r.model} status={r.status} message={r.message} latency={r.latency} />
            ))}
          </div>
        )}

        <p className="text-xs text-text-muted">
          Os testes rodam no backend local (Node) — sem bloqueio de CORS e sem chamadas em segundo plano: cada teste
          acontece quando você clica em um botão.
        </p>
      </div>
    </Modal>
  );
}
