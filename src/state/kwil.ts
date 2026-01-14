import { WebKwil, KwilSigner, Utils } from '@kwilteam/kwil-js';
import { Wallet } from 'ethers';
import * as crypto from 'crypto';
import { NeoEvent, Receipt, DynamicData } from '../types/domain';

// Cache the kwil client
let kwilClient: WebKwil | null = null;
let kwilWallet: Wallet | null = null;
// ... (omitting getKwil for brevity as it is unchanged, need to jump to function)

export function getKwil() {
    if (kwilClient && kwilWallet) return { kwil: kwilClient, wallet: kwilWallet };

    const provider = process.env.KWIL_PROVIDER;
    const privateKey = process.env.KWIL_PRIVATE_KEY;

    if (!provider || !privateKey) {
        throw new Error("KWIL_PROVIDER or KWIL_PRIVATE_KEY is missing in environment variables.");
    }

    // Initialize Kwil Client
    kwilClient = new WebKwil({
        kwilProvider: provider,
        chainId: process.env.KWIL_CHAIN_ID || "kwil-chain-1" // Default or from env
    });

    // Initialize Wallet
    kwilWallet = new Wallet(privateKey);

    return { kwil: kwilClient, wallet: kwilWallet };
}

export async function insertKwil({ event }: { event: NeoEvent, receipt_hint?: Receipt }) {
    try {
        const { kwil, wallet } = getKwil();
        const dbId = process.env.KWIL_DB_ID;

        if (!dbId) {
            console.warn("[KWIL] KWIL_DB_ID not set. Skipping DB write.");
            return { id: null, status: "skipped_no_dbid" };
        }

        // Create the signer
        const signer = new KwilSigner(wallet, wallet.address);

        let actionName = "add_event";
        let inputs: DynamicData[] = [];

        // ROUTING LOGIC based on Intent or Payload
        const agentResult = event.result as DynamicData;
        const leadData = agentResult?.payload || agentResult;

        if (leadData && leadData.email && (event.intent === "qualify_lead" || event.intent === "general_agent" || event.intent === "ask_general")) {
            actionName = "create_lead";
            const input = new Utils.ActionInput();
            input.put("$id", event.trace_id || crypto.randomUUID());
            input.put("$email", leadData.email);
            input.put("$name", leadData.name || leadData.full_name || "Unknown");
            input.put("$company", leadData.company || leadData.organization || "Unknown");
            input.put("$score", Number(leadData.score || leadData.lead_score || leadData.quantity || 0));
            input.put("$lead_status", leadData.status || "qualified");
            input.put("$lead_source", leadData.source || "neo_agent_core");
            input.put("$created_at", new Date().toISOString());
            inputs = [input];
        }

        // Fallback or Generic Event Logging
        if (actionName === "add_event") {
            const input = new Utils.ActionInput();
            input.put("$id", crypto.randomUUID());
            input.put("$trace_id", event.trace_id || "no_trace");
            input.put("$intent", event.intent || "unknown");
            input.put("$actor_did", "did:key:z6M...");
            input.put("$payload", JSON.stringify(event.payload || {}));
            input.put("$exec_result", JSON.stringify(event.result || {}));
            input.put("$event_ts", event.timestamp || new Date().toISOString());
            inputs = [input];
        }

        console.log(`[KWIL] Executing action: ${actionName} for intent: ${event.intent}`);

        // Execute Action
        const res = await kwil.execute({
            dbid: dbId,
            action: actionName,
            inputs: inputs,
            description: ""
        }, signer);

        const txHash = res.data?.tx_hash;
        console.log(`[KWIL] Action executed. TxHash: ${txHash}`);

        return {
            id: txHash,
            status: "success"
        };

    } catch (error) {
        const err = error as Error;
        // Resilience: Log error but don't throw, allowing other parallel writes to succeed
        console.error("[KWIL] Action failed:", err.message || err);
        return {
            id: null,
            status: "error",
            error: err.message
        };
    }
}
export async function executeSelect(query: string) {
    const { kwil } = getKwil();
    const dbId = process.env.KWIL_DB_ID;
    if (!dbId) throw new Error("KWIL_DB_ID is not set.");

    try {
        const res = await kwil.selectQuery(dbId, query);
        return res.data;
    } catch (error) {
        console.error("[KWIL] Select Error:", error);
        throw error;
    }
}
