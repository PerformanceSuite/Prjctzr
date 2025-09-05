# PROJECT_NAME - JavaScript/TypeScript Project

This file provides guidance to Claude Code when working with this JavaScript/TypeScript project.

## Project Overview
**Project:** PROJECT_NAME
**Location:** PROJECT_PATH
**Type:** JavaScript/TypeScript
**DevAssist:** Initialized PROJECT_DATE

## Technology Stack
- **Language:** JavaScript/TypeScript
- **Package Manager:** npm/yarn/pnpm
- **Build Tools:** Detected automatically
- **Frameworks:** Will be detected (React, Vue, Angular, Express, etc.)

## Common Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Session Commands
After restarting Claude Code:
- `/session-start` - Start development session with DevAssist
- `/session-end` - End session with summary
- `/session-checkpoint` - Save progress checkpoint

## JavaScript/TypeScript Best Practices
- Use consistent code style (ESLint/Prettier)
- Write tests for critical functionality
- Keep dependencies up to date
- Use TypeScript for better type safety
- Follow component/module organization patterns

## Project Structure
```
PROJECT_NAME/
├── src/              # Source code
├── tests/            # Test files
├── dist/             # Build output
├── node_modules/     # Dependencies
├── package.json      # Project configuration
└── .devassist/       # DevAssist data (isolated)
```

## DevAssist Features
- Isolated knowledge base for this project
- Terminal logging in .devassist/terminal_logs/
- JavaScript-specific code analysis
- Framework detection and assistance
- npm/yarn command suggestions