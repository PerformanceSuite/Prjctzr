# Prjctzr MCP Server 2.0

## Intelligent Project Initialization with Built-in Masking & Containerization

Prjctzr is a powerful MCP server that provides comprehensive project initialization with all modern best practices, containerization support, and an intelligent masking layer for optimized Claude integration.

## 🚀 Features

### Core Capabilities
- **One-command project setup** with all best practices
- **Intelligent project type detection** (Node, Python, Go, Rust, Fullstack)
- **Built-in tool masking** for optimized LLM interaction
- **Docker & Docker Compose** generation
- **Dagger CI/CD pipelines** creation
- **Template management** system with language-specific templates
- **Progressive enhancement** - add features to existing projects
- **Includes templates from Prjctzr v1** for backward compatibility

### What Gets Created

#### Project Structure
- ✅ Git repository with proper .gitignore
- ✅ Standard directory structure (src, tests, docs, etc.)
- ✅ README with project template
- ✅ LICENSE file
- ✅ Package manager configuration (package.json, pyproject.toml, go.mod, Cargo.toml)

#### Development Environment
- ✅ .devcontainer/devcontainer.json for VS Code
- ✅ Docker & docker-compose.yml
- ✅ .env.example with required variables
- ✅ Makefile with common commands
- ✅ Pre-commit hooks

#### CI/CD Pipeline
- ✅ GitHub Actions workflows
- ✅ GitLab CI configuration
- ✅ Dagger pipelines
- ✅ Multi-stage Dockerfiles
- ✅ Security scanning (Dependabot, CodeQL)

#### Documentation
- ✅ docs/ folder with MkDocs/Sphinx
- ✅ CONTRIBUTING.md
- ✅ CHANGELOG.md
- ✅ Architecture Decision Records (ADR)
- ✅ API documentation templates

#### Testing Infrastructure
- ✅ Test framework setup (Jest, Pytest, Go test, Cargo test)
- ✅ Example unit and integration tests
- ✅ Coverage reporting
- ✅ E2E testing structure

#### Code Quality
- ✅ Linters (ESLint, Black, Ruff, golangci-lint)
- ✅ Formatters (Prettier, Black, gofmt, rustfmt)
- ✅ EditorConfig
- ✅ Husky git hooks

## 📦 Installation

### As MCP Server (Claude Code)

Already configured in your Claude Code setup at:
```
/Users/danielconnolly/.config/claude/mcp_servers.json
```

### Docker Installation

```bash
cd /Users/danielconnolly/Projects/Custom_MCP/Prjctzr_MCP

# Build the image
docker build -t prjctzr-mcp .

# Run with docker-compose
docker-compose up -d

# Or run standalone
docker run -it --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  prjctzr-mcp
```

## 🎯 Usage

### Available Commands

#### `prjctzr:init`
Create a new project with all best practices:
```
prjctzr:init
  name: "my-awesome-app"
  type: "node"  # or python, go, rust, fullstack, auto
  features: ["docker", "ci", "monitoring"]
```

#### `prjctzr:enhance`
Add features to existing project:
```
prjctzr:enhance
  feature: "testing"  # or ci, monitoring, security, docs
  path: "./my-project"
```

#### `prjctzr:dockerize`
Add Docker support to existing project:
```
prjctzr:dockerize
  path: "./my-project"
  options: {
    multistage: true,
    alpine: true,
    compose: true
  }
```

#### `prjctzr:analyze`
Analyze project and get recommendations:
```
prjctzr:analyze
  path: "./my-project"
  detailed: true
```

#### `prjctzr:template`
Manage project templates:
```
prjctzr:template
  action: "list"  # or add, remove, update
```

## 🏗️ Architecture

### Tool Masking
Prjctzr implements a masking layer that:
- **Hides complexity** from Claude (system parameters, paths, etc.)
- **Simplifies interfaces** (only essential parameters exposed)
- **Injects system values** automatically
- **Filters outputs** to reduce token usage

### Containerization Strategy
- **Docker**: Multi-stage builds with Alpine Linux
- **Docker Compose**: Full development environment
- **Dagger**: Advanced CI/CD pipelines
- **Kubernetes**: Optional Helm charts and manifests

### Template System
- **Built-in templates** for common project types
- **Custom templates** support via volume mounting
- **Template versioning** and updates
- **Cookiecutter** compatibility

## 🐳 Container Features

### Included Tools
- Node.js, Python, Go, Rust toolchains
- Git, Make, Bash
- Docker & Docker Compose
- Dagger CLI
- Package managers (npm, pip, cargo, go mod)
- Linters and formatters
- Testing frameworks

### Volumes
- `/workspace` - Where projects are created
- `/app/templates` - Custom templates
- `/app/data` - Persistent metadata

### Environment Variables
```bash
DEFAULT_PROJECT_TYPE=auto
DEFAULT_LICENSE=MIT
GITHUB_TOKEN=your-token
DOCKER_REGISTRY=your-registry
```

## 🚀 Dagger Integration

Prjctzr automatically generates Dagger pipelines for:
- **Node.js**: Build, test, lint, security scan, Docker image
- **Python**: Poetry build, pytest, ruff, mypy, bandit
- **Go**: Build, test, golangci-lint, gosec
- **Rust**: Cargo build, test, clippy, fmt
- **Fullstack**: Frontend, backend, migrations, E2E tests

Example pipeline usage:
```bash
cd my-project
node dagger.mjs
```

## 📊 Metrics

The masking engine tracks:
- Total tool calls
- Success rate
- Average execution time
- Error rate

View metrics in Claude Code logs.

## 🔧 Development

### Project Structure
```
Prjctzr_MCP/
├── index.js              # Main MCP server
├── Dockerfile            # Multi-stage container
├── docker-compose.yml    # Orchestration
├── src/
│   ├── masking/         # Tool masking engine
│   ├── analyzer/        # Project analyzer
│   ├── initializer/     # Project initializer
│   ├── templates/       # Template manager
│   └── containers/      # Container manager
├── scripts/
│   └── dagger-pipeline.js  # Dagger generators
└── templates/           # Project templates
```

### Adding New Project Types

1. Add template to `templates/`
2. Update analyzer in `src/analyzer/`
3. Add Dagger pipeline in `scripts/dagger-pipeline.js`
4. Update Docker tools if needed

## 🎯 Benefits Over Manual Setup

1. **Consistency**: Same high-quality setup every time
2. **Speed**: Minutes instead of hours
3. **Best Practices**: Industry standards built-in
4. **No Configuration**: Works out of the box
5. **Extensible**: Easy to add new features
6. **Isolated**: No global tool pollution

## 📝 License

MIT

## 🤝 Contributing

See CONTRIBUTING.md for guidelines.

## 🔗 Related Projects

- [DevAssist](https://github.com/PerformanceSuite/DevAssist) - Development assistant with masking
- [ToolMasker](https://github.com/yourusername/toolmasker) - Tool masking research

---

**Note**: After making changes, restart Claude Code for the new configuration to take effect.
