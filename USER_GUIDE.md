# 📘 Prjctzr User Guide

> The complete guide to using Prjctzr for intelligent project initialization with DevAssist

## Table of Contents
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Framework Detection](#framework-detection)
- [Session Management](#session-management)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Quick Start

Initialize any project with DevAssist in 3 simple steps:

```bash
# 1. Navigate to your project
cd ~/Projects/YourProject

# 2. Run initialization
/initproject

# 3. Restart Claude Code and start session
claude
/session-start
```

That's it! Your project now has an isolated DevAssist instance with intelligent framework detection.

## Installation

### Prerequisites
- macOS, Linux, or WSL on Windows
- Node.js installed (version 16 or higher)
- Claude Code (claude.ai/code)
- Git

### Setup Steps

1. **Clone Prjctzr repository:**
```bash
cd ~/Projects
git clone https://github.com/yourusername/Prjctzr.git
cd Prjctzr
git submodule update --init --recursive
```

2. **Create the initialization command:**
```bash
# Create alias for easy access
echo 'alias /initproject="$HOME/bin/devassist-init"' >> ~/.zshrc
source ~/.zshrc
```

3. **Verify installation:**
```bash
/initproject --version
```

## Usage

### Basic Initialization

Navigate to any project directory and run:
```bash
/initproject
```

The script will:
- ✅ Detect your project type (JavaScript, Python, Go, etc.)
- ✅ Identify frameworks (React, Django, Express, etc.)
- ✅ Create isolated DevAssist configuration
- ✅ Generate project-specific documentation
- ✅ Set up session management

### What Gets Created

After initialization, your project will have:

```
YourProject/
├── .devassist/           # DevAssist configuration
│   ├── server.js         # Isolated MCP server
│   ├── data/            # Project memory (vector DB)
│   ├── scripts/         # Utility scripts
│   └── terminal_logs/   # Session recordings
├── .mcp.json            # MCP configuration
├── .sessions/           # Session history
└── CLAUDE.md           # Project guidance with framework commands
```

## Framework Detection

Prjctzr automatically detects and configures for:

### JavaScript/TypeScript
- **React** - Detects react/react-dom dependencies
- **Vue** - Detects vue or nuxt
- **Angular** - Detects @angular/core
- **Next.js** - Detects next framework
- **Express** - Detects express server
- **Svelte** - Detects svelte compiler

### Python
- **Django** - Detects manage.py or django in requirements
- **Flask** - Detects app.py or flask in requirements
- **FastAPI** - Detects fastapi with main.py
- **Streamlit** - Detects streamlit dependency

### Go
- **Gin** - Detects gin-gonic/gin
- **Echo** - Detects labstack/echo
- **Fiber** - Detects gofiber/fiber
- **Gorilla/Mux** - Detects gorilla/mux

### DevOps
- **Docker** - Detects Dockerfile or docker-compose
- **Kubernetes** - Detects k8s configurations

## Session Management

After initialization, use these commands in Claude Code:

### Start a Session
```bash
/session-start
```
- Loads project context
- Restores previous session state
- Activates DevAssist memory

### Save Progress
```bash
/session-checkpoint "Implemented user authentication"
```
- Creates a checkpoint
- Saves current context
- Useful for long sessions

### End Session
```bash
/session-end
```
- Saves all progress
- Creates session summary
- Preserves context for next time

### Enhanced Terminal Logging
For recorded terminal sessions:
```bash
.devassist/scripts/claude-project.sh
```
Instead of regular `claude` command.

## Troubleshooting

### Common Issues

**"Node.js is not installed"**
- Install Node.js from https://nodejs.org/
- Or use homebrew: `brew install node`

**"DevAssist already initialized"**
- This is normal - project is already set up
- To reinitialize: `rm -rf .devassist .mcp.json`

**"No write permission"**
- Check directory permissions: `ls -la`
- Fix with: `chmod u+w .`

**Framework not detected**
- Ensure package.json or requirements.txt exists
- Check dependencies are listed correctly
- Generic template will be used as fallback

### Performance

Initialization typically takes:
- < 0.2 seconds for detection
- < 1 second total including file creation
- If slower, check disk space and permissions

## FAQ

**Q: Can I use this with existing projects?**
A: Yes! Prjctzr works with any project, new or existing.

**Q: Will it modify my existing files?**
A: No, it only creates new files (.devassist/, .mcp.json, CLAUDE.md) and updates .gitignore.

**Q: Can I have multiple projects initialized?**
A: Yes, each project gets its own isolated DevAssist instance.

**Q: How do I update Prjctzr?**
A: Pull latest changes: `cd ~/Projects/Prjctzr && git pull`

**Q: Is my project data private?**
A: Yes, all DevAssist data stays local in your project's .devassist/ directory.

**Q: Can I customize the templates?**
A: Yes, modify templates in ~/Projects/Prjctzr/templates/

**Q: What if my framework isn't detected?**
A: It will use a generic template. Request support by opening an issue.

## Advanced Usage

### Custom Templates

Create custom templates for your stack:
```bash
cd ~/Projects/Prjctzr/templates
mkdir mystack
# Create your CLAUDE.md template
```

### Environment Variables

```bash
# Custom Prjctzr location
export PRJCTZR_HOME=/custom/path/Prjctzr

# Enable debug output
export PRJCTZR_DEBUG=1
```

### Testing

Run the test suite to verify everything works:
```bash
cd ~/Projects/Prjctzr
./test-suite.sh
```

## Support

- **Issues**: GitHub Issues (link)
- **Documentation**: This guide and CLAUDE.md files
- **Updates**: Check ROADMAP.md for upcoming features

---

*Prjctzr - Making AI-assisted development smarter, one project at a time.*