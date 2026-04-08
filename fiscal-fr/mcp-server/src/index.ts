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
import { CompareTaxOptionsUseCase } from "./usecases/domains/qualify-tool/compare-tax-options.usecase.js";
import express from "express";
import { createLoggerFromEnv } from "./logger.js";
import { authMiddleware } from "./auth/auth.middleware.js";
import { createOAuthRouter } from "./auth/oauth.router.js";

const SERVER_INFO = {
  name: "fiscal-fr-mcp",
  version: "0.1.0",
} as const;

const logger = createLoggerFromEnv();

type RequestContext = {
  requesterAccount: string;
  transport: "http" | "stdio";
};

function extractDebugMetaFromRequest(request: unknown): Record<string, unknown> {
  if (!request || typeof request !== "object") {
    return {};
  }

  const requestRecord = request as Record<string, unknown>;
  const params = requestRecord.params;
  if (!params || typeof params !== "object") {
    return {};
  }

  const paramsRecord = params as Record<string, unknown>;
  const meta = paramsRecord._meta;

  if (!meta || typeof meta !== "object") {
    return {};
  }

  return { requestMeta: meta };
}

function createMcpServer(context: RequestContext) {
  const withRequestMeta = (meta?: Record<string, unknown>) => ({
    requesterAccount: context.requesterAccount,
    transport: context.transport,
    ...meta,
  });

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
  const compareTaxOptionsUseCase = container.get<CompareTaxOptionsUseCase>(
    TYPES.CompareTaxOptionsUseCase
  );

  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    logger.info("MCP list tools request received", withRequestMeta());
    logger.debug(
      "MCP list tools request meta",
      withRequestMeta(extractDebugMetaFromRequest(request))
    );
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
          name: "compare_tax_options",
          description:
            "Compare des options fiscales (PFU vs bareme, frais reels vs 10%, micro-foncier vs reel, rattachement enfant majeur vs pension) et retourne une recommandation conditionnelle avec hypotheses et donnees manquantes.",
          inputSchema: compareTaxOptionsUseCase.getToolSchema(),
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
    logger.info("MCP tool call request received", {
      ...withRequestMeta(),
      tool: request.params.name,
    });
    logger.debug(
      "MCP tool call request meta",
      withRequestMeta({
        tool: request.params.name,
        ...extractDebugMetaFromRequest(request),
      })
    );

    if (request.params.name === "qualify_tax_profile") {
      logger.debug("Validating tool input", withRequestMeta({ tool: "qualify_tax_profile" }));
      const parsed = qualifyTaxProfileUseCase.validateInput(request.params.arguments);

      if (!parsed.success) {
        logger.debug(
          "Tool input validation failed",
          withRequestMeta({ tool: "qualify_tax_profile" })
        );
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

      const startedAt = Date.now();
      logger.debug("Executing tool", withRequestMeta({ tool: "qualify_tax_profile" }));
      const result = qualifyTaxProfileUseCase.execute(parsed.data);
      logger.debug("Tool execution completed", {
        ...withRequestMeta(),
        tool: "qualify_tax_profile",
        durationMs: Date.now() - startedAt,
      });

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
      logger.debug(
        "Validating tool input",
        withRequestMeta({ tool: "list_supporting_documents" })
      );
      const parsed = listSupportingDocumentsUseCase.validateInput(request.params.arguments);

      if (!parsed.success) {
        logger.debug(
          "Tool input validation failed",
          withRequestMeta({ tool: "list_supporting_documents" })
        );
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

      const startedAt = Date.now();
      logger.debug("Executing tool", withRequestMeta({ tool: "list_supporting_documents" }));
      const result = listSupportingDocumentsUseCase.execute(parsed.data);
      logger.debug("Tool execution completed", {
        ...withRequestMeta(),
        tool: "list_supporting_documents",
        durationMs: Date.now() - startedAt,
      });

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
      logger.debug("Validating tool input", withRequestMeta({ tool: "detect_review_points" }));
      const parsed = detectReviewPointsUseCase.validateInput(request.params.arguments);

      if (!parsed.success) {
        logger.debug(
          "Tool input validation failed",
          withRequestMeta({ tool: "detect_review_points" })
        );
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

      const startedAt = Date.now();
      logger.debug("Executing tool", withRequestMeta({ tool: "detect_review_points" }));
      const result = detectReviewPointsUseCase.execute(parsed.data);
      logger.debug("Tool execution completed", {
        ...withRequestMeta(),
        tool: "detect_review_points",
        durationMs: Date.now() - startedAt,
      });

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
      logger.debug("Validating tool input", withRequestMeta({ tool: "build_pre_declaration" }));
      const parsed = buildPreDeclarationUseCase.validateInput(request.params.arguments);

      if (!parsed.success) {
        logger.debug(
          "Tool input validation failed",
          withRequestMeta({ tool: "build_pre_declaration" })
        );
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

      const startedAt = Date.now();
      logger.debug("Executing tool", withRequestMeta({ tool: "build_pre_declaration" }));
      const result = buildPreDeclarationUseCase.execute(parsed.data);
      logger.debug("Tool execution completed", {
        ...withRequestMeta(),
        tool: "build_pre_declaration",
        durationMs: Date.now() - startedAt,
      });

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
      logger.debug("Validating tool input", withRequestMeta({ tool: "estimate_impact" }));
      const parsed = estimateImpactUseCase.validateInput(request.params.arguments);

      if (!parsed.success) {
        logger.debug(
          "Tool input validation failed",
          withRequestMeta({ tool: "estimate_impact" })
        );
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

      const startedAt = Date.now();
      logger.debug("Executing tool", withRequestMeta({ tool: "estimate_impact" }));
      const result = estimateImpactUseCase.execute(parsed.data);
      logger.debug("Tool execution completed", {
        ...withRequestMeta(),
        tool: "estimate_impact",
        durationMs: Date.now() - startedAt,
      });

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
      logger.debug("Validating tool input", withRequestMeta({ tool: "guide_filing_step" }));
      const parsed = guideFilingStepUseCase.validateInput(request.params.arguments);

      if (!parsed.success) {
        logger.debug(
          "Tool input validation failed",
          withRequestMeta({ tool: "guide_filing_step" })
        );
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
        const startedAt = Date.now();
        logger.debug("Executing tool", withRequestMeta({ tool: "guide_filing_step" }));
        const result = guideFilingStepUseCase.execute(parsed.data);
        logger.debug("Tool execution completed", {
          ...withRequestMeta(),
          tool: "guide_filing_step",
          durationMs: Date.now() - startedAt,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.warn("Tool execution failed", {
          ...withRequestMeta(),
          tool: "guide_filing_step",
          error: err instanceof Error ? err.message : String(err),
        });
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

    if (request.params.name === "compare_tax_options") {
      logger.debug("Validating tool input", withRequestMeta({ tool: "compare_tax_options" }));
      const parsed = compareTaxOptionsUseCase.validateInput(request.params.arguments);

      if (!parsed.success) {
        logger.debug(
          "Tool input validation failed",
          withRequestMeta({ tool: "compare_tax_options" })
        );
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

      const startedAt = Date.now();
      logger.debug("Executing tool", withRequestMeta({ tool: "compare_tax_options" }));
      const result = compareTaxOptionsUseCase.execute(parsed.data);
      logger.debug("Tool execution completed", {
        ...withRequestMeta(),
        tool: "compare_tax_options",
        durationMs: Date.now() - startedAt,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    logger.warn("Unknown MCP tool requested", {
      ...withRequestMeta(),
      tool: request.params.name,
    });
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
  const requesterAccount = process.env.MCP_STDIO_ACCOUNT?.trim() || "stdio";
  const server = createMcpServer({ requesterAccount, transport: "stdio" });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("STDIO MCP server ready", { requesterAccount, transport: "stdio" });
}

async function startHttpServer() {
  const allowedHosts = process.env.MCP_ALLOWED_HOSTS
    ? process.env.MCP_ALLOWED_HOSTS.split(",").map((h) => h.trim()).filter(Boolean)
    : undefined;
  const app = createMcpExpressApp(allowedHosts ? { host: "0.0.0.0", allowedHosts } : {});
  const port = Number.parseInt(process.env.MCP_PORT ?? "3333", 10);

  // Body parsers (needed for OAuth form POST and token endpoint)
  app.use(express.urlencoded({ extended: false }));

  // OAuth endpoints (no auth required)
  app.use(createOAuthRouter());

  app.post("/mcp", authMiddleware, async (req: any, res: any) => {
    const requesterAccount = (res.locals.requesterAccount as string) ?? "unknown";
    logger.info("HTTP MCP request received", {
      method: req.method,
      path: req.path,
      requesterAccount,
      transport: "http",
    });
    logger.debug("HTTP MCP request headers", {
      headers: req.headers,
      requesterAccount,
      transport: "http",
    });
    const server = createMcpServer({ requesterAccount, transport: "http" });

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
      logger.error("Error handling MCP HTTP request", {
        error: error instanceof Error ? error.message : String(error),
        requesterAccount,
        transport: "http",
      });

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

  app.get("/mcp", authMiddleware, async (req: any, res: any) => {
    const requesterAccount = (res.locals.requesterAccount as string) ?? "unknown";
    logger.info("HTTP MCP GET request received", { requesterAccount, transport: "http" });
    const server = createMcpServer({ requesterAccount, transport: "http" });
    try {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        transport.close();
        server.close();
      });
    } catch {
      if (!res.headersSent) {
        res.status(405).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "SSE not supported in stateless mode." },
          id: null,
        });
      }
    }
  });

  app.delete("/mcp", authMiddleware, (_req: any, res: any) => {
    res.status(200).json({ message: "Session closed." });
  });

  app.listen(port, (error?: Error) => {
    if (error) {
      logger.error("Failed to start MCP HTTP server", {
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }

    logger.info("HTTP MCP server started", {
      endpoint: `http://localhost:${port}/mcp`,
    });
  });
}

const transportMode = (process.env.MCP_TRANSPORT ?? "stdio").toLowerCase();

if (transportMode === "http") {
  logger.info("Starting MCP server", { transport: "http" });
  await startHttpServer();
} else {
  logger.info("Starting MCP server", { transport: "stdio" });
  await startStdioServer();
}
