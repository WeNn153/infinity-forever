import React, { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { Card, EmptyState, Spinner } from '../components/ui';
import { fetchUsage } from '../lib/api';
import { cn, formatCompact, formatNumber } from '../lib/util';

const REFRESH_MS = 20000;

function StatCard({ label, value, tone = 'default', sub }) {
  const tones = {
    default: 'text-text-main',
    input: 'text-brand-300',
    output: 'text-emerald-400',
    total: 'text-text-main',
  };
  return (
    <Card padding="sm" className="flex flex-col gap-1 min-w-0 items-center text-center">
      <span className="text-text-muted text-[11px] uppercase font-semibold tracking-wider">{label}</span>
      <span
        className={cn('w-full truncate text-xl font-bold tracking-tight', tones[tone] || tones.default)}
        title={formatNumber(value)}
      >
        {formatCompact(value)}
      </span>
      {sub && <span className="text-[10px] text-text-muted">{sub}</span>}
    </Card>
  );
}

function PeriodSection({ title, icon, stats }) {
  const total = stats ? stats.total : 0;
  return (
    <Card padding="md" className="flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-semibold flex items-center gap-2 text-text-main">
          <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
          {title}
        </h3>
        <span className="text-xs text-text-muted">{stats ? `${formatNumber(stats.requests)} requisições` : '—'}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Input" value={stats ? stats.input : 0} tone="input" sub="tokens de entrada" />
        <StatCard label="Output" value={stats ? stats.output : 0} tone="output" sub="tokens de saída" />
        <StatCard label="Total" value={total} tone="total" sub="input + output" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-border-subtle">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Provedores mais usados</p>
          {!stats || stats.byProvider.length === 0 ? (
            <p className="text-xs text-text-muted">Sem consumo no período.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.byProvider.slice(0, 6).map((p, idx) => {
                const pct = total ? Math.round((p.total / total) * 100) : 0;
                return (
                  <div key={p.id || p.name || idx} className="min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <span className="truncate text-text-main font-medium">{p.name}</span>
                      <span className="shrink-0 text-text-muted font-mono">
                        {formatCompact(p.total)} tok · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Modelos mais usados</p>
          {!stats || stats.byModel.length === 0 ? (
            <p className="text-xs text-text-muted">Sem consumo no período.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {stats.byModel.slice(0, 6).map((m, idx) => {
                const pct = total ? Math.round((m.total / total) * 100) : 0;
                return (
                  <div key={m.name || idx} className="flex items-center gap-2 min-w-0 rounded-lg bg-surface-2/60 px-2.5 py-1.5">
                    <span className="text-[10px] font-bold text-text-muted w-4 shrink-0">{idx + 1}</span>
                    <span className="font-mono text-xs text-text-main truncate flex-1 min-w-0" title={m.name}>{m.name}</span>
                    <span className="shrink-0 text-[11px] font-mono text-brand-300">{formatCompact(m.total)}</span>
                    <span className="shrink-0 text-[10px] text-text-muted w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ConsumoPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchUsage()
        .then((d) => { if (!alive) return; setData(d); setError(''); })
        .catch((err) => { if (alive) setError(err.message); });
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  const d28 = data ? data.d28 : null;
  const hasData = !!(d28 && d28.requests > 0);

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <Topbar
        icon="monitoring"
        title="Consumo"
        description="Automático: todos os testes e chamadas do gateway local entram aqui (28 dias) — sem botões nem formulário."
        actions={
          <div className="flex items-center gap-2 text-xs text-text-muted">
            {error ? (
              <span className="text-red-400">backend offline</span>
            ) : !data ? (
              <Spinner size={16} />
            ) : (
              <span className="hidden sm:inline">atualiza sozinho a cada {REFRESH_MS / 1000}s · 28 dias</span>
            )}
          </div>
        }
      />

      {error && (
        <Card padding="md" className="border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-300">Não foi possível ler o consumo: {error}. Suba o backend com <code>npm start</code>.</p>
        </Card>
      )}

      {!error && !data ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : !hasData ? (
        <EmptyState
          icon="monitoring"
          title="Ainda sem consumo registrado"
          description="Os testes de modelos e as chamadas feitas pelo gateway local (http://localhost:3001/v1) são contados aqui automaticamente."
        />
      ) : (
        <PeriodSection title="Últimos 28 dias" icon="date_range" stats={d28} />
      )}
    </div>
  );
}