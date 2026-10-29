import React from 'react';
import { INFINITY_D } from '../lib/logoPath';
import { cn } from '../lib/util';

/* Marca do Infinity Forever: símbolo do infinito sobre fundo roxo. */
export function InfinityMark({ size = 36, className = '', round = false }) {
  const gid = React.useMemo(() => `ifm${Math.round(size)}${Math.random().toString(36).slice(2, 7)}`, [size]);
  const rx = round ? size / 2 : size * 0.24;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Infinity Forever"
    >
      <defs>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="52%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <radialGradient id={`${gid}-glow`} cx="28%" cy="22%" r="78%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="500" height="500" rx={(rx * 512) / size} fill={`url(#${gid}-bg)`} />
      <rect x="6" y="6" width="500" height="500" rx={(rx * 512) / size} fill={`url(#${gid}-glow)`} />
      <rect
        x="9"
        y="9"
        width="494"
        height="494"
        rx={((rx * 512) / size) - 3}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.18"
        strokeWidth="5"
      />
      <g transform="translate(256 256) scale(0.96) translate(-256 -256)">
        <path
          d={INFINITY_D}
          fill="none"
          stroke={`url(#${gid}-stroke)`}
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/* Avatar do provedor: usa a logo quando disponível; senão iniciais coloridas. */
export function ProviderLogo({ provider, size = 34, className = '' }) {
  const color = provider?.color || '#8b5cf6';
  const text = provider?.name || provider?.prefix || '?';
  const logoUrl = provider?.logoUrl;
  const initials = text
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const [failed, setFailed] = React.useState(false);

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={text}
        title={text}
        onError={() => setFailed(true)}
        className={cn('object-contain shrink-0', className)}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, size * 0.28),
        }}
      />
    );
  }

  return (
    <div
      className={cn('flex items-center justify-center shrink-0 font-bold select-none', className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(6, size * 0.28),
        background: `linear-gradient(135deg, ${color}33, ${color}14)`,
        border: `1px solid ${color}55`,
        color,
        fontSize: Math.max(11, size * 0.36),
        letterSpacing: '0.02em',
      }}
      title={text}
    >
      {initials || '?'}
    </div>
  );
}
