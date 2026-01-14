
import { WebKwil, KwilSigner } from '@kwilteam/kwil-js';
import { Wallet } from 'ethers';
import { NEO_SCHEMA } from '../src/state/schema';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

// Helper local para evitar dependência circular
const KwilUtils = {
    generateDbId: (owner: string, name: string) => {
        const ownerClean = owner.toLowerCase().replace('0x', '');
        return `x${crypto.createHash('sha256').update(ownerClean + name).digest('hex').substring(0, 50)}`;
    }
};

async function deployKwil() {
    const provider = process.env.KWIL_PROVIDER || 'http://localhost:8081';
    const privateKey = process.env.KWIL_PRIVATE_KEY;

    if (!privateKey) {
        console.error("❌ ERRO: Faltam KWIL_PRIVATE_KEY no .env");
        return;
    }

    console.log("🚀 Iniciando Deploy do Banco NΞØ no Kwil...");
    console.log(`📡 Provider: ${provider}`);

    const kwil = new WebKwil({
        kwilProvider: provider,
        chainId: process.env.KWIL_CHAIN_ID || "kwil-chain-1"
    });

    const wallet = new Wallet(privateKey);
    const signer = new KwilSigner(wallet, wallet.address);

    try {
        console.log("📦 Enviando Database Schema...");

        const tx = await kwil.deploy({
            schema: NEO_SCHEMA as any,
            description: "NΞØ Agent State Layer"
        }, signer);

        console.log("✅ Database Deploy bem sucedido!");
        console.log(`🔗 Transaction Hash: ${tx.data?.tx_hash}`);

        const dbId = KwilUtils.generateDbId(wallet.address, "neo_agent_db");
        console.log(`\n🔑 ATENÇÃO: Atualize seu .env com:`);
        console.log(`KWIL_DB_ID=${dbId}`);

    } catch (error: any) {
        console.error("❌ Erro no Deploy:", error.message || error);

        if (error.message?.includes("already exists")) {
            const dbId = KwilUtils.generateDbId(wallet.address, "neo_agent_db");
            console.log("💡 O banco já existe.");
            console.log(`KWIL_DB_ID=${dbId}`);
        }
    }
}

deployKwil();
