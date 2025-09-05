# 📚 SuperClaude Framework Reference

## Location
`/Users/danielconnolly/Projects/SuperClaude/SuperClaude_Framework/`

## Structure Overview

```
SuperClaude_Framework/
├── SuperClaude/
│   ├── Agents/                    # Domain-specific personas
│   │   ├── backend-architect.md
│   │   ├── frontend-architect.md
│   │   ├── devops-architect.md
│   │   ├── security-engineer.md
│   │   ├── performance-engineer.md
│   │   ├── quality-engineer.md
│   │   └── ...
│   │
│   ├── Modes/                     # Behavioral modes
│   │   ├── MODE_Token_Efficiency.md
│   │   ├── MODE_Brainstorming.md
│   │   ├── MODE_Orchestration.md
│   │   ├── MODE_Task_Management.md
│   │   └── ...
│   │
│   ├── Commands/                  # Slash commands
│   │   ├── analyze.md
│   │   ├── brainstorm.md
│   │   ├── design.md
│   │   ├── refactor.md
│   │   └── ...
│   │
│   ├── MCP/                      # MCP integrations
│   └── Core/                     # Core functionality
│
├── Docs/                         # Documentation
├── scripts/                      # Setup and utility scripts
└── setup/                        # Installation files
```

## Key Concepts to Adapt

### 1. Agent Structure (Behavioral Personas)
**Location**: `SuperClaude/Agents/*.md`

Each agent file contains:
- Role definition
- Focus areas
- Behavioral instructions
- Domain-specific knowledge

**Example Pattern**:
```markdown
# Backend Architect Agent
You are now a backend architect. Focus on:
- API design patterns
- Database optimization
- Scalability considerations
- Security best practices
```

### 2. Mode Structure (Behavioral Modifications)
**Location**: `SuperClaude/Modes/MODE_*.md`

Modes inject specific behaviors:
- Token efficiency instructions
- Thinking patterns
- Output formatting
- Response strategies

**Example Pattern**:
```markdown
# Token Efficiency Mode
- Use abbreviations: cfg, impl, deps
- Prefer bullet points over paragraphs
- Focus on diffs rather than full files
- Batch operations together
```

### 3. Command Structure
**Location**: `SuperClaude/Commands/*.md`

Commands trigger specific workflows:
- Structured processes
- Step-by-step instructions
- Integration with modes/agents

## How We're Adapting These Concepts

### Our ProjectAnalyzer → SuperClaude Agents
```javascript
// We detect project type and generate appropriate persona
if (projectType === 'react') {
  return frontendArchitectPersona;
}
```

### Our Behavioral Modes → SuperClaude Modes
```javascript
// We generate project-specific behavioral modes
generateBehavioralMode(projectAnalysis) {
  // Combines SuperClaude mode patterns with project context
}
```

### Our Subagents → SuperClaude Agents + Commands
```javascript
// Subagents combine agent personas with command workflows
class APISubagent {
  persona = 'backend-architect';
  workflow = 'api-design-pattern';
  mode = 'token-efficiency';
}
```

## Key Files to Reference

### For Behavioral Patterns
- `/Agents/frontend-architect.md` - Frontend focus areas
- `/Agents/backend-architect.md` - Backend patterns
- `/Agents/security-engineer.md` - Security considerations

### For Mode Implementation
- `/Modes/MODE_Token_Efficiency.md` - Token optimization
- `/Modes/MODE_Orchestration.md` - Multi-step workflows
- `/Modes/MODE_Task_Management.md` - Task organization

### For Command Workflows
- `/Commands/analyze.md` - Analysis patterns
- `/Commands/refactor.md` - Refactoring approach
- `/Commands/design.md` - Design thinking

## Integration Points

### 1. Behavioral Generation
When our `ProjectAnalyzer` detects patterns, reference SuperClaude agents for appropriate behavioral instructions.

### 2. Mode Activation
When activating project-specific modes, use SuperClaude mode patterns as templates.

### 3. Workflow Definition
When defining subagent workflows, reference SuperClaude command structures.

## Quick Access Commands

```bash
# View an agent
cat /Users/danielconnolly/Projects/SuperClaude/SuperClaude_Framework/SuperClaude/Agents/frontend-architect.md

# View a mode
cat /Users/danielconnolly/Projects/SuperClaude/SuperClaude_Framework/SuperClaude/Modes/MODE_Token_Efficiency.md

# View a command
cat /Users/danielconnolly/Projects/SuperClaude/SuperClaude_Framework/SuperClaude/Commands/analyze.md
```

## Notes

- SuperClaude uses markdown files for behavioral injection
- We're adapting this to dynamic generation based on project analysis
- The key insight: Combine SuperClaude's static behaviors with our dynamic detection

---

**Reference this document when implementing behavioral aspects of Smart DevAssist Isolation**