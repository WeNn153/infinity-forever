/**
 * Mock OpenAI-compatível para testes de UI (porta 3099).
 * GET  /v1/models                → lista de modelos
 * POST /v1/chat/completions      → conclusão com usage (tokens)
 */
const http = require('http');

const MODELS = ['mock-alpha', 'mock-beta', 'mock-gamma'];

const server = http.createServer((req, res) => {
  const send = (status, obj) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };

  if (req.method === 'GET' && /^\/v1\/models\/?$/.test(req.url)) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      // simula os headers de rate limit da Groq (usados na página de Quota)
      'x-ratelimit-limit-requests': '1000',
      'x-ratelimit-remaining-requests': '750',
      'x-ratelimit-limit-tokens': '100000',
      'x-ratelimit-remaining-tokens': '62000',
      'x-ratelimit-reset-requests': '1h0m0s',
    });
    res.end(JSON.stringify({ object: 'list', data: MODELS.map((id) => ({ id, object: 'model' })) }));
    return undefined;
  }

  if (req.method === 'POST' && /^\/v1\/chat\/completions\/?$/.test(req.url)) {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
    });
    req.on('end', () => {
      let body = {};
      try {
        body = JSON.parse(raw || '{}');
      } catch (e) {
        body = {};
      }
      const model = body.model || MODELS[0];
      const promptTokens = 120;
      const completionTokens = 45;
      return send(200, {
        id: 'chatcmpl-mock',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'ok (mock)' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        },
      });
    });
    return undefined;
  }

  return send(404, { error: { message: 'not found' } });
});

server.listen(3099, '127.0.0.1', () => {
  console.log('[mock] openai-compat em http://127.0.0.1:3099/v1');
});
