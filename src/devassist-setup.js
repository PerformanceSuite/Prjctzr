/**
 * DevAssist Setup Module for Prjctzr
 * Prepares complete DevAssist infrastructure during project initialization
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DevAssistSetup {
  constructor() {
    this.setupComplete = false;
  }

  /**
   * Main setup orchestration - called by Prjctzr when devassist feature is enabled
   */
  async setupDevAssist(projectPath, projectName, projectType, detectedTechnologies) {
    console.log('🔧 Setting up DevAssist infrastructure...');
    
    try {
      // 1. Create directory structure
      await this.createDirectoryStructure(projectPath);
      
      // 2. Create configuration
      await this.createConfiguration(projectPath, projectName, projectType, detectedTechnologies);
      
      // 3. Create subagents based on detected tech
      await this.createSubagents(projectPath, detectedTechnologies);
      
      // 4. Setup documentation
      await this.setupDocumentation(projectPath, projectName, detectedTechnologies);
      
      // 5. Initialize databases
      await this.initializeDatabases(projectPath);
      
      // 6. Setup git integration
      await this.setupGitIntegration(projectPath);
      
      // 7. Create initial session template
      await this.createSessionTemplate(projectPath, projectName);
      
      // 8. Fetch and cache technology docs
      await this.fetchTechnologyDocs(projectPath, detectedTechnologies);
      
      this.setupComplete = true;
      
      return {
        success: true,
        message: `✅ DevAssist infrastructure ready for ${projectName}`,
        structure: {
          config: path.join(projectPath, '.devassist', 'config.json'),
          agents: path.join(projectPath, '.devassist', 'agents'),
          docs: path.join(projectPath, '.devassist', 'docs'),
          data: path.join(projectPath, '.devassist', 'data')
        }
      };
      
    } catch (error) {
      console.error('❌ DevAssist setup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create complete .devassist directory structure
   */
  async createDirectoryStructure(projectPath) {
    const directories = [
      '.devassist/data',
      '.devassist/sessions',
      '.devassist/decisions',
      '.devassist/vectors',
      '.devassist/agents',
      '.devassist/docs',
      '.devassist/tech-docs',
      '.devassist/logs',
      '.devassist/artifacts',
      '.devassist/reports',
      '.devassist/templates',
      '.devassist/cache',
      '.claude/commands'  // Add Claude Code commands directory
    ];
    
    for (const dir of directories) {
      const fullPath = path.join(projectPath, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
    
    console.log('  ✓ Created DevAssist directory structure');
    
    // Copy Claude Code slash command files
    await this.copyClaudeCommands(projectPath);
  }

  /**
   * Copy Claude Code slash command files
   */
  async copyClaudeCommands(projectPath) {
    try {
      // Get the source directory (Prjctzr's .claude/commands)
      const sourceDir = path.join(path.dirname(path.dirname(import.meta.url.replace('file://', ''))), '.claude', 'commands');
      const targetDir = path.join(projectPath, '.claude', 'commands');
      
      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });
      
      // Copy all command files
      const commandFiles = ['prjctzr.md', 'start-session.md', 'end-session.md'];
      
      for (const file of commandFiles) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        try {
          await fs.copyFile(sourcePath, targetPath);
        } catch (err) {
          console.warn(`  ⚠ Could not copy ${file}: ${err.message}`);
        }
      }
      
      console.log('  ✓ Copied Claude Code slash commands');
    } catch (error) {
      console.warn('  ⚠ Could not copy Claude commands:', error.message);
    }
  }

  /**
   * Create DevAssist configuration file
   */
  async createConfiguration(projectPath, projectName, projectType, technologies) {
    const config = {
      version: '3.0.0',
      project: {
        name: projectName,
        type: projectType,
        created: new Date().toISOString(),
        path: projectPath
      },
      technologies: technologies,
      features: {
        warmup: true,
        heartbeat: true,
        terminalLogging: true,
        autoCleanup: true,
        semanticSearch: true
      },
      settings: {
        warmupEnabled: true,
        heartbeatInterval: 300000, // 5 minutes
        maxSessionDuration: 14400000, // 4 hours
        autoCommitReminder: 1800000, // 30 minutes
        cleanupOnEnd: true
      },
      databases: {
        sqlite: {
          path: '.devassist/data/project.db',
          walMode: true
        },
        vectorDb: {
          path: '.devassist/vectors',
          dimensions: 384,
          model: 'all-MiniLM-L6-v2'
        }
      },
      subagents: [],
      initialized: new Date().toISOString()
    };
    
    const configPath = path.join(projectPath, '.devassist', 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    console.log('  ✓ Created DevAssist configuration');
    return config;
  }

  /**
   * Create project-specific subagents
   */
  async createSubagents(projectPath, technologies) {
    const agents = [];
    
    // Always create base agents
    agents.push(
      this.createGitAgent(),
      this.createTestAgent(technologies),
      this.createCleanupAgent()
    );
    
    // Technology-specific agents
    if (technologies.includes('Dagger')) {
      agents.push(this.createDaggerAgent());
    }
    
    if (technologies.includes('Kubernetes')) {
      agents.push(this.createKubernetesAgent());
    }
    
    if (technologies.includes('Docker')) {
      agents.push(this.createDockerAgent());
    }
    
    if (technologies.includes('Terraform')) {
      agents.push(this.createTerraformAgent());
    }
    
    // Language-specific agents
    if (technologies.includes('Node') || technologies.includes('JavaScript')) {
      agents.push(this.createNodeAgent());
    }
    
    if (technologies.includes('Python')) {
      agents.push(this.createPythonAgent());
    }
    
    if (technologies.includes('Go')) {
      agents.push(this.createGoAgent());
    }
    
    if (technologies.includes('Rust')) {
      agents.push(this.createRustAgent());
    }
    
    // Write all agents
    const agentsDir = path.join(projectPath, '.devassist', 'agents');
    for (const agent of agents) {
      const agentPath = path.join(agentsDir, agent.filename);
      await fs.writeFile(agentPath, agent.content, { mode: 0o755 });
    }
    
    console.log(`  ✓ Created ${agents.length} subagents`);
    return agents.map(a => a.name);
  }

  /**
   * Individual agent creators
   */
  createGitAgent() {
    return {
      name: 'git-workflow',
      filename: 'git-workflow.js',
      content: `#!/usr/bin/env node
// Git Workflow Agent
const { execSync } = require('child_process');

console.log('🔀 Git Workflow Agent Active');

try {
  // Check git status
  const status = execSync('git status --short', { encoding: 'utf8' });
  console.log('Git Status:', status || 'Clean working directory');
  
  // Recent commits
  const commits = execSync('git log --oneline -5', { encoding: 'utf8' });
  console.log('\\nRecent Commits:\\n', commits);
  
  // Current branch
  const branch = execSync('git branch --show-current', { encoding: 'utf8' });
  console.log('Current Branch:', branch.trim());
  
  // Check for uncommitted changes
  if (status) {
    console.log('\\n⚠️ You have uncommitted changes');
    console.log('Consider: git add . && git commit -m "message"');
  }
} catch (e) {
  console.error('Git error:', e.message);
}
`
    };
  }

  createDaggerAgent() {
    return {
      name: 'dagger-pipeline',
      filename: 'dagger-pipeline.js',
      content: `#!/usr/bin/env node
// Dagger Pipeline Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Dagger Pipeline Agent Active');

try {
  // Check Dagger installation
  const version = execSync('dagger version', { encoding: 'utf8' });
  console.log('Dagger Version:', version.trim());
  
  // Look for Dagger files
  const daggerFiles = ['dagger.json', 'dagger.cue', 'dagger.mjs'];
  const found = daggerFiles.filter(f => fs.existsSync(f));
  
  if (found.length > 0) {
    console.log('Found Dagger configs:', found.join(', '));
    console.log('\\nAvailable commands:');
    console.log('  dagger run <pipeline> - Execute pipeline');
    console.log('  dagger list - List available pipelines');
  } else {
    console.log('No Dagger configuration found');
    console.log('Initialize with: dagger init');
  }
  
  // Check for SDK
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.dependencies?.['@dagger.io/dagger']) {
      console.log('✓ Dagger SDK installed');
    }
  }
} catch (e) {
  console.error('Dagger not installed:', e.message);
  console.log('Install: curl -L https://dl.dagger.io/dagger/install.sh | sh');
}
`
    };
  }

  createKubernetesAgent() {
    return {
      name: 'k8s-manager',
      filename: 'k8s-manager.js',
      content: `#!/usr/bin/env node
// Kubernetes Manager Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('☸️ Kubernetes Manager Agent Active');

try {
  // Check kubectl
  const version = execSync('kubectl version --client --short', { encoding: 'utf8' });
  console.log('kubectl:', version.trim());
  
  // Current context
  const context = execSync('kubectl config current-context', { encoding: 'utf8' });
  console.log('Context:', context.trim());
  
  // Check for manifests
  const k8sDirs = ['k8s', 'kubernetes', 'manifests', 'deployments'];
  k8sDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      console.log(\`Found \${files.length} manifests in \${dir}/\`);
    }
  });
  
  // Check Helm
  try {
    const helmVersion = execSync('helm version --short', { encoding: 'utf8' });
    console.log('Helm:', helmVersion.trim());
  } catch {}
  
} catch (e) {
  console.error('kubectl not configured:', e.message);
  console.log('Install: https://kubernetes.io/docs/tasks/tools/');
}
`
    };
  }

  createDockerAgent() {
    return {
      name: 'docker-manager',
      filename: 'docker-manager.js',
      content: `#!/usr/bin/env node
// Docker Manager Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🐳 Docker Manager Agent Active');

try {
  // Check Docker
  const version = execSync('docker --version', { encoding: 'utf8' });
  console.log('Docker:', version.trim());
  
  // Check for Dockerfile
  if (fs.existsSync('Dockerfile')) {
    console.log('✓ Dockerfile found');
    
    // Check if image exists
    const projectName = path.basename(process.cwd());
    try {
      execSync(\`docker images \${projectName} --quiet\`);
      console.log(\`✓ Image '\${projectName}' exists\`);
    } catch {
      console.log(\`Image '\${projectName}' not built yet\`);
      console.log(\`Build with: docker build -t \${projectName} .\`);
    }
  }
  
  // Check docker-compose
  if (fs.existsSync('docker-compose.yml')) {
    console.log('✓ docker-compose.yml found');
    console.log('Commands: docker-compose up/down/logs');
  }
  
  // Running containers
  const containers = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}"', { encoding: 'utf8' });
  if (containers) {
    console.log('\\nRunning Containers:\\n', containers);
  }
  
} catch (e) {
  console.error('Docker error:', e.message);
}
`
    };
  }

  createTerraformAgent() {
    return {
      name: 'terraform-agent',
      filename: 'terraform-agent.js',
      content: `#!/usr/bin/env node
// Terraform Infrastructure Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏗️ Terraform Infrastructure Agent Active');

try {
  // Check Terraform
  const version = execSync('terraform version -json', { encoding: 'utf8' });
  const versionInfo = JSON.parse(version);
  console.log('Terraform:', versionInfo.terraform_version);
  
  // Check for Terraform files
  const tfFiles = fs.readdirSync('.').filter(f => f.endsWith('.tf'));
  if (tfFiles.length > 0) {
    console.log(\`Found \${tfFiles.length} Terraform files\`);
    
    // Check initialization
    if (fs.existsSync('.terraform')) {
      console.log('✓ Terraform initialized');
      
      // Check workspace
      const workspace = execSync('terraform workspace show', { encoding: 'utf8' });
      console.log('Workspace:', workspace.trim());
    } else {
      console.log('⚠️ Not initialized. Run: terraform init');
    }
  }
  
  console.log('\\nCommon commands:');
  console.log('  terraform plan - Preview changes');
  console.log('  terraform apply - Apply changes');
  console.log('  terraform destroy - Destroy infrastructure');
  
} catch (e) {
  console.error('Terraform error:', e.message);
}
`
    };
  }

  createTestAgent(technologies) {
    const testCommands = {
      'Node': 'npm test',
      'JavaScript': 'npm test',
      'Python': 'pytest',
      'Go': 'go test ./...',
      'Rust': 'cargo test'
    };
    
    const primaryLang = technologies.find(t => testCommands[t]) || 'Node';
    const testCommand = testCommands[primaryLang] || 'npm test';
    
    return {
      name: 'test-runner',
      filename: 'test-runner.js',
      content: `#!/usr/bin/env node
// Test Runner Agent
const { execSync } = require('child_process');

console.log('🧪 Test Runner Agent Active');

try {
  console.log('Running tests with: ${testCommand}');
  const output = execSync('${testCommand}', { encoding: 'utf8' });
  console.log(output);
} catch (e) {
  console.error('Test execution failed:', e.message);
  console.log('\\nMake sure test framework is installed');
}
`
    };
  }

  createCleanupAgent() {
    return {
      name: 'cleanup-agent',
      filename: 'cleanup-agent.js',
      content: `#!/usr/bin/env node
// Cleanup Agent
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleanup Agent Active');

// Patterns to clean
const cleanupPatterns = [
  '*.log',
  '*.tmp',
  '.DS_Store',
  '*.swp',
  '*.bak'
];

let cleaned = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    // Skip important directories
    if (['node_modules', '.git', '.devassist'].includes(entry.name)) return;
    
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else {
      // Check if file matches cleanup pattern
      if (cleanupPatterns.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(entry.name);
      })) {
        console.log(\`  Would clean: \${fullPath}\`);
        cleaned++;
      }
    }
  });
}

scanDir('.');
console.log(\`\\nFound \${cleaned} files to clean\`);
console.log('Run with --force to actually delete');
`
    };
  }

  createNodeAgent() {
    return {
      name: 'node-agent',
      filename: 'node-agent.js',
      content: `#!/usr/bin/env node
// Node.js Development Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Node.js Development Agent Active');

try {
  // Check Node version
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log('Node:', nodeVersion.trim());
  console.log('npm:', npmVersion.trim());
  
  // Check package.json
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(\`\\nProject: \${pkg.name} v\${pkg.version}\`);
    
    // Check scripts
    if (pkg.scripts) {
      console.log('\\nAvailable scripts:');
      Object.keys(pkg.scripts).forEach(script => {
        console.log(\`  npm run \${script}\`);
      });
    }
    
    // Check for outdated packages
    try {
      const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
      if (outdated) {
        const packages = JSON.parse(outdated);
        const count = Object.keys(packages).length;
        if (count > 0) {
          console.log(\`\\n⚠️ \${count} packages are outdated\`);
          console.log('Update with: npm update');
        }
      }
    } catch {}
  }
  
} catch (e) {
  console.error('Node.js error:', e.message);
}
`
    };
  }

  createPythonAgent() {
    return {
      name: 'python-agent',
      filename: 'python-agent.js',
      content: `#!/usr/bin/env node
// Python Development Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🐍 Python Development Agent Active');

try {
  // Check Python version
  const pythonVersion = execSync('python3 --version', { encoding: 'utf8' });
  console.log(pythonVersion.trim());
  
  // Check pip
  const pipVersion = execSync('pip3 --version', { encoding: 'utf8' });
  console.log('pip:', pipVersion.split(' ')[1]);
  
  // Check for requirements
  if (fs.existsSync('requirements.txt')) {
    console.log('✓ requirements.txt found');
    
    // Check virtual environment
    if (process.env.VIRTUAL_ENV) {
      console.log('✓ Virtual environment active:', process.env.VIRTUAL_ENV);
    } else {
      console.log('⚠️ No virtual environment active');
      console.log('Create with: python3 -m venv venv');
      console.log('Activate with: source venv/bin/activate');
    }
  }
  
  // Check for pyproject.toml
  if (fs.existsSync('pyproject.toml')) {
    console.log('✓ pyproject.toml found (modern Python project)');
  }
  
  // Check for tests
  if (fs.existsSync('tests') || fs.existsSync('test')) {
    console.log('✓ Test directory found');
    console.log('Run tests with: pytest');
  }
  
} catch (e) {
  console.error('Python error:', e.message);
}
`
    };
  }

  createGoAgent() {
    return {
      name: 'go-agent',
      filename: 'go-agent.js',
      content: `#!/usr/bin/env node
// Go Development Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🐹 Go Development Agent Active');

try {
  // Check Go version
  const goVersion = execSync('go version', { encoding: 'utf8' });
  console.log(goVersion.trim());
  
  // Check go.mod
  if (fs.existsSync('go.mod')) {
    console.log('✓ go.mod found');
    
    // Check module
    const modInfo = fs.readFileSync('go.mod', 'utf8');
    const moduleMatch = modInfo.match(/module\\s+(\\S+)/);
    if (moduleMatch) {
      console.log('Module:', moduleMatch[1]);
    }
    
    // Verify dependencies
    try {
      execSync('go mod verify', { encoding: 'utf8' });
      console.log('✓ Dependencies verified');
    } catch {
      console.log('⚠️ Dependency issues detected');
      console.log('Fix with: go mod tidy');
    }
  }
  
  console.log('\\nCommon commands:');
  console.log('  go build - Build the project');
  console.log('  go test ./... - Run all tests');
  console.log('  go fmt ./... - Format code');
  console.log('  go vet ./... - Check for issues');
  
} catch (e) {
  console.error('Go error:', e.message);
}
`
    };
  }

  createRustAgent() {
    return {
      name: 'rust-agent',
      filename: 'rust-agent.js',
      content: `#!/usr/bin/env node
// Rust Development Agent
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🦀 Rust Development Agent Active');

try {
  // Check Rust version
  const rustVersion = execSync('rustc --version', { encoding: 'utf8' });
  const cargoVersion = execSync('cargo --version', { encoding: 'utf8' });
  console.log(rustVersion.trim());
  console.log(cargoVersion.trim());
  
  // Check Cargo.toml
  if (fs.existsSync('Cargo.toml')) {
    console.log('✓ Cargo.toml found');
    
    // Check if built
    if (fs.existsSync('target')) {
      console.log('✓ Project has been built');
    }
    
    console.log('\\nCommon commands:');
    console.log('  cargo build - Build the project');
    console.log('  cargo test - Run tests');
    console.log('  cargo run - Build and run');
    console.log('  cargo clippy - Run linter');
    console.log('  cargo fmt - Format code');
  }
  
} catch (e) {
  console.error('Rust error:', e.message);
}
`
    };
  }

  /**
   * Setup documentation structure
   */
  async setupDocumentation(projectPath, projectName, technologies) {
    const docsDir = path.join(projectPath, '.devassist', 'docs');
    
    // Create CLAUDE.md specifically for DevAssist
    const claudeMd = `# DevAssist Guide for ${projectName}

## Project Overview
- **Name**: ${projectName}
- **Technologies**: ${technologies.join(', ')}
- **Created**: ${new Date().toISOString()}

## Session Commands
\`\`\`bash
# Start a development session
devassist:session-start description="Working on feature X"

# Create checkpoint
devassist:session-checkpoint summary="Completed authentication"

# End session with cleanup
devassist:session-end
\`\`\`

## Available Agents
${technologies.includes('Dagger') ? '- \`dagger-pipeline\` - CI/CD pipeline management' : ''}
${technologies.includes('Kubernetes') ? '- \`k8s-manager\` - Kubernetes operations' : ''}
${technologies.includes('Docker') ? '- \`docker-manager\` - Container management' : ''}
${technologies.includes('Terraform') ? '- \`terraform-agent\` - Infrastructure provisioning' : ''}
- \`git-workflow\` - Version control operations
- \`test-runner\` - Test execution
- \`cleanup-agent\` - File organization

## Recording Decisions
\`\`\`bash
devassist:record_architectural_decision 
  decision="Use Redis for session storage"
  context="Need fast session lookups"
  alternatives=["In-memory", "PostgreSQL"]
\`\`\`

## Tracking Progress
\`\`\`bash
devassist:track_progress 
  milestone="API endpoints complete"
  status="completed"
\`\`\`
`;
    
    await fs.writeFile(path.join(docsDir, 'CLAUDE.md'), claudeMd);
    console.log('  ✓ Created DevAssist documentation');
  }

  /**
   * Initialize databases
   */
  async initializeDatabases(projectPath) {
    // Create SQLite database schema
    const dbSchema = `
-- DevAssist Database Schema
CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  decision TEXT NOT NULL,
  context TEXT,
  alternatives TEXT,
  impact TEXT,
  session_id TEXT
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  milestone TEXT NOT NULL,
  status TEXT,
  notes TEXT,
  blockers TEXT,
  session_id TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  description TEXT,
  checkpoints TEXT,
  summary TEXT
);

CREATE INDEX idx_decisions_project ON decisions(project_name);
CREATE INDEX idx_progress_project ON progress(project_name);
CREATE INDEX idx_sessions_project ON sessions(project_name);
`;
    
    const schemaPath = path.join(projectPath, '.devassist', 'data', 'schema.sql');
    await fs.writeFile(schemaPath, dbSchema);
    
    console.log('  ✓ Initialized database schemas');
  }

  /**
   * Setup git integration
   */
  async setupGitIntegration(projectPath) {
    const gitignorePath = path.join(projectPath, '.gitignore');
    
    const devassistIgnores = `
# DevAssist
.devassist/logs/
.devassist/sessions/
.devassist/artifacts/
.devassist/cache/
.devassist/vectors/
*.log
*.tmp
`;
    
    try {
      let gitignore = '';
      if (await this.fileExists(gitignorePath)) {
        gitignore = await fs.readFile(gitignorePath, 'utf8');
      }
      
      if (!gitignore.includes('.devassist')) {
        gitignore += devassistIgnores;
        await fs.writeFile(gitignorePath, gitignore);
        console.log('  ✓ Updated .gitignore');
      }
    } catch (error) {
      console.log('  ⚠️ Could not update .gitignore:', error.message);
    }
  }

  /**
   * Create initial session template
   */
  async createSessionTemplate(projectPath, projectName) {
    const template = {
      name: 'default-session',
      project: projectName,
      warmup: {
        loadPreviousContext: true,
        analyzeRecentChanges: true,
        analyzeTerminalLogs: true,
        prepareSearchIndices: true,
        checkPendingTasks: true
      },
      heartbeat: {
        enabled: true,
        interval: 300000,
        reminders: true
      },
      cleanup: {
        enabled: true,
        organizeFiles: true,
        archiveArtifacts: true,
        updateGitignore: true
      }
    };
    
    const templatePath = path.join(projectPath, '.devassist', 'templates', 'session-default.json');
    await fs.writeFile(templatePath, JSON.stringify(template, null, 2));
    
    console.log('  ✓ Created session template');
  }

  /**
   * Fetch and cache technology documentation
   */
  async fetchTechnologyDocs(projectPath, technologies) {
    // This is a simplified version - in production, would actually fetch docs
    const docSources = {
      'Dagger': 'https://docs.dagger.io',
      'Kubernetes': 'https://kubernetes.io/docs',
      'Docker': 'https://docs.docker.com',
      'Terraform': 'https://www.terraform.io/docs',
      'Node': 'https://nodejs.org/docs',
      'Python': 'https://docs.python.org',
      'Go': 'https://go.dev/doc',
      'Rust': 'https://doc.rust-lang.org'
    };
    
    const techDocsDir = path.join(projectPath, '.devassist', 'tech-docs');
    const manifest = {
      fetched: new Date().toISOString(),
      technologies: {}
    };
    
    for (const tech of technologies) {
      if (docSources[tech]) {
        const techDir = path.join(techDocsDir, tech.toLowerCase());
        await fs.mkdir(techDir, { recursive: true });
        
        // Create placeholder doc file
        const docContent = `# ${tech} Documentation
Source: ${docSources[tech]}
Fetched: ${new Date().toISOString()}

This is a placeholder for ${tech} documentation.
In production, actual documentation would be fetched and cached here.
`;
        
        await fs.writeFile(path.join(techDir, 'README.md'), docContent);
        manifest.technologies[tech] = {
          source: docSources[tech],
          path: techDir
        };
      }
    }
    
    await fs.writeFile(
      path.join(techDocsDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`  ✓ Prepared documentation cache for ${technologies.length} technologies`);
  }

  /**
   * Helper: Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export default DevAssistSetup;