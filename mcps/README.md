# MCPs

Model Context Protocol servers I use and recommend. Each entry includes a ready-to-paste config block for Claude Code's `settings.json`.

---

## Docker MCP

Run AI tools inside Docker containers via MCP. Useful for sandboxed execution of agent-driven workflows without polluting your local environment.

**Source:** https://github.com/docker/labs-ai-tools-for-devs
> Note: Docker Desktop also ships an integrated MCP Toolkit — check Docker Desktop settings under "Beta Features".

**Prerequisites:**
- Docker Desktop running

**Config (`~/.claude/settings.json`):**

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

> Remove `--readOnly` to enable write operations. For Atlas, replace `MDB_MCP_CONNECTION_STRING` with `MDB_MCP_API_CLIENT_ID` and `MDB_MCP_API_CLIENT_SECRET`.
