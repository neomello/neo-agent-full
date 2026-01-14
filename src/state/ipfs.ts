import { DynamicData } from "../types/domain";

// NΞØ Protocol - Storacha (IPFS) Logic
let client: any = null;

/**
 * Inicializa o cliente w3up-client (Storacha) usando a Delegation Proof do .env
 */
async function getIPFSClient() {
    if (client) return client;

    try {
        const { create } = await import('@web3-storage/w3up-client');
        const { extract } = await import('@ucanto/core/delegation');

        client = await create();

        const token = process.env.IPFS_TOKEN?.trim();
        if (!token) {
            console.warn("[IPFS] ⚠️  IPFS_TOKEN não encontrado no ambiente.");
            return client;
        }

        try {
            // Sanitização Total NΞØ: Remove aspas e espaços invisíveis
            const cleanToken = token.replace(/^["']|["']$/g, '');

            // Decodifica a prova base64
            const bytes = Uint8Array.from(Buffer.from(cleanToken, 'base64'));

            console.log(`[IPFS] 🛠️  Processing token (${bytes.length} bytes)...`);

            // Tenta extrair a delegação (formato CAR)
            const proof = await extract(bytes);

            if (proof.ok) {
                // Adiciona a prova ao cliente
                await client.addSpace(proof.ok);

                // Seleciona o espaço da delegação
                const spaceDid = proof.ok.capabilities[0].with;
                await client.setCurrentSpace(spaceDid);

                console.log(`[IPFS] 🟢 Storacha Authenticated. Space: ${spaceDid}`);
            } else {
                console.error("[IPFS] 🔴 Erro na prova (extract failed):", proof.error);
                console.log("[IPFS] 🛠️ Header bytes:", bytes.slice(0, 10));
                console.log("[IPFS] 🛠️ Certifique-se que o IPFS_TOKEN no .env é o Base64 DIRETO do comando 'storacha delegation create'");
            }
        } catch (err: any) {
            console.error("[IPFS] 🔴 Falha crítica ao processar IPFS_TOKEN:", err.message);
        }

    } catch (error: any) {
        console.error("[IPFS] ❌ Falha ao inicializar w3up-client:", error.message);
    }

    return client;
}

/**
 * ⚡ Upload Snapshot
 * Converte um objeto JSON em um arquivo imutável no IPFS via Storacha.
 */
export async function uploadSnapshot(data: object): Promise<string | null> {
    try {
        const ipfsClient = await getIPFSClient();
        if (!ipfsClient) return null;

        // Criar Blob do JSON (Global no Node 20)
        const content = JSON.stringify(data, null, 2);
        const file = new File([content], `neo-snapshot-${Date.now()}.json`, { type: 'application/json' });

        console.log("[IPFS] 🚀 Fazendo upload de snapshots para Storacha...");
        const cid = await ipfsClient.uploadFile(file);

        const cidString = cid.toString();
        console.log(`[IPFS] ✅ Snapshot persistido! CID: ${cidString}`);

        return cidString;
    } catch (error: any) {
        console.error("[IPFS] ❌ Falha no upload do snapshot:", error.message);
        return null;
    }
}

/**
 * Legacy/Wrapper support for StateWriterExecutor
 */
export async function saveIPFS({ content, metadata }: { content: string, metadata: DynamicData }) {
    try {
        const ipfsClient = await getIPFSClient();
        if (!ipfsClient) return { cid: null, url: null };

        // metadata ignorado no upload direto de arquivo único, mas preservado para compatibilidade
        const file = new File([content], `neo-content-${Date.now()}.md`, { type: 'text/markdown' });
        const cid = await ipfsClient.uploadFile(file);
        const cidString = cid.toString();

        return {
            cid: cidString,
            url: `https://${cidString}.ipfs.w3s.link`
        };
    } catch (error: any) {
        console.error("[IPFS] ❌ Save failed:", error.message);
        return { cid: null, url: null };
    }
}
