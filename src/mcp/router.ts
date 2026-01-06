import { LangChainAgentExecutor } from "../executors/langchain-agent-executor";
import { StateWriterExecutor } from "../executors/state-writer-executor";
import { z } from "zod";

// Initialize singletons
const agent = new LangChainAgentExecutor();
const stateWriter = new StateWriterExecutor();

// Define validation schemas
const BaseRequestSchema = z.object({
    method: z.string(),
    params: z.any().optional(),
});

const ProcessIntentParamsSchema = z.object({
    intent: z.string(),
    context: z.record(z.any()).optional().default({}),
});

export const router = async (request: any) => {
    // Validate general request structure
    const baseValidation = BaseRequestSchema.safeParse(request);

    if (!baseValidation.success) {
        return {
            status: "error",
            message: "Invalid request structure. Expected { method: string, params?: any }",
            errors: baseValidation.error.format()
        };
    }

    const { method, params } = baseValidation.data;
    console.log(`[MCP Router] Route: ${method}`);

    try {
        switch (method) {
            case "process_intent": {
                // Validate specific params for process_intent
                const paramsValidation = ProcessIntentParamsSchema.safeParse(params);

                if (!paramsValidation.success) {
                    return {
                        status: "error",
                        message: "Invalid params for process_intent",
                        errors: paramsValidation.error.format()
                    };
                }

                const { intent, context } = paramsValidation.data;

                // 1. Brain: Process Intent
                const agentResult = await agent.execute(intent, context);

                // 2. State Layer: If action implies writing, trigger StateWriter
                let receipt = null;
                if (agentResult.action === "write") {
                    // Determine targets based on context or payload
                    // Defaulting to basic availability for now
                    const targets = context.targets || ["kwil", "ceramic"];

                    receipt = await stateWriter.write({
                        intent,
                        payload: agentResult.payload,
                        result: agentResult, // Pass full thought process as result/metadata
                        targets,
                        context,
                        actor: context.actor || "user"
                    });
                }

                return {
                    status: "success",
                    agent_response: agentResult,
                    state_receipt: receipt
                };
            }

            case "get_state": {
                // Placeholder for read operations
                return { status: "not_implemented_yet" };
            }

            default:
                throw new Error(`Method ${method} not supported`);
        }
    } catch (error: any) {
        console.error("[MCP Router] Error:", error);
        return {
            status: "error",
            message: error.message
        };
    }
};
