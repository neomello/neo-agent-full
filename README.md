# NΞØ Agent Full

**NΞØ Agent Template - State Layer v2.5**

An advanced autonomous AI agent with persistent memory, external tool integration via MCP (Model Context Protocol), and multi-layer state management.

[![Sponsor neomello](https://img.shields.io/badge/Sponsor-neomello-ff008e?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/neomello)

---

## Why this exists

Most AI agents are stateless, ephemeral and forget everything when they restart.

**NΞØ Agent** exists to enforce one idea:
**your agent must remember, reason with external data, and persist its knowledge**.

If the process dies, memory does not.

---

## What you get

* **Persistent Memory**: Kwil SQL database for lead management and state
* **External Intelligence**: 33+ tools via MCP (Brave Search, GitHub, Fetch)
* **Autonomous Reasoning**: LangGraph ReAct agent with tool calling
* **Multi-Layer State**: Ceramic, GUN, IPFS support for decentralized persistence
* **Production Ready**: Webhook API, structured JSON responses, error recovery

This repository does not document the agent.
It **runs** it.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/neomello/neo-agent-full.git
cd neo-agent-full

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your API keys

# Start Kwil database
docker-compose up -d

# Deploy Kwil schema
npx ts-node scripts/deploy-kwil.ts

# Run the agent
npm run dev
```

Secrets are externalized by design.
See [`.env.example`](.env.example) for required configuration.

---

## Configuration

### Required Environment Variables

```env
GOOGLE_API_KEY=your_google_ai_key
LLM_MODEL=gemini-flash-lite-latest
KWIL_PROVIDER=http://127.0.0.1:8080
KWIL_PRIVATE_KEY=your_private_key
KWIL_DB_ID=your_deployed_db_id
```

### Optional MCP Tools

```env
BRAVE_API_KEY=your_brave_search_key
GITHUB_TOKEN=your_github_token
HUNTER_API_KEY=your_hunter_key
```

New machine. Same memory.

---

## Testing

```bash
# E2E test for Kwil integration
npx ts-node scripts/test-e2e-write.ts

# Test agent via webhook
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "qualify_lead",
    "context": {
      "message": "Qualifique Alice da TechCorp",
      "sender": "user@example.com"
    }
  }'
```

---

## Documentation

- [Checkpoint 9: MCP Integration](docs/checkpoint_9_mcp_integration.md)
- [Architecture Overview](docs/architecture_checkpoint_2026_01_05.md)

---

## Related Repositories

- **Dashboard**: [neo-agent-dashboard](https://github.com/neomello/neo-agent-dashboard) - Next.js frontend for monitoring and control

---

## Architecture

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
│  │ • Kwil State Reader                                  │ │
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

## Tech Stack

- **Runtime**: Node.js 20, TypeScript
- **AI/ML**: LangChain, LangGraph, Google Gemini
- **Database**: Kwil (SQL), Ceramic, GUN
- **Storage**: IPFS (Web3.Storage)
- **APIs**: Hunter.io, Twitter/X, Brave Search, GitHub
- **Protocol**: MCP (Model Context Protocol)

---

## Why sponsor this

This work is public, but it is not free.

Sponsoring means supporting:

* Autonomous agents with persistent memory
* Decentralized state management patterns
* Infrastructure that outlives processes

You are not sponsoring a person.
You are sponsoring a **protocol**.

If this agent saved you time, prevented data loss, or clarified your AI workflow, sponsorship is simply returning value to the system.

[![Sponsor neomello](https://img.shields.io/badge/Sponsor-neomello-ff008e?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/neomello)

---

## Repository

[https://github.com/neomello/neo-agent-full](https://github.com/neomello/neo-agent-full)

---

## Contact

[neo@neoprotocol.space](mailto:neo@neoprotocol.space)

<div align="center">
  <a href="https://x.com/node_mello">
    <img src="https://img.shields.io/badge/-@node_mello-ff008e?style=flat-square&logo=twitter&logoColor=white" alt="Twitter @node_mello" />
  </a>
  <a href="https://www.instagram.com/neoprotocol.eth/">
    <img src="https://img.shields.io/badge/-@neoprotocol.eth-ff008e?style=flat-square&logo=instagram&logoColor=white" alt="Instagram @neoprotocol.eth" />
  </a>
  <a href="https://etherscan.io/">
    <img src="https://img.shields.io/badge/-neomello.eth-ff008e?style=flat-square&logo=ethereum&logoColor=white" alt="Ethereum neomello.eth" />
  </a>
</div>

<div align="center">
  <i>"Expand until silence becomes structure."</i>
</div>

---

> This agent evolves.
> Forgetfulness does not.
