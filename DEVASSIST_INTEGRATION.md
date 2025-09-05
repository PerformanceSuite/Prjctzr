# DevAssist MCP Integration

## Architecture

DevAssist MCP is integrated into Prjctzr as a git submodule, maintaining separation while enabling tight coupling.

### Repository Structure

```
Prjctzr/                              # Main orchestration repository
├── devassist-mcp/                    # DevAssist MCP (git submodule)
│   ├── index.js                      # MCP server
│   ├── src/                          # Core functionality
│   └── data/                         # Vector database
│
├── devassist-isolation/              # Smart isolation development
│   └── [Uses DevAssist as foundation]
│
└── bin/devassist-init               # Initialization script
    └── [Deploys DevAssist to projects]
```

## Integration Points

### 1. Project Initialization
When `/initproject` runs, it:
- Copies DevAssist server to `.devassist/` in target project
- Creates isolated configuration
- Sets up project-specific MCP server

### 2. Smart Isolation
The devassist-isolation system:
- Extends DevAssist with behavioral modes
- Adds subagent detection
- Maintains complete project isolation

### 3. Development Workflow

#### Working on Prjctzr with DevAssist
```bash
# Clone with submodules
git clone --recursive https://github.com/PerformanceSuite/Prjctzr.git

# Or if already cloned
git submodule init
git submodule update
```

#### Updating DevAssist
```bash
# Update to latest DevAssist
cd devassist-mcp
git pull origin main
cd ..
git add devassist-mcp
git commit -m "Update DevAssist MCP to latest version"
git push
```

#### Making DevAssist Changes
```bash
# Work in the submodule
cd devassist-mcp
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "Your changes"
git push origin feature/your-feature

# Then update Prjctzr to point to new commit
cd ..
git add devassist-mcp
git commit -m "Update DevAssist with new feature"
git push
```

## Synchronization Strategy

### DevAssist Repository
- **URL**: https://github.com/PerformanceSuite/devassist-mcp.git
- **Purpose**: Standalone MCP server for project memory
- **Updates**: Can be used independently of Prjctzr

### Prjctzr Repository  
- **URL**: https://github.com/PerformanceSuite/Prjctzr.git
- **Purpose**: Complete project initialization system
- **Includes**: DevAssist as submodule for integrated development

### Best Practices

1. **DevAssist Changes**: Always commit to DevAssist repo first
2. **Version Pinning**: Prjctzr points to specific DevAssist commits
3. **Testing**: Test DevAssist changes standalone before updating Prjctzr
4. **Documentation**: Update both repos' docs when making changes

## Benefits of This Approach

### Separation of Concerns
- DevAssist remains a standalone tool
- Prjctzr orchestrates without contaminating DevAssist
- Clean API boundaries

### Synchronized Development
- Changes to DevAssist automatically available in Prjctzr
- Version control tracks exact DevAssist version used
- Easy rollback if needed

### Flexibility
- Other projects can use DevAssist without Prjctzr
- Prjctzr can swap DevAssist versions easily
- Independent release cycles

## Quick Commands

```bash
# Update submodule to latest
git submodule update --remote devassist-mcp

# Check submodule status
git submodule status

# Clone with submodules
git clone --recursive [repo-url]

# Initialize after regular clone
git submodule init && git submodule update
```

## Future Considerations

### When Smart Isolation is Complete
- May create devassist-smart as separate package
- Could become npm package instead of submodule
- Maintain backward compatibility

### Scaling Strategy
- Each major component could become submodule
- Enables modular development
- Simplifies testing and deployment