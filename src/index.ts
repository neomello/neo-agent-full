import 'dotenv/config';
import { startServer } from './adapters/webhook-express';

console.log("NΞØ Agent - System Initializing...");

// Start the Webhook Adapter (Make/n8n/Zapier)
startServer();

console.log("NΞØ Agent - Core Services Started.");
