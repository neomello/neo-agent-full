import { Utils } from '@kwilteam/kwil-js';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

// Script para prever o ID do banco antes do deploy
async function main() {
    if (!process.env.KWIL_PRIVATE_KEY) {
        console.error("❌ ERRO: Defina KWIL_PRIVATE_KEY no .env primeiro!");
        process.exit(1);
    }

    const wallet = new Wallet(process.env.KWIL_PRIVATE_KEY);
    const dbName = "neo_agent_db"; // O mesmo nome que está no schema.ts

    console.log("------------------------------------------------");
    console.log("🧮 CALCULADORA DE ID KWIL (NΞØ)");
    console.log("------------------------------------------------");
    console.log(`🔑 Wallet:  ${wallet.address}`);
    console.log(`📂 DB Name: ${dbName}`);

    // A Mágica:
    const dbId = Utils.generateDBID(wallet.address, dbName);

    console.log("\n✅ ADICIONE ISTO AO SEU .ENV AGORA:");
    console.log(`KWIL_DB_ID=${dbId}`);
    console.log("------------------------------------------------");
}

main();
