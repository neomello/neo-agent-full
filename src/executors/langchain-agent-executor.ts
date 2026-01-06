import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { hunterTool } from "./tools/hunter-tool";
import { twitterTool } from "./tools/twitter-tool";

export class LangChainAgentExecutor {
    private agent: any; // LangGraph CompiledGraph
    private tools: any[];

    constructor() {
        this.tools = [hunterTool, twitterTool];
        console.log("System: LangChain Executor v3 (LangGraph) initialized");
        this.initAgent();
    }

    private async initAgent() {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_API_KEY,
        });

        // Create the ReAct agent using LangGraph prebuilt
        // This handles tool calling loops internally and robustly
        this.agent = createAgent({
            model: model,
            tools: this.tools,
        });
    }

    async execute(intent: string, context: any = {}) {
        // Ensure initialization
        if (!this.agent) await this.initAgent();

        const systemInstruction = "You are NΞØ, an advanced autonomous agent. You have access to tools. Use them when needed. For final output, always provide a clear response.";
        const fullContent = `${systemInstruction}\n\nIntent: ${intent}\nContext: ${JSON.stringify(context)}`;

        console.log(`[NΞØ AI] Executing: ${intent}`);

        try {
            // Invoke the graph
            const result = await this.agent.invoke({
                messages: [new HumanMessage(fullContent)],
            });

            // Extract the last message content as the response
            const lastMessage = result.messages[result.messages.length - 1];

            return {
                action: "response",
                payload: {},
                response_text: lastMessage.content
            };
        } catch (e: any) {
            console.error("Agent Error:", e);
            return { action: "error", payload: {}, response_text: e.message };
        }
    }

    // Wrapper for compatibility
    async handle(intent: string, payload: any, context: any) {
        return this.execute(intent, { ...context, payload });
    }
}
