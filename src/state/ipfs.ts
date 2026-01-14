import { DynamicData } from "../types/domain";

// Singleton client promise
let clientPromise: Promise<DynamicData> | null = null;

async function getClient() {
    if (clientPromise) return clientPromise;

    // Dynamic import for ESM compatibility in CommonJS project
    const { create } = await import('@web3-storage/w3up-client');

    clientPromise = create();
    const client = await clientPromise;

    // In w3up, authorization typically persists in the local store.
    // However, if IPFS_TOKEN is provided (assuming it acts as a Space DID or valid proof),
    // we would integrate it here. 
    // For State Layer v2.5 with w3up, we assume the agent environment 
    // is authenticated via `w3 login` or has a valid delegation.

    // Minimal logic to attempt using the Space from env if set (as a DID)
    // or relying on local store.
    if (process.env.IPFS_TOKEN) {
        try {
            // If the token is a Space DID, we set it.
            // If it's a Delegation string, we would parse and add it.
            // Here we assume it helps identify the space.
            const space = client.spaces().find((s: DynamicData) => s.did() === process.env.IPFS_TOKEN);
            if (space) {
                await client.setCurrentSpace(space.did());
            } else {
                console.warn("[IPFS] IPFS_TOKEN provided but space not found in local store. Ensure you have delegated capabilities to this agent.");
            }
        } catch (error) {
            const err = error as Error;
            console.error("[IPFS] Failed to configure space from IPFS_TOKEN:", err.message);
        }
    }

    return client;
}

export async function saveIPFS({ content, metadata }: { content: string, metadata: DynamicData }) {
    try {
        const client = await getClient();

        // Create a File-like object from the content
        // Node.js environments with w3up-client support generic File/Blob
        const file = new File([content], `proposal-${Date.now()}.md`, { type: 'text/markdown' });

        // Upload
        // w3up uploadFile returns the Data CID (the file's own CID) if linked correctly, 
        // or we upload a directory wrapping it. 
        // client.uploadFile is a helper that returns a CID.
        const cid = await client.uploadFile(file);
        const cidString = cid.toString();

        // Construct URL (using w3s.link gateway for convenience)
        const url = `https://${cidString}.ipfs.w3s.link`;

        console.log(`[IPFS] Saved: ${cidString}`);

        return { cid: cidString, url };
    } catch (error) {
        const err = error as Error;
        console.error("[IPFS] Save failed:", err.message);
        // Return nulls to allow fallback/resilience in executor
        return { cid: null, url: null };
    }
}

