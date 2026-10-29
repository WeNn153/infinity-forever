import React, { useState } from 'react';
import { Link, usePath, navigate } from '../router';
import { InfinityMark } from './Brand';
import { Button, ConfirmModal } from './ui';
import { cn } from '../lib/util';
import { useStore, resetAll, toast } from '../lib/store';

const MAIN_NAV = [
  { href: '/dashboard/modelos', label: 'Seus modelos', icon: 'hub' },
  { href: '/dashboard/providers', label: 'Provedores', icon: 'dns' },
  { href: '/dashboard/consumo', label: 'Consumo', icon: 'monitoring' },
];

const SHORTCUTS = [
  { icon: 'add_circle', label: 'Novo Provedor', event: 'infinity:new-provider', to: '/dashboard/providers' },
];

function isActive(path, href) {
  if (href === '/dashboard/providers') return path.startsWith('/dashboard/providers');
  return path.startsWith(href);
}

export default function Sidebar({ onClose }) {
  const path = usePath();
  const store = useStore();
  const [confirm, setConfirm] = useState(false);

  const trigger = (item) => {
    navigate(item.to);
    setTimeout(() => window.dispatchEvent(new CustomEvent(item.event)), 0);
    if (onClose) onClose();
  };

  const renderNavItem = (item) => {
    const active = isActive(path, item.href);
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all group',
          active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-2 hover:text-text-main'
        )}
      >
        <span
          className={cn(
            'material-symbols-outlined text-[18px]',
            active ? 'fill-1' : 'group-hover:text-primary transition-colors'
          )}
        >
          {item.icon}
        </span>
        <span className="text-[13px] font-medium truncate">{item.label}</span>
        {item.href === '/dashboard/providers' && (
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] bg-surface-2 text-text-muted">
            {store.providers.length}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="flex w-72 flex-col border-r border-border-subtle bg-vibrancy backdrop-blur-xl h-full">
      {/* semáforo estilo janela */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-2 shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
      </div>

      {/* marca */}
      <div className="px-6 py-4 flex flex-col gap-1 shrink-0">
        <Link to="/dashboard/providers" onClick={onClose} className="flex items-center gap-3 min-w-0">
          <InfinityMark size={36} className="shadow-[var(--shadow-warm)] shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-text-main truncate">Infinity Forever</h1>
            <span className="text-xs text-text-muted">v2.0.0 · registro de provedores</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto custom-scrollbar min-h-0">
        {MAIN_NAV.map(renderNavItem)}

        <div className="pt-4 mt-3 border-t border-border-subtle space-y-0.5">
          <p className="px-3 text-xs font-semibold text-text-muted/60 uppercase tracking-wider mb-2">Atalhos</p>
          {SHORTCUTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => trigger(item)}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all group text-text-muted hover:bg-surface-2 hover:text-text-main cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">
                {item.icon}
              </span>
              <span className="text-[13px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-4 mt-3 border-t border-border-subtle">
          <p className="px-3 text-xs font-semibold text-text-muted/60 uppercase tracking-wider mb-2">Estado</p>
          <div className="px-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Provedores</span>
              <span className="text-text-main font-medium">{store.providers.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Modelos</span>
              <span className="text-text-main font-medium">
                {store.providers.reduce((acc, p) => acc + p.models.length, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Ativos</span>
              <span className="text-emerald-400 font-medium">
                {store.providers.reduce(
                  (acc, p) => acc + p.models.filter((m) => m.status === 'available').length,
                  0
                )}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-border-subtle shrink-0 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <span className="material-symbols-outlined text-[14px] text-brand-400">storage</span>
          <span className="truncate">Registro local · consumo via gateway :3001</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="xs"
            variant="ghost"
            icon="delete_sweep"
            className="flex-1"
            onClick={() => setConfirm(true)}
          >
            Limpar tudo
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          resetAll();
          setConfirm(false);
          toast('Todos os registros foram apagados', 'warning');
        }}
        title="Limpar todos os dados"
        message="Isso apaga provedores, modelos e API keys registrados neste navegador. Não há como desfazer."
        confirmText="Apagar tudo"
      />
    </aside>
  );
}
