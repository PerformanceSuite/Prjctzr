# How Prjctzr Slash Commands Actually Work

## The Complete Picture

### What You Have Now

1. **`.claude/commands/` directory** with three `.md` files:
   - `prjctzr.md` - Project initialization
   - `start-session.md` - Start DevAssist session
   - `end-session.md` - End DevAssist session

2. **MCP Servers** running in background:
   - **Prjctzr** - Provides `prjctzr:*` tools
   - **DevAssist** - Provides `devassist:*` tools

3. **Claude Code** - Connects everything together

### How It Works Step-by-Step

#### Example: Using `/prjctzr`

1. **You type in Claude Code terminal**: `/prjctzr my-api python docker,devassist`

2. **Claude Code**:
   - Finds `.claude/commands/prjctzr.md` in your project
   - Reads the markdown file
   - Substitutes arguments ($1=my-api, $2=python, $3=docker,devassist)
   - Sends instructions to Claude

3. **Claude receives instructions** that say:
   ```
   Use prjctzr:init tool with:
   - name: "my-api"
   - type: "python"  
   - features: ["docker", "devassist"]
   ```

4. **Claude calls MCP tool** `prjctzr:init` through the Prjctzr server

5. **Prjctzr MCP server**:
   - Creates project structure
   - Sets up Python template
   - Adds Docker configuration
   - Initializes DevAssist infrastructure
   - Returns success message

6. **You see**: Project created with all features ready to use

### The Key Insight

**Slash commands are NOT programs** - they are **instructions to Claude**.

- `/prjctzr` doesn't run code directly
- It tells Claude what to do
- Claude uses MCP tools to do the actual work
- This is why it's not "interactive" like a traditional CLI

### Directory Structure Required

```
your-project/
├── .claude/
│   └── commands/
│       ├── prjctzr.md        # Instructions for /prjctzr
│       ├── start-session.md   # Instructions for /start-session
│       └── end-session.md     # Instructions for /end-session
└── [your code files]
```

### Configuration Required

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "prjctzr": {
      "command": "node",
      "args": ["/path/to/Prjctzr/index.js"]
    },
    "devassist": {
      "command": "node",
      "args": ["/path/to/DevAssist/index.js"]
    }
  }
}
```

## Quick Start Guide

### First Time Setup
1. Ensure MCP servers are configured in Claude Desktop
2. Restart Claude Desktop
3. Copy `.claude/commands/` to your project

### Creating a New Project
```bash
mkdir my-new-project
cd my-new-project
cp -r /path/to/Prjctzr/.claude .
claude  # Start Claude Code
```

Then in Claude Code:
```
/prjctzr my-app node docker,devassist
```

### Working on Existing Project
```bash
cd existing-project
claude  # Start Claude Code
```

Then:
```
/start-session Building new feature
# ... work on code ...
/end-session
```

## Why It's Built This Way

1. **Separation of Concerns**:
   - Slash commands = User interface
   - MCP tools = Backend functionality
   - Claude = Intelligence layer

2. **Flexibility**:
   - Can use tools directly without slash commands
   - Can create custom slash commands for any workflow
   - Works with Claude's natural language understanding

3. **Project-Specific Commands**:
   - Each project can have its own `.claude/commands/`
   - Customize commands per project needs
   - No global installation required

## Common Confusions Cleared Up

❌ **Wrong**: "Slash commands run programs"
✅ **Right**: Slash commands give Claude instructions

❌ **Wrong**: "I need to install slash commands globally"  
✅ **Right**: Just copy `.claude/commands/` to each project

❌ **Wrong**: "The slash command is interactive"
✅ **Right**: Claude executes the instructions with the arguments you provide

❌ **Wrong**: "`.slash-command` files are needed"
✅ **Right**: Only `.md` files matter for Claude Code

## Summary

- **Slash commands** = Markdown instructions for Claude
- **MCP tools** = Actual functionality 
- **Claude** = Interprets commands and calls tools
- **You** = Type simple commands, get complex results

The system works by layering:
1. Simple user commands (`/prjctzr`)
2. Through Claude's intelligence
3. To powerful MCP tools
4. Creating professional results

This is why you just type `/prjctzr my-api` and get a fully configured project with Docker, testing, CI/CD, and DevAssist - Claude orchestrates everything based on the instructions in the markdown file.