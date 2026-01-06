export const schema = {
    owner: "", // Will be filled by deploy script
    name: "neo_agent_db",
    description: "State Layer DB for Neo Agent",
    tables: [
        {
            name: "events",
            columns: [
                { name: "id", type: "TEXT", attributes: [{ type: "PRIMARY_KEY" }] },
                { name: "trace_id", type: "TEXT" },
                { name: "intent", type: "TEXT" },
                { name: "payload", type: "TEXT" },
                { name: "exec_result", type: "TEXT" },
                { name: "event_ts", type: "TEXT" },
                { name: "actor_did", type: "TEXT" }
            ]
        },
        {
            name: "leads",
            columns: [
                { name: "id", type: "TEXT", attributes: [{ type: "PRIMARY_KEY" }] },
                { name: "email", type: "TEXT", attributes: [{ type: "UNIQUE" }, { type: "NOT_NULL" }] },
                { name: "name", type: "TEXT" },
                { name: "company", type: "TEXT" },
                { name: "score", type: "INT" },
                { name: "lead_status", type: "TEXT" }, // Renamed from status (reserved)
                { name: "lead_source", type: "TEXT" }, // Renamed from source (reserved)
                { name: "created_at", type: "TEXT" }
            ]
        }
    ],
    actions: [
        {
            name: "add_event",
            inputs: ["$id", "$trace_id", "$intent", "$payload", "$exec_result", "$event_ts", "$actor_did"],
            public: true,
            mutability: "UPDATE",
            statements: [`INSERT INTO events (id, trace_id, intent, payload, exec_result, event_ts, actor_did) VALUES ($id, $trace_id, $intent, $payload, $exec_result, $event_ts, $actor_did);`]
        },
        {
            name: "create_lead",
            inputs: ["$id", "$email", "$name", "$company", "$score", "$lead_status", "$lead_source", "$created_at"],
            public: true,
            mutability: "UPDATE",
            statements: [`INSERT INTO leads (id, email, name, company, score, lead_status, lead_source, created_at) VALUES ($id, $email, $name, $company, $score, $lead_status, $lead_source, $created_at);`]
        }
    ]
};
