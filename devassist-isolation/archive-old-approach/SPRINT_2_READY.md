# 🚀 Sprint 2: Veria Implementation - Ready to Run

## Quick Start for Next Session

```bash
# Start here - just copy and run:
cd ~/Projects/PROJECT_SETUP
cat devassist-isolation/SESSION_HANDOVER.md  # Read context
```

## Sprint 2 Objectives

### Primary Goal
Deploy the working template-v2 to Veria project and add blockchain-specific commands.

### Deliverables
1. ✅ Veria server fully functional
2. ✅ Base commands working (`/veria-start`, `/veria-end`, etc.)
3. ✅ Blockchain commands added (`/veria-blockchain`, `/veria-compliance`, `/veria-token`, `/veria-investor`)
4. ✅ Commands visible in Claude Code
5. ✅ Session management working

## Implementation Plan

### Phase 1: Deploy Template (15 min)
```bash
# 1. Copy template to Veria
cd ~/Projects/Veria
mkdir -p .devassist
cp -r ~/Projects/PROJECT_SETUP/devassist-isolation/template-v2/* .devassist/

# 2. Create MCP config
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "veria": {
      "command": "node",
      "args": [".devassist/server.js"],
      "env": {
        "PROJECT_ROOT": ".",
        "DEVASSIST_PROJECT": "veria",
        "DEVASSIST_ISOLATED": "true"
      }
    }
  }
}
EOF

# 3. Test basic commands
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node .devassist/server.js 2>/dev/null | jq -r '.result.tools[].name'
```

### Phase 2: Add Blockchain Commands (30 min)

Create `/veria-blockchain` command:
```javascript
// In .devassist/server.js, add to registerProjectCommands():

this.registerCommand({
  name: `${prefix}-blockchain`,
  description: `Blockchain integration and smart contract operations for ${this.config.projectName}`,
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['deploy', 'verify', 'audit', 'status'],
        description: 'Blockchain operation to perform'
      },
      contract: {
        type: 'string',
        description: 'Smart contract name or address'
      }
    }
  },
  handler: async (args) => {
    // Implementation
  }
});
```

Add similar commands for:
- `/veria-compliance` - Regulatory compliance checks
- `/veria-token` - Token management (mint, burn, transfer)
- `/veria-investor` - Investor portal operations

### Phase 3: Claude Desktop Integration (10 min)

1. Update Claude Desktop config:
```bash
# Add to ~/Library/Application Support/Claude/claude_desktop_config.json
```

2. Restart Claude Code

3. Test slash commands:
   - Type `/veria` and see autocomplete
   - Run `/veria-start`
   - Test `/veria-blockchain`

### Phase 4: Testing (15 min)

Create `sprint2-validation.js`:
```javascript
// Test Veria-specific functionality
// Verify blockchain commands
// Check compliance integration
// Validate session persistence
```

## Command Specifications

### `/veria-blockchain`
- **Purpose**: Manage blockchain operations
- **Operations**: deploy, verify, audit, status
- **Integration**: Web3, Ethers.js, Hardhat

### `/veria-compliance`
- **Purpose**: Regulatory compliance tracking
- **Checks**: KYC, AML, accreditation
- **Reporting**: Generate compliance reports

### `/veria-token`
- **Purpose**: Token lifecycle management
- **Actions**: mint, burn, transfer, freeze
- **Tracking**: Token metrics and distribution

### `/veria-investor`
- **Purpose**: Investor portal management
- **Features**: Dashboard, documents, distributions
- **Access**: Role-based permissions

## Files to Modify

### Primary Files
1. `.devassist/server.js` - Add new commands
2. `.devassist/lib/veria-blockchain.js` - Blockchain logic (create new)
3. `.devassist/lib/veria-compliance.js` - Compliance logic (create new)

### Configuration
1. `.mcp.json` - Already created above
2. `.devassist/config/veria.json` - Project settings (create)

## Success Metrics

### Sprint 2 Complete When:
- [ ] All 7 base commands working (`veria-start`, etc.)
- [ ] 4 blockchain commands added and functional
- [ ] Commands appear in Claude Code slash menu
- [ ] Session persistence verified
- [ ] Can run `/veria-start` → work → `/veria-end` cycle

## Troubleshooting Guide

### If commands don't appear:
1. Check `.mcp.json` is correct
2. Restart Claude Code
3. Run `claude mcp list` to verify

### If server won't start:
1. Check Node.js version (need 18+)
2. Verify template copied correctly
3. Check environment variables

### If blockchain commands fail:
1. Ensure Web3 libraries installed
2. Check Ethereum provider configured
3. Verify contract addresses

## Time Estimate

- **Total Sprint Time**: 1-2 hours
- **Deployment**: 15 minutes
- **Command Implementation**: 45 minutes
- **Testing**: 30 minutes
- **Documentation**: 30 minutes

## Next Session Checklist

When you return:
1. [ ] Read `SESSION_HANDOVER.md`
2. [ ] Check Sprint 1 complete
3. [ ] Run this Sprint 2 guide
4. [ ] Deploy to Veria
5. [ ] Add blockchain commands
6. [ ] Test in Claude Code
7. [ ] Update SPRINT_TRACKER.md

---

**Ready to Execute**: Just follow the phases above in order! 🚀