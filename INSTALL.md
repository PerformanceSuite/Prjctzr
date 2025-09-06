# 🚀 Prjctzr Installation Guide

Complete installation instructions for setting up Prjctzr on your system.

## System Requirements

### Minimum Requirements
- **OS**: macOS 10.14+, Ubuntu 18.04+, or Windows 10 with WSL2
- **Node.js**: Version 16.0.0 or higher
- **Git**: Version 2.0 or higher
- **Disk Space**: 50MB free
- **RAM**: 512MB available

### Recommended
- **OS**: macOS 12+ or Ubuntu 22.04+
- **Node.js**: Version 18+ (LTS)
- **Claude Code**: Latest version
- **Terminal**: iTerm2 (macOS) or Windows Terminal

## Installation Methods

### Method 1: Quick Install (Recommended)

Run this one-liner in your terminal:

```bash
curl -sSL https://raw.githubusercontent.com/yourusername/Prjctzr/main/install.sh | bash
```

This will:
1. Clone the repository to `~/Projects/Prjctzr`
2. Set up the devassist-init script
3. Configure your shell alias
4. Run verification tests

### Method 2: Manual Installation

#### Step 1: Install Prerequisites

**macOS:**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and Git
brew install node git
```

**Ubuntu/Debian:**
```bash
# Update packages
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs git
```

**Windows (WSL2):**
```powershell
# First, install WSL2 from PowerShell as Administrator
wsl --install

# Then in WSL2 terminal, follow Ubuntu instructions above
```

#### Step 2: Clone Prjctzr

```bash
# Create Projects directory if it doesn't exist
mkdir -p ~/Projects
cd ~/Projects

# Clone the repository
git clone https://github.com/yourusername/Prjctzr.git
cd Prjctzr

# Initialize submodules (DevAssist MCP)
git submodule update --init --recursive
```

#### Step 3: Set Up the Script

```bash
# Create bin directory
mkdir -p ~/bin

# Copy the initialization script
cp ~/Projects/Prjctzr/bin/devassist-init ~/bin/
chmod +x ~/bin/devassist-init

# Ensure ~/bin is in PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc  # For Zsh (macOS default)
# OR
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc  # For Bash

# Reload shell configuration
source ~/.zshrc  # or source ~/.bashrc
```

#### Step 4: Create Alias

```bash
# Add the /initproject alias
echo 'alias /initproject="$HOME/bin/devassist-init"' >> ~/.zshrc
# OR for Bash
echo 'alias /initproject="$HOME/bin/devassist-init"' >> ~/.bashrc

# Reload configuration
source ~/.zshrc  # or source ~/.bashrc
```

#### Step 5: Verify Installation

```bash
# Test the command exists
which devassist-init

# Test the alias works
/initproject --help

# Run the test suite
cd ~/Projects/Prjctzr
./test-suite.sh
```

## Configuration

### Environment Variables (Optional)

Add to your shell configuration file (`~/.zshrc` or `~/.bashrc`):

```bash
# Custom Prjctzr home directory (default: ~/Projects/Prjctzr)
export PRJCTZR_HOME="$HOME/Projects/Prjctzr"

# Enable debug mode for troubleshooting
export PRJCTZR_DEBUG=1

# Custom templates directory
export PRJCTZR_TEMPLATES="$HOME/my-templates"
```

### Claude Code Configuration

1. **Install Claude Code** if not already installed:
   - Visit https://claude.ai/code
   - Follow installation instructions for your OS

2. **Configure MCP Servers** (optional):
   The `/initproject` command will create project-specific MCP configurations automatically.

## Verification

### Run Tests

```bash
cd ~/Projects/Prjctzr
./test-suite.sh
```

Expected output:
```
======================================
  Prjctzr Integration Test Suite
======================================
...
Tests Run:    10
Tests Passed: 10
Tests Failed: 0

✓ All tests passed!
```

### Test Project Initialization

```bash
# Create a test project
mkdir -p ~/test-project
cd ~/test-project
echo '{"name": "test", "dependencies": {"react": "^18.0.0"}}' > package.json

# Initialize with Prjctzr
/initproject

# Check created files
ls -la .devassist/
cat CLAUDE.md
```

## Updating

### Update to Latest Version

```bash
cd ~/Projects/Prjctzr
git pull origin main
git submodule update --init --recursive

# Re-run tests to verify
./test-suite.sh
```

### Check Version

```bash
/initproject --version
```

## Uninstallation

### Complete Removal

```bash
# Remove Prjctzr directory
rm -rf ~/Projects/Prjctzr

# Remove script
rm ~/bin/devassist-init

# Remove alias (manually edit ~/.zshrc or ~/.bashrc)
# Remove the line: alias /initproject="$HOME/bin/devassist-init"
```

### Keep Projects, Remove Prjctzr

Your initialized projects will continue to work even if you uninstall Prjctzr. To remove Prjctzr from a project:

```bash
cd ~/YourProject
rm -rf .devassist .sessions .mcp.json CLAUDE.md
```

## Troubleshooting Installation

### Command Not Found

```bash
# Verify script exists
ls -la ~/bin/devassist-init

# Check PATH
echo $PATH | grep -q "$HOME/bin" && echo "Path OK" || echo "Path missing ~/bin"

# Add to PATH if missing
export PATH="$HOME/bin:$PATH"
```

### Permission Denied

```bash
# Fix script permissions
chmod +x ~/bin/devassist-init

# Fix directory permissions
chmod 755 ~/bin
```

### Node.js Issues

```bash
# Check Node version
node --version  # Should be 16.0.0 or higher

# Update Node.js (macOS)
brew upgrade node

# Update Node.js (Ubuntu)
sudo npm install -g n
sudo n latest
```

### Submodule Issues

```bash
cd ~/Projects/Prjctzr
git submodule deinit -f .
git submodule update --init --recursive
```

## Platform-Specific Notes

### macOS
- Use iTerm2 for better terminal experience
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`

### Linux
- May need to install `build-essential`: `sudo apt install build-essential`
- Some distributions require manual Node.js repository setup

### Windows (WSL2)
- Ensure WSL2 is properly configured: `wsl --set-default-version 2`
- Use Windows Terminal for best experience
- File paths use Linux format inside WSL

## Getting Help

- **Issues**: Open an issue on GitHub
- **Documentation**: See USER_GUIDE.md
- **Test Suite**: Run `./test-suite.sh` to diagnose issues

---

*Installation typically takes less than 2 minutes on a standard internet connection.*