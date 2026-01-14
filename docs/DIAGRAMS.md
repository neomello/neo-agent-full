# 📊 NΞØ Agent - Visual Architecture & Flows

This page contains the visual documentation of the NΞØ Agent system. All diagrams are rendered directly by GitHub using Mermaid.

---

## 🏗️ General System Architecture
The high-level structure of the neo-agent system, showing layers from Frontend to External Infrastructure.

```mermaid
graph TD
    subgraph "Frontend Layer"
        DASH[Dashboard<br/>neo-agent-dashboard<br/>✅ Deployed]
    end
    
    subgraph "API Gateway"
        WH[Webhook API<br/>:3000/webhook<br/>✅ Active]
        WH --> ROUTER[MCP Router<br/>process_intent<br/>✅ Active]
    end
    
    subgraph "Agent Core"
        ROUTER --> AGENT[LangChain Agent<br/>LangGraph ReAct<br/>✅ Active]
        
        AGENT --> HUNTER[Hunter.io<br/>verifyEmail<br/>✅ Connected]
        AGENT --> TWITTER[Twitter/X<br/>postUpdate<br/>⚠️ Auth Error]
        AGENT --> READER[State Reader<br/>get_lead_data<br/>✅ Connected]
        
        subgraph "MCP Tools - 33 total"
            AGENT --> BRAVE[Brave Search<br/>6 tools<br/>✅ Connected]
            AGENT --> FETCH[Fetch<br/>1 tool<br/>✅ Connected]
            AGENT --> GITHUB[GitHub<br/>26 tools<br/>✅ Connected]
        end
    end
    
    subgraph "State Layer - Active"
        READER --> KWIL_READ[(Kwil DB<br/>SELECT<br/>✅ Working)]
        AGENT --> WRITER[State Writer<br/>Multi-target<br/>✅ Active]
        WRITER --> KWIL_WRITE[(Kwil DB<br/>INSERT/UPDATE<br/>✅ Working)]
    end
    
    subgraph "State Layer - Pending"
        WRITER -.->|❌ Not Connected| CERAMIC[(Ceramic<br/>DID Streams<br/>⏳ Code Ready)]
        WRITER -.->|❌ Not Connected| GUN[(GUN DB<br/>P2P Sync<br/>⏳ Code Ready)]
        WRITER -.->|❌ Not Connected| IPFS[(IPFS<br/>Web3.Storage<br/>⏳ Code Ready)]
    end
    
    subgraph "External Infrastructure"
        BRAVE --> DOCKER_BRAVE[Docker<br/>mcp/brave-search<br/>✅ Running]
        FETCH --> DOCKER_FETCH[Docker<br/>mcp/fetch<br/>✅ Running]
        GITHUB --> DOCKER_GITHUB[Docker<br/>mcp/github<br/>✅ Running]
        
        KWIL_READ --> KWIL_NODE[Kwil Node<br/>:8080<br/>✅ Running]
        KWIL_WRITE --> KWIL_NODE
        KWIL_NODE --> POSTGRES[(PostgreSQL<br/>Kwil Backend<br/>✅ Running)]
    end
    
    subgraph "Monitoring - Not Connected"
        AGENT -.->|❌ Disabled| LANGSMITH[LangSmith<br/>Tracing<br/>⏳ Available]
        KWIL_NODE -.->|❌ Not Setup| PROMETHEUS[Prometheus<br/>Metrics<br/>⏳ Planned]
    end
    
    %% Frontend Connection
    DASH -->|HTTP POST| WH
    
    %% Styling
    classDef connected fill:#00ff88,stroke:#00aa55,stroke-width:3px,color:#000
    classDef warning fill:#ffaa00,stroke:#ff6600,stroke-width:2px,color:#000
    classDef pending fill:#ff6666,stroke:#cc0000,stroke-width:2px,color:#fff
    classDef infrastructure fill:#4488ff,stroke:#0044aa,stroke-width:2px,color:#fff
    
    class DASH,WH,ROUTER,AGENT,HUNTER,READER,BRAVE,FETCH,GITHUB,WRITER,KWIL_READ,KWIL_WRITE,KWIL_NODE,POSTGRES,DOCKER_BRAVE,DOCKER_FETCH,DOCKER_GITHUB connected
    class TWITTER warning
    class CERAMIC,GUN,IPFS,LANGSMITH,PROMETHEUS pending
```

---

## 🔍 Lead Query Flow (Read-Only)
How the agent fetches existing memory from the state layer.

```mermaid
graph TD
    DASH["Dashboard (User Input)"] -->|POST /webhook| WH["Webhook API"]
    WH -->|process_intent| ROUTER["MCP Router"]
    ROUTER -->|execute| AGENT["LangGraph Agent"]
    AGENT -->|"get_lead_data<br/>('alice@example.com')"| READER["State Reader"]
    READER -->|"SELECT * FROM leads<br/>WHERE email = ?"| KWIL["Kwil Database"]
    KWIL -->|"[{id, email, name,<br/>company, score}]"| READER
    READER -->|JSON data| AGENT
    AGENT -->|"{action: 'response',<br/>response_text: '...'}"| ROUTER
    ROUTER -->|"{status: 'success',<br/>agent_response: {...}}"| WH
    WH -->|200 OK| DASH
    
    style DASH fill:#00ff88,stroke:#00aa55,stroke-width:3px
    style WH fill:#ff008e,stroke:#aa0055,stroke-width:3px
    style ROUTER fill:#ff008e,stroke:#aa0055,stroke-width:3px
    style AGENT fill:#ff008e,stroke:#aa0055,stroke-width:3px
    style READER fill:#00ff88,stroke:#00aa55,stroke-width:3px
    style KWIL fill:#00ff88,stroke:#00aa55,stroke-width:3px
```

### 🧠 Mindmap: Lead Query Decision
How the agent thinks when processing a lead query.

```mermaid
mindmap
  root((Query Lead Flow))
    Frontend
      Dashboard Next.js
        User Input
          "Mostre dados de alice@example.com"
        HTTP Request
          POST /webhook
    Agent Processing
      LangChain Agent
        Interprets query
        Decides to use tool
        Calls get_lead_data
      State Reader Tool
        Receives email param
        Builds SQL query
        Executes on Kwil
    Database Layer
      Kwil Database
        SELECT * FROM leads
        Returns JSON array
    Response Flow
      Agent Formats
        action: response
        response_text: formatted
      Dashboard Updates
        Displays lead info
        Updates UI state
```

---

## ⚡ Lead Qualification Flow (Write-Memory)
Step-by-step sequence of searching, verifying, and persisting new lead data.

```mermaid
sequenceDiagram
    participant DASH as Dashboard<br/>(Next.js)
    participant WH as Webhook API<br/>:3000/webhook
    participant ROUTER as MCP Router
    participant AGENT as LangChain Agent
    participant READER as State Reader
    participant KWIL as Kwil Database
    participant BRAVE as Brave Search<br/>(MCP)
    participant HUNTER as Hunter.io
    participant WRITER as State Writer

    Note over DASH,WRITER: User qualifies a lead via Dashboard

    DASH->>WH: POST /webhook<br/>{intent: "qualify_lead", context: {...}}
    activate WH
    WH->>ROUTER: process_intent(intent, context)
    activate ROUTER
    
    ROUTER->>AGENT: execute(intent, context)
    activate AGENT
    
    Note over AGENT: Agent decides to check if lead exists
    AGENT->>READER: get_lead_data(email)
    activate READER
    READER->>KWIL: SELECT * FROM leads WHERE email = ?
    activate KWIL
    KWIL-->>READER: [] (not found)
    deactivate KWIL
    READER-->>AGENT: "Lead not found"
    deactivate READER
    
    Note over AGENT: Agent decides to search for company info
    AGENT->>BRAVE: brave_web_search(query: "company name")
    activate BRAVE
    BRAVE-->>AGENT: {results: [...]}
    deactivate BRAVE
    
    Note over AGENT: Agent decides to verify email
    AGENT->>HUNTER: verifyEmail(email)
    activate HUNTER
    HUNTER-->>AGENT: {valid: true, score: 95}
    deactivate HUNTER
    
    Note over AGENT: Agent qualifies lead and returns JSON
    AGENT-->>ROUTER: {action: "write", payload: {email, name, company, score: 99}}
    deactivate AGENT
    
    ROUTER->>WRITER: write(payload, targets: ["kwil"])
    activate WRITER
    WRITER->>KWIL: execute("create_lead", inputs)
    activate KWIL
    KWIL-->>WRITER: {tx_hash: "0x..."}
    deactivate KWIL
    WRITER-->>ROUTER: {kwil_id: "0x...", ceramic_stream_id: null}
    deactivate WRITER
    
    ROUTER-->>WH: {status: "success", agent_response: {...}, state_receipt: {...}}
    deactivate ROUTER
    WH-->>DASH: 200 OK<br/>{status: "success", ...}
    deactivate WH
```
