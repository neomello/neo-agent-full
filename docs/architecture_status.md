# NΞØ Agent - Architecture Diagram

## Status das Conexões

### ✅ Implementado (Verde)
- **Dashboard**: Next.js frontend (repositório separado)
- **Kwil Database**: Leitura e escrita funcionando
- **State Writer**: Multi-target (Kwil ativo)
- **State Reader**: `get_lead_data` tool
- **Hunter.io**: Email verification
- **Twitter/X**: Social media integration
- **MCP Tools**: 33 ferramentas externas
  - Brave Search (6 tools)
  - Fetch (1 tool)
  - GitHub (26 tools)

### ⏳ Pendente (Laranja)
- **Ceramic Network**: DID + Streams (código preparado, não testado)
- **GUN DB**: P2P sync (código preparado, não testado)
- **IPFS**: Web3.Storage (código preparado, não testado)

### 🔵 Infraestrutura Externa (Azul)
- Docker containers para MCP servers
- Kwil Node (:8080)
- PostgreSQL (backend do Kwil)

### 🔴 Core (Rosa/Magenta)
- MCP Router
- LangChain Agent (LangGraph ReAct)

---

## Visualização

### Diagrama de Arquitetura

Para visualizar o diagrama principal:

1. **No Cursor/VS Code**: Instale a extensão "Markdown Preview Mermaid Support"
2. **Online**: Cole o conteúdo de `architecture.mmd` em https://mermaid.live
3. **GitHub**: O GitHub renderiza automaticamente arquivos `.mmd`

### Diagramas de Sequência

**Fluxo de Qualificação de Lead** (`sequence_qualify_lead.mmd`):
- Dashboard → Webhook → Agent → Brave Search → Hunter.io → Kwil
- Mostra o fluxo completo de qualificação com pesquisa externa

**Fluxo de Consulta de Lead** (`sequence_query_lead.mmd`):
- Dashboard → Webhook → Agent → State Reader → Kwil
- Mostra consulta read-only de dados existentes

### Rotas Reais

**Dashboard → Backend**:
```
POST http://localhost:3000/webhook
Content-Type: application/json

{
  "intent": "qualify_lead" | "ask_general" | "general_agent",
  "context": {
    "message": "...",
    "sender": "...",
    ...
  }
}
```

**Resposta**:
```json
{
  "status": "success",
  "agent_response": {
    "action": "write" | "response" | "error",
    "payload": {...},
    "response_text": "..."
  },
  "state_receipt": {
    "kwil_id": "0x...",
    "ceramic_stream_id": null,
    ...
  }
}
```

---

## Próximos Passos

Para completar a arquitetura:

1. **Testar Ceramic**: Implementar stream creation e updates
2. **Testar GUN**: Configurar peers e sincronização
3. **Testar IPFS**: Upload de dados para Web3.Storage
4. **Integrar Dashboard**: Conectar frontend ao backend
5. **Monitoring**: Adicionar observabilidade (LangSmith, Prometheus)

---

**Última atualização**: 2026-01-06 (Checkpoint 9)
