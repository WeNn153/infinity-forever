import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Toasts from './components/Toasts';
import { TestResultsModal } from './components/Status';
import { MenuContext } from './components/Topbar';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import ModelosPage from './pages/ModelosPage';
import ConsumoPage from './pages/ConsumoPage';
import { usePath, matchPath, navigate } from './router';
import { useStore } from './lib/store';
import { syncProviders } from './lib/api';
import { InfinityMark } from './components/Brand';
import { Button } from './components/ui';

const ROUTES = [
  { pattern: '/dashboard/providers/:id', render: (m) => <ProviderDetailPage providerId={m.id} /> },
  { pattern: '/dashboard/providers', render: () => <ProvidersPage /> },
  { pattern: '/dashboard/modelos', render: () => <ModelosPage /> },
  { pattern: '/dashboard/consumo', render: () => <ConsumoPage /> },
  { pattern: '/dashboard/tokens', render: () => <ConsumoPage /> },
  { pattern: '/dashboard', render: () => <ProvidersPage /> },
  { pattern: '/', render: () => <ProvidersPage /> },
];

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <InfinityMark size={72} />
      <h2 className="text-xl font-semibold">Página não encontrada</h2>
      <p className="text-sm text-text-muted">O endereço acessado não existe no Infinity Forever.</p>
      <Button icon="arrow_back" onClick={() => navigate('/dashboard/providers')}>
        Ir para Provedores
      </Button>
    </div>
  );
}

export default function App() {
  const path = usePath();
  const store = useStore();
  const [drawer, setDrawer] = useState(false);
  const [globalResults, setGlobalResults] = useState(null);

  useEffect(() => {
    if (path === '/' || path === '/dashboard') navigate('/dashboard/providers', { replace: true });
  }, [path]);

  /* sincroniza os provedores registrados com o backend no boot
     (o gateway e o dashboard de consumo precisam saber quem está conectado) */
  useEffect(() => {
    syncProviders(store.providers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { providerName, summary } = e.detail || {};
      if (summary) setGlobalResults({ title: `Testes — ${providerName || 'provedor'}`, ...summary });
    };
    window.addEventListener('infinity:test-results', handler);
    return () => window.removeEventListener('infinity:test-results', handler);
  }, []);

  let content = <NotFound />;
  for (const route of ROUTES) {
    const params = matchPath(route.pattern, path);
    if (params) {
      content = route.render(params);
      break;
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg text-text-main flex">
      {/* fundo com grade sutil */}
      <div className="pointer-events-none fixed inset-0 page-grid" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(900px 500px at 12% -8%, rgba(139,92,246,0.16), transparent 60%), radial-gradient(800px 520px at 92% 108%, rgba(124,58,237,0.13), transparent 60%)',
        }}
      />

      {/* Sidebar desktop */}
      <div className="hidden lg:flex shrink-0 relative z-10 h-full">
        <Sidebar />
      </div>

      {/* Drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] fade-in" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] slide-in-right">
            <Sidebar onClose={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <MenuContext.Provider value={() => setDrawer(true)}>
        <main className="flex-1 min-w-0 flex flex-col relative z-10">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 lg:px-8 py-4">
            <div className="mx-auto w-full max-w-7xl flex flex-col min-h-full">{content}</div>
          </div>
        </main>
      </MenuContext.Provider>

      <Toasts />

      <TestResultsModal
        isOpen={!!globalResults}
        onClose={() => setGlobalResults(null)}
        title={globalResults ? globalResults.title : 'Resultados'}
        endpoint={globalResults ? globalResults.endpoint : null}
        results={globalResults ? globalResults.results : []}
        summary={
          globalResults
            ? { passed: globalResults.passed, failed: globalResults.failed, total: globalResults.total }
            : null
        }
      />

      {/* dados carregados — mantém referência viva do store no render */}
      <span className="hidden" data-providers={store.providers.length} />
    </div>
  );
}
