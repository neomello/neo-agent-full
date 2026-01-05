import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { TwitterApi } from "twitter-api-v2";

export const twitterTool = new DynamicStructuredTool({
    name: "post_social_update",
    description: "Posts a status update, signal, or announcement to X (formerly Twitter).",
    schema: z.object({
        text: z.string().describe("The content of the tweet (max 280 chars)"),
    }),
    func: async ({ text }) => {
        // Check for keys
        const appKey = process.env.X_API_KEY;
        const appSecret = process.env.X_API_SECRET;
        const accessToken = process.env.X_ACCESS_TOKEN;
        const accessSecret = process.env.X_ACCESS_SECRET;

        if (!appKey || !appSecret || !accessToken || !accessSecret) {
            // Fallback for simulation if keys missing
            console.warn("[Twitter Tool] Missing API Keys. Simulating post.");
            return JSON.stringify({ status: "simulated", id: "sim_tweet_123", text });
        }

        try {
            const client = new TwitterApi({
                appKey,
                appSecret,
                accessToken,
                accessSecret,
            });

            const rwClient = client.readWrite;
            const result = await rwClient.v2.tweet(text);

            return JSON.stringify({
                status: "success",
                id: result.data.id,
                text: result.data.text
            });

        } catch (error: any) {
            console.error("[Twitter Tool] Error:", error);
            return `Error posting to Twitter: ${error.message}`;
        }
    },
});
