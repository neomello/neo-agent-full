import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { hunterTool } from "./tools/hunter-tool";
import { twitterTool } from "./tools/twitter-tool";

export class LangChainAgentExecutor {
    private executor: AgentExecutor | null = null;
    private tools: any[];

    constructor() {
        this.tools = [hunterTool, twitterTool];
        console.log("System: LangChain Executor v2 initialized");
        this.initAgent();
    }

    private async initAgent() {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-pro", // Usando alias estável
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_API_KEY,

        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["placeholder", "{chat_history}"],
            ["human", "You are NΞØ, an advanced autonomous agent. You have access to tools. Use them when needed. For final output, always provide a clear response.\n\n{input}"],
            ["placeholder", "{agent_scratchpad}"],
        ]);

        const agent = createToolCallingAgent({
            llm: model,
            tools: this.tools,
            prompt,
        });

        this.executor = new AgentExecutor({
            agent,
            tools: this.tools,
            verbose: true,
        });
    }

    async execute(intent: string, context: any = {}) {
        // Garante inicialização
        if (!this.executor) await this.initAgent();

        const input = `Intent: ${intent}\nContext: ${JSON.stringify(context)}`;

        console.log(`[NΞØ AI] Executing: ${intent}`);

        try {
            const result = await this.executor!.invoke({ input });
            return {
                action: "response",
                payload: {}, // Satisfies Router interface
                response_text: result.output // AgentExecutor retorna { output: string }
            };
        } catch (e: any) {
            console.error("Agent Error:", e);
            return { action: "error", payload: {}, response_text: e.message };
        }
    }

    // Wrapper para compatibilidade com o Router antigo
    async handle(intent: string, payload: any, context: any) {
        return this.execute(intent, { ...context, payload });
    }
}
