
import { saveIPFS } from "../state/ipfs";
import { logCeramic } from "../state/ceramic";
import { insertKwil } from "../state/kwil";
import { notifyGun } from "../state/gun";
import { emitGraphFeed } from "../state/graph-feed";

export class StateWriterExecutor {
    async write({ intent, payload, result, targets, context, actor }: any) {
        const event = {
            intent,
            trace_id: context?.trace_id,
            actor,
            payload,
            result,
            timestamp: context?.timestamp || new Date().toISOString()
        };

        const promises: Promise<any>[] = [];
        const keys: string[] = [];

        // 1. IPFS (Sequencial se necessário o CID para metadata)
        let ipfsResult: { cid: string | null, url: string | null } = { cid: null, url: null };
        if (targets?.includes("ipfs") && result?.proposal_markdown) {
            // Assume saveIPFS implementado futuramente
            ipfsResult = await saveIPFS({ content: result.proposal_markdown, metadata: event });
        }

        const receipt: any = {
            ipfs_cid: ipfsResult.cid,
            ipfs_url: ipfsResult.url,
            ceramic_stream_id: null,
            kwil_id: null,
            gun_ack: null,
            graph_feed_id: null
        };

        // 2. Disparo Paralelo (Fan-out)
        const possibleTargets = ["ceramic", "kwil", "gun", "graph_feed"];

        if (targets) {
            if (targets.includes("ceramic")) { keys.push("ceramic"); promises.push(logCeramic({ event, receipt_hint: receipt })); }
            if (targets.includes("kwil")) { keys.push("kwil"); promises.push(insertKwil({ event, receipt_hint: receipt })); }
            if (targets.includes("gun")) { keys.push("gun"); promises.push(notifyGun({ event, receipt_hint: receipt })); }
            if (targets.includes("graph_feed")) { keys.push("graph_feed"); promises.push(emitGraphFeed({ event, receipt_hint: receipt })); }
        }

        const results = await Promise.allSettled(promises);

        results.forEach((res, index) => {
            const target = keys[index];
            if (res.status === 'fulfilled') {
                if (target === "ceramic") receipt.ceramic_stream_id = res.value.stream_id;
                if (target === "kwil") receipt.kwil_id = res.value.id;
                if (target === "gun") receipt.gun_ack = res.value.ok;
                if (target === "graph_feed") receipt.graph_feed_id = res.value.id;
            } else {
                console.error(`[NΞØ State Error] Write failed for ${target}:`, res.reason);
            }
        });

        return receipt;
    }
}
