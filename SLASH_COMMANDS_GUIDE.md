# 📚 Prjctzr Slash Commands Guide

## Overview

This project provides **THREE different ways** to use Prjctzr functionality:

### 1. 🎯 Claude Code Slash Commands (Recommended)
**Location**: `.claude/commands/*.md`  
**How they work**: These are markdown files that give Claude instructions when you type slash commands in Claude Code.

### 2. 🔧 MCP Tools
**Access**: Through Claude directly or via slash commands  
**How they work**: Backend tools that Claude can call to perform actions.

### 3. 🖥️ CLI Tool
**Access**: `npx prjctzr` or `prjctzr` (if globally installed)  
**How they work**: Standalone command-line tool for use outside Claude Code.

---

## 🎯 Using Slash Commands in Claude Code

### Setup
1. Open your project in terminal
2. Start Claude Code: `claude`
3. The commands are automatically available if `.claude/commands/` exists in your project

### Available Commands

#### `/prjctzr [name] [type] [features]`
Initializes a new project with Prjctzr.

**Examples**:
```bash
# Interactive (asks for details)
/prjctzr

# With name
/prjctzr my-api

# Full specification
/prjctzr my-api python docker,devassist,testing
```

**What it does**:
1. Creates project structure
2. Sets up selected features (Docker, DevAssist, testing, etc.)
3. Initializes DevAssist if selected
4. Provides next steps

#### `/start-session [description]`
Starts a DevAssist development session.

**Examples**:
```bash
/start-session Building authentication system
/start-session Fixing bug #123
/start-session Adding new API endpoints
```

**What it does**:
1. Starts session tracking
2. Analyzes current codebase
3. Retrieves project memory
4. Provides actionable next steps

#### `/end-session`
Ends the current DevAssist session.

**Example**:
```bash
/end-session
```

**What it does**:
1. Generates session summary
2. Tracks completed milestones
3. Performs cleanup
4. Suggests next session focus

---

## 🔧 Direct MCP Tool Usage

You can also ask Claude directly to use these tools:

### Project Creation
"Use prjctzr:init to create a Python project called 'my-api' with Docker and DevAssist"

### Session Management
"Start a DevAssist session for building the authentication system"
"End my current DevAssist session and give me a summary"

### Other DevAssist Tools
- `devassist:analyze_codebase` - Analyze project structure
- `devassist:record_architectural_decision` - Record important decisions
- `devassist:track_progress` - Track development milestones
- `devassist:get_project_memory` - Retrieve past context

---

## 🖥️ CLI Usage (Outside Claude Code)

### Installation
```bash
# From the Prjctzr directory
npm link

# Or use directly with npx
npx prjctzr
```

### Usage
```bash
# Interactive mode
prjctzr

# With options
prjctzr --name my-api --type python --features docker,devassist
```

---

## 🏗️ Architecture

### How Slash Commands Work

1. **User types**: `/prjctzr my-api`
2. **Claude Code reads**: `.claude/commands/prjctzr.md`
3. **Claude receives**: Instructions from the markdown file with arguments
4. **Claude executes**: `prjctzr:init` MCP tool with parameters
5. **Project created**: With all specified features

### File Structure
```
your-project/
├── .claude/
│   └── commands/
│       ├── prjctzr.md        # Project initialization command
│       ├── start-session.md   # Session start command
│       └── end-session.md     # Session end command
├── .devassist/                # Created by DevAssist (if selected)
│   ├── sessions/
│   ├── agents/
│   └── docs/
└── [your project files]
```

### MCP Server Connection
- **Prjctzr MCP Server**: Provides `prjctzr:*` tools
- **DevAssist MCP Server**: Provides `devassist:*` tools
- Both configured in Claude Desktop's config file

---

## 💡 Best Practices

### Starting a New Project
1. Create empty directory: `mkdir my-project && cd my-project`
2. Open Claude Code: `claude`
3. Initialize: `/prjctzr my-project node docker,devassist`
4. Start session: `/start-session Initial project setup`

### Working on Existing Project
1. Open project and Claude Code
2. Start session: `/start-session Working on feature X`
3. Work on your code (Claude tracks everything)
4. End session: `/end-session`

### Feature Selection
- **devassist**: Always include for AI-powered development tracking
- **docker**: Include for containerized applications
- **testing**: Include for test framework setup
- **ci**: Include for GitHub Actions/GitLab CI
- **dagger**: Include for portable CI/CD pipelines
- **docs**: Include for auto-generated documentation

---

## 🚨 Troubleshooting

### "Command not found"
- Ensure `.claude/commands/` exists in your project
- Check that the `.md` files are present
- Restart Claude Code

### "MCP tool not available"
- Check Claude Desktop configuration
- Ensure MCP servers are running
- Restart Claude Desktop

### "Project creation failed"
- Check you have write permissions
- Ensure you're in the correct directory
- Check MCP server logs for errors

---

## 📝 Summary

**For most users**: Use the slash commands (`/prjctzr`, `/start-session`, `/end-session`) in Claude Code for the best experience.

**Key points**:
- Slash commands are project-specific (need `.claude/commands/` in each project)
- MCP tools are globally available (configured in Claude Desktop)
- Everything integrates seamlessly for AI-powered development

**Workflow**:
1. `/prjctzr` to set up project
2. `/start-session` when you begin work
3. Work on your code with Claude's assistance
4. `/end-session` when done

This creates a complete AI-powered development environment with automatic tracking, context preservation, and intelligent assistance!