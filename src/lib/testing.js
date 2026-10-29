import { testModelServer, testProviderServer } from './api';

export const TEST_TIMEOUT = 9000;

/**
 * Status → metadados de exibição (bolinha verde/vermelha etc.).
 * available = verde (ativo) · unavailable/unreachable = vermelho (inativo)
 */
export const STATUS_META = {
  available: { label: 'Online (ativo)', variant: 'success', icon: 'check_circle' },
  'rate-limited': { label: 'Rate limit', variant: 'warning', icon: 'thunderstorm' },
  unavailable: { label: 'Offline (inativo)', variant: 'error', icon: 'cancel' },
  unreachable: { label: 'Sem resposta', variant: 'error', icon: 'wifi_off' },
  testing: { label: 'Testando…', variant: 'warning', icon: 'progress_activity' },
  unknown: { label: 'Não testado', variant: 'default', icon: 'help' },
  error: { label: 'Offline (erro)', variant: 'error', icon: 'error' },
};

export const STATUS_EXPLAIN = {
  available: { title: 'Online (ativo)', text: 'O modelo respondeu com sucesso e pode ser usado.' },
  'rate-limited': { title: 'Rate limit', text: 'O modelo não pode ser usado no momento porque o provedor limitou o consumo (HTTP 429). Aguarde o reset ou troque de chave.' },
  unavailable: { title: 'Offline (inativo)', text: 'O modelo/provedor não respondeu corretamente (chave inválida ou endpoint errado).' },
  unreachable: { title: 'Sem resposta', text: 'O provedor não respondeu (timeout, DNS ou bloqueio).' },
  testing: { title: 'Testando…', text: 'Ainda não foi testado ou está em processamento.' },
  unknown: { title: 'Não testado', text: 'Ainda não foi testado; clique em Test.' },
  error: { title: 'Offline (erro)', text: 'Erro genérico na medição.' },
};

/* Testes rodam no backend local (Node) — sem CORS. */
export async function testModelRequest(provider, modelName) {
  try {
    return await testModelServer(provider, modelName);
  } catch (err) {
    return { status: 'unreachable', message: err.message, latency: null };
  }
}

export async function testProviderEndpoint(provider) {
  try {
    const result = await testProviderServer(provider, false);
    return result.endpoint;
  } catch (err) {
    return { status: 'unreachable', message: err.message, latency: null };
  }
}
