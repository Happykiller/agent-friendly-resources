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
import { ListSupportingDocumentsUseCase } from "./usecases/domains/qualify-tool/list-supporting-documents.usecase.js";
import { DetectReviewPointsUseCase } from "./usecases/domains/qualify-tool/detect-review-points.usecase.js";
import { BuildPreDeclarationUseCase } from "./usecases/domains/qualify-tool/build-pre-declaration.usecase.js";
import { EstimateImpactUseCase } from "./usecases/domains/qualify-tool/estimate-impact.usecase.js";
import { GuideFilingStepUseCase } from "./usecases/domains/qualify-tool/guide-filing-step.usecase.js";

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
  const listSupportingDocumentsUseCase = container.get<ListSupportingDocumentsUseCase>(
    TYPES.ListSupportingDocumentsUseCase
  );
  const detectReviewPointsUseCase = container.get<DetectReviewPointsUseCase>(
    TYPES.DetectReviewPointsUseCase
  );
  const buildPreDeclarationUseCase = container.get<BuildPreDeclarationUseCase>(
    TYPES.BuildPreDeclarationUseCase
  );
  const estimateImpactUseCase = container.get<EstimateImpactUseCase>(
    TYPES.EstimateImpactUseCase
  );
  const guideFilingStepUseCase = container.get<GuideFilingStepUseCase>(
    TYPES.GuideFilingStepUseCase
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
        {
          name: "list_supporting_documents",
          description:
            "Genere la checklist de justificatifs obligatoires/recommandes/manquants a partir d'un profil qualifie.",
          inputSchema: listSupportingDocumentsUseCase.getToolSchema(),
        },
        {
          name: "detect_review_points",
          description:
            "Detecte les points de vigilance et incoherences dans un profil fiscal qualifie (regimes non tranches, justificatifs manquants, cas hors perimetre).",
          inputSchema: detectReviewPointsUseCase.getToolSchema(),
        },
        {
          name: "build_pre_declaration",
          description:
            "Construit un brouillon de pre-declaration structure a partir du profil qualifie et des montants declares. Chaque rubrique est tracee vers sa source, son code case et son statut (confirme ou a renseigner).",
          inputSchema: buildPreDeclarationUseCase.getToolSchema(),
        },
        {
          name: "estimate_impact",
          description:
            "Calcule une estimation indicative de l'impot sur le revenu (IR 2026, revenus 2025) a partir du profil qualifie et des montants declares. Applique le bareme progressif, le quotient familial, la decote, les reductions et credits d'impot. Resultat sans valeur juridique — toujours accompagne d'un disclaimer.",
          inputSchema: estimateImpactUseCase.getToolSchema(),
        },
        {
          name: "guide_filing_step",
          description:
            "Fournit le guide de saisie etape par etape pour la declaration en ligne sur impots.gouv.fr. Pour une etape donnee, retourne : ce qu'il faut verifier maintenant, les oublis frequents, et les pieges a eviter. Contexte optionnel pour personnaliser les points de vigilance selon le profil.",
          inputSchema: guideFilingStepUseCase.getToolSchema(),
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "qualify_tax_profile") {
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
    }

    if (request.params.name === "list_supporting_documents") {
      const parsed = listSupportingDocumentsUseCase.validateInput(request.params.arguments);

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

      const result = listSupportingDocumentsUseCase.execute(parsed.data);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (request.params.name === "detect_review_points") {
      const parsed = detectReviewPointsUseCase.validateInput(request.params.arguments);

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

      const result = detectReviewPointsUseCase.execute(parsed.data);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (request.params.name === "build_pre_declaration") {
      const parsed = buildPreDeclarationUseCase.validateInput(request.params.arguments);

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

      const result = buildPreDeclarationUseCase.execute(parsed.data);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (request.params.name === "estimate_impact") {
      const parsed = estimateImpactUseCase.validateInput(request.params.arguments);

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

      const result = estimateImpactUseCase.execute(parsed.data);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (request.params.name === "guide_filing_step") {
      const parsed = guideFilingStepUseCase.validateInput(request.params.arguments);

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

      try {
        const result = guideFilingStepUseCase.execute(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: "UNKNOWN_STEP",
                  message: err instanceof Error ? err.message : String(err),
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: "UNKNOWN_TOOL", tool: request.params.name }, null, 2),
        },
      ],
      isError: true,
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
