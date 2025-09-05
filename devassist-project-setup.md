# DevAssist Project Isolation - Project Setup Instructions

## Project Context
This project aims to solve a critical issue: Creating isolated DevAssist instances for each project with project-specific slash commands in Claude Code.

## Current Problem Statement
1. **Veria project** needs its own DevAssist instance with commands like `/veria-start`, `/veria-end`
2. These commands are NOT appearing as slash commands in Claude Code
3. When attempting to use the Veria DevAssist:
   - It finds the wrong project (Performia instead of Veria)
   - No warmup animations or subagents load
   - Session cleanup doesn't execute properly
   - Commands aren't available as slash commands

## What We've Discovered
1. **MCP servers can provide tools** that appear as slash commands in Claude Code
2. **Multiple MCP servers** can be configured in `~/Library/Application Support/Claude/claude_desktop_config.json`
3. **The main DevAssist** (`/Projects/Custom_MCP/DevAssist_MCP/`) works but isn't project-isolated
4. **Current Veria setup** (`/Projects/Veria/.devassist/`) isn't properly inheriting DevAssist functionality

## Technical Architecture

### File Locations
```
/Users/danielconnolly/Projects/
├── Custom_MCP/
│   └── DevAssist_MCP/          # Main DevAssist MCP server (working)
│       ├── index.js            # Entry point with tool registration
│       └── src/                # Core functionality
├── Veria/                      # Target project needing isolation
│   └── .devassist/
│       ├── veria-mcp-server.js # Attempted server (not working properly)
│       ├── veria-server.js     # Another attempt
│       └── data/               # Project-specific data
├── Performia/                  # Another project needing isolation
│   └── .devassist/
└── PROJECT_SETUP/              # This new project for fixing the issue
    └── devassist-isolation/   # Our working directory
```

### Claude Configuration
Location: `~/Library/Application Support/Claude/claude_desktop_config.json`

Current relevant entries:
```json
{
  "mcpServers": {
    "devassist": {
      "command": "node",
      "args": ["/Users/danielconnolly/Projects/Custom_MCP/DevAssist_MCP/index.js"],
      "env": {
        "PROJECT_ROOT": "/Users/danielconnolly/Projects"
      }
    },
    "veria-devassist": {
      "command": "node",
      "args": ["/Users/danielconnolly/Projects/Veria/.devassist/veria-server.js"]
    }
  }
}
```

## Project Requirements

### Core Requirements
1. **Project Isolation**: Each project has its own DevAssist instance
2. **Slash Commands**: Commands appear as `/[project]-command` in Claude Code
3. **Full Functionality**: All DevAssist features work (warmup, subagents, cleanup)
4. **Data Isolation**: Each project has separate data stores
5. **No Interference**: Projects don't conflict with each other

### Veria-Specific Commands Needed
- `/veria-start` - Start development session with full warmup
- `/veria-end` - End session with proper cleanup
- `/veria-sprint` - Check sprint status
- `/veria-blockchain` - Blockchain integration tasks
- `/veria-compliance` - Compliance checks (KYC, AML, securities)
- `/veria-memory` - Search project memory
- `/veria-decision` - Record architectural decisions

## Sprint Plan

### Sprint 1: Foundation (Current)
**Goal**: Create base infrastructure for project isolation
**Key Tasks**:
1. Research how MCP tools become slash commands
2. Create reusable server template
3. Implement command registration system
4. Test commands appear in Claude Code

### Sprint 2: Veria Implementation
**Goal**: Full Veria DevAssist instance
**Key Tasks**:
1. Apply template to Veria
2. Implement all Veria-specific commands
3. Configure and test in Claude Code

### Sprint 3: Session Management
**Goal**: Fix warmup and cleanup
**Key Tasks**:
1. Implement proper warmup with animations
2. Fix subagent loading
3. Implement session cleanup
4. Add state persistence

### Sprint 4: Testing & Documentation
**Goal**: Ensure reliability
**Key Tasks**:
1. Create comprehensive test suite
2. Document setup process
3. Create troubleshooting guide

### Sprint 5: Rollout
**Goal**: Deploy to all projects
**Key Tasks**:
1. Create setup automation
2. Deploy to Performia
3. Create project template generator

## Key Technical Insights

### How DevAssist Registers Commands
```javascript
// From /Projects/Custom_MCP/DevAssist_MCP/index.js
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'session-start',
      description: 'Start development session with warmup',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            default: 'Development session'
          }
        }
      }
    }
    // ... more tools
  ]
}));
```

### Why Current Veria Server Fails
1. It doesn't properly import DevAssist functionality
2. Environment variables aren't set before DevAssist loads
3. Commands aren't registered with correct MCP schema
4. No proper session management inheritance

## Critical Success Factors
1. ✅ Commands MUST appear as slash commands in Claude Code
2. ✅ Full DevAssist functionality must work
3. ✅ Data must be isolated per project
4. ✅ Commands must have project prefix

## Known Issues & Attempts

### What We've Tried
1. **Simple wrapper script** - Didn't inherit DevAssist properly
2. **Standalone server** - Lost DevAssist functionality
3. **Environment variable injection** - Timing issues with imports
4. **Direct DevAssist import** - Project context not isolated

### Current Blockers
1. Commands don't appear as slash commands
2. DevAssist functionality not fully inherited
3. Session management broken (no warmup/cleanup)
4. Wrong project detected (finds Performia instead of Veria)

## Development Commands

### Test Current Setup
```bash
# Check if Veria server is running
ps aux | grep veria

# Test Veria server directly
cd /Users/danielconnolly/Projects/Veria
node .devassist/veria-server.js --version

# Check Claude configuration
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq '.mcpServers."veria-devassist"'
```

### Monitor Claude Code
```bash
# Watch for errors (if logs exist)
tail -f ~/Library/Logs/Claude/*.log

# Check running MCP processes
ps aux | grep "node.*mcp"
```

## Next Steps for New Project

1. **Set up development environment**
   ```bash
   cd /Users/danielconnolly/Projects/PROJECT_SETUP/devassist-isolation
   npm init -y
   npm install @modelcontextprotocol/sdk
   ```

2. **Start Sprint 1 implementation**
   - Create server template that properly inherits DevAssist
   - Implement command registration
   - Test in Claude Code

3. **Focus on the core issue**
   - Make commands appear as slash commands
   - Maintain full DevAssist functionality
   - Ensure project isolation

## Important Notes

### For Claude Code (not Claude Desktop)
- Claude Code uses MCP servers for slash commands
- Tools registered with MCP appear as slash commands
- Multiple MCP servers can run simultaneously
- Each project needs its own MCP server entry

### File Structure Needed
```
/Projects/[PROJECT]/.devassist/
├── server.js           # MCP server entry point
├── config.json         # Project configuration
├── commands/           # Project-specific commands
├── data/              # Isolated data
│   ├── sessions/      # Session data
│   ├── memory.db      # SQLite database
│   └── embeddings/    # Vector store
└── .no-generic        # Prevents main DevAssist from running
```

## Resources
- Main DevAssist: `/Projects/Custom_MCP/DevAssist_MCP/`
- Veria Project: `/Projects/Veria/`
- MCP SDK Docs: https://modelcontextprotocol.io/docs
- Claude Config: `~/Library/Application Support/Claude/claude_desktop_config.json`

## Sprint 1 Immediate Actions
1. Research MCP SDK for proper tool/slash command registration
2. Create working server template with DevAssist inheritance
3. Test command appears when typing "/" in Claude Code
4. Ensure full DevAssist functionality is available
5. Document the working solution

## Expected Outcome
After completing all sprints, typing "/" in Claude Code while in the Veria project should show:
- /veria-start
- /veria-end
- /veria-sprint
- /veria-blockchain
- /veria-compliance
- /veria-memory
- /veria-decision

And these commands should work with full DevAssist functionality including warmup animations, subagents, and proper cleanup.