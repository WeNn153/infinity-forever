import React, { useEffect, useRef, useState } from 'react';
import { cn, copyText } from '../lib/util';

/* ------------------------------------------------------------------ Button */
const BTN_VARIANTS = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm disabled:bg-surface-3 disabled:text-text-muted',
  secondary: 'bg-surface-2 hover:bg-surface-3 text-text-main border border-border disabled:opacity-50',
  outline: 'border border-border text-text-main hover:bg-surface-2 hover:border-brand-500/50',
  ghost: 'text-text-muted hover:bg-surface-2 hover:text-text-main',
  danger: 'bg-red-500/90 hover:bg-red-600 text-white shadow-sm disabled:bg-surface-3 disabled:text-text-muted',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:bg-surface-3 disabled:text-text-muted',
  purple: 'bg-primary/15 border border-primary/40 text-brand-300 hover:bg-primary/25',
};

const BTN_SIZES = {
  xs: 'h-6 px-2.5 text-[11px] rounded-[6px] gap-1.5',
  sm: 'h-7 px-3 text-xs rounded-[8px]',
  md: 'h-9 px-4 text-sm rounded-[10px]',
  lg: 'h-11 px-6 text-sm rounded-[10px]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  title,
  type = 'button',
  onClick,
  ...rest
}) {
  const iconSize = size === 'xs' ? 'text-[13px]' : size === 'lg' ? 'text-[20px]' : 'text-[18px]';
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out cursor-pointer',
        'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        BTN_VARIANTS[variant] || BTN_VARIANTS.primary,
        BTN_SIZES[size] || BTN_SIZES.md,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className={cn('material-symbols-outlined animate-spin', iconSize)}>progress_activity</span>
      ) : icon ? (
        <span className={cn('material-symbols-outlined', iconSize)}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading ? (
        <span className={cn('material-symbols-outlined', iconSize)}>{iconRight}</span>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------- Badge */
const BADGE_VARIANTS = {
  default: 'bg-surface-2 text-text-muted',
  primary: 'bg-brand-500/10 text-brand-400',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  error: 'bg-red-500/10 text-red-400',
  info: 'bg-blue-500/10 text-blue-400',
  purple: 'bg-primary/10 text-brand-300',
};

const BADGE_SIZES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const DOT_COLORS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  primary: 'bg-brand-500',
  purple: 'bg-brand-400',
  default: 'bg-gray-500',
};

export function Badge({ children, variant = 'default', size = 'md', dot = false, icon, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        BADGE_VARIANTS[variant] || BADGE_VARIANTS.default,
        BADGE_SIZES[size] || BADGE_SIZES.md,
        className
      )}
    >
      {dot ? <span className={cn('size-1.5 rounded-full', DOT_COLORS[variant] || DOT_COLORS.default)} /> : null}
      {icon ? <span className="material-symbols-outlined text-[14px]">{icon}</span> : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------- Card */
export function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = 'md',
  hover = false,
  elev = false,
  className = '',
  ...rest
}) {
  const pad = { none: '', xs: 'p-3', sm: 'p-4', md: 'p-6', lg: 'p-8' }[padding] || 'p-6';
  return (
    <div
      className={cn(
        'bg-surface border border-border-subtle rounded-[14px]',
        elev ? 'shadow-[var(--shadow-elev)]' : 'shadow-[var(--shadow-soft)]',
        hover && 'hover:shadow-[var(--shadow-warm)] hover:border-brand-500/40 transition-all cursor-pointer',
        pad,
        className
      )}
      {...rest}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="p-2 rounded-[10px] bg-surface-2 text-brand-400 shrink-0">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-text-main font-semibold truncate">{title}</h3>}
              {subtitle && <p className="text-sm text-text-muted truncate">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- Input */
export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  icon,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  mono = false,
  ...rest
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-text-main">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'w-full py-2.5 px-3 text-sm text-text-main bg-surface-2 rounded-[10px]',
            'border border-transparent placeholder:text-text-muted/60',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40',
            'transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed',
            'text-[16px] sm:text-sm',
            icon && 'pl-10',
            mono && 'font-mono',
            error && 'ring-1 ring-red-500 focus:ring-2 focus:ring-red-500/40 border-red-500/40',
            inputClassName
          )}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, hint, className = '', ...rest }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-sm font-medium text-text-main">{label}</label>}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-3 py-2.5 text-sm text-text-main bg-surface-2 rounded-[10px] border border-transparent font-mono placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all resize-y"
        {...rest}
      />
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options = [], className = '', disabled, hint, ...rest }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-sm font-medium text-text-main">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-9 px-3 rounded-[10px] bg-surface-2 border border-transparent text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all cursor-pointer disabled:opacity-50"
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ Toggle */
export function Toggle({ checked, onChange, disabled = false, label, size = 'md', title, id }) {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const knob = size === 'sm' ? 'size-4' : 'size-5';
  const move = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <label
      htmlFor={id}
      title={title}
      className={cn('inline-flex items-center gap-2 select-none', disabled ? 'opacity-50' : 'cursor-pointer')}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onChange && onChange(!checked);
        }}
        className={cn(
          'relative inline-flex shrink-0 rounded-full transition-colors duration-200 border',
          w,
          checked ? 'bg-brand-500 border-brand-400' : 'bg-surface-3 border-border'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform duration-200',
            knob,
            checked && move
          )}
        />
      </button>
      {label && <span className="text-xs text-text-muted">{label}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ Modal */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  showTrafficLights = true,
  className = '',
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const width =
    { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', full: 'max-w-4xl' }[size] || 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        className={cn(
          'relative w-full bg-surface border border-border-subtle rounded-[14px] shadow-[var(--shadow-elev)] fade-in',
          width,
          className
        )}
      >
        {(title || showTrafficLights) && (
          <div className="flex items-center justify-between p-2 border-b border-border-subtle gap-3">
            <div className="flex items-center min-w-0">
              {showTrafficLights && (
                <div className="hidden md:flex items-center gap-2 mr-4 ml-2 shrink-0">
                  <button
                    onClick={onClose}
                    aria-label="Fechar"
                    title="Fechar"
                    className="w-4 h-4 rounded-full bg-[#FF5F56] hover:brightness-90 transition-all cursor-pointer"
                  />
                  <div className="w-4 h-4 rounded-full bg-white/10 cursor-not-allowed" />
                  <div className="w-4 h-4 rounded-full bg-white/10 cursor-not-allowed" />
                </div>
              )}
              {title && <h2 className="text-lg font-semibold text-text-main truncate">{title}</h2>}
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="md:hidden p-1.5 rounded-[10px] text-text-muted hover:bg-surface-2 hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        <div className="p-6 max-h-[calc(85vh-110px)] overflow-y-auto custom-scrollbar">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-border-subtle">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-text-muted">{message}</p>
    </Modal>
  );
}

/* -------------------------------------------------------------- EmptyState */
export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="text-center py-10 border border-dashed border-border rounded-xl">
      <span className="material-symbols-outlined text-[32px] text-text-muted mb-2 block">{icon}</span>
      <p className="text-text-main font-medium">{title}</p>
      {description && <p className="text-text-muted text-sm mt-1">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 20, className = '' }) {
  return (
    <span className={cn('material-symbols-outlined animate-spin text-brand-500', className)} style={{ fontSize: size }}>
      progress_activity
    </span>
  );
}

/* -------------------------------------------------------------- CopyButton */
export function CopyButton({ value, label = 'Copiar', className = '' }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const ok = await copyText(value);
        if (ok) {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }
      }}
      className={cn(
        'p-1 rounded-md text-text-muted hover:text-brand-300 hover:bg-surface-2 transition-colors',
        done && 'text-emerald-400',
        className
      )}
    >
      <span className="material-symbols-outlined text-[16px]">{done ? 'check' : 'content_copy'}</span>
    </button>
  );
}

/* ------------------------------------------------------------ Field / Row */
export function Field({ label, children, hint, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</span>
      <div className="text-sm text-text-main min-w-0 break-words">{children}</div>
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </div>
  );
}

export function useAutoFocus(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (active && ref.current) ref.current.focus();
  }, [active]);
  return ref;
}
