import { createWriteStream, mkdirSync, type WriteStream } from "node:fs";
import { dirname, join, parse } from "node:path";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function toLogLevel(value: string | undefined): LogLevel {
  if (value === "debug" || value === "info" || value === "warn" || value === "error") {
    return value;
  }

  return "info";
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function stringifyMeta(meta: unknown): string {
  if (meta === undefined) {
    return "";
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return " [unserializable-meta]";
  }
}

export class Logger {
  private readonly minimumLevel: LogLevel;
  private stream?: WriteStream;
  private readonly baseFilePath?: string;
  private readonly rotateDaily: boolean;
  private readonly now: () => Date;
  private currentDateKey?: string;
  private readonly stderrEnabled: boolean;

  public constructor(options?: {
    level?: LogLevel;
    filePath?: string;
    stderrEnabled?: boolean;
    rotateDaily?: boolean;
    now?: () => Date;
  }) {
    this.minimumLevel = options?.level ?? "info";
    this.stderrEnabled = options?.stderrEnabled ?? true;
    this.rotateDaily = options?.rotateDaily ?? true;
    this.now = options?.now ?? (() => new Date());
    this.baseFilePath = options?.filePath;

    if (this.baseFilePath) {
      this.reopenStreamIfNeeded();
    }
  }

  public debug(message: string, meta?: unknown): void {
    this.log("debug", message, meta);
  }

  public info(message: string, meta?: unknown): void {
    this.log("info", message, meta);
  }

  public warn(message: string, meta?: unknown): void {
    this.log("warn", message, meta);
  }

  public error(message: string, meta?: unknown): void {
    this.log("error", message, meta);
  }

  public close(): Promise<void> {
    if (!this.stream) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.stream!.end(resolve);
    });
  }

  private log(level: LogLevel, message: string, meta?: unknown): void {
    if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[this.minimumLevel]) {
      return;
    }

    const now = this.now();
    this.reopenStreamIfNeeded(now);

    const line = `${now.toISOString()} ${level.toUpperCase()} ${message}${stringifyMeta(meta)}\n`;

    if (this.stream) {
      this.stream.write(line);
    }

    if (this.stderrEnabled) {
      process.stderr.write(line);
    }
  }

  private reopenStreamIfNeeded(now = this.now()): void {
    if (!this.baseFilePath) {
      return;
    }

    const nextDateKey = now.toISOString().slice(0, 10);
    const shouldReopen =
      !this.stream ||
      (this.rotateDaily && this.currentDateKey !== nextDateKey);

    if (!shouldReopen) {
      return;
    }

    if (this.stream) {
      this.stream.end();
    }

    const nextFilePath = this.resolveFilePath(this.baseFilePath, nextDateKey);
    mkdirSync(dirname(nextFilePath), { recursive: true });
    this.stream = createWriteStream(nextFilePath, { flags: "a", encoding: "utf8" });
    this.currentDateKey = nextDateKey;
  }

  private resolveFilePath(filePath: string, dateKey: string): string {
    if (!this.rotateDaily) {
      return filePath;
    }

    if (filePath.includes("{date}")) {
      return filePath.replaceAll("{date}", dateKey);
    }

    const pathParts = parse(filePath);
    const fileName = pathParts.ext
      ? `${pathParts.name}-${dateKey}${pathParts.ext}`
      : `${pathParts.name}-${dateKey}`;

    return join(pathParts.dir, fileName);
  }
}

export function createLoggerFromEnv(): Logger {
  const level = toLogLevel(process.env.MCP_LOG_LEVEL?.trim().toLowerCase());
  const filePath = process.env.MCP_LOG_FILE;
  const stderrEnabled = toBoolean(process.env.MCP_LOG_STDERR, true);
  const rotateDaily = toBoolean(process.env.MCP_LOG_ROTATE_DAILY, true);
  const defaultFilePath = "./logs/mcp-server.log";

  return new Logger({
    level,
    filePath: filePath && filePath.trim().length > 0 ? filePath : defaultFilePath,
    stderrEnabled,
    rotateDaily,
  });
}
