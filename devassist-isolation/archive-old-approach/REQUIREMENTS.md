# DevAssist Project Isolation - Technical Requirements Document

## Project Overview
Create a system where each project can have its own isolated DevAssist instance with project-specific commands while maintaining the full functionality of the main DevAssist system.

## Current State Analysis

### What's Working
- Main DevAssist MCP server runs and provides base functionality
- Multiple MCP servers can be configured in Claude Desktop
- Basic project isolation concept exists (.no-generic file)

### What's NOT Working
- Project-specific commands (/veria-start, /veria-end) are not available as slash commands
- Veria-specific server doesn't properly inherit DevAssist functionality
- Warmup and subagents don't run in isolated instances
- Session cleanup doesn't execute properly
- Command naming conflicts between projects

## Technical Requirements

### 1. Core Architecture

#### 1.1 Project Isolation
- **REQ-1.1.1**: Each project SHALL have its own DevAssist instance in `.devassist/` directory
- **REQ-1.1.2**: Project instances SHALL inherit ALL functionality from main DevAssist
- **REQ-1.1.3**: Project instances SHALL have isolated data stores (SQLite, embeddings)
- **REQ-1.1.4**: Project instances SHALL NOT interfere with other project instances

#### 1.2 Command System
- **REQ-1.2.1**: Project-specific commands SHALL be prefixed with project name (e.g., /veria-start)
- **REQ-1.2.2**: Commands SHALL appear as slash commands in Claude Code interface
- **REQ-1.2.3**: Commands SHALL have proper descriptions and parameter schemas
- **REQ-1.2.4**: Generic DevAssist commands SHALL be disabled when in project directory

### 2. Functional Requirements

#### 2.1 Session Management
- **REQ-2.1.1**: `/[project]-start` SHALL initialize full DevAssist session with:
  - Warmup animations and system checks
  - Subagent initialization
  - Project context loading
  - Memory restoration from previous sessions
- **REQ-2.1.2**: `/[project]-end` SHALL properly cleanup:
  - Save session state
  - Archive conversation history
  - Update project memory
  - Show cleanup summary

#### 2.2 Project-Specific Commands
Each project SHALL have these base commands:
- **REQ-2.2.1**: `/[project]-start` - Start development session
- **REQ-2.2.2**: `/[project]-end` - End development session
- **REQ-2.2.3**: `/[project]-sprint` - Check sprint status
- **REQ-2.2.4**: `/[project]-memory` - Search project memory
- **REQ-2.2.5**: `/[project]-decision` - Record architectural decisions

#### 2.3 Veria-Specific Commands
- **REQ-2.3.1**: `/veria-blockchain` - Blockchain integration tasks
- **REQ-2.3.2**: `/veria-compliance` - Compliance status checks
- **REQ-2.3.3**: `/veria-token` - Token management operations
- **REQ-2.3.4**: `/veria-investor` - Investor portal operations

### 3. Technical Implementation

#### 3.1 MCP Server Structure
```
/Projects/[PROJECT_NAME]/.devassist/
├── server.js                 # Project MCP server entry point
├── config.json               # Project-specific configuration
├── commands/                 # Project-specific command implementations
│   ├── index.js             # Command registry
│   └── [project]-commands.js # Project command implementations
├── data/                    # Isolated data storage
│   ├── project.db          # SQLite database
│   ├── sessions/           # Session data
│   └── embeddings/         # Vector embeddings
└── .no-generic             # Prevents generic DevAssist from running
```

#### 3.2 Server Initialization Flow
1. Load project configuration
2. Set environment variables for project context
3. Import main DevAssist with project overrides
4. Register project-specific commands
5. Start MCP server with full functionality

#### 3.3 Command Registration
Commands must be registered in a way that:
- Makes them available as slash commands in Claude Code
- Includes proper parameter schemas
- Provides helpful descriptions
- Handles both tool calls and slash command invocations

### 4. Testing Requirements

#### 4.1 Unit Tests
- **TEST-4.1.1**: Test project isolation (data doesn't leak)
- **TEST-4.1.2**: Test command registration and discovery
- **TEST-4.1.3**: Test session state persistence
- **TEST-4.1.4**: Test warmup and cleanup processes

#### 4.2 Integration Tests
- **TEST-4.2.1**: Test full session lifecycle (start → work → end)
- **TEST-4.2.2**: Test command availability in Claude Code
- **TEST-4.2.3**: Test multiple project instances running simultaneously
- **TEST-4.2.4**: Test failover and error recovery

#### 4.3 Acceptance Criteria
- [ ] `/veria-start` appears as slash command in Claude Code
- [ ] Session start shows warmup animation and loads subagents
- [ ] Session end performs cleanup and shows summary
- [ ] Project data is isolated from other projects
- [ ] All base DevAssist functionality is available
- [ ] Project-specific commands work correctly

## Sprint Plan

### Sprint 1: Foundation (2 days)
**Goal**: Create base infrastructure for project isolation

**Tasks**:
1. Create project server template that properly inherits DevAssist
2. Implement environment variable management for project context
3. Create command registration system that exposes slash commands
4. Test basic server startup and command discovery

**Deliverables**:
- Working project server template
- Command registration system
- Basic test suite

### Sprint 2: Veria Implementation (2 days)
**Goal**: Implement full Veria-specific DevAssist instance

**Tasks**:
1. Create Veria server with all required commands
2. Implement veria-specific commands (blockchain, compliance, etc.)
3. Configure Claude Desktop for Veria server
4. Test all Veria commands work as slash commands

**Deliverables**:
- Complete Veria DevAssist server
- All /veria-* commands working
- Documentation for Veria setup

### Sprint 3: Session Management (2 days)
**Goal**: Fix session management with proper warmup and cleanup

**Tasks**:
1. Implement proper warmup sequence with animations
2. Fix subagent initialization
3. Implement proper session cleanup
4. Add session state persistence

**Deliverables**:
- Working warmup with visual feedback
- Proper cleanup on session end
- Session continuity between restarts

### Sprint 4: Testing & Documentation (1 day)
**Goal**: Comprehensive testing and documentation

**Tasks**:
1. Write automated tests for all requirements
2. Create setup documentation
3. Create troubleshooting guide
4. Performance testing and optimization

**Deliverables**:
- Test suite with >80% coverage
- Complete documentation
- Performance benchmarks

### Sprint 5: Rollout & Refinement (1 day)
**Goal**: Deploy to other projects and refine based on usage

**Tasks**:
1. Create setup script for new projects
2. Deploy to Performia project
3. Gather feedback and fix issues
4. Create project template generator

**Deliverables**:
- Setup automation script
- Multiple working project instances
- Template generator for new projects

## Success Metrics
1. All slash commands appear and work in Claude Code
2. Full DevAssist functionality available in isolated instances
3. Zero data leakage between projects
4. <2 second startup time for sessions
5. 100% of acceptance criteria met

## Risk Mitigation
1. **Risk**: MCP protocol limitations for slash commands
   - **Mitigation**: Research MCP SDK documentation, potentially contribute fixes upstream

2. **Risk**: Performance degradation with multiple instances
   - **Mitigation**: Implement lazy loading, shared resources where safe

3. **Risk**: Complex debugging across isolated instances
   - **Mitigation**: Comprehensive logging, debug mode, monitoring dashboard

## Next Steps
1. Review and approve requirements
2. Set up PROJECT_SETUP as the development environment
3. Begin Sprint 1 implementation
4. Daily progress updates and testing
