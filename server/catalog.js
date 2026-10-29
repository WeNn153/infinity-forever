/** catalog updated */

const CATALOG = [
  {
    "id": "openrouter",
    "name": "OpenRouter",
    "color": "#F97316",
    "apiType": "openai",
    "baseUrl": "https://openrouter.ai/api/v1",
    "apiKeyUrl": "https://openrouter.ai/settings/keys",
    "website": "https://openrouter.ai",
    "category": "Gratuito",
    "description": "27+ modelos grátis sem cartão, 200 req/dia.",
    "defaultModels": [
      "deepseek/deepseek-chat-v3-0324:free",
      "qwen/qwen3-coder:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.5-flash:free"
    ],
    "quota": "openrouter",
    "logoUrl": "/providers/openrouter.png",
    "auth": "apikey"
  },
  {
    "id": "groq",
    "name": "Groq",
    "color": "#F55036",
    "apiType": "openai",
    "baseUrl": "https://api.groq.com/openai/v1",
    "apiKeyUrl": "https://console.groq.com/keys",
    "website": "https://groq.com",
    "category": "Gratuito",
    "description": "Inferência ultra-rápida com tier grátis.",
    "defaultModels": [
      "llama-3.3-70b-versatile",
      "meta-llama/llama-4-maverick-17b-128e-instruct",
      "qwen/qwen3-32b",
      "openai/gpt-oss-120b"
    ],
    "quota": "groq",
    "logoUrl": "/providers/groq.png",
    "auth": "apikey"
  },
  {
    "id": "openai",
    "name": "OpenAI",
    "color": "#10A37F",
    "apiType": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "apiKeyUrl": "https://platform.openai.com/api-keys",
    "website": "https://platform.openai.com",
    "category": "Pago",
    "description": "Modelos GPT oficiais.",
    "defaultModels": [
      "gpt-5.5",
      "gpt-5.4-mini",
      "gpt-5.2",
      "gpt-5-mini",
      "gpt-4.1-mini"
    ],
    "logoUrl": "/providers/openai.png",
    "auth": "apikey"
  },
  {
    "id": "anthropic",
    "name": "Anthropic",
    "color": "#D97757",
    "apiType": "anthropic",
    "baseUrl": "https://api.anthropic.com/v1",
    "apiKeyUrl": "https://console.anthropic.com/settings/keys",
    "website": "https://console.anthropic.com",
    "category": "Pago",
    "description": "Modelos Claude oficiais.",
    "defaultModels": [
      "claude-sonnet-4-20250514",
      "claude-haiku-4-5-20251001",
      "claude-3-5-sonnet-20241022"
    ],
    "logoUrl": "/providers/anthropic.png",
    "auth": "apikey"
  },
  {
    "id": "gemini",
    "name": "Gemini",
    "color": "#4285F4",
    "apiType": "openai",
    "baseUrl": "https://generativelanguage.googleapis.com/v1beta/openai",
    "apiKeyUrl": "https://aistudio.google.com/app/apikey",
    "website": "https://aistudio.google.com",
    "category": "Gratuito",
    "description": "Modelos Gemini com cota grátis no AI Studio.",
    "defaultModels": [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash"
    ],
    "logoUrl": "/providers/gemini.png",
    "auth": "apikey"
  },
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "color": "#4D6BFE",
    "apiType": "openai",
    "baseUrl": "https://api.deepseek.com/v1",
    "apiKeyUrl": "https://platform.deepseek.com/api_keys",
    "website": "https://deepseek.com",
    "category": "Pago",
    "description": "Modelos R1/Chat com preço baixo.",
    "defaultModels": [
      "deepseek-chat",
      "deepseek-reasoner"
    ],
    "quota": "deepseek",
    "logoUrl": "/providers/deepseek.png",
    "auth": "apikey"
  },
  {
    "id": "mistral",
    "name": "Mistral",
    "color": "#FF7000",
    "apiType": "openai",
    "baseUrl": "https://api.mistral.ai/v1",
    "apiKeyUrl": "https://console.mistral.ai/api-keys",
    "website": "https://mistral.ai",
    "category": "Pago",
    "description": "Modelos Mistral e Codestral.",
    "defaultModels": [
      "mistral-large-latest",
      "codestral-latest",
      "mistral-medium-latest"
    ],
    "logoUrl": "/providers/mistral.png",
    "auth": "apikey"
  },
  {
    "id": "xai",
    "name": "xAI (Grok)",
    "color": "#1DA1F2",
    "apiType": "openai",
    "baseUrl": "https://api.x.ai/v1",
    "apiKeyUrl": "https://console.x.ai",
    "website": "https://x.ai",
    "category": "Pago",
    "description": "Modelos Grok.",
    "defaultModels": [
      "grok-4",
      "grok-4-fast-reasoning",
      "grok-code-fast-1",
      "grok-3"
    ],
    "logoUrl": "/providers/xai.png",
    "auth": "apikey"
  },
  {
    "id": "together",
    "name": "Together AI",
    "color": "#0F6FFF",
    "apiType": "openai",
    "baseUrl": "https://api.together.xyz/v1",
    "apiKeyUrl": "https://api.together.xyz/settings/api-keys",
    "website": "https://www.together.ai",
    "category": "Pago",
    "description": "Modelos open-source hospedados.",
    "defaultModels": [
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "deepseek-ai/DeepSeek-R1",
      "Qwen/Qwen3-235B-A22B"
    ],
    "logoUrl": "/providers/together.png",
    "auth": "apikey"
  },
  {
    "id": "cerebras",
    "name": "Cerebras",
    "color": "#FF4F00",
    "apiType": "openai",
    "baseUrl": "https://api.cerebras.ai/v1",
    "apiKeyUrl": "https://cloud.cerebras.ai/platform",
    "website": "https://www.cerebras.ai",
    "category": "Gratuito",
    "description": "Inferência rápida com tier grátis.",
    "defaultModels": [
      "llama-3.3-70b",
      "qwen-3-32b",
      "gpt-oss-120b"
    ],
    "logoUrl": "/providers/cerebras.png",
    "auth": "apikey"
  },
  {
    "id": "fireworks",
    "name": "Fireworks AI",
    "color": "#7B2EF2",
    "apiType": "openai",
    "baseUrl": "https://api.fireworks.ai/inference/v1",
    "apiKeyUrl": "https://fireworks.ai/account/api-keys",
    "website": "https://fireworks.ai",
    "category": "Pago",
    "description": "Modelos open-source rápidos.",
    "defaultModels": [
      "accounts/fireworks/models/deepseek-v3p1",
      "accounts/fireworks/models/llama-v3p3-70b-instruct"
    ],
    "logoUrl": "/providers/fireworks.png",
    "auth": "apikey"
  },
  {
    "id": "nvidia",
    "name": "NVIDIA NIM",
    "color": "#76B900",
    "apiType": "openai",
    "baseUrl": "https://integrate.api.nvidia.com/v1",
    "apiKeyUrl": "https://build.nvidia.com/settings/api-keys",
    "website": "https://developer.nvidia.com/nim",
    "category": "Gratuito",
    "description": "Créditos grátis ao criar conta.",
    "defaultModels": [
      "minimaxai/minimax-m2.7",
      "z-ai/glm-5.2",
      "deepseek-ai/deepseek-v4-flash"
    ],
    "logoUrl": "/providers/nvidia.png",
    "auth": "apikey"
  },
  {
    "id": "siliconflow",
    "name": "SiliconFlow",
    "color": "#5B6EF5",
    "apiType": "openai",
    "baseUrl": "https://api.siliconflow.com/v1",
    "apiKeyUrl": "https://cloud.siliconflow.com/account/ak",
    "website": "https://cloud.siliconflow.com",
    "category": "Gratuito",
    "description": "Modelos chineses com cota grátis.",
    "defaultModels": [
      "deepseek-ai/DeepSeek-V3.2",
      "Qwen/Qwen3.5-397B-A17B"
    ],
    "logoUrl": "/providers/siliconflow.png",
    "auth": "apikey"
  },
  {
    "id": "cohere",
    "name": "Cohere",
    "color": "#39594D",
    "apiType": "openai",
    "baseUrl": "https://api.cohere.ai/v1",
    "apiKeyUrl": "https://dashboard.cohere.com/api-keys",
    "website": "https://cohere.com",
    "category": "Gratuito",
    "description": "Modelos Command com tier grátis.",
    "defaultModels": [
      "command-a-03-2025",
      "command-r-plus-08-2024"
    ],
    "logoUrl": "/providers/cohere.png",
    "auth": "apikey"
  },
  {
    "id": "perplexity",
    "name": "Perplexity",
    "color": "#20808D",
    "apiType": "openai",
    "baseUrl": "https://api.perplexity.ai",
    "apiKeyUrl": "https://www.perplexity.ai/settings/api",
    "website": "https://www.perplexity.ai",
    "category": "Pago",
    "description": "Modelos Sonar com busca na web.",
    "defaultModels": [
      "sonar-pro",
      "sonar"
    ],
    "logoUrl": "/providers/perplexity.png",
    "auth": "apikey"
  },
  {
    "id": "kimi",
    "name": "Kimi (Moonshot)",
    "color": "#1E3A8A",
    "apiType": "anthropic",
    "baseUrl": "https://api.kimi.com/coding/v1",
    "apiKeyUrl": "https://platform.moonshot.ai/console/api-keys",
    "website": "https://platform.moonshot.ai",
    "category": "Pago",
    "description": "Modelos Kimi para código (API compatível com Anthropic).",
    "defaultModels": [
      "kimi-k3",
      "kimi-for-coding",
      "kimi-k2.6"
    ],
    "logoUrl": "/providers/kimi.png",
    "auth": "apikey"
  },
  {
    "id": "minimax",
    "name": "MiniMax",
    "color": "#7C3AED",
    "apiType": "anthropic",
    "baseUrl": "https://api.minimax.io/anthropic/v1",
    "apiKeyUrl": "https://platform.minimaxi.com/user-center/basic-information/interface-key",
    "website": "https://www.minimaxi.com",
    "category": "Pago",
    "description": "Modelos MiniMax (compatível com Anthropic).",
    "defaultModels": [
      "MiniMax-M3",
      "MiniMax-M2.7"
    ],
    "logoUrl": "/providers/minimax.png",
    "auth": "apikey"
  },
  {
    "id": "glm",
    "name": "Z.ai GLM",
    "color": "#2563EB",
    "apiType": "anthropic",
    "baseUrl": "https://api.z.ai/api/anthropic/v1",
    "apiKeyUrl": "https://open.bigmodel.cn/usercenter/apikeys",
    "website": "https://open.bigmodel.cn",
    "category": "Pago",
    "description": "Modelos GLM de código (compatível com Anthropic).",
    "defaultModels": [
      "glm-5.3",
      "glm-5.2",
      "glm-4.7"
    ],
    "logoUrl": "/providers/glm.png",
    "auth": "apikey"
  },
  {
    "id": "alicode-intl",
    "name": "Alibaba Coding",
    "color": "#FF6A00",
    "apiType": "openai",
    "baseUrl": "https://coding-intl.dashscope.aliyuncs.com/v1",
    "apiKeyUrl": "https://www.alibabacloud.com/product/coding",
    "website": "https://www.alibabacloud.com/product/coding",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 7 modelo(s) no catálogo.",
    "defaultModels": [
      "qwen3.5-plus",
      "kimi-k2.5",
      "glm-5",
      "MiniMax-M2.5"
    ],
    "logoUrl": "/providers/alicode-intl.png"
  },
  {
    "id": "claude",
    "name": "Claude Code",
    "color": "#D97757",
    "apiType": "anthropic",
    "baseUrl": "https://api.anthropic.com/v1",
    "apiKeyUrl": "https://claude.ai",
    "website": "https://claude.ai",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 7 modelo(s).",
    "defaultModels": [
      "claude-opus-5-5",
      "claude-opus-5",
      "claude-fable-5-1",
      "claude-fable-5"
    ],
    "logoUrl": "/providers/claude.png"
  },
  {
    "id": "kiro",
    "name": "Kiro AI",
    "color": "#FF6B35",
    "apiType": "openai",
    "baseUrl": "https://runtime.us-east-1.kiro.dev/generateAssistantResponse",
    "apiKeyUrl": "https://kiro.dev",
    "website": "https://kiro.dev",
    "category": "Gratuito",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 48 modelo(s).",
    "defaultModels": [
      "claude-opus-5.5",
      "claude-opus-5.5-thinking",
      "claude-opus-5.5-agentic",
      "claude-opus-5.5-thinking-agentic"
    ],
    "logoUrl": "/providers/kiro.png"
  },
  {
    "id": "alims-intl",
    "name": "Alibaba Studio",
    "color": "#FF6A00",
    "apiType": "openai",
    "baseUrl": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    "apiKeyUrl": "https://modelstudio.console.alibabacloud.com/?apiKey=1",
    "website": "https://modelstudio.console.alibabacloud.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 7 modelo(s) no catálogo.",
    "defaultModels": [
      "qwen3.5-plus",
      "kimi-k2.5",
      "glm-5",
      "MiniMax-M2.5"
    ],
    "logoUrl": "/providers/alims-intl.png"
  },
  {
    "id": "alitp-intl",
    "name": "Alibaba Token Plan",
    "color": "#FF6A00",
    "apiType": "openai",
    "baseUrl": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
    "apiKeyUrl": "https://modelstudio.console.alibabacloud.com/?apiKey=1",
    "website": "https://www.alibabacloud.com/campaign/ai-landing-page-token",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 6 modelo(s) no catálogo.",
    "defaultModels": [
      "qwen3.8-max-preview",
      "qwen3.7-max",
      "qwen3.7-plus",
      "qwen3.6-flash"
    ],
    "logoUrl": "/providers/alitp-intl.png"
  },
  {
    "id": "alicode",
    "name": "Alibaba",
    "color": "#FF6A00",
    "apiType": "openai",
    "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
    "apiKeyUrl": "https://bailian.console.aliyun.com/?apiKey=1",
    "website": "https://bailian.console.aliyun.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 8 modelo(s) no catálogo.",
    "defaultModels": [
      "qwen3.5-plus",
      "kimi-k2.5",
      "glm-5",
      "MiniMax-M2.5"
    ],
    "logoUrl": "/providers/alicode.png"
  },
  {
    "id": "gemini-cli",
    "name": "Gemini CLI",
    "color": "#4285F4",
    "apiType": "openai",
    "baseUrl": "https://cloudcode-pa.googleapis.com/v1internal",
    "apiKeyUrl": "https://github.com/google-gemini/gemini-cli",
    "website": "https://github.com/google-gemini/gemini-cli",
    "category": "Gratuito",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 7 modelo(s).",
    "defaultModels": [
      "gemini-3.1-pro-preview",
      "gemini-3-pro-preview",
      "gemini-3-flash-preview",
      "gemini-3.1-flash-lite-preview"
    ],
    "logoUrl": "/providers/gemini-cli.png"
  },
  {
    "id": "ollama",
    "name": "Ollama Cloud",
    "color": "#ffffffff",
    "apiType": "openai",
    "baseUrl": "https://ollama.com/v1",
    "apiKeyUrl": "https://ollama.com/settings/keys",
    "website": "https://ollama.com",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 11 modelo(s) no catálogo.",
    "defaultModels": [
      "gpt-oss:120b",
      "kimi-k2.5",
      "glm-5",
      "minimax-m2.5"
    ],
    "logoUrl": "/providers/ollama.png",
    "quota": "ollama"
  },
  {
    "id": "codex",
    "name": "OpenAI Codex",
    "color": "#3B82F6",
    "apiType": "openai",
    "baseUrl": "https://chatgpt.com/backend-api/codex",
    "apiKeyUrl": "https://chatgpt.com/codex",
    "website": "https://chatgpt.com/codex",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 28 modelo(s).",
    "defaultModels": [
      "gpt-6.1-sol",
      "gpt-6-astra",
      "gpt-6-astra[1m]",
      "gpt-6-sol"
    ],
    "logoUrl": "/providers/codex.png"
  },
  {
    "id": "qoder",
    "name": "Qoder",
    "color": "#EC4899",
    "apiType": "openai",
    "baseUrl": "https://api3.qoder.sh/algo/api/v2/service/pro/sse/agent_chat_generation",
    "apiKeyUrl": "https://qoder.com",
    "website": "https://qoder.com",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 18 modelo(s).",
    "defaultModels": [
      "ultimate",
      "auto",
      "performance",
      "efficient"
    ],
    "logoUrl": "/providers/qoder.png"
  },
  {
    "id": "qoder-cn",
    "name": "Qoder CN",
    "color": "#EC4899",
    "apiType": "openai",
    "baseUrl": "https://gateway.qoder.com.cn/algo/api/v2/service/pro/sse/agent_chat_generation",
    "apiKeyUrl": "https://qoder.com.cn",
    "website": "https://qoder.com.cn",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 16 modelo(s).",
    "defaultModels": [
      "ultimate",
      "auto",
      "performance",
      "efficient"
    ],
    "logoUrl": "/providers/qoder-cn.png"
  },
  {
    "id": "github",
    "name": "GitHub Copilot",
    "color": "#333333",
    "apiType": "openai",
    "baseUrl": "https://api.githubcopilot.com",
    "apiKeyUrl": "https://github.com/features/copilot",
    "website": "https://github.com/features/copilot",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 30 modelo(s).",
    "defaultModels": [
      "gpt-5-mini",
      "gpt-5.3-codex",
      "gpt-5.4",
      "gpt-5.4-mini"
    ],
    "logoUrl": "/providers/github.png"
  },
  {
    "id": "opencode",
    "name": "OpenCode Free",
    "color": "#E87040",
    "apiType": "openai",
    "baseUrl": "https://opencode.ai",
    "apiKeyUrl": "",
    "website": "",
    "category": "Gratuito",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 4 modelo(s).",
    "defaultModels": [
      "muse-spark-1.2-contributor-free",
      "muse-spark-1.3-contributor-free",
      "union-alpha"
    ],
    "logoUrl": "/providers/opencode.png"
  },
  {
    "id": "vertex",
    "name": "Vertex AI",
    "color": "#4285F4",
    "apiType": "openai",
    "baseUrl": "https://aiplatform.googleapis.com",
    "apiKeyUrl": "https://console.cloud.google.com/iam-admin/serviceaccounts",
    "website": "https://cloud.google.com/vertex-ai",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 9 modelo(s) no catálogo.",
    "defaultModels": [
      "gemini-4-argon",
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite-preview",
      "gemini-3-flash-preview"
    ],
    "logoUrl": "/providers/vertex.png"
  },
  {
    "id": "blackbox",
    "name": "Blackbox AI",
    "color": "#5B5FEF",
    "apiType": "openai",
    "baseUrl": "https://api.blackbox.ai/v1",
    "apiKeyUrl": "https://www.blackbox.ai/api-management",
    "website": "https://blackbox.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 10 modelo(s) no catálogo.",
    "defaultModels": [
      "claude-fable-5",
      "claude-opus-4.8",
      "claude-sonnet-4.6",
      "gpt-5.5"
    ],
    "logoUrl": "/providers/blackbox.png"
  },
  {
    "id": "cursor",
    "name": "Cursor IDE",
    "color": "#00D4AA",
    "apiType": "openai",
    "baseUrl": "https://api2.cursor.sh",
    "apiKeyUrl": "https://cursor.com",
    "website": "https://cursor.com",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 14 modelo(s).",
    "defaultModels": [
      "default",
      "claude-4.5-opus-high-thinking",
      "claude-4.5-opus-high",
      "claude-4.5-sonnet-thinking"
    ],
    "logoUrl": "/providers/cursor.png"
  },
  {
    "id": "mimo-free",
    "name": "MiMo Code Free",
    "color": "#FF6900",
    "apiType": "openai",
    "baseUrl": "https://api.xiaomimimo.com/api/free-ai/openai",
    "apiKeyUrl": "",
    "website": "",
    "category": "Gratuito",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 1 modelo(s).",
    "defaultModels": [
      "mimo-auto"
    ],
    "logoUrl": "/providers/mimo-free.png"
  },
  {
    "id": "ollama-local",
    "name": "Ollama Local",
    "color": "#ffffffff",
    "apiType": "openai",
    "baseUrl": "http://localhost:11434/v1",
    "apiKeyUrl": "https://ollama.com",
    "website": "https://ollama.com",
    "category": "API key",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 2 modelo(s).",
    "defaultModels": [
      "clef",
      "clef-flash"
    ],
    "logoUrl": "/providers/ollama-local.png",
    "quota": "ollama"
  },
  {
    "id": "poolside",
    "name": "Poolside",
    "color": "#0EA5E9",
    "apiType": "openai",
    "baseUrl": "https://inference.poolside.ai/v1",
    "apiKeyUrl": "https://platform.poolside.ai/api-keys",
    "website": "https://poolside.ai",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 2 modelo(s) no catálogo.",
    "defaultModels": [
      "poolside/laguna-s-2.1",
      "poolside/laguna-xs-2.1"
    ],
    "logoUrl": "/providers/poolside.png"
  },
  {
    "id": "featherless",
    "name": "Featherless",
    "color": "#111827",
    "apiType": "openai",
    "baseUrl": "https://api.featherless.ai/v1",
    "apiKeyUrl": "https://featherless.ai/account/api-keys",
    "website": "https://featherless.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 7 modelo(s) no catálogo.",
    "defaultModels": [
      "deepseek-ai/DeepSeek-V4-Pro",
      "deepseek-ai/DeepSeek-V4-Flash",
      "zai-org/GLM-5.2",
      "zai-org/GLM-5.1"
    ],
    "logoUrl": "/providers/featherless.png"
  },
  {
    "id": "byteplus",
    "name": "BytePlus ModelArk",
    "color": "#2563EB",
    "apiType": "openai",
    "baseUrl": "https://ark.ap-southeast.bytepluses.com/api/coding/v3",
    "apiKeyUrl": "https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey",
    "website": "https://console.byteplus.com/ark",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 7 modelo(s) no catálogo.",
    "defaultModels": [
      "seed-2-0-pro-260328",
      "seed-2-0-code-preview-260328",
      "seed-2-0-mini-260215",
      "seed-2-0-lite-260228"
    ],
    "logoUrl": "/providers/byteplus.png"
  },
  {
    "id": "chutes",
    "name": "Chutes AI",
    "color": "#ffffffff",
    "apiType": "openai",
    "baseUrl": "https://llm.chutes.ai/v1",
    "apiKeyUrl": "https://chutes.ai/app/api",
    "website": "https://chutes.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 0 modelo(s) no catálogo.",
    "defaultModels": [],
    "logoUrl": "/providers/chutes.png"
  },
  {
    "id": "kilocode",
    "name": "Kilo Code",
    "color": "#FF6B35",
    "apiType": "openai",
    "baseUrl": "https://api.kilo.ai/api/openrouter",
    "apiKeyUrl": "https://kilocode.ai",
    "website": "https://kilocode.ai",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 8 modelo(s).",
    "defaultModels": [
      "anthropic/claude-sonnet-4-20250514",
      "anthropic/claude-opus-4-20250514",
      "google/gemini-2.5-pro",
      "google/gemini-2.5-flash"
    ],
    "logoUrl": "/providers/kilocode.png"
  },
  {
    "id": "nebius",
    "name": "Nebius AI",
    "color": "#6C5CE7",
    "apiType": "openai",
    "baseUrl": "https://api.studio.nebius.ai/v1",
    "apiKeyUrl": "https://studio.nebius.com/settings/api-keys",
    "website": "https://nebius.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 2 modelo(s) no catálogo.",
    "defaultModels": [
      "meta-llama/Llama-3.3-70B-Instruct"
    ],
    "logoUrl": "/providers/nebius.png"
  },
  {
    "id": "cline",
    "name": "Cline",
    "color": "#5B9BD5",
    "apiType": "openai",
    "baseUrl": "https://api.cline.bot/api/v1",
    "apiKeyUrl": "https://cline.bot",
    "website": "https://cline.bot",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 8 modelo(s).",
    "defaultModels": [
      "anthropic/claude-opus-4.7",
      "anthropic/claude-sonnet-4.6",
      "anthropic/claude-opus-4.6",
      "openai/gpt-5.3-codex"
    ],
    "logoUrl": "/providers/cline.png"
  },
  {
    "id": "minimax-code",
    "name": "MiniMax Code",
    "color": "#FF4D4F",
    "apiType": "anthropic",
    "baseUrl": "https://agent.minimax.cn/mavis/api/v1/llm/v1",
    "apiKeyUrl": "https://agent.minimax.cn",
    "website": "https://agent.minimax.cn",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 4 modelo(s).",
    "defaultModels": [
      "MiniMax-M3.1-Flash-Preview",
      "MiniMax-M3",
      "MiniMax-M2.7",
      "MiniMax-M2.7-highspeed"
    ],
    "logoUrl": null
  },
  {
    "id": "minimax-code-global",
    "name": "MiniMax Code (Global)",
    "color": "#FF4D4F",
    "apiType": "anthropic",
    "baseUrl": "https://agent.minimax.io/mavis/api/v1/llm/v1",
    "apiKeyUrl": "https://agent.minimax.io",
    "website": "https://agent.minimax.io",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 4 modelo(s).",
    "defaultModels": [
      "MiniMax-M3.1-Flash-Preview",
      "MiniMax-M3",
      "MiniMax-M2.7",
      "MiniMax-M2.7-highspeed"
    ],
    "logoUrl": null
  },
  {
    "id": "clinepass",
    "name": "ClinePass",
    "color": "#5B9BD5",
    "apiType": "openai",
    "baseUrl": "https://api.cline.bot/api/v1",
    "apiKeyUrl": "https://cline.bot",
    "website": "https://cline.bot",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 10 modelo(s).",
    "defaultModels": [
      "cline-pass/glm-5.2",
      "cline-pass/kimi-k2.7-code",
      "cline-pass/kimi-k2.6",
      "cline-pass/deepseek-v4-pro"
    ],
    "logoUrl": "/providers/clinepass.png"
  },
  {
    "id": "codebuddy-intl",
    "name": "CodeBuddy",
    "color": "#006EFF",
    "apiType": "openai",
    "baseUrl": "https://www.codebuddy.ai/v2",
    "apiKeyUrl": "https://www.codebuddy.ai",
    "website": "https://www.codebuddy.ai",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 15 modelo(s).",
    "defaultModels": [
      "glm-5.2",
      "glm-5.1",
      "glm-5.0",
      "glm-5.0-turbo"
    ],
    "logoUrl": "/providers/codebuddy-intl.png"
  },
  {
    "id": "codebuddy-cn",
    "name": "CodeBuddy CN",
    "color": "#006EFF",
    "apiType": "openai",
    "baseUrl": "https://copilot.tencent.com/v2",
    "apiKeyUrl": "https://copilot.tencent.com",
    "website": "https://copilot.tencent.com",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 11 modelo(s).",
    "defaultModels": [
      "glm-5.2",
      "glm-5.1",
      "minimax-m3",
      "hy3"
    ],
    "logoUrl": "/providers/codebuddy-cn.png"
  },
  {
    "id": "kimchi",
    "name": "Kimchi",
    "color": "#FF521D",
    "apiType": "openai",
    "baseUrl": "https://llm.kimchi.dev/openai/v1",
    "apiKeyUrl": "https://kimchi.dev",
    "website": "https://kimchi.dev",
    "category": "Gratuito",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 8 modelo(s).",
    "defaultModels": [
      "minimax-m3",
      "kimi-k2.7",
      "kimi-k2.6",
      "kimi-k2.5"
    ],
    "logoUrl": "/providers/kimchi.png"
  },
  {
    "id": "commandcode",
    "name": "Command Code",
    "color": "#000000",
    "apiType": "openai",
    "baseUrl": "https://api.commandcode.ai/alpha/generate",
    "apiKeyUrl": "https://commandcode.ai/studio",
    "website": "https://commandcode.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 22 modelo(s) no catálogo.",
    "defaultModels": [
      "deepseek/deepseek-v4-pro",
      "deepseek/deepseek-v4-flash",
      "moonshotai/Kimi-K2.7-Code",
      "moonshotai/Kimi-K2.7-Code-Highspeed"
    ],
    "logoUrl": "/providers/commandcode.png"
  },
  {
    "id": "gitlab",
    "name": "GitLab Duo",
    "color": "#FC6D26",
    "apiType": "openai",
    "baseUrl": "https://gitlab.com/api/v4",
    "apiKeyUrl": "https://gitlab.com",
    "website": "https://gitlab.com",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 0 modelo(s).",
    "defaultModels": [],
    "logoUrl": "/providers/gitlab.png"
  },
  {
    "id": "iflow",
    "name": "iFlow AI",
    "color": "#6366F1",
    "apiType": "openai",
    "baseUrl": "https://apis.iflow.cn/v1",
    "apiKeyUrl": "https://iflow.cn",
    "website": "https://iflow.cn",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 15 modelo(s).",
    "defaultModels": [
      "qwen3-coder-plus",
      "qwen3-max",
      "qwen3-vl-plus",
      "qwen3-max-preview"
    ],
    "logoUrl": "/providers/iflow.png"
  },
  {
    "id": "venice",
    "name": "Venice AI",
    "color": "#DC2626",
    "apiType": "openai",
    "baseUrl": "https://api.venice.ai/api/v1",
    "apiKeyUrl": "https://venice.ai/settings/api",
    "website": "https://venice.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 15 modelo(s) no catálogo.",
    "defaultModels": [
      "venice-uncensored-1-2",
      "zai-org-glm-5",
      "qwen3-235b-a22b-instruct-2507",
      "qwen3-coder-480b-a35b-instruct-turbo"
    ],
    "logoUrl": "/providers/venice.png"
  },
  {
    "id": "agnes",
    "name": "Agnes AI",
    "color": "#7C3AED",
    "apiType": "openai",
    "baseUrl": "https://apihub.agnes-ai.com/v1",
    "apiKeyUrl": "https://platform.agnes-ai.com",
    "website": "https://agnes-ai.com",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 4 modelo(s) no catálogo.",
    "defaultModels": [
      "agnes-2.5-flash",
      "agnes-2.5-pro",
      "agnes-2.5-pro-beta",
      "agnes-3.0-flash"
    ],
    "logoUrl": "/providers/agnes.png"
  },
  {
    "id": "atria",
    "name": "Atria Dawn",
    "color": "#C2410C",
    "apiType": "openai",
    "baseUrl": "https://api.atria-asi.ai/v1",
    "apiKeyUrl": "https://api.atria-asi.ai/dashboard",
    "website": "https://atria-asi.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 1 modelo(s) no catálogo.",
    "defaultModels": [
      "Atria-Dawn-Preview"
    ],
    "logoUrl": "/providers/atria.png"
  },
  {
    "id": "bai",
    "name": "B.AI",
    "color": "#0369A1",
    "apiType": "openai",
    "baseUrl": "https://api.b.ai/v1",
    "apiKeyUrl": "https://b.ai",
    "website": "https://b.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 0 modelo(s) no catálogo.",
    "defaultModels": [],
    "logoUrl": "/providers/bai.png"
  },
  {
    "id": "dahl",
    "name": "Dahl Inference",
    "color": "#1E40AF",
    "apiType": "openai",
    "baseUrl": "https://inference.dahl.global/v1",
    "apiKeyUrl": "https://dahl.global/dashboard",
    "website": "https://dahl.global",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 3 modelo(s) no catálogo.",
    "defaultModels": [
      "zai-org/GLM-5.3-Flash",
      "deepseek-ai/DeepSeek-V4-Flash-0731",
      "MiniMaxAI/MiniMax-M2.7"
    ],
    "logoUrl": "/providers/dahl.png"
  },
  {
    "id": "muse",
    "name": "Muse (Meta Model API)",
    "color": "#0866FF",
    "apiType": "openai",
    "baseUrl": "https://api.meta.ai/v1",
    "apiKeyUrl": "https://dev.meta.ai",
    "website": "https://muse.ai",
    "category": "Login",
    "auth": "apikey",
    "description": "Acesso por API key · 5 modelo(s) no catálogo.",
    "defaultModels": [
      "muse-spark-1.3",
      "muse-spark-1.2",
      "muse-spark-1.1",
      "muse-spark-1.3-contributor"
    ],
    "logoUrl": "/providers/muse.png"
  },
  {
    "id": "tokenharbor",
    "name": "Token Harbor",
    "color": "#0F766E",
    "apiType": "openai",
    "baseUrl": "https://tokenharbor.ai/v1",
    "apiKeyUrl": "https://tokenharbor.ai/dashboard",
    "website": "https://tokenharbor.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 6 modelo(s) no catálogo.",
    "defaultModels": [
      "claude-opus-5.5",
      "claude-sonnet-5",
      "gpt-6-astra",
      "gpt-6-sol"
    ],
    "logoUrl": "/providers/tokenharbor.png"
  },
  {
    "id": "glm-cn",
    "name": "GLM (China)",
    "color": "#DC2626",
    "apiType": "openai",
    "baseUrl": "https://open.bigmodel.cn/api/coding/paas/v4",
    "apiKeyUrl": "https://open.bigmodel.cn/usercenter/apikeys",
    "website": "https://open.bigmodel.cn",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 10 modelo(s) no catálogo.",
    "defaultModels": [
      "glm-5.3",
      "glm-5.3-flash",
      "glm-5.2",
      "glm-5.1"
    ],
    "logoUrl": "/providers/glm-cn.png"
  },
  {
    "id": "hyperbolic",
    "name": "Hyperbolic",
    "color": "#00D4FF",
    "apiType": "openai",
    "baseUrl": "https://api.hyperbolic.xyz/v1",
    "apiKeyUrl": "https://app.hyperbolic.xyz/settings",
    "website": "https://hyperbolic.xyz",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 8 modelo(s) no catálogo.",
    "defaultModels": [
      "Qwen/QwQ-32B",
      "deepseek-ai/DeepSeek-R1",
      "deepseek-ai/DeepSeek-V3",
      "meta-llama/Llama-3.3-70B-Instruct"
    ],
    "logoUrl": "/providers/hyperbolic.png"
  },
  {
    "id": "vercel-ai-gateway",
    "name": "Vercel AI Gateway",
    "color": "#111827",
    "apiType": "openai",
    "baseUrl": "https://ai-gateway.vercel.sh/v1",
    "apiKeyUrl": "https://vercel.com/dashboard/~/ai-gateway",
    "website": "https://vercel.com/ai-gateway",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 0 modelo(s) no catálogo.",
    "defaultModels": [],
    "logoUrl": "/providers/vercel-ai-gateway.png"
  },
  {
    "id": "perplexity-agent",
    "name": "Perplexity Agent",
    "color": "#20808D",
    "apiType": "openai",
    "baseUrl": "https://api.perplexity.ai/v1",
    "apiKeyUrl": "https://www.perplexity.ai/settings/api",
    "website": "https://www.perplexity.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 11 modelo(s) no catálogo.",
    "defaultModels": [
      "perplexity/sonar",
      "openai/gpt-5.5",
      "openai/gpt-5.4",
      "openai/gpt-5.4-mini"
    ],
    "logoUrl": "/providers/perplexity-agent.png"
  },
  {
    "id": "minimax-cn",
    "name": "Minimax (China)",
    "color": "#DC2626",
    "apiType": "anthropic",
    "baseUrl": "https://api.minimaxi.com/anthropic/v1",
    "apiKeyUrl": "https://platform.minimaxi.com/user-center/basic-information/interface-key",
    "website": "https://www.minimaxi.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 12 modelo(s) no catálogo.",
    "defaultModels": [
      "MiniMax-M3",
      "MiniMax-M2.7",
      "MiniMax-M2.5",
      "MiniMax-M2.1"
    ],
    "logoUrl": "/providers/minimax-cn.png"
  },
  {
    "id": "mmf",
    "name": "MMF",
    "color": "#6366F1",
    "apiType": "openai",
    "baseUrl": "https://api.xiaomimimo.com/api/free-ai/openai",
    "apiKeyUrl": "",
    "website": "",
    "category": "API key",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 1 modelo(s).",
    "defaultModels": [
      "mimo-auto"
    ],
    "logoUrl": "/providers/mmf.png"
  },
  {
    "id": "opencode-zen",
    "name": "OpenCode Zen",
    "color": "#E87040",
    "apiType": "openai",
    "baseUrl": "https://opencode.ai/zen/v1",
    "apiKeyUrl": "https://opencode.ai/auth",
    "website": "https://opencode.ai/auth",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 74 modelo(s) no catálogo.",
    "defaultModels": [
      "claude-fable-5",
      "claude-fable-5-1",
      "claude-opus-5",
      "claude-opus-4-8"
    ],
    "logoUrl": null
  },
  {
    "id": "opencode-go",
    "name": "OpenCode Go",
    "color": "#E87040",
    "apiType": "openai",
    "baseUrl": "https://opencode.ai/zen/go/v1",
    "apiKeyUrl": "https://opencode.ai/auth",
    "website": "https://opencode.ai/auth",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 43 modelo(s) no catálogo.",
    "defaultModels": [
      "deepseek-flash",
      "glm-5.3-flash",
      "glm-5.3",
      "glm-5.2"
    ],
    "logoUrl": "/providers/opencode-go.png"
  },
  {
    "id": "vertex-partner",
    "name": "Vertex Partner",
    "color": "#34A853",
    "apiType": "openai",
    "baseUrl": "https://aiplatform.googleapis.com",
    "apiKeyUrl": "https://console.cloud.google.com/iam-admin/serviceaccounts",
    "website": "https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-partner-models",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 4 modelo(s) no catálogo.",
    "defaultModels": [
      "deepseek-ai/deepseek-v3.2-maas",
      "qwen/qwen3-next-80b-a3b-thinking-maas",
      "qwen/qwen3-next-80b-a3b-instruct-maas",
      "zai-org/glm-5-maas"
    ],
    "logoUrl": "/providers/vertex-partner.png"
  },
  {
    "id": "volcengine-ark",
    "name": "Volcengine Ark",
    "color": "#1677FF",
    "apiType": "openai",
    "baseUrl": "https://ark.cn-beijing.volces.com/api/coding/v3",
    "apiKeyUrl": "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey",
    "website": "https://ark.cn-beijing.volces.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 9 modelo(s) no catálogo.",
    "defaultModels": [
      "Doubao-Seed-2.0-Code",
      "Doubao-Seed-2.0-pro",
      "Doubao-Seed-2.0-lite",
      "Doubao-Seed-Code"
    ],
    "logoUrl": "/providers/volcengine-ark.png"
  },
  {
    "id": "xiaomi-mimo",
    "name": "Xiaomi MiMo",
    "color": "#FF6900",
    "apiType": "openai",
    "baseUrl": "https://api.xiaomimimo.com/v1",
    "apiKeyUrl": "https://platform.xiaomimimo.com/console/api-keys",
    "website": "https://xiaomimimo.com",
    "category": "Login",
    "auth": "apikey",
    "description": "Acesso por API key · 8 modelo(s) no catálogo.",
    "defaultModels": [
      "mimo-v2.6-pro",
      "mimo-v2.6-flash",
      "mimo-v2.6-pro-ultraspeed",
      "mimo-v2.5-pro"
    ],
    "logoUrl": "/providers/xiaomi-mimo.png"
  },
  {
    "id": "xiaomi-tokenplan",
    "name": "Xiaomi MiMo (Token Plan)",
    "color": "#FF6700",
    "apiType": "openai",
    "baseUrl": "https://token-plan-sgp.xiaomimimo.com/v1",
    "apiKeyUrl": "https://mimo.xiaomi.com",
    "website": "https://mimo.xiaomi.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 9 modelo(s) no catálogo.",
    "defaultModels": [
      "mimo-v2.5-pro",
      "mimo-v2.5-pro-claude",
      "mimo-v2.5",
      "mimo-v2-pro"
    ],
    "logoUrl": "/providers/xiaomi-tokenplan.png"
  },
  {
    "id": "api-airforce",
    "name": "API.airforce",
    "color": "#0EA5E9",
    "apiType": "openai",
    "baseUrl": "https://api.airforce/v1",
    "apiKeyUrl": "https://api.airforce",
    "website": "https://api.airforce",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 3 modelo(s) no catálogo.",
    "defaultModels": [
      "gpt-oss-120b",
      "gpt-oss-20b",
      "kimi-k2.7-code"
    ],
    "logoUrl": "/providers/api-airforce.png"
  },
  {
    "id": "baidu",
    "name": "Baidu Qianfan",
    "color": "#2932E1",
    "apiType": "openai",
    "baseUrl": "https://qianfan.baidubce.com/v2",
    "apiKeyUrl": "https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application",
    "website": "https://cloud.baidu.com/product/qianfan.html",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 7 modelo(s) no catálogo.",
    "defaultModels": [
      "deepseek-v4-pro",
      "deepseek-v4-flash",
      "glm-5.2",
      "glm-5.1"
    ],
    "logoUrl": "/providers/baidu.png"
  },
  {
    "id": "bazaarlink",
    "name": "Bazaarlink",
    "color": "#DC2626",
    "apiType": "openai",
    "baseUrl": "https://bazaarlink.ai/api/v1",
    "apiKeyUrl": "https://bazaarlink.ai",
    "website": "https://bazaarlink.ai",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 24 modelo(s) no catálogo.",
    "defaultModels": [
      "auto:free",
      "claude-opus-4.7",
      "claude-sonnet-4.6",
      "claude-haiku-4.5"
    ],
    "logoUrl": "/providers/bazaarlink.png"
  },
  {
    "id": "bluesminds",
    "name": "BluesMinds",
    "color": "#2563EB",
    "apiType": "openai",
    "baseUrl": "https://api.bluesminds.com/v1",
    "apiKeyUrl": "https://bluesminds.com",
    "website": "https://bluesminds.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 14 modelo(s) no catálogo.",
    "defaultModels": [
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "claude-sonnet-4-5"
    ],
    "logoUrl": "/providers/bluesminds.png"
  },
  {
    "id": "kilo-gateway",
    "name": "Kilo Gateway",
    "color": "#8B5CF6",
    "apiType": "openai",
    "baseUrl": "https://api.kilo.ai/api/gateway",
    "apiKeyUrl": "https://kilo.ai/dashboard?tab=apiKeys",
    "website": "https://kilo.ai",
    "category": "Gratuito",
    "auth": "apikey",
    "description": "Acesso por API key · 6 modelo(s) no catálogo.",
    "defaultModels": [
      "kilo-auto/free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "kwaipilot/kat-coder-pro-v2.5:free"
    ],
    "logoUrl": "/providers/kilo-gateway.png"
  },
  {
    "id": "llm7",
    "name": "LLM7",
    "color": "#7C3AED",
    "apiType": "openai",
    "baseUrl": "https://api.llm7.io/v1",
    "apiKeyUrl": "https://llm7.io",
    "website": "https://llm7.io",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 5 modelo(s) no catálogo.",
    "defaultModels": [
      "gpt-5.5",
      "claude-opus-5",
      "deepseek-v4-flash",
      "grok-4.5"
    ],
    "logoUrl": "/providers/llm7.png"
  },
  {
    "id": "morph",
    "name": "Morph",
    "color": "#14B8A6",
    "apiType": "openai",
    "baseUrl": "https://api.morphllm.com/v1",
    "apiKeyUrl": "https://morphllm.com",
    "website": "https://morphllm.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 6 modelo(s) no catálogo.",
    "defaultModels": [
      "morph-v3-large",
      "morph-v3-fast",
      "morph-qwen35-397b",
      "morph-minimax27-230b"
    ],
    "logoUrl": "/providers/morph.png"
  },
  {
    "id": "sambanova",
    "name": "SambaNova",
    "color": "#F97316",
    "apiType": "openai",
    "baseUrl": "https://api.sambanova.ai/v1",
    "apiKeyUrl": "https://cloud.sambanova.ai/apis",
    "website": "https://sambanova.ai",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 1 modelo(s) no catálogo.",
    "defaultModels": [
      "MiniMax-M2.7"
    ],
    "logoUrl": "/providers/sambanova.png"
  },
  {
    "id": "sensenova",
    "name": "SenseNova",
    "color": "#5B5CE2",
    "apiType": "openai",
    "baseUrl": "https://token.sensenova.cn/v1",
    "apiKeyUrl": "https://token.sensenova.cn",
    "website": "https://token.sensenova.cn",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 7 modelo(s) no catálogo.",
    "defaultModels": [
      "sensenova-6.8-flash-lite",
      "deepseek-v4-flash",
      "deepseek-flash",
      "glm-5.2"
    ],
    "logoUrl": "/providers/sensenova.png"
  },
  {
    "id": "tencent",
    "name": "Tencent Hunyuan",
    "color": "#0052D9",
    "apiType": "openai",
    "baseUrl": "https://api.hunyuan.cloud.tencent.com/v1",
    "apiKeyUrl": "https://console.cloud.tencent.com/hunyuan/api-key",
    "website": "https://cloud.tencent.com/product/hunyuan",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 2 modelo(s) no catálogo.",
    "defaultModels": [
      "hunyuan-turbos-latest",
      "hunyuan-t1-latest"
    ],
    "logoUrl": "/providers/tencent.png"
  },
  {
    "id": "tokenrouter",
    "name": "TokenRouter",
    "color": "#0EA5E9",
    "apiType": "openai",
    "baseUrl": "https://api.tokenrouter.com/v1",
    "apiKeyUrl": "https://www.tokenrouter.com",
    "website": "https://www.tokenrouter.com",
    "category": "API key",
    "auth": "apikey",
    "description": "Acesso por API key · 22 modelo(s) no catálogo.",
    "defaultModels": [
      "anthropic/claude-haiku-4.5",
      "anthropic/claude-sonnet-4.6",
      "anthropic/claude-opus-4.8",
      "anthropic/claude-opus-4.8-fast"
    ],
    "logoUrl": "/providers/tokenrouter.png"
  },
  {
    "id": "trae",
    "name": "Trae",
    "color": "#FF6A00",
    "apiType": "openai",
    "baseUrl": "https://core-normal.trae.ai/api/remote/v1",
    "apiKeyUrl": "https://www.trae.ai",
    "website": "https://www.trae.ai",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 9 modelo(s).",
    "defaultModels": [
      "auto",
      "work",
      "gemini-3.1-pro",
      "gemini-3-flash-solo"
    ],
    "logoUrl": "/providers/trae.png"
  },
  {
    "id": "windsurf",
    "name": "Windsurf",
    "color": "#14B8A6",
    "apiType": "openai",
    "baseUrl": "https://server.codeium.com/exa.language_server_pb.LanguageServerService/GetChatMessage",
    "apiKeyUrl": "https://windsurf.com",
    "website": "https://windsurf.com",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 75 modelo(s).",
    "defaultModels": [
      "swe-1.6-fast",
      "swe-1.6",
      "swe-1.5-fast",
      "swe-1.5"
    ],
    "logoUrl": "/providers/windsurf.png"
  },
  {
    "id": "zed",
    "name": "Zed",
    "color": "#A855F7",
    "apiType": "openai",
    "baseUrl": "https://cloud.zed.dev",
    "apiKeyUrl": "https://zed.dev",
    "website": "https://zed.dev",
    "category": "Login",
    "auth": "login",
    "description": "Acesso via login no site oficial (OAuth) · 0 modelo(s).",
    "defaultModels": [],
    "logoUrl": "/providers/zed.png"
  }
];

function getCatalogEntry(id){return CATALOG.find(c=>c.id===id)||null;}

module.exports={CATALOG,getCatalogEntry};
