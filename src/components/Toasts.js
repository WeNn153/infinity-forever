import React from 'react';
import { useStore, dismissToast } from '../lib/store';
import { cn } from '../lib/util';

const TONES = {
  success: { icon: 'check_circle', color: 'text-emerald-400', bar: 'bg-emerald-500' },
  error: { icon: 'error', color: 'text-red-400', bar: 'bg-red-500' },
  warning: { icon: 'warning', color: 'text-amber-400', bar: 'bg-amber-500' },
  info: { icon: 'info', color: 'text-blue-400', bar: 'bg-blue-500' },
  default: { icon: 'notifications', color: 'text-brand-400', bar: 'bg-brand-500' },
};

export default function Toasts() {
  const { toasts } = useStore();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(92vw,340px)] pointer-events-none">
      {toasts.map((t) => {
        const tone = TONES[t.variant] || TONES.default;
        return (
          <div
            key={t.id}
            className="pointer-events-auto relative overflow-hidden bg-surface border border-border rounded-[12px] shadow-[var(--shadow-elev)] p-3 pl-4 toast-in"
            onClick={() => dismissToast(t.id)}
          >
            <span className={cn('absolute left-0 top-0 h-full w-1', tone.bar)} />
            <div className="flex items-start gap-2">
              <span className={cn('material-symbols-outlined text-[18px] mt-0.5', tone.icon)}>{tone.icon}</span>
              <div className="min-w-0">
                <p className="text-sm text-text-main font-medium break-words">{t.message}</p>
                {t.detail && <p className="text-xs text-text-muted mt-0.5 break-words">{t.detail}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
