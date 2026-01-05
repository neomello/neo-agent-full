import Gun from 'gun';

// Initialize Gun with peers from env
// Note: In a real server context, we might want to also act as a peer server ('http' passed to Gun).
// Here we act as a client/peer node.
const peers = process.env.GUN_PEER ? [process.env.GUN_PEER.trim()] : [];
const gun = Gun({
    peers,
    // localStorage: false, // Optional: disable localStorage if purely server-side ephemeral
    // radisk: true         // Optional: persistence
});

export async function notifyGun({ event, receipt_hint }: { event: any, receipt_hint: any }) {
    return new Promise<{ ok: boolean }>((resolve) => {
        try {
            if (!process.env.GUN_PEER) {
                console.warn("[GUN] No GUN_PEER configured, skipping network emission.");
                // We resolve true to not block the executor, but log warning
                return resolve({ ok: false });
            }

            // We store the event in a 'timeline' or specific node
            // Structure: neo-agent / {trace_id} -> data
            const node = gun.get('neo-agent').get('events');

            const dataToPut = {
                ...event,
                receipt: receipt_hint,
                timestamp: event.timestamp || Date.now()
            };

            node.set(dataToPut, (ack: any) => {
                if (ack.err) {
                    console.error("[GUN] Put error:", ack.err);
                    resolve({ ok: false });
                } else {
                    // console.log("[GUN] Acknowledged:", ack);
                    resolve({ ok: true });
                }
            });

        } catch (error) {
            console.error("[GUN] Unexpected error:", error);
            resolve({ ok: false });
        }
    });
}

