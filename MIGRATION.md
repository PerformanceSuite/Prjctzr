# Migration from Prjctzr v1 to Prjctzr MCP v2

## Overview
Prjctzr has evolved from a bash-based `/initproject` system to a modern MCP server with tool masking.

## Old vs New Approach

### Version 1 (Bash-based)
- Location: `/Users/danielconnolly/Projects/Prjctzr`
- Used `/initproject` bash command
- Required manual installation steps
- DevAssist integration through file isolation

### Version 2 (MCP Server)
- Location: `/Users/danielconnolly/Projects/Custom_MCP/Prjctzr`
- Uses MCP tools: `prjctzr:init`, `prjctzr:enhance`, etc.
- Integrated with Claude Desktop directly
- Built-in tool masking for 40-60% token reduction
- Docker and containerization support

## Migration Complete ✅

### What Was Preserved
- All templates from v1 (base, configs, go, javascript, python)
- Binary tools and scripts
- Core project initialization concepts

### What's New in v2
- MCP server architecture
- Tool masking layer
- Docker integration
- Dagger CI/CD support
- Direct Claude Desktop integration

## Usage

Instead of `/initproject`, now use:
```
prjctzr:init name:"my-project" type:"node"
```

Or for existing projects:
```
prjctzr:enhance path:"/path/to/project" features:["docker","ci"]
```

## Deprecated Features
- `/initproject` bash command (replaced by MCP tools)
- Manual DevAssist isolation (now handled automatically)
- Bash-based installation process

## Repository
The v2 MCP server is maintained at:
https://github.com/PerformanceSuite/Prjctzr
