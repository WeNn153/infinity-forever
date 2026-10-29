import React, { useContext } from 'react';
import { Link } from '../router';
import { cn } from '../lib/util';

/* Contexto do botão de menu (hambúrguer) do mobile — fornecido pelo App. */
export const MenuContext = React.createContext(null);

export default function Topbar({ icon, title, description, breadcrumbs = [], actions, onMenuClick }) {
  const ctxMenu = useContext(MenuContext);
  const openMenu = onMenuClick || ctxMenu;
  return (
    <header className="shrink-0 flex items-center justify-between gap-3 px-4 lg:px-8 pt-3 pb-3 border-b border-border-subtle bg-surface/60 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none z-20">
      <div className="flex items-center gap-3 lg:hidden shrink-0">
        {openMenu && (
          <button
            onClick={openMenu}
            className="text-text-main hover:text-primary transition-colors"
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        {breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <div
                key={`${crumb.label}-${idx}`}
                className={cn(
                  'items-center gap-1.5 min-w-0',
                  idx < breadcrumbs.length - 1 ? 'hidden sm:flex shrink-0' : 'flex flex-1'
                )}
              >
                {idx > 0 && (
                  <span className="material-symbols-outlined text-text-muted text-base hidden sm:inline">
                    chevron_right
                  </span>
                )}
                {crumb.to ? (
                  <Link to={crumb.to} className="text-text-muted hover:text-primary transition-colors truncate">
                    {crumb.label}
                  </Link>
                ) : (
                  <h1 className="text-base lg:text-2xl font-semibold text-text-main tracking-tight truncate">
                    {crumb.label}
                  </h1>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 min-w-0">
              {icon && (
                <span className="material-symbols-outlined text-primary text-xl lg:text-2xl shrink-0">{icon}</span>
              )}
              <h1 className="text-base lg:text-2xl font-semibold tracking-tight truncate">{title}</h1>
            </div>
            {description && (
              <p className="hidden lg:block text-sm text-text-muted truncate">{description}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">{actions}</div>
    </header>
  );
}
