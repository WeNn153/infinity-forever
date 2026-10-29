import React, { useCallback, useEffect, useState } from 'react';

function currentPath() {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname + window.location.search;
}

export function navigate(to, { replace = false } = {}) {
  if (typeof window === 'undefined') return;
  const url = to.startsWith('/') ? to : `/${to}`;
  if (replace) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
  window.dispatchEvent(new Event('infinity:navigate'));
}

export function usePath() {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const update = () => setPath(currentPath());
    window.addEventListener('popstate', update);
    window.addEventListener('infinity:navigate', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('infinity:navigate', update);
    };
  }, []);
  return path;
}

export function Link({ to, className, children, onClick, title, style, ...rest }) {
  const handle = useCallback(
    (e) => {
      if (onClick) onClick(e);
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to);
    },
    [to, onClick]
  );
  return (
    <a href={to} className={className} onClick={handle} title={title} style={style} {...rest}>
      {children}
    </a>
  );
}

/** Converte "/dashboard/providers/:id" em matcher simples. */
export function matchPath(pattern, path) {
  const p = path.split('?')[0].replace(/\/+$/, '') || '/';
  const parts = pattern.split('/').filter(Boolean);
  const segs = p.split('/').filter(Boolean);
  if (parts.length !== segs.length) return null;
  const params = {};
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i].startsWith(':')) params[parts[i].slice(1)] = decodeURIComponent(segs[i]);
    else if (parts[i] !== segs[i]) return null;
  }
  return params;
}
