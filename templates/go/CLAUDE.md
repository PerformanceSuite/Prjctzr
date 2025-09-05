# PROJECT_NAME - Go Project

This file provides guidance to Claude Code when working with this Go project.

## Project Overview
**Project:** PROJECT_NAME
**Location:** PROJECT_PATH
**Type:** Go
**DevAssist:** Initialized PROJECT_DATE

## Technology Stack
- **Language:** Go
- **Module System:** Go Modules
- **Version:** Go 1.20+ recommended
- **Frameworks:** Will be detected (Gin, Echo, Fiber, etc.)

## Common Commands
```bash
# Initialize module (if needed)
go mod init PROJECT_NAME

# Download dependencies
go mod download

# Tidy dependencies
go mod tidy

# Run application
go run main.go
# or
go run .

# Build application
go build -o PROJECT_NAME

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Format code
go fmt ./...

# Lint code
golangci-lint run
```

## Session Commands
After restarting Claude Code:
- `/session-start` - Start development session with DevAssist
- `/session-end` - End session with summary
- `/session-checkpoint` - Save progress checkpoint

## Go Best Practices
- Follow Go conventions and idioms
- Use meaningful package names
- Write table-driven tests
- Handle errors explicitly
- Use go fmt for consistent formatting
- Keep interfaces small
- Document exported functions and types
- Use go mod for dependency management

## Project Structure
```
PROJECT_NAME/
├── cmd/                 # Command line apps
│   └── PROJECT_NAME/    # Main application
├── internal/            # Private packages
├── pkg/                 # Public packages
├── api/                 # API definitions
├── web/                 # Web assets
├── scripts/             # Build/install scripts
├── test/                # Integration tests
├── go.mod              # Module definition
├── go.sum              # Dependency checksums
└── .devassist/         # DevAssist data (isolated)
```

## DevAssist Features
- Isolated knowledge base for this project
- Terminal logging in .devassist/terminal_logs/
- Go-specific code analysis
- Framework detection (Gin, Echo, Fiber)
- Go module command suggestions
- Test coverage tracking