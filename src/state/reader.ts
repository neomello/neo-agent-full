import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { executeSelect } from "./kwil";
import { DynamicData } from "../types/domain";

/**
 * StateReaderExecutor
 * Permite que o Agente consulte o banco de dados Kwil (SQL) para recuperar memória.
 */
export class StateReaderExecutor {
    /**
     * Cria a ferramenta de busca de Lead para o LangChain
     */
    public getLeadTool(): DynamicStructuredTool {
        return new DynamicStructuredTool({
            name: "get_lead_data",
            description: "Use esta ferramenta para buscar informações de um Lead existente no banco de dados Kwil usando o email.",
            schema: z.object({
                email: z.string().email().describe("O email do lead para buscar"),
            }),
            func: async ({ email }) => {
                console.log(`[StateReader] Buscando lead: ${email}...`);
                try {
                    // Executa o SELECT direto no Kwil usando a função exportada
                    const query = `SELECT * FROM leads WHERE email = '${email}'`;
                    const result = await executeSelect(query);

                    if (!result || result.length === 0) {
                        return JSON.stringify({ found: false, message: "Lead não encontrado no banco." });
                    }

                    // Retorna o primeiro registro encontrado
                    const lead = (result as DynamicData[])[0];
                    return JSON.stringify({
                        found: true,
                        data: {
                            name: lead.name,
                            company: lead.company,
                            status: lead.lead_status,
                            score: lead.score,
                            source: lead.lead_source
                        }
                    });
                } catch (error) {
                    const err = error as Error;
                    return JSON.stringify({ found: false, error: err.message });
                }
            },
        });
    }
}
