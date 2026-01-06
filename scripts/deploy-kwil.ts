import { Utils, WebKwil, KwilSigner } from '@kwilteam/kwil-js';
import { Wallet } from 'ethers';
import { schema } from '../src/state/schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function deployKwilSchema() {
    console.log("🚀 Starting Kwil Database Deployment (SDK v0.6.3)...");

    const provider = process.env.KWIL_PROVIDER;
    const privateKey = process.env.KWIL_PRIVATE_KEY;
    const chainId = process.env.KWIL_CHAIN_ID || "kwil-chain-1";

    if (!provider || !privateKey) {
        console.error("❌ Error: KWIL_PROVIDER or KWIL_PRIVATE_KEY missing in .env");
        process.exit(1);
    }

    try {
        const kwil = new WebKwil({ kwilProvider: provider, chainId: chainId });
        const wallet = new Wallet(privateKey);
        const signer = new KwilSigner(wallet, wallet.address);

        console.log(`📡 Connected as: ${wallet.address}`);
        console.log("💾 Deploying Schema...");

        // Set owner
        schema.owner = wallet.address;

        const res = await kwil.deploy({
            // @ts-ignore
            schema: schema,
            description: "State Layer DB for Neo Agent"
        }, signer);

        const txHash = res.data?.tx_hash;
        console.log(`✅ Transaction Broadcasted! Hash: ${txHash}`);

        const dbid = Utils.generateDBID(wallet.address, "neo_agent_db");
        console.log("\n" + "=".repeat(60));
        console.log(`✅ DATABASE DEPLOYED! ADICIONE ISTO AO SEU .ENV:`);
        console.log(`\nKWIL_DB_ID=${dbid}\n`);
        console.log("=".repeat(60) + "\n");

    } catch (error: any) {
        console.error("❌ Deploy Failed:", error.message || error);
        process.exit(1);
    }
}

deployKwilSchema();
