import { WebKwil, KwilSigner } from '@kwilteam/kwil-js';
import { Wallet } from 'ethers';
import * as crypto from 'crypto';
import { NeoEvent, Receipt } from '../types/domain';

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
        let inputs: any[] = [];

        // ROUTING LOGIC based on Intent
        if (event.intent === "qualify_lead" && event.result) {
            const leadData = event.result as any;

            // Basic validation to ensure it looks like a lead
            if (leadData.email) {
                actionName = "create_lead";
                // Map fields to create_lead action
                inputs = [{
                    "$id": event.trace_id || crypto.randomUUID(),
                    "$email": leadData.email,
                    "$name": leadData.name || "Unknown",
                    "$company": leadData.company || "Unknown",
                    "$score": typeof leadData.score === 'number' ? leadData.score : 0,
                    "$lead_status": leadData.status || "new",
                    "$lead_source": "neo_agent_core",
                    "$created_at": new Date().toISOString()
                }];
            }
        }

        // Fallback or Generic Event Logging
        if (actionName === "add_event") {
            inputs = [{
                "$id": crypto.randomUUID(), // Unique ID for the event record
                "$trace_id": event.trace_id || "no_trace",
                "$intent": event.intent || "unknown",
                "$actor_did": "did:key:z6M...",
                "$payload": JSON.stringify(event.payload || {}),
                "$exec_result": JSON.stringify(event.result || {}),
                "$event_ts": event.timestamp || new Date().toISOString()
            }];
        }

        console.log(`[KWIL] Executing action: ${actionName} for intent: ${event.intent}`);

        // Execute Action
        const res = await kwil.execute({
            namespace: dbId,
            name: actionName,
            inputs: inputs,
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

