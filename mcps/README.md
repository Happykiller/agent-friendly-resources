# MCPs

Model Context Protocol servers I use and recommend. Each entry includes a ready-to-paste config block for Claude Code's `settings.json`.

---

## Docker MCP

Run AI tools inside Docker containers via MCP. Useful for sandboxed execution of agent-driven workflows without polluting your local environment.

**Source:** https://github.com/docker/labs-ai-tools-for-devs

**Prerequisites:**
- Docker Desktop running

**Install (recommended):** Use the integrated MCP Toolkit built into Docker Desktop — enable it in Docker Desktop settings under "Beta Features".

### Legacy config (Docker Engine without Desktop)

```json
{
  "mcpServers": {
    "docker-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-v", "/var/run/docker.sock:/var/run/docker.sock",
        "vonwig/prompts:latest",
        "serve", "--mcp"
      ]
    }
  }
}
```

---

## MongoDB MCP

Interact with MongoDB databases and MongoDB Atlas clusters directly from your agent. Supports queries, collection inspection, and Atlas management.

**Source:** https://github.com/mongodb-js/mongodb-mcp-server

**Prerequisites:**
- Node.js 20.19.0+
- A MongoDB connection string **or** MongoDB Atlas Service Account credentials

**Config (`~/.claude/settings.json`) — local MongoDB:**

```json
{
  "mcpServers": {
    "MongoDB": {
      "command": "npx",
      "args": ["-y", "mongodb-mcp-server@latest", "--readOnly"],
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017/myDatabase"
      }
    }
  }
}
```

> Remove `--readOnly` to enable write operations.

**Config (`~/.claude/settings.json`) — MongoDB Atlas:**

```json
{
  "mcpServers": {
    "MongoDB": {
      "command": "npx",
      "args": ["-y", "mongodb-mcp-server@latest"],
      "env": {
        "MDB_MCP_API_CLIENT_ID": "your-service-account-id",
        "MDB_MCP_API_CLIENT_SECRET": "your-service-account-secret"
      }
    }
  }
}
```
