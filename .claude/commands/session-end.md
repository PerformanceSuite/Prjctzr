# /session-end

Ends the current Prjctzr development session with summary and context preservation.

## What this does:
1. Summarizes work completed in current session
2. Updates SESSION_LOG.md with completion status
3. Documents any blockers or pending items
4. Creates handoff notes for next session
5. Archives session data for future reference

## Usage:
Just type: `/session-end`

This will:
- Prompt for session summary if not provided
- Update progress metrics in ROADMAP.md
- Document completed tasks and remaining work
- Create TODO items for next session
- Generate session statistics

## Context preservation:
- Saves current working state
- Documents decisions made
- Records technical discoveries
- Notes for future sessions
- Updates project metrics