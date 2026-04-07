// start-mcp.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const p1 = path.join(cwd, "mcp-server");
const p2 = path.join(cwd, "fiscal-fr", "mcp-server");

const dir = fs.existsSync(path.join(p1, "package.json")) ? p1 : p2;

// npm → npm.cmd sur Windows
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const profile = process.env.MCP_PROFILE || "default";

const profileEnv = {
  default: {
    MCP_LOG_LEVEL: "info",
  },
  debug: {
    MCP_LOG_LEVEL: "debug",
  },
  quiet: {
    MCP_LOG_LEVEL: "warn",
    MCP_LOG_STDERR: "false",
  },
};

const child = spawn(npm, ["run", "dev"], {
  cwd: dir,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    ...(profileEnv[profile] || profileEnv.default),
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
