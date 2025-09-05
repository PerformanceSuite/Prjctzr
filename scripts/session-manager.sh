#!/bin/bash

# Prjctzr Session Manager
# Manages development sessions without DevAssist dependency

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SESSION_LOG="$PROJECT_ROOT/SESSION_LOG.md"
ROADMAP="$PROJECT_ROOT/ROADMAP.md"
CURRENT_SPRINT="$PROJECT_ROOT/docs/sprints/SPRINT_01.md"
SESSION_DIR="$PROJECT_ROOT/.sessions"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Ensure directories exist
mkdir -p "$SESSION_DIR"

# Function to start session
start_session() {
    echo -e "${BLUE}🚀 Starting Prjctzr Development Session${NC}"
    echo "======================================="
    
    # Get timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
    DATE=$(date '+%Y-%m-%d')
    
    # Create session file
    SESSION_FILE="$SESSION_DIR/session_${DATE}_$(date +%s).json"
    
    # Load recent context
    echo -e "\n${YELLOW}📋 Recent Session Activity:${NC}"
    grep -A 5 "^## " "$SESSION_LOG" | head -20 || echo "No recent sessions"
    
    # Check current sprint
    echo -e "\n${YELLOW}🎯 Current Sprint Status:${NC}"
    if [ -f "$CURRENT_SPRINT" ]; then
        grep "^**Status:" "$CURRENT_SPRINT" || echo "Sprint status not found"
        grep "^**Sprint Goal:" "$CURRENT_SPRINT" || echo "Sprint goal not found"
    fi
    
    # Show project metrics
    echo -e "\n${YELLOW}📊 Project Metrics:${NC}"
    grep "Overall Progress:" "$ROADMAP" || echo "Metrics not found"
    
    # Create session entry
    cat > "$SESSION_FILE" << EOF
{
  "start_time": "$TIMESTAMP",
  "date": "$DATE",
  "status": "active",
  "goals": [],
  "completed": [],
  "blockers": []
}
EOF
    
    echo -e "\n${GREEN}✅ Session started successfully!${NC}"
    echo -e "Session file: $SESSION_FILE"
    echo -e "\n${BLUE}Ready for Sprint 1: Core Architecture Refactor${NC}"
    echo -e "Use ${YELLOW}/session-end${NC} when finished to save progress"
}

# Function to generate commit message based on changes
generate_commit_message() {
    # Get git status and diff summary
    local changes=$(git status --short | head -10)
    local diff_stat=$(git diff --stat | tail -1)
    local session_date=$(date '+%Y-%m-%d')
    
    # Check SESSION_LOG.md for recent activities
    local recent_activities=""
    if [ -f "$SESSION_LOG" ]; then
        # Get the most recent session entry activities
        recent_activities=$(grep -A 10 "^## $session_date" "$SESSION_LOG" | grep "^- " | head -5 | sed 's/^- //' | tr '\n' ', ' | sed 's/, $//')
    fi
    
    # Analyze changes to determine commit type
    local commit_type="Update"
    if echo "$changes" | grep -q "^A.*\.js"; then
        commit_type="Add"
    elif echo "$changes" | grep -q "^M.*session.*"; then
        commit_type="Session"
    elif echo "$changes" | grep -q "^M.*sprint"; then
        commit_type="Sprint"
    elif echo "$changes" | grep -q "docs/"; then
        commit_type="Docs"
    fi
    
    # Build commit message
    local message=""
    
    # Check current sprint status
    if [ -f "$CURRENT_SPRINT" ]; then
        local sprint_name=$(grep "^# " "$CURRENT_SPRINT" | head -1 | sed 's/# .* //')
        if [ -n "$sprint_name" ]; then
            message="$commit_type: $sprint_name progress"
        fi
    fi
    
    # Fallback to generic message if needed
    if [ -z "$message" ]; then
        message="$commit_type: Development session $(date '+%H:%M')"
    fi
    
    # Add details if available
    if [ -n "$recent_activities" ]; then
        message="$message - ${recent_activities:0:100}"
    else
        # Use file change summary
        local files_changed=$(echo "$diff_stat" | grep -oE '[0-9]+ file' | cut -d' ' -f1)
        if [ -n "$files_changed" ]; then
            message="$message ($files_changed files)"
        fi
    fi
    
    echo "$message"
}

# Function to end session
end_session() {
    echo -e "${BLUE}📝 Ending Prjctzr Development Session${NC}"
    echo "======================================"
    
    # Find active session
    ACTIVE_SESSION=$(find "$SESSION_DIR" -name "*.json" -type f -exec grep -l '"status": "active"' {} \; | head -1)
    
    if [ -z "$ACTIVE_SESSION" ]; then
        echo -e "${RED}No active session found${NC}"
        return 1
    fi
    
    # Get session start time
    START_TIME=$(grep '"start_time"' "$ACTIVE_SESSION" | cut -d'"' -f4)
    END_TIME=$(date '+%Y-%m-%d %H:%M')
    
    # Update session file
    sed -i '' 's/"status": "active"/"status": "completed"/' "$ACTIVE_SESSION"
    
    # Add end time to session
    echo "  \"end_time\": \"$END_TIME\"" >> "$ACTIVE_SESSION"
    
    echo -e "${GREEN}✅ Session ended successfully!${NC}"
    echo -e "Duration: $START_TIME to $END_TIME"
    
    # Git commit and push
    echo -e "\n${BLUE}📤 Committing and pushing changes...${NC}"
    
    # Check if there are changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        # Stage all changes
        git add -A
        
        # Generate commit message
        COMMIT_MSG=$(generate_commit_message)
        echo -e "${YELLOW}Commit message: $COMMIT_MSG${NC}"
        
        # Commit changes
        git commit -m "$COMMIT_MSG" > /dev/null 2>&1
        
        # Push to remote
        if git push origin main 2>/dev/null; then
            echo -e "${GREEN}✅ Changes pushed to GitHub successfully!${NC}"
        else
            # Try to set upstream if needed
            if git push -u origin main 2>/dev/null; then
                echo -e "${GREEN}✅ Changes pushed to GitHub successfully!${NC}"
            else
                echo -e "${YELLOW}⚠️  Could not push to remote. You may need to push manually.${NC}"
            fi
        fi
        
        # Show what was committed
        echo -e "\n${BLUE}📊 Committed changes:${NC}"
        git log --oneline -1
        git diff --stat HEAD~1
    else
        echo -e "${YELLOW}No changes to commit${NC}"
    fi
}

# Function to show session status
session_status() {
    echo -e "${BLUE}📊 Prjctzr Session Status${NC}"
    echo "========================"
    
    # Check for active session
    ACTIVE_SESSION=$(find "$SESSION_DIR" -name "*.json" -type f -exec grep -l '"status": "active"' {} \; | head -1)
    
    if [ -n "$ACTIVE_SESSION" ]; then
        echo -e "${GREEN}Active session found:${NC}"
        START_TIME=$(grep '"start_time"' "$ACTIVE_SESSION" | cut -d'"' -f4)
        echo "Started: $START_TIME"
    else
        echo -e "${YELLOW}No active session${NC}"
    fi
    
    # Show recent sessions
    echo -e "\n${BLUE}Recent Sessions:${NC}"
    ls -lt "$SESSION_DIR"/*.json 2>/dev/null | head -5 || echo "No sessions found"
    
    # Show current sprint
    echo -e "\n${BLUE}Current Development:${NC}"
    echo "Sprint 1: Core Architecture Refactor"
    echo "Focus: ProjectAnalyzer and SubagentRegistry"
}

# Main command handler
case "${1:-}" in
    start)
        start_session
        ;;
    end)
        end_session
        ;;
    status)
        session_status
        ;;
    *)
        echo "Prjctzr Session Manager"
        echo "Usage: $0 {start|end|status}"
        echo ""
        echo "Commands:"
        echo "  start  - Start a new development session"
        echo "  end    - End current session and save progress"
        echo "  status - Show current session status"
        ;;
esac