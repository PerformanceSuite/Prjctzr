# 🚀 Prjctzr

> Complete project initialization system with intelligent DevAssist integration and smart isolation

## Overview

Prjctzr (Projectizer) is a comprehensive project initialization and management system that provides:
- **One-command setup**: `/initproject` configures everything
- **Smart DevAssist isolation**: Each project gets its own isolated AI assistant
- **Intelligent subagent detection**: Automatically loads appropriate tools based on project type
- **Session management**: Terminal logging, context preservation, and knowledge accumulation

## Architecture

```
Prjctzr/
├── devassist-isolation/      # Smart isolation system (Sprint-based development)
│   ├── lib/                  # Core libraries
│   ├── subagents/           # Intelligent subagents
│   └── tests/               # Comprehensive testing
│
├── devassist-mcp/           # DevAssist MCP Server (submodule)
│   └── [Linked to separate DevAssist repository]
│
├── bin/                     # Global initialization scripts
│   └── devassist-init      # Main initialization script
│
├── templates/               # Project templates
│   ├── base/               # Base project structure
│   └── configs/            # Configuration templates
│
└── docs/                    # Documentation
    ├── SPRINT_*.md         # Sprint completion records
    └── guides/             # Implementation guides
```

## Features

### 🎯 Smart DevAssist Isolation
- Each project gets completely isolated DevAssist instance
- Automatic detection of project type (React, Node.js, Python, etc.)
- Dynamic loading of appropriate subagents
- Project-specific behavioral modes

### 📝 Session Management
- Terminal logging with `.devassist/scripts/claude-project.sh`
- Session commands: `/session-start`, `/session-end`, `/session-checkpoint`
- Context preservation across sessions
- Knowledge accumulation in vector database

### 🤖 Intelligent Subagents
- **Web Development**: React, Vue, Angular assistance
- **Backend API**: REST, GraphQL, database design
- **Blockchain**: Solidity, Web3, smart contracts
- **DevOps**: Docker, Kubernetes, CI/CD
- **Testing**: Jest, Mocha, test coverage
- And more, automatically detected and loaded

### 🔧 MCP Integration
- 9 global MCP servers configured
- Project-specific MCP servers via `.mcp.json`
- Seamless Claude Desktop integration

## Installation

### Prerequisites
```bash
# Required environment variables
export GITHUB_TOKEN="your-token"
export BRAVE_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export GEMINI_API_KEY="your-key"
```

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/PerformanceSuite/Prjctzr.git
cd Prjctzr

# Initialize submodules (DevAssist)
git submodule init
git submodule update

# Install global command
sudo ln -s $(pwd)/bin/devassist-init /usr/local/bin/devassist-init

# Add to Claude commands
cp -r templates/claude-commands/* ~/.claude/commands/
```

## Usage

### Initialize a New Project
```bash
cd ~/Projects/YourProject
claude
# Type: /initproject
```

This single command:
1. Creates complete DevAssist isolation
2. Sets up session management
3. Configures MCP servers
4. Installs slash commands
5. Prepares terminal logging

### Start a Session
```bash
# Use the enhanced Claude with logging
.devassist/scripts/claude-project.sh

# In Claude:
/session-start  # Loads context and begins session
```

### Project-Specific Commands
After initialization, each project gets:
- `/session-start-[project]` - Start with context loading
- `/session-end-[project]` - End with knowledge preservation

## Development

### Current Focus: Smart DevAssist Isolation

We're building an intelligent system where:
- Only 2 commands per project (start/end)
- Automatic subagent detection
- Behavioral enhancement from SuperClaude patterns
- Complete project isolation

See `devassist-isolation/SMART_ISOLATION_ROADMAP.md` for the complete development plan.

### Sprint Status
- ✅ Sprint 1-5: Core initialization system (COMPLETE)
- 🚧 Smart Isolation: 10-sprint plan (IN PROGRESS)
  - Sprint 1: Core Architecture Refactor
  - Sprint 2: Dynamic Loading System
  - Sprint 3: Memory Isolation
  - Sprint 4-5: Subagent Development
  - Sprint 6: Intelligence Layer
  - Sprint 7-8: Optimization & Testing
  - Sprint 9-10: Polish & Release

## Repository Structure

### Main Prjctzr Repository
- Project initialization system
- Smart isolation development
- Templates and configurations
- Documentation

### DevAssist MCP Repository (Submodule)
- Standalone MCP server
- Vector database integration
- Semantic search capabilities
- Knowledge management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow sprint-based development
4. Ensure comprehensive testing
5. Submit pull request

## Documentation

- [MASTER_PLAN.md](MASTER_PLAN.md) - Overall system architecture
- [MCP_SERVERS.md](MCP_SERVERS.md) - MCP server configuration
- [devassist-isolation/SMART_ISOLATION_ROADMAP.md](devassist-isolation/SMART_ISOLATION_ROADMAP.md) - Smart isolation development
- [devassist-isolation/ENHANCED_VISION.md](devassist-isolation/ENHANCED_VISION.md) - Enhanced vision with behavioral intelligence

## License

MIT

## Status

**Production Ready**: Core initialization system ✅
**In Development**: Smart DevAssist Isolation 🚧

---

Built with ❤️ for developers who want intelligent, context-aware AI assistance