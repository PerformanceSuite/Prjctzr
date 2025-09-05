#!/bin/bash

# Generate project-specific slash commands for Claude Code
# This creates commands like /projectname-start, /projectname-end, etc.

set -e

# Get project name from current directory or parameter
PROJECT_NAME="${1:-$(basename "$(pwd)")}"
PROJECT_NAME_LOWER=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr -d ' -_')
PROJECT_PATH=$(pwd)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎯 Generating project-specific slash commands for: $PROJECT_NAME${NC}"
echo "=================================================="

# Ensure .claude/commands directory exists
mkdir -p .claude/commands

# Function to create a command file
create_command() {
    local cmd_name="$1"
    local cmd_desc="$2"
    local cmd_content="$3"
    
    cat > ".claude/commands/${PROJECT_NAME_LOWER}-${cmd_name}.md" << EOF
---
name: ${PROJECT_NAME_LOWER}-${cmd_name}
description: ${cmd_desc}
---

${cmd_content}
EOF
    
    echo -e "${GREEN}✅ Created /${PROJECT_NAME_LOWER}-${cmd_name}${NC}"
}

# 1. Project-specific start command
create_command "start" \
    "Start ${PROJECT_NAME} session with DevAssist warmup and verification" \
"# 🚀 Starting ${PROJECT_NAME} Development Session

I'll start a comprehensive session for ${PROJECT_NAME} with full DevAssist integration.

## Session Initialization
1. **DevAssist Verification** - Checking project-specific MCP server
2. **Terminal Logging** - Starting session recording
3. **Context Loading** - Loading previous session knowledge
4. **Subagent Warmup** - Verifying all project subagents
5. **Heartbeat System** - Activating 5-minute engagement checks

\`\`\`bash
# Starting session with DevAssist
mcp__devassist__session-start --project \"${PROJECT_NAME}\"
\`\`\`

After initialization:
- Use \`.devassist/scripts/claude-project.sh\` for terminal logging
- Session heartbeat will keep DevAssist engaged
- All work will be isolated to ${PROJECT_NAME}
- Previous context automatically loaded"

# 2. Project-specific end command
create_command "end" \
    "End ${PROJECT_NAME} session with git operations and cleanup" \
"# 🏁 Ending ${PROJECT_NAME} Development Session

I'll properly close the ${PROJECT_NAME} session with full cleanup and knowledge preservation.

## Session Closure Steps
1. **Knowledge Preservation** - Saving session insights
2. **Git Commit** - Auto-committing changes with intelligent message
3. **Terminal Log** - Finalizing session recording
4. **Cleanup Agent** - Removing temporary files
5. **Summary Generation** - Creating session summary

\`\`\`bash
# Ending session with cleanup
mcp__devassist__session-end --project \"${PROJECT_NAME}\"
\`\`\`

This will:
- Save all session knowledge to \`.devassist/data/\`
- Create git commit with session summary
- Archive terminal logs
- Clean up temporary files
- Generate PROJECT_SESSIONS.md entry"

# 3. Project-specific status command
create_command "status" \
    "Check ${PROJECT_NAME} session and DevAssist status" \
"# 📊 ${PROJECT_NAME} Session Status

Checking current session and DevAssist status for ${PROJECT_NAME}.

\`\`\`bash
mcp__devassist__session-status --project \"${PROJECT_NAME}\"
\`\`\`

This shows:
- Active session information
- DevAssist connection status
- Subagent verification
- Recent checkpoints
- Terminal log status
- Knowledge base statistics"

# 4. Project-specific checkpoint command
create_command "checkpoint" \
    "Save ${PROJECT_NAME} progress checkpoint" \
"# 💾 Creating ${PROJECT_NAME} Checkpoint

Saving a progress checkpoint for the current ${PROJECT_NAME} session.

\`\`\`bash
mcp__devassist__session_checkpoint --summary \"Progress checkpoint for ${PROJECT_NAME}\"
\`\`\`

Checkpoint includes:
- Current timestamp
- Git changes summary
- Work completed so far
- Next planned steps
- Session state preservation"

# 5. Project-specific memory search command
create_command "memory" \
    "Search ${PROJECT_NAME} knowledge base and decisions" \
"# 🧠 Searching ${PROJECT_NAME} Memory

I'll search the project knowledge base for relevant information.

\`\`\`bash
mcp__devassist__semantic_search --project \"${PROJECT_NAME}\" --query \"<your search query>\"
\`\`\`

This searches:
- Architectural decisions
- Code patterns
- Session summaries
- Documentation
- Previous implementations"

# 6. Project-specific decision command
create_command "decision" \
    "Record architectural decision for ${PROJECT_NAME}" \
"# 📝 Recording ${PROJECT_NAME} Architectural Decision

I'll record an architectural decision for the ${PROJECT_NAME} project.

\`\`\`bash
mcp__devassist__record_architectural_decision \\
    --project \"${PROJECT_NAME}\" \\
    --decision \"<decision made>\" \\
    --context \"<reasoning and context>\" \\
    --alternatives \"<alternatives considered>\" \\
    --impact \"<expected impact>\"
\`\`\`

This captures:
- Decision details
- Context and reasoning
- Alternatives considered
- Expected impact
- Timestamp and author"

# 7. Project-specific sprint check (heartbeat)
create_command "sprint" \
    "Quick ${PROJECT_NAME} sprint check (keeps DevAssist engaged)" \
"# ⚡ ${PROJECT_NAME} Sprint Check

Quick progress check to keep DevAssist engaged and maintain session momentum.

\`\`\`bash
mcp__devassist__sprint-check --message \"Continuing work on ${PROJECT_NAME}\"
\`\`\`

This heartbeat:
- Keeps DevAssist connection active
- Prevents session timeout
- Updates progress tracking
- Maintains context awareness"

# Create additional project-specific commands based on project type
detect_and_create_specialized_commands() {
    # Check for blockchain projects (Veria pattern)
    if [[ "$PROJECT_NAME_LOWER" == *"veria"* ]] || [[ "$PROJECT_NAME_LOWER" == *"blockchain"* ]] || [ -f "truffle-config.js" ] || [ -f "hardhat.config.js" ]; then
        create_command "blockchain" \
            "Manage ${PROJECT_NAME} blockchain operations" \
"# ⛓️ ${PROJECT_NAME} Blockchain Operations

Managing blockchain-specific operations for ${PROJECT_NAME}.

## Available Operations
- Deploy smart contracts
- Run blockchain tests
- Interact with contracts
- Check gas estimates
- Verify on-chain data

\`\`\`bash
# Example: Deploy contracts
cd contracts && truffle migrate --network development
\`\`\`"
    fi
    
    # Check for compliance projects (Performia pattern)
    if [[ "$PROJECT_NAME_LOWER" == *"performia"* ]] || [[ "$PROJECT_NAME_LOWER" == *"compliance"* ]]; then
        create_command "compliance" \
            "Manage ${PROJECT_NAME} compliance checks" \
"# 📋 ${PROJECT_NAME} Compliance Management

Running compliance checks and audits for ${PROJECT_NAME}.

## Compliance Features
- Security audit checks
- Code standard validation
- Dependency scanning
- License verification
- GDPR compliance

\`\`\`bash
# Run compliance suite
npm run compliance:check
\`\`\`"
    fi
    
    # Check for testing frameworks
    if [ -f "jest.config.js" ] || [ -f "vitest.config.js" ] || grep -q "\"test\"" package.json 2>/dev/null; then
        create_command "test" \
            "Run ${PROJECT_NAME} test suite" \
"# 🧪 ${PROJECT_NAME} Test Execution

Running the test suite for ${PROJECT_NAME}.

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
\`\`\`"
    fi
}

# Execute specialized command generation
detect_and_create_specialized_commands

# Generate a commands index file
cat > ".claude/commands/${PROJECT_NAME_LOWER}-commands.md" << EOF
# ${PROJECT_NAME} Slash Commands

## Core Commands
- \`/${PROJECT_NAME_LOWER}-start\` - Start development session
- \`/${PROJECT_NAME_LOWER}-end\` - End session with cleanup
- \`/${PROJECT_NAME_LOWER}-status\` - Check session status
- \`/${PROJECT_NAME_LOWER}-checkpoint\` - Save progress
- \`/${PROJECT_NAME_LOWER}-sprint\` - Quick heartbeat check

## Knowledge Commands
- \`/${PROJECT_NAME_LOWER}-memory\` - Search project knowledge
- \`/${PROJECT_NAME_LOWER}-decision\` - Record architectural decision

## Project-Specific Commands
EOF

# List any additional commands created
for cmd in .claude/commands/${PROJECT_NAME_LOWER}-*.md; do
    if [ -f "$cmd" ]; then
        basename="${cmd##*/}"
        cmdname="${basename%.md}"
        if [[ ! "$cmdname" =~ (start|end|status|checkpoint|sprint|memory|decision|commands) ]]; then
            echo "- \`/${cmdname}\` - Custom project command" >> ".claude/commands/${PROJECT_NAME_LOWER}-commands.md"
        fi
    fi
done

echo ""
echo -e "${GREEN}✅ Successfully generated project-specific slash commands!${NC}"
echo ""
echo -e "${BLUE}📋 Commands created:${NC}"
ls -1 .claude/commands/${PROJECT_NAME_LOWER}-*.md | while read cmd; do
    cmdname=$(basename "$cmd" .md)
    echo "  • /${cmdname}"
done

echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Restart Claude Code to load new commands"
echo "  2. Type '/' in Claude to see your project commands"
echo "  3. Use /${PROJECT_NAME_LOWER}-start to begin a session"
echo ""
echo -e "${GREEN}✨ Project commands ready for ${PROJECT_NAME}!${NC}"