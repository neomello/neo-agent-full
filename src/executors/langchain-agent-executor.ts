import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { hunterTool } from "./tools/hunter-tool";
import { twitterTool } from "./tools/twitter-tool";
import { StateReaderExecutor } from "../state/reader";
import { loadMCPTools } from "../mcp/mcp-tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AgentResult, AgentOneShotContext, DynamicData } from "../types/domain";
import { StructuredTool, DynamicStructuredTool } from "@langchain/core/tools";

export class LangChainAgentExecutor {
    private agent: DynamicData | undefined;
    private tools: (StructuredTool | DynamicStructuredTool)[] = [];

    constructor() {
        const stateReader = new StateReaderExecutor();
        this.tools = [hunterTool, twitterTool, stateReader.getLeadTool()];
        console.log("System: LangChain Executor v3 (LangGraph) initialized");
        this.initAgent();
    }

    private async initAgent() {
        try {
            // Load MCP Tools
            const mcpTools = await loadMCPTools();
            this.tools = [...this.tools, ...mcpTools];

            const model = new ChatGoogleGenerativeAI({
                model: process.env.LLM_MODEL || "gemini-flash-lite-latest",
                maxOutputTokens: 2048,
                apiKey: process.env.GOOGLE_API_KEY,
            });

            this.agent = createReactAgent({
                llm: model,
                tools: this.tools,
            });
            console.log("System: Agent Graph ready with MCP support.");
        } catch (e) {
            console.error("Agent Init Error:", e);
        }
    }

    async execute(intent: string, context: AgentOneShotContext = {}): Promise<AgentResult> {
        if (!this.agent) await this.initAgent();

        const systemInstruction = `You are NΞØ, an advanced autonomous agent.
        IMPORTANT: Your final response MUST be a valid JSON object with the following structure:
        {
          "action": "response" | "write" | "error",
          "payload": {}, // Data to be persisted if action is "write"
          "response_text": "Human readable summary"
        }
        
        GUIDELINES:
        - If you need information, use your tools.
        - DO NOT call the same tool with the same arguments multiple times if it returns no result.
        - If a lead is not found, proceed to search for it using web search tools.
        - If you have qualified a lead or performed a task that requires persistence, set action to "write" and put the relevant details in the payload.`;

        const fullContent = `${systemInstruction}\n\nIntent: ${intent}\nContext: ${JSON.stringify(context)}`;

        console.log(`[NΞØ AI] Starting Invocation for: ${intent}`);

        try {
            const result = await this.agent.invoke({
                messages: [new HumanMessage(fullContent)],
            }, { recursionLimit: 40 });

            console.log("[NΞØ AI] Finished Invocation.");
            const messages = result.messages;
            const lastMessage = messages[messages.length - 1];

            // Handle content which can be string or array of parts
            let rawContent = "";
            if (typeof lastMessage.content === "string") {
                rawContent = lastMessage.content;
            } else if (Array.isArray(lastMessage.content)) {
                rawContent = lastMessage.content.map((c: DynamicData) => c.text || JSON.stringify(c)).join("\n");
            }

            if (!rawContent || rawContent.trim() === "") {
                console.warn("[NΞØ AI] Empty response from agent. Last message:", JSON.stringify(lastMessage, null, 2));
            }

            try {
                // Try to parse JSON from the response
                const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed && parsed.action) {
                        return {
                            action: parsed.action,
                            payload: parsed.payload || {},
                            response_text: parsed.response_text || rawContent
                        };
                    }
                }
            } catch (jsonErr) {
                console.warn("[NΞØ AI] Could not parse agent response as JSON, falling back to response mode.");
            }

            return {
                action: "response",
                payload: {},
                response_text: rawContent
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
