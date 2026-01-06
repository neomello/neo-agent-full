// Domain Types for Neo Agent

// 1. Core Structures
export interface NeoEvent {
    intent: string;
    trace_id?: string;
    actor: string;
    payload: unknown;
    result?: unknown;
    timestamp: string;
}

export interface AgentResult {
    action: "response" | "write" | "error";
    payload: Record<string, unknown>;
    response_text: string | unknown;
}

export interface AgentOneShotContext {
    targets?: string[];
    actor?: string;
    trace_id?: string;
    timestamp?: string;
    [key: string]: unknown;
}

// 2. State Layer
export interface WriteRequest {
    intent: string;
    payload: unknown;
    result?: AgentResult | unknown; // Can be broader
    targets?: string[];
    context: AgentOneShotContext;
    actor: string;
}

export interface Receipt {
    ipfs_cid: string | null;
    ipfs_url: string | null;
    ceramic_stream_id: string | null;
    kwil_id: string | null;
    gun_ack: boolean | null;
    graph_feed_id: string | null;
}

// 3. Router
export interface JsonRpcRequest {
    method: string;
    params?: unknown;
}

export interface JsonRpcResponse {
    status: "success" | "error" | "not_implemented_yet";
    message?: string;
    errors?: unknown;
    agent_response?: AgentResult;
    state_receipt?: Receipt | null;
}
