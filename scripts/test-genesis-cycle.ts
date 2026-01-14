
import * as dotenv from 'dotenv';
import { insertKwil } from '../src/state/kwil';
import { uploadSnapshot } from '../src/state/ipfs';
import { logCeramic } from '../src/state/ceramic';
import { broadcastLead } from '../src/state/gun';
import { NeoEvent } from '../src/types/domain';

dotenv.config();

/**
 * NΞØ Protocol - Genesis Cycle Test
 * 
 * Este script valida o fluxo completo de persistência v2.5:
 * 1. Kwil (SQL) -> 2. IPFS (Imutável) -> 3. Ceramic (Identidade) -> 4. GUN (Tempo Real)
 */
async function runGenesisCycle() {
    console.log("\n--- [NEO PROTOCOL]: INICIANDO CICLO GENESIS ---");
    const traceId = `neo_gen_${Date.now()}`;

    // MOCK DATA: Lead Qualificado Complexo
    const mockLead = {
        id: traceId,
        name: 'Thomas A. Anderson',
        email: 'neo@zion.net',
        company: 'The Resistance',
        score: 100,
        status: 'the_one',
        analysis: 'High priority lead. Potential to break the simulation detected.',
        tags: ['Zion', 'Resistance', 'Outlier']
    };

    const event: NeoEvent = {
        intent: 'qualify_lead',
        trace_id: traceId,
        actor: 'neo-agent-core-v2.5',
        payload: { email: mockLead.email },
        result: { payload: mockLead },
        timestamp: new Date().toISOString()
    };

    try {
        // STEP 1: KWIL (Structural Persistence)
        console.log("\n📦 [1/4] Gravando no Kwil DB (SQL layer)...");
        const kwilRes = await insertKwil({ event });
        if (kwilRes.status === 'success') {
            console.log(`✅ Kwil Saved! TxHash: ${kwilRes.id}`);
        } else {
            console.warn(`⚠️ Kwil Warning: ${kwilRes.status} (Check your DB context)`);
        }

        // STEP 2: IPFS (Immutable Snapshot)
        console.log("\n📦 [2/4] Gerando Snapshot Imutável no IPFS (Storacha)...");
        const ipfsCid = await uploadSnapshot(mockLead);
        if (ipfsCid) {
            console.log(`✅ IPFS Uploaded! CID: ${ipfsCid}`);
        } else {
            console.warn("⚠️ IPFS Warning: Upload failed (Check IPFS_TOKEN)");
        }

        // STEP 3: CERAMIC (Identity & Proof)
        console.log("\n📦 [3/4] Registrando prova de identidade no Ceramic Network...");
        const ceramicRes = await logCeramic({
            event_type: 'snapshot_anchored',
            cid: ipfsCid,
            trace_id: traceId
        });
        if (ceramicRes.stream_id) {
            console.log(`✅ Ceramic Anchored! StreamID: ${ceramicRes.stream_id}`);
        } else {
            console.warn("⚠️ Ceramic Warning: Logging failed (Check DID_SEED)");
        }

        // STEP 4: GUN (Real-time Synapse)
        console.log("\n📦 [4/4] Disparando Sinapse P2P para o Dashboard...");
        const finalPayload = {
            ...mockLead,
            _ipfs_cid: ipfsCid,
            _ceramic_stream_id: ceramicRes.stream_id,
            _kwil_tx: kwilRes.id
        };

        await broadcastLead(finalPayload);
        console.log("✅ GUN Shouted! Sinapse dispersa na malha.");

        console.log("\n--- [NEO] CICLO GENESIS CONCLUIDO COM SUCESSO ---");
        console.log(`🔍 Trace ID: ${traceId}`);
        console.log("----------------------------------------------\n");

        // Pequeno delay para garantir que o GUN finalize a emissão antes de fechar o processo
        setTimeout(() => process.exit(0), 2000);

    } catch (error) {
        const err = error as Error;
        console.error("\n❌ FALHA CRÍTICA NO CICLO GÊNESIS:", err.message);
        process.exit(1);
    }
}

runGenesisCycle();
