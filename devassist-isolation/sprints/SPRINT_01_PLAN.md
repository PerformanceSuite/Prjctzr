# Sprint 1: Core Architecture Refactor
**Duration**: 3-4 days  
**Start Date**: _To be determined_  
**Status**: NOT STARTED

## 🎯 Sprint Goal
Refactor the existing isolation system to support smart detection by simplifying the command structure and building the foundation for intelligent project analysis.

## 📋 User Stories

### US-1.1: Simplified Command Structure
**As a** developer  
**I want** only two commands per project (`/session-start-[project]` and `/session-end-[project]`)  
**So that** I don't need to remember project-specific commands

**Acceptance Criteria:**
- [ ] `/initproject` generates only 2 slash commands
- [ ] Old project-specific commands are removed
- [ ] Commands are properly registered in Claude Code
- [ ] Commands show correct project name

### US-1.2: Project Analysis Foundation  
**As a** system  
**I want** to analyze project structure automatically  
**So that** I can determine what type of assistance is needed

**Acceptance Criteria:**
- [ ] Can detect programming language (JS, Python, Go, etc.)
- [ ] Can detect frameworks (React, Django, Express, etc.) 
- [ ] Can identify project type (web, CLI, library, etc.)
- [ ] Analysis completes in < 3 seconds

### US-1.3: Subagent Registry System
**As a** system  
**I want** a registry of available subagents  
**So that** I can dynamically load the right ones

**Acceptance Criteria:**
- [ ] Subagents can register themselves
- [ ] Registry tracks trigger conditions
- [ ] Registry provides lookup by project type
- [ ] Registry supports dependencies between subagents

## 🔧 Technical Tasks

### Task 1: Refactor Command Generation
**File**: `devassist-isolation/template-v2/server.js`
- [ ] Remove all custom command generation logic
- [ ] Keep only session-start and session-end with project prefix
- [ ] Update command descriptions
- [ ] Test command registration

### Task 2: Create Project Analyzer Module
**File**: `devassist-isolation/lib/project-analyzer.js`
```javascript
class ProjectAnalyzer {
  async analyzeProject(projectPath) {
    // Returns: { type, language, frameworks, dependencies, features }
  }
  
  async detectLanguage(projectPath) {
    // Detect primary language
  }
  
  async detectFrameworks(projectPath) {
    // Detect frameworks in use
  }
  
  async detectProjectType(projectPath) {
    // web, cli, library, mobile, etc.
  }
}
```

### Task 3: Create Subagent Registry Module
**File**: `devassist-isolation/lib/subagent-registry.js`
```javascript
class SubagentRegistry {
  register(subagent) {
    // Register a new subagent
  }
  
  getSubagentsForProject(projectAnalysis) {
    // Return matching subagents
  }
  
  resolveDependencies(subagents) {
    // Handle subagent dependencies
  }
}
```

### Task 4: Update Initialization Script
**File**: `/Users/danielconnolly/bin/devassist-init`
- [ ] Update to use new simplified structure
- [ ] Remove project-specific command generation
- [ ] Ensure proper .mcp.json creation
- [ ] Update generated documentation

### Task 5: Create Test Suite
**File**: `devassist-isolation/tests/sprint-01/`
- [ ] Unit tests for ProjectAnalyzer
- [ ] Unit tests for SubagentRegistry  
- [ ] Integration tests for command flow
- [ ] Performance benchmarks

## 📊 Definition of Done

### Code Complete
- [ ] All code written and committed
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Clean code (no console.logs, commented code removed)

### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Performance benchmarks met

### Documentation
- [ ] Code is commented
- [ ] API documentation updated
- [ ] User guide updated
- [ ] Sprint retrospective completed

## 🧪 Test Plan

### Unit Tests
1. **ProjectAnalyzer Tests**
   - Test Node.js project detection
   - Test Python project detection
   - Test framework detection (React, Vue, Django)
   - Test edge cases (empty project, mixed languages)

2. **SubagentRegistry Tests**
   - Test registration
   - Test lookup by triggers
   - Test dependency resolution
   - Test duplicate handling

### Integration Tests
1. **End-to-End Flow**
   - Run `/initproject` in test project
   - Verify only 2 commands created
   - Run `/session-start-test`
   - Verify project analysis runs
   - Verify correct subagents identified

### Performance Tests
1. **Analysis Speed**
   - Small project (< 100 files): < 1 second
   - Medium project (100-1000 files): < 3 seconds
   - Large project (> 1000 files): < 5 seconds

## 📁 Deliverables

### Code Deliverables
- [ ] `lib/project-analyzer.js` - Complete and tested
- [ ] `lib/subagent-registry.js` - Complete and tested
- [ ] Updated `server.js` with simplified commands
- [ ] Updated `devassist-init` script

### Test Deliverables  
- [ ] Unit test suite in `tests/sprint-01/unit/`
- [ ] Integration tests in `tests/sprint-01/integration/`
- [ ] Performance benchmarks in `tests/sprint-01/performance/`

### Documentation Deliverables
- [ ] Updated README with new architecture
- [ ] API documentation for new modules
- [ ] Migration guide from old system

## 🚀 Sprint Kickoff Checklist

### Pre-Sprint
- [ ] Review previous sprint (Sprint 1 from old approach)
- [ ] Set up sprint branch: `sprint-01-core-refactor`
- [ ] Clear any blocking issues
- [ ] Review this plan with stakeholder

### Environment Setup
- [ ] Clean test environment ready
- [ ] All dependencies installed
- [ ] Previous template backed up
- [ ] Claude Code ready for testing

### Team Sync (even if working solo)
- [ ] Sprint goal is clear
- [ ] Success criteria understood
- [ ] Risks identified
- [ ] Questions answered

## 🎯 Success Metrics

### Quantitative
- Command reduction: From N custom commands to 2 per project
- Analysis speed: < 3 seconds for medium projects
- Test coverage: > 90%
- Zero regression bugs

### Qualitative  
- Simpler mental model for users
- Cleaner codebase
- Foundation ready for smart features
- Easy to extend with new subagents

## 🔴 Risks & Mitigations

### Risk 1: Breaking Existing Projects
**Mitigation**: Create migration script, test thoroughly

### Risk 2: Performance Issues with Analysis
**Mitigation**: Implement caching, use incremental analysis

### Risk 3: Claude Code Command Registration Issues
**Mitigation**: Test extensively, have rollback plan

## 📝 Sprint Notes

### Daily Standup Template
```
Date: ____
Yesterday: 
Today:
Blockers:
```

### Sprint Retrospective Questions
1. What went well?
2. What could be improved?
3. What will we commit to doing differently?
4. Technical debt introduced?
5. Technical debt resolved?

---

**Sprint Status**: READY TO START
**Next Sprint**: Sprint 2 - Dynamic Loading System