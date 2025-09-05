# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **DevAssist & MCP Configuration System** that provides complete project initialization with isolated DevAssist instances, MCP server setup, and session management for any project.

## Core Commands

### Primary Initialization
```bash
cd ~/Projects/YourProject
claude
# Type: /initproject
```
This single command sets up everything needed for DevAssist integration.

### Session Management (after initialization)
```bash
/session-start              # Begin with DevAssist verification & terminal log loading
/session-end                # End with knowledge review & context saving
/session-checkpoint "msg"   # Save progress checkpoint
/session-status             # Check current session state
```

### Project Claude with Logging
```bash
.devassist/scripts/claude-project.sh    # Use instead of 'claude' for terminal logging
```

## Architecture

### System Components

**Global MCP Servers (9 total)**
- Configured in `~/.claude.json` (user scope)
- Available in all projects: filesystem, github, brave-search, git, puppeteer, desktop-commander, devassist (global), openai-gpt5, gemini

**Project Isolation System**
- Each project gets its own DevAssist instance via `.mcp.json`
- Isolated knowledge bases in `.devassist/data/`
- Terminal logs saved to `.devassist/terminal_logs/`

### Generated Project Structure (via /initproject)
```
YourProject/
├── CLAUDE.md                      # Project documentation
├── .claude/commands/              # Session slash commands
├── .devassist/                    # DevAssist isolation
│   ├── server.js                  # Project-specific MCP server
│   ├── data/                      # Vector database (isolated)
│   ├── terminal_logs/             # All sessions recorded
│   └── scripts/claude-project.sh  # Claude with logging
├── .sessions/                     # Session history
└── .mcp.json                     # Project MCP configuration
```

## Key Files

### System Files
- `/Users/danielconnolly/bin/devassist-init` - Main initialization script
- `/Users/danielconnolly/.claude/commands/initproject.md` - The /initproject slash command
- `~/Library/Application Support/Claude/claude_desktop_config.json` - Claude Desktop config

### Templates & Sources
- `/Users/danielconnolly/Projects/Custom_MCP/DevAssist_MCP/` - Main DevAssist MCP server
- `/Users/danielconnolly/Projects/Custom_MCP/DevAssist_Templates/` - DevAssist templates

## Development Workflow

### Starting Work on Any Project
1. `cd ~/Projects/YourProject`
2. `claude` then `/initproject` (first time only)
3. Restart Claude Code
4. `/session-start` - Loads previous context
5. Use `.devassist/scripts/claude-project.sh` for logged sessions
6. `/session-checkpoint "progress"` to save work
7. `/session-end` when done

### DevAssist Isolation Problem (devassist-isolation/)
This subdirectory contains work on creating truly isolated DevAssist instances per project:
- **Problem**: Current system finds wrong projects, commands don't appear as slash commands
- **Goal**: Project-specific commands like `/veria-start`, `/veria-blockchain` 
- **Sprint-based development** tracked in SPRINT_TRACKER.md
- **STATUS**: Sprint 1 of 5 COMPLETE (2025-01-02) - Foundation built, template working
- **NEXT**: Sprint 2 ready to run - see `devassist-isolation/SESSION_HANDOVER.md`

## Important Notes

### MCP Server Management
- Always restart Claude Code after `/initproject`
- Verify servers with `claude mcp list`
- Project-specific MCP servers are added via `.mcp.json`

### Terminal Logging
- Use `.devassist/scripts/claude-project.sh` instead of plain `claude`
- All sessions automatically recorded to `.devassist/terminal_logs/`
- Logs reviewed on next `/session-start`

### Environment Variables Required
```bash
export GITHUB_TOKEN="your-token"
export BRAVE_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export GEMINI_API_KEY="your-key"
```

## Troubleshooting

### MCP Servers Not Showing
1. Restart Claude Code after `/initproject`
2. Check `.mcp.json` exists in project root
3. Verify with `claude mcp list`

### DevAssist Not Working
1. Ensure `.devassist/server.js` exists and is executable
2. Check terminal logs in `.devassist/terminal_logs/`
3. Verify project isolation (each project has separate data)

### Session Commands Missing
Session management commands only work after `/initproject` has been run in a project.