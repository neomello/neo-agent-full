import Gun from 'gun';
import { DynamicData } from '../types/domain';

// NΞØ Protocol - P2P Synapse Node
// Note: We use process.env.GUN_PEERS (comma separated) or a default relay
const peers = process.env.GUN_PEERS
    ? process.env.GUN_PEERS.split(',').map(p => p.trim())
    : ['https://gun-manhattan.herokuapp.com/gun'];

const gun = Gun({
    peers,
    // localStorage: false // Server-side environment
});

const AGENT_NAMESPACE = 'neo-agent';
const CHANNEL = 'leads/feed';

/**
 * ⚡ A Sinapse em Tempo Real
 * Dispara o sinal P2P para a rede. 
 * O Dashboard deve fazer: gun.get('neo-agent').get('leads/feed').map().on(...)
 */
export const broadcastLead = async (lead: DynamicData) => {
    try {
        if (!lead.id) {
            console.warn("[GUN] ⚠️  Tentativa de broadcast sem ID. Gerando ID temporário.");
            lead.id = lead.email || Date.now().toString();
        }

        // Sanitização NΞØ: GUN não aceita arrays puros em nodes .put()
        const sanitizedLead = JSON.parse(JSON.stringify(lead));
        if (sanitizedLead.tags && Array.isArray(sanitizedLead.tags)) {
            sanitizedLead.tags = sanitizedLead.tags.join(', ');
        }

        const payload = {
            ...sanitizedLead,
            _synced_at: Date.now(), // Timestamp da sinapse
            _source: 'neo-agent-core'
        };

        // ⚡ A Mágica: Usar lead.id como chave previne duplicatas no grafo
        gun
            .get(AGENT_NAMESPACE)
            .get(CHANNEL)
            .get(lead.id)
            .put(payload, (ack: DynamicData) => {
                if (ack.err) {
                    console.error(`[GUN] 🔴 Erro na propagação: ${ack.err}`);
                } else {
                    console.log(`[GUN] 🟢 Sinapse disparada para lead: ${lead.id}`);
                }
            });

    } catch (error) {
        const err = error as Error;
        console.error('[GUN] ❌ Falha crítica no subsistema P2P:', err.message);
    }
};

/**
 * Legacy support for the generic notifyGun function
 */
export async function notifyGun({ event, receipt_hint }: { event: DynamicData, receipt_hint: DynamicData }) {
    // If it's a lead-related event, use the specialized broadcast
    const leadData = event.result?.payload || event.result;
    if (leadData && leadData.email) {
        return broadcastLead({ ...leadData, id: event.trace_id });
    }

    // Fallback for generic events
    return new Promise<{ ok: boolean }>((resolve) => {
        try {
            const node = gun.get(AGENT_NAMESPACE).get('events');
            const dataToPut = {
                ...event,
                receipt: receipt_hint,
                timestamp: event.timestamp || Date.now()
            };

            node.set(dataToPut, (ack: DynamicData) => {
                if (ack.err) {
                    resolve({ ok: false });
                } else {
                    resolve({ ok: true });
                }
            });
        } catch (error) {
            resolve({ ok: false });
        }
    });
}
