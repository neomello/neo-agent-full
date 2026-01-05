import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

export const hunterTool = new DynamicStructuredTool({
    name: "verify_lead_email",
    description: "Verifies the validity of a professional email using Hunter.io to ensure high deliverability.",
    schema: z.object({
        email: z.string().describe("The professional email address to verify"),
    }),
    func: async ({ email }) => {
        if (!process.env.HUNTER_API_KEY) {
            return "Error: HUNTER_API_KEY is not set.";
        }

        try {
            const response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`);
            const data = response.data;

            return JSON.stringify({
                status: "success",
                email: email,
                result: data.data.status,
                score: data.data.score,
                sources: data.data.sources.length
            });
        } catch (error: any) {
            console.error("[Hunter Tool] Error:", error.message);
            return `Error verifying email: ${error.message}`;
        }
    },
});
