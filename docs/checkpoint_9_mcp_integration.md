# NΞØ Agent - Checkpoint 9: MCP Integration & Model Stability

## Data: 2026-01-06

### 🎯 Objetivo Alcançado
Integração completa do **Model Context Protocol (MCP)** com ferramentas externas (Brave Search, Fetch, GitHub) e estabilização do modelo LLM para evitar problemas de quota.

---

## 🔧 Mudanças Principais

### 1. **MCP Tools Integration** (`src/mcp/mcp-tools.ts`)
- **Novo arquivo** que carrega dinamicamente ferramentas MCP via Docker containers
- Suporta 3 servidores MCP:
  - **Brave Search**: 6 ferramentas de busca web
  - **Fetch**: 1 ferramenta para leitura de URLs
  - **GitHub**: 26 ferramentas para interação com repositórios
- Usa `DynamicStructuredTool` para compatibilidade com LangChain
- Implementa tratamento de erros e limpeza de variáveis de ambiente

### 2. **State Reader** (`src/state/reader.ts`)
- **Novo arquivo** que permite ao agente ler dados do Kwil Database
- Ferramenta `get_lead_data`: busca leads por email
- Retorna JSON estruturado com informações do lead ou mensagem de "não encontrado"

### 3. **LangChain Agent Executor** (`src/executors/langchain-agent-executor.ts`)
- **Modelo LLM**: Migrado para `gemini-flash-lite-latest` (estável, com quota adequada)
- **MCP Tools**: Integrados ao agente via `loadMCPTools()`
- **Recursion Limit**: Aumentado para 40 para evitar loops prematuros
- **System Prompt**: Melhorado com guidelines para evitar chamadas repetitivas de ferramentas
- **Fallback Model**: Atualizado para `gemini-flash-lite-latest`

### 4. **Kwil State Writer** (`src/state/kwil.ts`)
- **Routing Logic**: Generalizado para suportar múltiplos intents (`qualify_lead`, `general_agent`, `ask_general`)
- **Field Mapping**: Adicionado suporte para `lead_score` como fallback de `score`
- **Função `executeSelect`**: Nova função exportada para consultas SQL diretas

### 5. **HTTP Server Adapter** (`src/adapters/http-server.ts`)
- **Payload Handling**: Melhorado para aceitar campos flat ou estruturados
- Merge automático de campos top-level (`message`, `sender`, `metadata`) no contexto

---

## 🧪 Testes Realizados

### Teste 1: Leitura de Lead Existente
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Você se lembra de alice.real@example.com?",
    "intent": "ask_general"
  }'
```
**Resultado**: ✅ Agente consultou o banco e respondeu com dados da Alice

### Teste 2: Qualificação de Lead com Brave Search
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qualifique vitalik@ethereum.org. Pesquise a empresa dele.",
    "intent": "general_agent"
  }'
```
**Resultado**: ✅ Agente buscou no Brave Search, verificou email com Hunter, e salvou no Kwil

---

## 📊 Arquitetura Atualizada

```
┌─────────────────────────────────────────────────────────────┐
│                    NΞØ Agent System                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Webhook    │───▶│  MCP Router  │───▶│  LangChain   │ │
│  │   Adapter    │    │              │    │    Agent     │ │
│  └──────────────┘    └──────────────┘    └──────┬───────┘ │
│                                                  │         │
│                                                  ▼         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Agent Tools (36 total)                  │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ • Hunter Email Verification                          │ │
│  │ • Twitter/X Integration                              │ │
│  │ • Kwil State Reader (get_lead_data)                  │ │
│  │ • Brave Search (6 tools)                             │ │
│  │ • Fetch (1 tool)                                     │ │
│  │ • GitHub (26 tools)                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                  │         │
│                                                  ▼         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │     Kwil     │    │   Ceramic    │    │     GUN      │ │
│  │   Database   │    │   Network    │    │      DB      │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Variáveis de Ambiente

### Novas Variáveis
```env
LLM_MODEL=gemini-flash-lite-latest
BRAVE_API_KEY=<sua_chave>
GITHUB_TOKEN=<seu_token>
```

### Variáveis Existentes (mantidas)
- `GOOGLE_API_KEY`
- `KWIL_PROVIDER`, `KWIL_PRIVATE_KEY`, `KWIL_CHAIN_ID`, `KWIL_DB_ID`
- `HUNTER_API_KEY`
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`

---

## 🐛 Problemas Resolvidos

### 1. **Quota Exceeded (429 Errors)**
- **Causa**: Modelo `gemini-flash-latest` resolvia para `gemini-2.5-flash` (quota de apenas 20 req/dia)
- **Solução**: Migração para `gemini-flash-lite-latest` (quota adequada)

### 2. **Function Calling Not Supported**
- **Causa**: Modelo `gemma-3-27b-it` não suporta tool calling
- **Solução**: Uso de `gemini-flash-lite-latest` que suporta nativamente

### 3. **Recursion Limit Exceeded**
- **Causa**: Agente chamava `get_lead_data` repetidamente quando não encontrava resultado
- **Solução**: 
  - Aumentado `recursionLimit` para 40
  - Melhorado system prompt com guidelines anti-loop

### 4. **404 Model Not Found**
- **Causa**: Modelos `gemini-1.5-flash` e `gemini-1.5-pro` não disponíveis para a chave atual
- **Solução**: Diagnóstico via API e seleção de modelo disponível

### 5. **Payload Mapping Issues**
- **Causa**: Webhook recebia campos flat (`message`, `sender`) mas router esperava `context`
- **Solução**: Merge automático de campos top-level no adapter

---

## 📦 Dependências

### Mantidas
- `@langchain/google-genai`: ^2.1.3
- `@langchain/langgraph`: ^1.0.7
- `@kwilteam/kwil-js`: ^0.5.0
- `@modelcontextprotocol/sdk`: ^0.6.0

### Novas Funcionalidades
- MCP via Docker containers (não requer novas deps npm)

---

## 🚀 Próximos Passos Sugeridos

1. **Otimização de Prompts**: Refinar instruções para reduzir tokens e melhorar precisão
2. **Caching de Respostas**: Implementar cache para consultas frequentes ao Kwil
3. **Rate Limiting**: Adicionar controle de taxa para chamadas externas (Brave, Hunter)
4. **Monitoring**: Integrar LangSmith ou similar para observabilidade
5. **Error Recovery**: Implementar retry logic para falhas de rede/API

---

## 📝 Notas Técnicas

### Model Selection Strategy
A escolha do modelo seguiu esta hierarquia:
1. `gemini-flash-latest` → ❌ Quota baixa (20/dia)
2. `gemini-2.0-flash` → ❌ Quota esgotada
3. `gemini-1.5-flash` → ❌ 404 Not Found
4. `gemma-3-27b-it` → ❌ Sem tool calling
5. `gemini-flash-lite-latest` → ✅ **Funcional**

### MCP Architecture
- Containers Docker são iniciados sob demanda via `StdioClientTransport`
- Cada ferramenta MCP é wrapeada em `DynamicStructuredTool`
- Ferramentas são injetadas no agente durante `initAgent()`

### Kwil Integration
- Escrita: `create_lead` action via `Utils.ActionInput`
- Leitura: `selectQuery` via função `executeSelect`
- Validação: Score forçado para Number para evitar erros de tipo

---

**Checkpoint criado por**: NΞØ AI Assistant  
**Status**: ✅ Sistema Operacional e Pronto para Produção
