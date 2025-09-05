# Sprint 1 Quick Start Guide

## Objective
Create the foundation for project-isolated DevAssist instances with slash command support.

## Key Challenge
The main issue we're solving: **Making project-specific commands appear as slash commands in Claude Code while maintaining full DevAssist functionality.**

## Sprint 1 Action Plan

### Step 1: Research MCP Slash Commands (Day 1 Morning)
**Goal**: Understand how to properly register slash commands in MCP

**Actions**:
1. Study MCP SDK documentation for command registration
2. Analyze working MCP servers that have slash commands
3. Test different registration methods
4. Document findings

**Key Files to Examine**:
- `/Projects/Custom_MCP/DevAssist_MCP/index.js` - How DevAssist registers commands
- Other MCP servers in `~/.npm/_npx/` that work with slash commands

### Step 2: Create Server Template (Day 1 Afternoon)
**Goal**: Build reusable template for project servers

**Create**: `/PROJECT_SETUP/devassist-isolation/template/server.js`

```javascript
// Key requirements:
// 1. Import main DevAssist functionality
// 2. Override project-specific settings
// 3. Register project commands as slash commands
// 4. Maintain data isolation
```

### Step 3: Implement Command Registry (Day 1 Evening)
**Goal**: Build system to register and expose commands

**Create**: `/PROJECT_SETUP/devassist-isolation/template/commands/registry.js`

**Must Support**:
- Dynamic command registration
- Slash command metadata
- Parameter schemas
- Command descriptions

### Step 4: Test in Claude Code (Day 2 Morning)
**Goal**: Verify commands appear and work

**Test Process**:
1. Create test project with template
2. Configure in Claude Desktop config
3. Restart Claude Code
4. Check if commands appear with "/"
5. Test command execution

### Step 5: Fix Issues & Document (Day 2 Afternoon)
**Goal**: Resolve any issues and create documentation

**Tasks**:
- Fix any command discovery issues
- Ensure DevAssist inheritance works
- Document the solution
- Create setup instructions

---

## Critical Success Factors

### Must Have
1. ✅ Commands MUST appear as slash commands (not just tools)
2. ✅ Full DevAssist functionality must be inherited
3. ✅ Data must be isolated between projects
4. ✅ Commands must have project prefix (e.g., /veria-start)

### Should Have
1. 📋 Warmup animations working
2. 📋 Subagent initialization
3. 📋 Session state persistence
4. 📋 Clean error messages

### Nice to Have
1. 💡 Auto-discovery of project commands
2. 💡 Hot-reload for development
3. 💡 Debug mode for troubleshooting
4. 💡 Performance monitoring

---

## Technical Approach

### Option A: Direct MCP Registration
```javascript
// Register commands directly with MCP Server
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'veria-start',
      description: 'Start Veria development session',
      inputSchema: { /* ... */ }
    }
  ]
}));
```

### Option B: DevAssist Extension
```javascript
// Extend DevAssist's command system
class ProjectCommands extends DevAssistCommands {
  constructor(projectName) {
    super();
    this.registerProjectCommands(projectName);
  }
}
```

### Option C: Hybrid Approach
```javascript
// Combine both methods for maximum compatibility
// Use DevAssist for functionality
// Use direct MCP for slash command registration
```

---

## Development Commands

### Start Development
```bash
cd /Users/danielconnolly/Projects/PROJECT_SETUP/devassist-isolation
npm init -y
npm install @modelcontextprotocol/sdk
```

### Test Server
```bash
# Test template server
node template/server.js --test

# Test in Veria project
cd /Users/danielconnolly/Projects/Veria
node .devassist/server.js --test
```

### Check Claude Config
```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq '.mcpServers."veria-devassist"'
```

### Monitor Logs
```bash
# Watch Claude logs for errors
tail -f ~/Library/Logs/Claude/*.log
```

---

## Known Issues & Solutions

### Issue: Commands don't appear as slash commands
**Potential Solutions**:
1. Ensure proper tool registration with MCP
2. Check if inputSchema is correctly formatted
3. Verify server is actually running
4. Restart Claude Code completely

### Issue: DevAssist functions not available
**Potential Solutions**:
1. Import DevAssist before setting project env vars
2. Ensure proper module resolution
3. Check for circular dependencies
4. Verify paths are absolute

### Issue: Data contamination between projects
**Potential Solutions**:
1. Use project-specific SQLite databases
2. Isolate environment variables properly
3. Create separate data directories
4. Implement proper cleanup

---

## Quick Test Checklist

Before considering Sprint 1 complete:

- [ ] Create template server that starts without errors
- [ ] Register at least one test command
- [ ] Command appears when typing "/" in Claude Code
- [ ] Command executes when selected
- [ ] DevAssist functions are accessible
- [ ] Data is isolated to project directory
- [ ] Documentation is clear and complete
- [ ] Another developer could replicate setup

---

## Next Steps After Sprint 1

1. **Sprint 2**: Apply template to Veria project
2. **Sprint 3**: Fix session management 
3. **Sprint 4**: Comprehensive testing
4. **Sprint 5**: Deploy to all projects

---

## Support Resources

- MCP SDK: https://modelcontextprotocol.io/docs
- DevAssist Source: /Projects/Custom_MCP/DevAssist_MCP/
- Claude Logs: ~/Library/Logs/Claude/
- Test Project: /Projects/PROJECT_SETUP/devassist-isolation/

---

## Notes Space
(Use this space to track discoveries and decisions during Sprint 1)

---
