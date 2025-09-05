# /session-start

Starts a new Prjctzr development session with context loading and session tracking.

## What this does:
1. Loads recent session history from SESSION_LOG.md
2. Reviews current sprint status and tasks
3. Checks project state and pending work
4. Creates timestamped session entry
5. Loads relevant context for current development phase

## Usage:
Just type: `/session-start`

This will:
- Review the last 3 session entries
- Load current sprint documentation
- Check TODO status from previous session
- Display project metrics and progress
- Set up context for productive work

## Session tracking:
- Updates SESSION_LOG.md with new session start
- Tracks session goals and progress
- Maintains running history of all work
- Helps with context switching and handoffs