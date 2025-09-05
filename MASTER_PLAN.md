# 🎯 PROJECT_SETUP Master Plan - Perfect /initproject Command

## Mission Statement
Create the **perfect** `/initproject` command that initializes ANY project with complete DevAssist isolation, project-specific slash commands, and full automation. Zero manual configuration. No mistakes.

## 🏆 Ultimate Vision

When a developer runs `/initproject` in ANY project:
1. Complete DevAssist isolation is created
2. Project-specific slash commands appear (e.g., `/veria-start`, `/veria-end`)
3. Full session management with automated workflows
4. Git operations happen automatically
5. Subagents verify and create as needed
6. Terminal logging captures everything
7. Knowledge persists across sessions
8. Zero manual configuration required

---

## 📊 Current State Analysis

### ✅ What Works
- Basic DevAssist structure creation via `mcp__devassist__initproject`
- Terminal logging to `.devassist/terminal_logs/`
- Session JSON file creation in `.sessions/`
- Global MCP servers (9 configured and functional)
- Template-v2 with enhanced features from Sprint 3
- Basic warmup and cleanup agents
- Log reading on session start

### ❌ What's Missing (Critical Gaps)
1. **Project-specific slash commands** - Not being created in `.claude/commands/`
2. **Heartbeat integration** - Code exists but not connected to sessions
3. **Git push automation** - No automatic commits/pushes on session-end
4. **Continuous summary file** - No cumulative knowledge file with latest on top
5. **Subagent auto-verification** - Manual process, not automated
6. **Complete autonomous workflow** - Still requires manual steps
7. **Project name in commands** - Should be `/veria-start` not `/session-start`

---

## 🚀 5-Sprint Implementation Plan

### Sprint 1: Perfect Slash Commands (Day 1)
**Goal:** Make project-specific slash commands work flawlessly

#### Tasks:
- [ ] Create `.claude/commands/{project}-start.md` generation
- [ ] Create `.claude/commands/{project}-end.md` generation
- [ ] Create `.claude/commands/{project}-status.md` generation
- [ ] Create `.claude/commands/{project}-checkpoint.md` generation
- [ ] Use template-v2 enhanced server for full DevAssist
- [ ] Update devassist-init to generate these files
- [ ] Test commands appear in Claude Code after restart
- [ ] Verify with multiple projects (veria, performia, test)

#### Success Criteria:
- Typing `/` in Claude Code shows project-specific commands
- Commands execute with full DevAssist functionality
- Each project has isolated commands

---

### Sprint 2: Autonomous Session Management (Day 2)
**Goal:** Complete automation from start to end

#### Tasks:
- [ ] Integrate SessionHeartbeat class into session-start
- [ ] Implement subagent verification on start
- [ ] Auto-create missing subagents based on project type
- [ ] Add warmup animations and progress indicators
- [ ] Create continuous session summary file system
- [ ] Implement terminal log analysis on session-start
- [ ] Add session recovery from crashes
- [ ] Implement sprint-check heartbeat command

#### Success Criteria:
- Session starts with full warmup and verification
- Heartbeat keeps DevAssist engaged during long sessions
- Previous context loads automatically
- Subagents created as needed

---

### Sprint 3: Git Integration & Cleanup (Day 3)
**Goal:** Automatic git operations and perfect cleanup

#### Tasks:
- [ ] Auto git add and commit on session-end
- [ ] Generate intelligent commit messages from session
- [ ] Optional git push (configurable via prompt)
- [ ] Enhance cleanup agent with more patterns
- [ ] Archive old logs (>7 days)
- [ ] Clean test artifacts and build files
- [ ] Knowledge preservation to continuous file
- [ ] Session summary appended to PROJECT_SESSIONS.md

#### Success Criteria:
- Git commits happen automatically with good messages
- Cleanup removes all temporary files
- Knowledge persists across sessions
- Session history maintained

---

### Sprint 4: Intelligence & Context (Day 4)
**Goal:** Smart project analysis and suggestions

#### Tasks:
- [ ] Detect project type (JS/TS, Python, Rust, Go, etc.)
- [ ] Suggest appropriate subagents based on project
- [ ] Auto-create relevant documentation templates
- [ ] Detect testing framework and create test commands
- [ ] Create project-specific workflows
- [ ] Generate optimal CLAUDE.md with project context
- [ ] Implement dependency analysis
- [ ] Add security scanning suggestions

#### Success Criteria:
- Project type correctly detected
- Appropriate subagents suggested
- Documentation matches project needs
- Testing approach identified

---

### Sprint 5: Testing & Polish (Day 5)
**Goal:** Ensure perfection - no mistakes

#### Tasks:
- [ ] Test on JavaScript/TypeScript project
- [ ] Test on Python project
- [ ] Test on Rust project
- [ ] Test on Go project
- [ ] Test on mixed/unknown project
- [ ] Performance optimization (<2s init time)
- [ ] Error handling and recovery
- [ ] Create comprehensive test suite
- [ ] Update all documentation
- [ ] Create troubleshooting guide

#### Success Criteria:
- Works perfectly on all project types
- No errors or warnings
- Fast initialization
- Complete documentation

---

## 🎯 Definition of "Perfect"

### A project is PERFECTLY initialized when:

1. **One Command Does Everything:**
   ```bash
   cd ~/Projects/AnyProject
   claude
   /initproject
   # Everything else is automatic
   ```

2. **Project-Specific Commands Work:**
   - `/projectname-start` - Full session with warmup, heartbeat, subagents
   - `/projectname-end` - Summary, git push, cleanup
   - `/projectname-status` - Complete system status
   - `/projectname-checkpoint` - Save progress
   - `/projectname-memory` - Search project knowledge
   - `/projectname-decision` - Record architectural decisions

3. **Full Automation:**
   - Session starts load previous context automatically
   - Heartbeat keeps DevAssist engaged (5-min intervals)
   - Subagents verify and create as needed
   - Git operations happen without prompting
   - Cleanup runs automatically
   - Terminal logs captured always

4. **Perfect Isolation:**
   - Each project has separate `.devassist/data/`
   - No data leakage between projects
   - Project-specific configurations
   - Isolated vector databases

5. **Zero Configuration:**
   - No manual file editing
   - No environment setup beyond initial
   - Works immediately after Claude Code restart
   - All paths resolved automatically

---

## 🛠️ Technical Implementation

### Key Components to Integrate:

1. **Enhanced template-v2** (from devassist-isolation/template-v2/)
   - Full DevAssist integration
   - Vector-based memory
   - Session persistence
   - Warmup animations

2. **DevAssist MCP Core** (/Projects/Custom_MCP/DevAssist_MCP/)
   - Session management
   - Heartbeat system
   - Subagent manager
   - Memory systems

3. **Project Command Generator**
   - Creates `.claude/commands/{project}-*.md` files
   - Generates proper slash command syntax
   - Handles command discovery

4. **Session Automation**
   - Start → Work → Checkpoint → End lifecycle
   - Terminal log integration
   - Context preservation
   - Knowledge archival

5. **Git Workflow**
   - Intelligent commit messages
   - Session summaries
   - Optional push
   - Branch management

### File Structure After Perfect Init:

```
YourProject/
├── CLAUDE.md                          # Perfect project context
├── PROJECT_SESSIONS.md                # Cumulative session log (latest on top)
├── .claude/
│   └── commands/
│       ├── {project}-start.md        # Project-specific start command
│       ├── {project}-end.md          # Project-specific end command
│       ├── {project}-status.md       # Project-specific status
│       ├── {project}-checkpoint.md   # Project-specific checkpoint
│       ├── {project}-memory.md       # Project-specific memory search
│       └── {project}-decision.md     # Project-specific decisions
├── .devassist/
│   ├── server.js                     # Enhanced MCP server (template-v2)
│   ├── config.json                   # Project configuration
│   ├── warmup.js                     # Project warmup script
│   ├── agents/
│   │   ├── cleanup.js               # Cleanup agent
│   │   └── [project-specific]/      # Auto-created subagents
│   ├── data/
│   │   ├── memory.db                # SQLite database
│   │   ├── vectors/                 # Vector embeddings
│   │   └── sessions/                # Session data
│   ├── terminal_logs/               # All terminal sessions
│   ├── knowledge/                   # Knowledge base
│   └── scripts/
│       └── claude-project.sh        # Terminal logging launcher
├── .sessions/
│   ├── current.json                 # Current session
│   └── archive/                     # Historical sessions
└── .mcp.json                        # Project MCP configuration
```

---

## 📋 Implementation Priority

### Phase 1: Foundation (Sprint 1)
- Project-specific slash commands
- Basic command execution
- Template integration

### Phase 2: Automation (Sprint 2-3)
- Session lifecycle
- Git integration
- Cleanup routines

### Phase 3: Intelligence (Sprint 4)
- Project analysis
- Smart suggestions
- Optimal configuration

### Phase 4: Polish (Sprint 5)
- Testing
- Performance
- Documentation

---

## 🔄 Session Recovery Instructions

If you need to restart this session, here's the current state:

1. **Location**: `/Users/danielconnolly/Projects/PROJECT_SETUP`
2. **Current Sprint**: Ready to start Sprint 1
3. **Key Files**:
   - This plan: `MASTER_PLAN.md`
   - Session log: `SESSION_LOG.md`
   - Implementation: `devassist-isolation/`
4. **Next Steps**: Implement Sprint 1 - Project-specific slash commands

---

## 📝 Notes

- Focus on making `/initproject` perfect - no mistakes
- Each sprint builds on the previous
- Test continuously, don't wait until Sprint 5
- Document everything for future sessions
- Use template-v2 as the foundation

---

*Created: 2025-09-04*
*Last Updated: 2025-09-04*
*Session: PROJECT_SETUP Master Planning*