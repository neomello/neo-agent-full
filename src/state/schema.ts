
export const NEO_SCHEMA: any = {
    name: "neo_agent_db",
    tables: [
        {
            name: "leads",
            columns: [
                { name: "id", type: "TEXT", attributes: [{ type: "PRIMARY_KEY" }] },
                { name: "email", type: "TEXT" },
                { name: "name", type: "TEXT" },
                { name: "company", type: "TEXT" },
                { name: "score", type: "INT" },
                { name: "lead_status", type: "TEXT" },
                { name: "lead_source", type: "TEXT" },
                { name: "created_at", type: "TEXT" }
            ]
        },
        {
            name: "events",
            columns: [
                { name: "id", type: "TEXT", attributes: [{ type: "PRIMARY_KEY" }] },
                { name: "trace_id", type: "TEXT" },
                { name: "intent", type: "TEXT" },
                { name: "actor_did", type: "TEXT" },
                { name: "payload", type: "TEXT" },
                { name: "exec_result", type: "TEXT" },
                { name: "event_ts", type: "TEXT" }
            ]
        }
    ],
    actions: [
        {
            name: "create_lead",
            public: true,
            mutability: "update",
            inputs: ["$id", "$email", "$name", "$company", "$score", "$lead_status", "$lead_source", "$created_at"],
            statements: [
                "INSERT INTO leads (id, email, name, company, score, lead_status, lead_source, created_at) VALUES ($id, $email, $name, $company, $score, $lead_status, $lead_source, $created_at)"
            ]
        },
        {
            name: "add_event",
            public: true,
            mutability: "update",
            inputs: ["$id", "$trace_id", "$intent", "$actor_did", "$payload", "$exec_result", "$event_ts"],
            statements: [
                "INSERT INTO events (id, trace_id, intent, actor_did, payload, exec_result, event_ts) VALUES ($id, $trace_id, $intent, $actor_did, $payload, $exec_result, $event_ts)"
            ]
        }
    ]
};
