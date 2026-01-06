import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export interface MCPConfig {
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
}

export async function loadMCPTools(): Promise<DynamicStructuredTool[]> {
    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
    const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");

    const servers: MCPConfig[] = [
        {
            name: "brave-search",
            command: "docker",
            args: ["run", "-i", "--rm", "-e", `BRAVE_API_KEY=${process.env.BRAVE_API_KEY}`, "mcp/brave-search"]
        },
        {
            name: "fetch",
            command: "docker",
            args: ["run", "-i", "--rm", "mcp/fetch"]
        },
        {
            name: "github",
            command: "docker",
            args: ["run", "-i", "--rm", "-e", `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_TOKEN}`, "mcp/github"]
        }
    ];

    const allTools: DynamicStructuredTool[] = [];

    for (const server of servers) {
        if (server.name === "brave-search" && !process.env.BRAVE_API_KEY) continue;
        if (server.name === "github" && !process.env.GITHUB_TOKEN) continue;

        try {
            console.log(`[MCP] Connecting to ${server.name}...`);

            const cleanEnv: Record<string, string> = {};
            for (const key in process.env) {
                const value = process.env[key];
                if (value !== undefined) cleanEnv[key] = value;
            }

            const transport = new StdioClientTransport({
                command: server.command,
                args: server.args,
                env: { ...cleanEnv, ...server.env }
            });

            const client = new Client({
                name: "neo-agent-client",
                version: "1.0.0"
            }, {
                capabilities: {}
            });

            await client.connect(transport);
            const { tools } = await client.listTools();

            for (const tool of tools) {
                allTools.push(new DynamicStructuredTool({
                    name: `mcp_${server.name}_${tool.name}`.replace(/-/g, '_'),
                    description: `${tool.description} (Source: MCP ${server.name})`,
                    schema: z.any(), // Flexible schema for MCP tools
                    func: async (args: any) => {
                        try {
                            const result = await client.callTool({
                                name: tool.name,
                                arguments: args
                            });
                            return JSON.stringify(result.content);
                        } catch (err: any) {
                            return `Error calling MCP tool: ${err.message}`;
                        }
                    }
                }));
            }
            console.log(`[MCP] Loaded ${tools.length} tools from ${server.name}`);
        } catch (error: any) {
            console.error(`[MCP] Error connecting to ${server.name}:`, error.message);
        }
    }

    return allTools;
}
