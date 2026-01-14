# NΞØ Agent - Documentação Local

Bem-vindo à central de documentação do projeto **NΞØ Agent**. Este diretório contém especificações técnicas, diagramas de fluxo e guias de infraestrutura.

---

## 🚀 Status & Operação

Acompanhe o estado atual da implementação e as conexões do sistema:

*   [**Setup & Testes**](./SETUP_TESTING.md): Comandos para instalação, execução e validação do sistema.
*   [**Status de Arquitetura**](./architecture_status.md): Visão geral do que está implementado, pendente e próximos passos.
*   [**Status de Conexões**](./connections_status.md): Detalhamento técnico da conectividade entre o Agente, Bancos de Dados e APIs externas.
*   [**Roadmap do Projeto**](./ROADMAP.md): Planejamento detalhado dos próximos passos técnicos e progresso por camada.

## 🏗️ Diagramas de Arquitetura (Mermaid)

Representações visuais dos fluxos de dados e estrutura do sistema. Para visualizar, use extensões Mermaid no VS Code ou o [Mermaid Live Editor](https://mermaid.live).

*   [**Arquitetura Geral**](./architecture.mmd): Diagrama principal de blocos.
*   [**Fluxo de Consulta de Lead**](./flow_query_lead.mmd): Lógica de busca de dados.
*   [**Grafo de Conexões**](./graph_connections_status.mmd): Relacionamento entre serviços.
*   [**Sequência: Qualificação**](./sequence_qualify_lead.mmd): Fluxo passo a passo de qualificação de leads.
*   [**Sequência: Consulta**](./sequence_query_lead.mmd): Fluxo de consulta read-only.
*   [**Mapa Mental: Busca**](./mindmap_query_lead.mmd): Estrutura mental do agente para queries.

## 📖 Guias de Infraestrutura

Documentação para setup e manutenção do ambiente:

*   [**Guia de Deploy Kwil**](./kwil_deployment_guide.md): Como configurar e manter o banco de dados local.
*   [**Troubleshooting Docker**](./kwil_docker_troubleshooting.md): Resolução de problemas comuns com containers.

## 📑 Histórico de Desenvolvimento

Registros de marcos importantes do projeto:

*   [**Checkpoint 9: Integração MCP**](./checkpoint_9_mcp_integration.md): Detalhes da implementação do Model Context Protocol e estabilidade do Gemini.

---

*Última atualização do índice: 14 de Janeiro de 2026*
