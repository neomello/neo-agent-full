# NΞØ Agent Full

**NΞØ Agent Template - State Layer v2.5**

An advanced autonomous AI agent with persistent memory, external tool integration via MCP (Model Context Protocol), and multi-layer state management.

---

## 🚀 Features

- **🧠 LangChain + LangGraph**: ReAct agent with tool calling
- **🔍 MCP Integration**: 33+ external tools (Brave Search, GitHub, Fetch)
- **💾 Persistent Memory**: Kwil Database for lead management
- **📧 Email Verification**: Hunter.io integration
- **🐦 Social Media**: Twitter/X API integration
- **🌐 Decentralized State**: Ceramic, GUN, IPFS support
- **📊 Structured Responses**: JSON-based agent outputs

---

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- Docker (for Kwil and MCP servers)
- Google AI API Key

### Installation

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

---

## 🔧 Configuration

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

See [`.env.example`](.env.example) for full configuration.

---

## 🧪 Testing

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

## 📚 Documentation

- [Checkpoint 9: MCP Integration](docs/checkpoint_9_mcp_integration.md)
- [Architecture Overview](docs/architecture_checkpoint_2026_01_05.md)

---

## 🎨 Related Repositories

- **Dashboard**: [neo-agent-dashboard](https://github.com/neomello/neo-agent-dashboard) - Next.js frontend for monitoring and control

---

## 🏗️ Architecture

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

## 🛠️ Tech Stack

- **Runtime**: Node.js 20, TypeScript
- **AI/ML**: LangChain, LangGraph, Google Gemini
- **Database**: Kwil (SQL), Ceramic, GUN
- **Storage**: IPFS (Web3.Storage)
- **APIs**: Hunter.io, Twitter/X, Brave Search, GitHub
- **Protocol**: MCP (Model Context Protocol)

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ by the NΞØ Team**
