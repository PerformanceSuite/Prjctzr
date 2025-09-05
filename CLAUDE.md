# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prjctzr** - Complete project initialization system with intelligent DevAssist integration and smart isolation. Provides one-command setup (`/initproject`) that creates isolated AI assistants for each project with automatic subagent detection based on project analysis.

## Core Commands

### Initialization & Session Management
```bash
# Initialize any project with DevAssist
cd ~/Projects/YourProject
claude
/initproject                           # One-time setup - creates everything

# After initialization, restart Claude Code, then:
/session-start                         # Load context & begin work
/session-checkpoint "progress note"    # Save checkpoint
/session-end                          # Save context & cleanup

# Use enhanced Claude with terminal logging
.devassist/scripts/claude-project.sh   # Instead of 'claude' for logged sessions
```

### Testing & Development
```bash
# Create test projects for different stacks
./test-projects-creator.sh

# Generate project-specific commands
./generate-project-commands.sh [project-name]
```

## Architecture

### System Structure
```
Prjctzr/
├── devassist-isolation/       # Smart isolation system (10-sprint roadmap)
│   ├── lib/                   # Core libraries for isolation
│   ├── subagents/            # Auto-detected project assistants
│   └── sprints/              # Development sprints
├── devassist-mcp/            # DevAssist MCP Server (git submodule)
├── test-*/                   # Test projects for validation
└── *.js                      # Core managers and analyzers
```

### Key Components
- **project-intelligence-analyzer.js**: Analyzes projects to detect type & load subagents
- **complete-session-manager.js**: Manages session lifecycle with context preservation
- **enhanced-session-manager.js**: Extended session features
- **git-integration-manager.js**: Git workflow integration
- **cleanup-agent.js**: Project cleanup and organization

### Generated Project Structure (after /initproject)
```
YourProject/
├── .devassist/
│   ├── server.js             # Isolated MCP server
│   ├── data/                 # Vector database (isolated)
│   ├── terminal_logs/        # Session recordings
│   └── scripts/
│       └── claude-project.sh # Enhanced Claude launcher
├── .mcp.json                 # Project MCP configuration
├── .sessions/                # Session history
└── CLAUDE.md                 # Project-specific guidance
```

## Development Workflow

### Smart DevAssist Isolation (Current Focus)
- **Goal**: Automatic subagent detection without manual configuration
- **Status**: Planning complete, Sprint 1 ready to start
- **Timeline**: 10 sprints over 6-8 weeks
- **Key Files**:
  - `devassist-isolation/SMART_ISOLATION_ROADMAP.md` - Complete strategy
  - `devassist-isolation/sprints/SPRINT_01_PLAN.md` - First sprint tasks
  - `devassist-isolation/ENHANCED_VISION.md` - Behavioral intelligence integration

### Subagent Types (Auto-Detected)
- **Web Development**: React, Vue, Angular projects
- **Backend API**: REST, GraphQL, database design
- **Blockchain**: Solidity, Web3, smart contracts
- **DevOps**: Docker, Kubernetes, CI/CD
- **Testing**: Jest, Mocha, test coverage

## MCP Server Configuration

### Global Servers (9 total in ~/.claude.json)
- filesystem, github, brave-search, git, puppeteer
- desktop-commander, devassist (global), openai-gpt5, gemini

### Project-Specific (via .mcp.json)
- DevAssist-[ProjectName] server with isolated memory
- Auto-configured by /initproject

## Environment Requirements

```bash
export GITHUB_TOKEN="your-token"
export BRAVE_API_KEY="your-key"  
export OPENAI_API_KEY="your-key"
export GEMINI_API_KEY="your-key"
```

## Important Notes

- **Always restart Claude Code** after running `/initproject`
- **Use `.devassist/scripts/claude-project.sh`** for terminal logging
- **Session commands** only available after project initialization
- **Each project** gets completely isolated DevAssist instance
- **Subagents load automatically** based on project analysis

## Sprint History

- ✅ **Sprints 1-5**: Core initialization system (COMPLETE)
- 🚧 **Smart Isolation**: 10-sprint development plan (IN PROGRESS)
  - Sprint 1: Core Architecture Refactor (READY)
  - Sprint 2: Dynamic Loading System
  - Sprint 3: Memory Isolation
  - Sprint 4-10: Subagents, Intelligence, Testing, Polish