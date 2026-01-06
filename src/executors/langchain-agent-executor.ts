import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { hunterTool } from "./tools/hunter-tool";
import { twitterTool } from "./tools/twitter-tool";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AgentResult, AgentOneShotContext } from "../types/domain";
import { StructuredTool } from "@langchain/core/tools";

export class LangChainAgentExecutor {
    private agent: any | undefined;
    private tools: StructuredTool[];

    constructor() {
        this.tools = [hunterTool, twitterTool];
        console.log("System: LangChain Executor v3 (LangGraph) initialized");
        this.initAgent();
    }

    private async initAgent() {
        try {
            const model = new ChatGoogleGenerativeAI({
                model: process.env.LLM_MODEL || "gemini-flash-latest",
                maxOutputTokens: 2048,
                apiKey: process.env.GOOGLE_API_KEY,
            });

            this.agent = createReactAgent({
                llm: model,
                tools: this.tools,
            });
            console.log("System: Agent Graph ready.");
        } catch (e) {
            console.error("Agent Init Error:", e);
        }
    }

    async execute(intent: string, context: AgentOneShotContext = {}): Promise<AgentResult> {
        if (!this.agent) await this.initAgent();

        const systemInstruction = "You are NΞØ, an advanced autonomous agent. Use tools only if strictly necessary. If you have enough info, answer directly.";
        const fullContent = `${systemInstruction}\n\nIntent: ${intent}\nContext: ${JSON.stringify(context)}`;

        console.log(`[NΞØ AI] Starting Invocation for: ${intent}`);

        try {
            const result = await this.agent.invoke({
                messages: [new HumanMessage(fullContent)],
            });

            console.log("[NΞØ AI] Finished Invocation.");
            const lastMessage = result.messages[result.messages.length - 1];

            return {
                action: "response",
                payload: {},
                response_text: lastMessage.content
            };
        } catch (e) {
            const err = e as Error;
            console.error("[NΞØ AI] Execution Error:", err.message);
            return { action: "error", payload: {}, response_text: err.message };
        }
    }

    async handle(intent: string, payload: unknown, context: AgentOneShotContext) {
        return this.execute(intent, { ...context, payload });
    }
}
