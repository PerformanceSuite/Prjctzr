#!/bin/bash

# Prjctzr Installation Script
# Installs the DevAssist initialization system for project management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "======================================"
echo "    Prjctzr Installation Script"
echo "======================================"
echo ""

# Check for dependencies
echo -e "${BLUE}[*]${NC} Checking dependencies..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}[✗]${NC} Node.js is not installed"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}[✗]${NC} Git is not installed"
    echo "Please install Git first: https://git-scm.com/"
    exit 1
fi

echo -e "${GREEN}[✓]${NC} Dependencies satisfied"

# Create necessary directories
echo -e "${BLUE}[*]${NC} Creating directories..."
mkdir -p ~/bin
mkdir -p ~/.devassist

# Copy the main script
echo -e "${BLUE}[*]${NC} Installing DevAssist initialization script..."
cp ./bin/devassist-init ~/bin/
chmod +x ~/bin/devassist-init

# Create basic subagents configuration
echo -e "${BLUE}[*]${NC} Setting up subagent configuration..."
cat > ~/.devassist/subagents.json <<'EOF'
{
  "react": ["component-generator", "hook-analyzer", "state-manager"],
  "vue": ["component-builder", "composition-api-helper"],
  "angular": ["service-generator", "component-scaffolder"],
  "django": ["model-builder", "view-helper", "serializer-generator"],
  "flask": ["route-builder", "blueprint-helper"],
  "fastapi": ["endpoint-generator", "schema-builder"],
  "express": ["middleware-builder", "route-helper"],
  "nextjs": ["page-generator", "api-route-builder"],
  "docker": ["compose-assistant", "build-optimizer"],
  "kubernetes": ["manifest-generator", "helm-helper"],
  "terraform": ["module-builder", "provider-helper"],
  "aws": ["cdk-helper", "lambda-builder"],
  "testing": ["unit-test-generator", "e2e-helper"],
  "database": ["migration-helper", "query-optimizer"]
}
EOF

# Detect shell and update appropriate config
SHELL_NAME=$(basename "$SHELL")
echo -e "${BLUE}[*]${NC} Detected shell: $SHELL_NAME"

# Function to add to shell config if not already present
add_to_shell_config() {
    local config_file=$1
    local line=$2
    
    if [ -f "$config_file" ]; then
        if ! grep -q "$line" "$config_file"; then
            echo "$line" >> "$config_file"
            echo -e "${GREEN}[✓]${NC} Added to $config_file"
        else
            echo -e "${YELLOW}[!]${NC} Already configured in $config_file"
        fi
    fi
}

# Update PATH and create alias
case "$SHELL_NAME" in
    zsh)
        add_to_shell_config ~/.zshrc 'export PATH="$HOME/bin:$PATH"'
        add_to_shell_config ~/.zshrc 'alias /initproject="$HOME/bin/devassist-init"'
        ;;
    bash)
        add_to_shell_config ~/.bashrc 'export PATH="$HOME/bin:$PATH"'
        add_to_shell_config ~/.bashrc 'alias /initproject="$HOME/bin/devassist-init"'
        add_to_shell_config ~/.bash_profile 'export PATH="$HOME/bin:$PATH"'
        add_to_shell_config ~/.bash_profile 'alias /initproject="$HOME/bin/devassist-init"'
        ;;
    fish)
        mkdir -p ~/.config/fish
        echo 'set -gx PATH $HOME/bin $PATH' >> ~/.config/fish/config.fish
        echo 'alias /initproject="$HOME/bin/devassist-init"' >> ~/.config/fish/config.fish
        echo -e "${GREEN}[✓]${NC} Added to ~/.config/fish/config.fish"
        ;;
    *)
        echo -e "${YELLOW}[!]${NC} Unknown shell: $SHELL_NAME"
        echo "Please manually add the following to your shell configuration:"
        echo '  export PATH="$HOME/bin:$PATH"'
        echo '  alias /initproject="$HOME/bin/devassist-init"'
        ;;
esac

# Check if DevAssist MCP is installed
if [ -d "./devassist-mcp" ]; then
    echo -e "${BLUE}[*]${NC} Installing DevAssist MCP dependencies..."
    cd devassist-mcp
    npm install --silent
    cd ..
    echo -e "${GREEN}[✓]${NC} DevAssist MCP ready"
else
    echo -e "${YELLOW}[!]${NC} DevAssist MCP not found"
    echo "For full functionality, ensure devassist-mcp is in this directory"
fi

# Create uninstall script
echo -e "${BLUE}[*]${NC} Creating uninstall script..."
cat > ~/bin/prjctzr-uninstall <<'EOF'
#!/bin/bash
echo "Uninstalling Prjctzr..."
rm -f ~/bin/devassist-init
rm -f ~/bin/prjctzr-uninstall
rm -rf ~/.devassist
echo "Prjctzr uninstalled"
echo "Note: You may want to remove the alias from your shell config"
EOF
chmod +x ~/bin/prjctzr-uninstall

# Success message
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Installation Complete! 🎉          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Prjctzr has been successfully installed!"
echo ""
echo "Usage:"
echo "  1. Navigate to any project directory"
echo "  2. Run: /initproject"
echo "  3. Restart Claude Code"
echo "  4. Use /session-start to begin"
echo ""
echo "The /initproject command will:"
echo "  • Detect your project type and framework"
echo "  • Create an isolated DevAssist instance"
echo "  • Set up session management"
echo "  • Generate project documentation"
echo ""
echo -e "${YELLOW}Important:${NC} Restart your terminal or run:"
echo "  source ~/.$SHELL_NAME"rc
echo ""
echo "To uninstall later, run: prjctzr-uninstall"
echo ""