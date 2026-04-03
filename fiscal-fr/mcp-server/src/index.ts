import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { container, TYPES } from "./inversify.js";
import { QualifyTaxProfileUseCase } from "./usecases/domains/qualify-tool/qualify-tax-profile.usecase.js";

const SERVER_INFO = {
  name: "fiscal-fr-mcp",
  version: "0.1.0",
} as const;

function createMcpServer() {
  const server = new Server(
    SERVER_INFO,
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const qualifyTaxProfileUseCase = container.get<QualifyTaxProfileUseCase>(
    TYPES.QualifyTaxProfileUseCase
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "qualify_tax_profile",
          description:
            "Qualifie une situation fiscale francaise et retourne recommandations structurees (cases, justificatifs, sources).",
          inputSchema: qualifyTaxProfileUseCase.getToolSchema(),
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "qualify_tax_profile") {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const parsed = qualifyTaxProfileUseCase.validateInput(request.params.arguments);

    if (!parsed.success) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "INVALID_INPUT",
                details: parsed.error.flatten(),
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    const result = qualifyTaxProfileUseCase.execute(parsed.data);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  });

  return server;
}

async function startStdioServer() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function startHttpServer() {
  const app = createMcpExpressApp();
  const port = Number.parseInt(process.env.MCP_PORT ?? "3333", 10);

  app.post("/mcp", async (req: any, res: any) => {
    const server = createMcpServer();

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);

      res.on("close", () => {
        transport.close();
        server.close();
      });
    } catch (error) {
      console.error("Error handling MCP HTTP request:", error);

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", (_req: any, res: any) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });

  app.delete("/mcp", (_req: any, res: any) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });

  app.listen(port, (error?: Error) => {
    if (error) {
      console.error("Failed to start MCP HTTP server:", error);
      process.exit(1);
    }

    console.log(`fiscal-fr-mcp listening on http://localhost:${port}/mcp`);
  });
}

const transportMode = (process.env.MCP_TRANSPORT ?? "stdio").toLowerCase();

if (transportMode === "http") {
  await startHttpServer();
} else {
  await startStdioServer();
}
