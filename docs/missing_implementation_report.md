# Relatório de Arquivos Não Implementados (Stubs/Mocks)

**Data:** 06/01/2026
**Auditor:** NΞØ AI Assistant

Este documento lista os arquivos identificados no projeto `neo-agent-full` que contêm apenas "stubs", "mocks" (simulações) ou estrutura vazia, aguardando implementação real.

## 1. Camada de Estado (State Layer)
Os seguintes conectores de banco de dados/rede estão definidos mas simulam respostas:

*   **`src/state/ceramic.ts`**
    *   **Estado:** Mock.
    *   **Observação:** A função `logCeramic` retorna `{ stream_id: 'ceramic_simulated_id' }`. Não há conexão real com o Ceramic Network (Clay/Mainnet).
*   **`src/state/kwil.ts`**
    *   **Estado:** Mock.
    *   **Observação:** A função `insertKwil` retorna `{ id: 'kwil_simulated_id' }`. Não há lógica de conexão com Kwil DB.
*   **`src/state/graph-feed.ts`**
    *   **Estado:** Mock.
    *   **Observação:** A função `emitGraphFeed` retorna `{ id: 'graph_simulated_id' }`. Provavelmente destinado a integração com The Graph ou feed RSS on-chain.

## 2. Camada MCP (Model Context Protocol)
Arquivos estruturais que ainda não contêm implementação funcional:

*   **`src/mcp/server.ts`**
    *   **Estado:** Vazio.
    *   **Conteúdo:** `export const server = {};`
    *   **Observação:** Este arquivo provavelmente é reservado para implementar um servidor MCP completo (transport via Stdio ou SSE) para conectar o agente diretamente a IDEs (Cursor/VSCode) ou Claude Desktop. Atualmente o projeto usa `adapters/webhook-express.ts`.
*   **`src/mcp/router.ts` (Método `get_state`)**
    *   **Estado:** Não implementado.
    *   **Observação:** O case `get_state` retorna `{ status: "not_implemented_yet" }`. Não há lógica para *ler* dados do estado persistido.

## 3. Adaptadores
*   **`src/adapters/webhook.ts`**
    *   **Estado:** Vazio.
    *   **Conteúdo:** `export const webhookAdapter = {};`
    *   **Observação:** Parece ser um arquivo redundante ou um placeholder antigo, já que a lógica real de webhook está em `src/adapters/webhook-express.ts`.

---
**Recomendação:**
Para avançar o projeto para "Produção Real", a prioridade deve ser implementar **Ceramic** e **Kwil**, pois são pilares fundamentais da persistência descentralizada proposta na arquitetura.
