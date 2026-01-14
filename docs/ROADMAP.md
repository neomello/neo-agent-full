# NΞØ Agent - Project Roadmap

Este documento centraliza o progresso do desenvolvimento e detalha os próximos passos técnicos para levar o **NΞØ Agent** ao estado de "Full Decentralized State".

---

## ✅ O que já foi alcançado (Highlights)

-   **🧠 Core Intelligence**: Agente ReAct implementado com LangGraph e Gemini (Flash Lite) para estabilidade de quota.
-   **🔌 MCP Integration**: Conexão total com Model Context Protocol para busca (Brave), leitura de código (GitHub) e análise de conteúdo (Fetch).
-   **💾 Kwil State Layer**: Integração real com Kwil v0.9+ para persistência estruturada de leads e eventos.
-   **🔗 Webhook Gateway**: Adaptador Express para comunicação fluida com o Dashboard externo.
-   **🧹 Project Hygiene**: Repositório limpo, scripts de auditoria funcional e documentação organizada.

---

## 🚀 Próximos Passos (Especificações Técnicas)

### 1. 💎 Ceramic Network: Autenticação & Streams
*Foco: Identidade descentralizada e log de eventos auditável.*

-   **Implementação de DID-Session**: Migrar do DID estático para sessões autenticadas via `did-session`, permitindo que o agente assine logs em nome de um usuário ou dele mesmo.
-   **Event Streams**: Substituir o log simulado em `src/state/ceramic.ts` por criação real de streams no Ceramic (Clay Testnet ou Mainnet). 
-   **Persistence**: Cada ação importante do agente deve gerar um `stream_id` único para garantir que o histórico seja imutável e descentralizado.

### 2. 🔫 GUN DB: Sincronização P2P em Tempo Real
*Foco: Redundância e comunicação Agent-to-Dashboard sem intermediários.*

-   **Relay Node Configuration**: Configurar um par de relay nodes estáveis para assegurar a propagação dos dados.
-   **Lead Propagation**: Ao salvar um lead no Kwil, o agente deve disparar um `.put()` no GUN no gráfico `leads/active`.
-   **Dashboard Sync**: O dashboard deve ouvir (`.on()`) as mudanças no GUN para atualizar a UI instantaneamente, eliminando o delay do polling de banco de dados.

### 3. 📦 Web3 Storage (IPFS): Snapshots de Estado
*Foco: Disponibilidade permanente de dados volumosos.*

-   **W3UP Client Integration**: Implementar o fluxo de upload usando `@web3-storage/w3up-client`.
-   **Daily Snapshots**: Criar um cron-job (ou trigger por volume) que agrupe leads/logs do dia, gere um arquivo JSON e faça upload para o IPFS.
-   **CID Referencing**: O CID gerado pelo IPFS deve ser salvo como um evento especial no Kwil/Ceramic para fechar o ciclo de auditabilidade.

### 📊 4. Observabilidade & Saúde do Sistema
*Foco: Monitoramento de performance e custo.*

-   **LangSmith Tracing**: Habilitar o tracing completo para analisar o custo por token e a assertividade das chamadas de ferramentas.
-   **Prometheus Metric Scraper**: Expor um endpoint `/metrics` no servidor Express para coletar latência de API e taxa de erro do modelo Gemini.

---

## 📈 Progresso do Protocolo

<div style="width: 100%; max-width: 600px; margin: 20px 0; font-family: sans-serif;">

  <!-- Kwil / State -->
  <div style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span style="font-weight: bold; color: #00f2fe;">SQL Persistence (Kwil)</span>
      <span style="color: #00f2fe;">100%</span>
    </div>
    <div style="width: 100%; background: #1a1a1a; border-radius: 10px; height: 8px; border: 1px solid #333;">
      <div style="width: 100%; background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%); height: 100%; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);"></div>
    </div>
  </div>

  <!-- MCP Tools -->
  <div style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span style="font-weight: bold; color: #00f2fe;">MCP Web/GitHub Tools</span>
      <span style="color: #00f2fe;">100%</span>
    </div>
    <div style="width: 100%; background: #1a1a1a; border-radius: 10px; height: 8px; border: 1px solid #333;">
      <div style="width: 100%; background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%); height: 100%; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);"></div>
    </div>
  </div>

  <!-- Ceramic -->
  <div style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span style="font-weight: bold; color: #ff008e;">DID Streams (Ceramic)</span>
      <span style="color: #ff008e;">10%</span>
    </div>
    <div style="width: 100%; background: #1a1a1a; border-radius: 10px; height: 8px; border: 1px solid #333;">
      <div style="width: 10%; background: linear-gradient(90deg, #ff008e 0%, #ff8ec7 100%); height: 100%; border-radius: 10px; box-shadow: 0 0 10px rgba(255, 0, 142, 0.5);"></div>
    </div>
  </div>

  <!-- GUN -->
  <div style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span style="font-weight: bold; color: #ff008e;">P2P Sync (GUN DB)</span>
      <span style="color: #ff008e;">5%</span>
    </div>
    <div style="width: 100%; background: #1a1a1a; border-radius: 10px; height: 8px; border: 1px solid #333;">
      <div style="width: 5%; background: linear-gradient(90deg, #ff008e 0%, #ff8ec7 100%); height: 100%; border-radius: 10px; box-shadow: 0 0 10px rgba(255, 0, 142, 0.5);"></div>
    </div>
  </div>

  <!-- IPFS -->
  <div style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span style="font-weight: bold; color: #666;">IPFS Snapshots</span>
      <span style="color: #666;">0%</span>
    </div>
    <div style="width: 100%; background: #1a1a1a; border-radius: 10px; height: 8px; border: 1px solid #333;">
      <div style="width: 0%; background: #444; height: 100%; border-radius: 10px;"></div>
    </div>
  </div>

  <!-- Obsevability -->
  <div style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span style="font-weight: bold; color: #666;">Observability (Tracing)</span>
      <span style="color: #666;">0%</span>
    </div>
    <div style="width: 100%; background: #1a1a1a; border-radius: 10px; height: 8px; border: 1px solid #333;">
      <div style="width: 0%; background: #444; height: 100%; border-radius: 10px;"></div>
    </div>
  </div>

</div>

---
*Última atualização: 14/01/2026*
