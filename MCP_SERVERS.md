# MCP Server Setup & Configuration

## Current MCP Servers Status

### ✅ 9 Global MCP Servers Configured

All available in Claude Code via user scope:

1. **filesystem** - `/Users/danielconnolly/.nvm/versions/node/v20.19.4/lib/node_modules/@modelcontextprotocol/server-filesystem`
2. **github** - Requires `GITHUB_TOKEN` env var
3. **brave-search** - Requires `BRAVE_API_KEY` env var  
4. **git** - `/Users/danielconnolly/.nvm/versions/node/v20.19.4/lib/node_modules/mcp-git`
5. **puppeteer** - Browser automation
6. **desktop-commander** - Desktop automation
7. **devassist** - Global instance at `/Users/danielconnolly/Projects/Custom_MCP/DevAssist_MCP`
8. **openai-gpt5** - GPT-5 integration
9. **gemini** - Google Gemini integration

### Configuration Files

- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Code**: `~/.claude.json` (user scope in projects section)
- **Project MCP**: `.mcp.json` in each project root

### How to Verify

```bash
# Check Claude Code MCP servers
claude mcp list

# Should show all 9 servers as connected
```

### Environment Variables Required

Add to `~/.zshrc`:
```bash
export GITHUB_TOKEN="your-github-token"
export BRAVE_API_KEY="your-brave-api-key"
export OPENAI_API_KEY="your-openai-key"
export GEMINI_API_KEY="your-gemini-key"
```

## Fixing MCP Issues

If servers aren't showing in Claude Code:

```bash
# 1. Check current configuration
claude mcp list

# 2. Add missing servers (example for puppeteer)
claude mcp add -s user puppeteer \
  /Users/danielconnolly/.nvm/versions/node/v20.19.4/bin/node \
  /Users/danielconnolly/.nvm/versions/node/v20.19.4/lib/node_modules/@modelcontextprotocol/server-puppeteer/dist/index.js

# 3. Restart Claude Code
```

## Project-Specific DevAssist

Each project gets its own DevAssist instance after `/initproject`:

```json
// .mcp.json in project root
{
  "mcpServers": {
    "devassist-ProjectName": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/project/.devassist/server.js"],
      "env": {
        "PROJECT_ROOT": "/path/to/project",
        "DEVASSIST_PROJECT": "ProjectName"
      }
    }
  }
}
```

This ensures knowledge isolation between projects.
