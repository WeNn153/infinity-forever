# Infinity Forever — Hub Local de APIs, Provedores e Modelos de IA

[![Status](https://img.shields.io/badge/status-early%20access-orange)](https://github.com/WeNn153/infinity-forever)
[![Vibecoded](https://img.shields.io/badge/vibecoded-IA%20assistido-purple)](https://github.com/WeNn153/infinity-forever)

> **Early access.** Este projeto foi vibecodado (construído com assistência de IA) e ainda está em fase inicial. Espere bugs, mudanças de UI e de fluxo ao longo do tempo. Toda ajuda, issue ou estrela é muito bem-vinda.

## O que é (e o que NÃO é)

O Infinity Forever é um **hub local** para **registrar, testar e acompanhar** APIs, provedores e modelos de IA (Groq, OpenAI, Anthropic, OpenRouter, Gemini, DeepSeek, Mistral, xAI e mais 85+). Ele se limita a:

- salvar **chaves de API** de provedores que você mesmo cadastra;
- detectar endpoints e modelos disponíveis;
- identificar se cada provedor/modelo está **funcionando** (online / rate limit / offline);
- medir latência e registrar consumo (tokens de entrada/saída).

**Não é um gateway com fallback automático.** Não existe roteamento inteligente, failover ou retry entre provedores. O que ele entrega é um painel único para você **fazer o fallback manualmente**: quando um provedor cai, você vê isso na hora e troca a chave/modelo à mão. Isso é deliberado e é a proposta central da ferramenta.

## Para quem foi feito

Foi pensado e desenhado para **pessoas que usam IAs agênticas do Hermes (ou qualquer CLI)** no celular (embora tambem seje compatível em PCs e etc)! E que **não conseguem usar seus 9routers ou OmniRouter por falta de compatibilidade**. Quem depende dessas ferramentas para rotear entre provedores acaba travado; com o Infinity Forever, o fallback continua possível — só que de forma manual, através de um hub local que mostra, com clareza, os modelos e provedores online ou offline. 

Também funciona em **PCs, notebooks e ambientes locais em geral** (Linux, macOS, Windows). É essencialmente um app de navegador + Node rodando na sua máquina! 

## Privacidade — app 100% local

- **Nenhuma chave ou dado seu sai da sua máquina.** O app roda 100% localmente (Node + frontend em localhost).
- Sua **chave de API**, endpoint e modelos ficam **apenas no seu navegador** (localStorage) e no arquivo local `server/data.json` (que está no `.gitignore` para nunca ser versionado).
- O proxy é local; **não há telemetria, cloud, multi-tenancy ou servidor remoto.** O app não cruza seus dados em nenhum servidor.
- O backend escuta em `0.0.0.0` apenas para permitir acesso na rede local (ex.: abrir no celular). Se a sua máquina estiver exposta à internet, abra as portas com cuidado: **não há autenticação** nessa versão. E o processamento do app é todo local também. Ou seja, 100% de privacidade. 

## Funcionalidades

- Catálogo de **85+ provedores** com links oficiais para "Gerar API key" tudo de forma completamente fácil para você.
- Adicionar provedor **colocando só a chave**; endpoint e modelos são detectados automaticamente, independentemente do provedor, apenas a API já basta.
- **Testes no servidor (sem CORS)**: É rodado um script de teste no app (com o seu consentimento e autonomia) de "oi" ao modelo em questão, e ele respondendo, já mede a latência + se esta online ou offline. 
- **Testar um modelo**, **um provedor** ou **Testar tudo** com progresso real 0-100%: Se quiser testar 1 model? Dá. Testar 1 provedor? Dá. Testar TUDO? DÁ TÁMBEM! 
- **Hub "Seus modelos"**: pílulas dos provedores lado a lado (clique abre a lista); copia, teste e filtragem; badges Vision/Thinking; status explicável.
- Dashboard de **Consumo automático** (28 dias) com input/output/total + ranking de provedores e modelos usados (20s auto). (O rastreio de uso pode haver erros, se caso houver, por favor informar issue) 
- Endpoint de gateway OpenAI-compatible em `http://localhost:3001/v1/chat/completions`, grava consumo automaticamente (shell local).
- Persistência local 100%, sem login, sem email, sem cadastro e sem senhas. 

## Requisitos

- Node.js 18+ (testado v24).
- npm/yarn/pnpm
- Portas livres **3000** (UI) e **3001** (backend). **3099** (mock, opcional).

## Instalação (rodando na sua máquina)

```bash
# clone
git clone https://github.com/WeNn153/infinity-forever.git
cd infinity-forever

# dependencias
npm install

# sobe backend (:3001) + frontend (:3000)
npm start

# abrir no navegador
xdg-open http://localhost:3000
```

Se preferir etapas separadas:
```bash
npm run start:api # só backend (porta 3001)
npm run start:ui  # só UI (proxy /api,/v1 -> 3001)
npm run start:mock # provedor mock OpenAI-compatível em :3099 (para testes)
npm run build     # build de produção em ./build
npm run serve     # serve build
```

## Como usar (fluxo típico)

1. Suba com `npm start` e abra http://localhost:3000.
2. Vá em **Provedores** → escolha um provedor no catálogo → clique **Conectar** → cole a API key.
3. App detecta endpoint + modelos automaticamente; veja bolinhas verde (online) / amarela (rate limit) / vermelha (offline).
4. **Testar provedor** ou **Testar tudo** (barra de progresso 0-100%) para validar tudo de uma vez.
5. Aba **Seus modelos**: pílula do provedor → todos os modelos dele com copiar/testar (isolado ou em massa); badges eye (vision) e lamp (thinking) informam capacidades.
6. **Consumo**: 28 dias de uso (input/output/total + ranking).
7. Gateway local para clientes compatíveis: `POST http://localhost:3001/v1/chat/completions` (header `Content-Type: application/json`, body `{"model":"...","messages":[...]}`).

Para usar Ollama Cloud: modelo de saída `https://ollama.com/v1`, e API key de https://ollama.com/settings/keys.

## Casos onde algo falha

- **Backend offline**: suba `npm run start:api` em terminal separado.
- **Porta ocupada**: libere portas 3000/3001 e 3099 (mock).
- **Sem modelos detectados**: use endpoint manual (Ajustes avançados → Endpoint) e adicione modelos manualmente; detecção via GET /models não é obrigatória.
- **Rate limit**: bolinhas amarelas e avisos na UI; aguarde o reset (provider) ou use plano premium. Ou simplesmente o provedor limitou o modelo para não ser usado. 
- **Visão não detectada**: envio de imagem é feito na hora do teste para validar 429/erro; modelos compatíveis reais serão detectados automaticamente. 

## Tests & verificação

```bash
npm test    # suíte UI com 57 checks (Puppeteer) -> FALHAS: 0
npm run build # compila com 3 avisos de bundle (esperado)
```

### Status interpretados

- **Bolinhas**: verde (online) · amarela (rate limit) · vermelha (offline).
- **Hub "O que isso significa?"** (clicável) explica: Online / Rate limit / Offline. Thinking/Visão têm suas explicações.

## Licença

MIT — livre para uso, fork, aprendizado. Sem afiliação com Groq/OpenAI/Anthropic/OpenRouter/Ollama.

## Motivação

Essa ferramenta foi feita puramente para solucionar a dor de quem está usando ferramentas pra modelos de IA fallback que está tendo repetidos erros de códigos quebrados. Por meio dela, você consegue fazer um fallback **manualmente**: basta colar a chave de API de seus provedores que o software identifica modelos, endpoints, provedores funcionando, offline, etc.

Tudo foi desenvolvido e facilitado com carinho por mim para que você possa usar. Considere dar uma estrela se gostar da ferramenta! :) 

## Autor e origem

- Feito por **Wender Thailan** (Brasil), vibecoded (IA-assistido). Credenciais e configurações de máquina não são compartilhadas.
- Repositório mantém o histórico (activity) — **sem segredo**, chaves não compartilhadas.

---

**Early access disclaimer:** como o projeto foi vibecodado, podem existir rough edges (UI, testes, naming). Issues e PRs são bem-vindos — o objetivo é manter o app simples, local e transparente. E mais uma vez, obrigado por usar meu app! 
