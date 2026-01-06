import express from 'express';
import cors from 'cors';
import { router } from '../mcp/router';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Webhook Endpoint for Make/n8n
app.post('/webhook', async (req, res) => {
    try {
        const { intent, context } = req.body;

        if (!intent) {
            res.status(400).json({ error: "Missing 'intent' field" });
            return;
        }

        console.log(`[Webhook] Received Intent: ${intent}`);

        // Route the event through MCP Router
        // We map the HTTP request to the 'process_intent' method expected by the router
        const response = await router({
            method: "process_intent",
            params: {
                intent,
                context: context || {}
            }
        });

        res.json(response);

    } catch (error: any) {
        console.error("[Webhook] Error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Start Server
export function startServer() {
    app.listen(PORT, () => {
        console.log(`[NΞØ Adapter] Webhook Listener running on port ${PORT}`);
    });
}
