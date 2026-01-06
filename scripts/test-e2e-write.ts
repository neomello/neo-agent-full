import { StateWriterExecutor } from '../src/executors/state-writer-executor';
import { getKwil } from '../src/state/kwil';
import * as dotenv from 'dotenv';

dotenv.config();

async function runTest() {
    console.log("🧪 Starting E2E Write Test...");

    // 1. Setup Data
    const traceId = `test-trace-${Date.now()}`;
    const testLead = {
        email: `alice.${Date.now()}@example.com`,
        name: "Alice Tester",
        company: "Neo Corp",
        score: 85,
        status: "qualified"
    };

    const { kwil, wallet } = getKwil();
    console.log(`📡 Connecting to Kwil for owner: ${wallet.address}`);

    // 2. Initialize Executor
    const writer = new StateWriterExecutor();

    // 3. Execute Write
    console.log(`📝 Writing Lead: ${testLead.email}`);

    try {
        const receipt = await writer.write({
            intent: "qualify_lead",
            payload: { raw_input: "Qualify Alice from Neo Corp" },
            result: testLead,
            targets: ["kwil"],
            context: { trace_id: traceId },
            actor: "tester"
        });

        console.log("✅ Write Receipt:", receipt);

        if (!receipt.kwil_id) {
            console.error("❌ Failed: No Kwil Transaction ID returned.");
            process.exit(1);
        }

        // 4. Verify Read
        console.log("🔍 Verifying Data in Kwil...");
        const { kwil } = getKwil();
        const dbId = process.env.KWIL_DB_ID;

        if (!dbId) throw new Error("KWIL_DB_ID missing");

        // Wait a bit for block finality (local node might take a few seconds)
        await new Promise(r => setTimeout(r, 5000));

        const query = `SELECT * FROM leads WHERE email = '${testLead.email}'`;
        const res = await kwil.selectQuery(dbId, query);

        if (res.data && res.data.length > 0) {
            console.log("🎉 SUCCESS! Found record in DB:");
            console.log(res.data[0]);
            console.log("\n✅ E2E TEST PASSED: Lead -> StateWriter -> Kwil DB -> Verification");
        } else {
            console.error("❌ Failed: Record not found in DB after write.");
            console.log("Query Response:", res);
        }

    } catch (err: any) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
}

runTest();
