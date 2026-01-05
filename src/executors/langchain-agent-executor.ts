import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { hunterTool } from "./tools/hunter-tool";
import { twitterTool } from "./tools/twitter-tool";

// Map exported tools to the names expected in the code if they differ, 
// or simply use the imported names directly in the array.
// The user request used 'verifyLeadEmailTool' and 'postSocialUpdateTool', 
// checking previous step: we exported 'hunterTool' and 'twitterTool'.
// We will alias them or use them directly.

export class LangChainAgentExecutor {
    private model: ChatGoogleGenerativeAI;
    private tools: any[];

    constructor() {
        // Configura o Gemini Pro via LangChain
        this.model = new ChatGoogleGenerativeAI({
            modelName: "gemini-pro",
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.7,
        });

        // Lista de ferramentas disponíveis para o agente
        this.tools = [hunterTool, twitterTool];
    }

    async handle(intent: string, payload: any, context: any, actor: any = {}) {
        console.log(`[NΞØ AI] Processing intent: ${intent}`);

        // Cria o Grafo do Agente (Padrão moderno LangGraph/LangChain)
        const agentApp = createReactAgent({
            llm: this.model,
            tools: this.tools,
        });

        // Constrói o prompt do sistema com a "persona" NΞØ
        const systemPrompt = `
      Você é o NΞØ:One, um agente autônomo Web3 sofisticado.
      Seu objetivo atual é: ${intent}.
      Contexto da sessão: ${JSON.stringify(context)}.
      Ator solicitante: ${actor.did || "unknown"}.
      
      Regras:
      1. Seja direto e técnico.
      2. Se precisar validar dados, use as ferramentas disponíveis.
      3. Retorne sempre um JSON final no formato { "success": true, "data": ... }.
    `;

        // Executa o agente
        // ReAct agent expects a list of messages.
        // We pass the payload as the Human message content to start the interaction.
        const messageContent = typeof payload === 'string' ? payload : JSON.stringify(payload || {});

        const result = await agentApp.invoke({
            messages: [
                new SystemMessage(systemPrompt),
                new HumanMessage(messageContent),
            ],
        });

        // O último 'content' da mensagem do AI é a resposta
        const lastMessage = result.messages[result.messages.length - 1];

        return {
            output: lastMessage.content,
            steps_taken: result.messages.length // Útil para debug
        };
    }

    // Backwards compatibility layer for the Router which calls 'execute'
    async execute(intent: string, context: any = {}) {
        // Mapping router calls to the new handle method
        const actor = context.actor || {};
        const payload = context.payload || {};
        const res = await this.handle(intent, payload, context, actor);

        // The router expects an object with action/analysis structure or just the raw result
        // We'll wrap the output to match previous expectations if needed, 
        // or return the raw output if the router handles it.
        // Based on previous step, router uses result.action. 
        // Since we changed to LangGraph which is more free-form, we'll assume the LLM output JSON as requested.

        let parsedOutput = {};
        try {
            if (typeof res.output === 'string') {
                // Extract JSON if embedded in markdown code blocks
                const cleanOutput = res.output.replace(/```json\n?|\n?```/g, "").trim();
                parsedOutput = JSON.parse(cleanOutput);
            } else {
                parsedOutput = res.output;
            }
        } catch (e) {
            parsedOutput = { response_text: res.output };
        }

        // Check if the output has 'action' field, otherwise default to response
        // The prompt asks for { "success": true, "data": ... }
        // This is slightly different from previous 'action/analysis' schema.
        // We will map it to keep router happy:

        return {
            analysis: "Graph Execution Complete",
            action: "response", // Defaulting to response as tool calls are handled internally by the Graph
            payload: parsedOutput,
            response_text: typeof res.output === 'string' ? res.output : JSON.stringify(res.output)
        };
    }
}
