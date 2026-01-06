import { WebKwil, KwilSigner } from '@kwilteam/kwil-js';
import { Wallet } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function dropKwilSchema() {
    const provider = process.env.KWIL_PROVIDER || '';
    const privateKey = process.env.KWIL_PRIVATE_KEY || '';
    const dbid = process.env.KWIL_DB_ID || '';

    if (!provider || !privateKey || !dbid) {
        console.error("Missing env vars");
        return;
    }

    try {
        const kwil = new WebKwil({ kwilProvider: provider, chainId: process.env.KWIL_CHAIN_ID || "kwil-chain-1" });
        const wallet = new Wallet(privateKey);
        const signer = new KwilSigner(wallet, wallet.address);

        console.log(`🗑 Dropping database: ${dbid}`);

        const res = await kwil.drop({
            dbid: dbid
        }, signer);

        console.log(`✅ Drop Broadcasted! Hash: ${res.data?.tx_hash}`);
    } catch (e: any) {
        console.error("❌ Drop Failed:", e.message || e);
    }
}

dropKwilSchema();
