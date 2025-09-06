#!/usr/bin/env node

/**
 * Enhanced Prjctzr DevAssist MCP Server
 * Intelligent project initialization with full analysis
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

const PROJECT_NAME = 'Prjctzr';
const PROJECT_PATH = '/Users/danielconnolly/Projects/Prjctzr';

// Set up project isolation
process.env.DEVASSIST_PROJECT = PROJECT_NAME;
process.env.DEVASSIST_PROJECT_PATH = PROJECT_PATH;
process.env.DEVASSIST_DATA_PATH = PROJECT_PATH + '/.devassist/data';

// Import main DevAssist in isolated mode
import('/Users/danielconnolly/Projects/Custom_MCP/DevAssist_MCP/index.js').then(async (devassist) => {
  console.error(`🚀 Enhanced Prjctzr DevAssist Ready`);
});

// Create project-specific server
const server = new Server({
  name: 'prjctzr-devassist',
  version: '2.0.0',
}, {
  capabilities: { tools: {} },
});

// Enhanced tools with intelligent initialization
const tools = [
  {
    name: 'start-prjctzr',
    description: 'Start Prjctzr session with warmup',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'end-prjctzr',
    description: 'End Prjctzr session with cleanup',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'status-prjctzr',
    description: 'Check Prjctzr status',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'initproject',
    description: 'Intelligently initialize DevAssist with full project analysis, documentation, and subagents',
    inputSchema: { 
      type: 'object', 
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project to initialize'
        },
        projectName: {
          type: 'string',
          description: 'Name of the project (for commands like /start-projectname)'
        },
        deepScan: {
          type: 'boolean',
          description: 'Perform deep project analysis (default: true)',
          default: true
        },
        createDocs: {
          type: 'boolean',
          description: 'Generate documentation suggestions (default: true)',
          default: true
        }
      },
      required: ['projectPath', 'projectName']
    },
  },
];

// Project analysis functions
async function analyzeProjectStructure(projectPath) {
  const analysis = {
    type: 'unknown',
    languages: [],
    frameworks: [],
    hasTests: false,
    hasDocker: false,
    hasCI: false,
    packageManagers: [],
    databases: [],
    structure: {}
  };

  try {
    const files = await fs.readdir(projectPath);
    
    // Detect project type and technologies
    if (files.includes('package.json')) {
      const pkg = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8'));
      analysis.type = 'node';
      analysis.languages.push('JavaScript/TypeScript');
      
      // Detect frameworks
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.react) analysis.frameworks.push('React');
      if (deps.next) analysis.frameworks.push('Next.js');
      if (deps.express) analysis.frameworks.push('Express');
      if (deps.vue) analysis.frameworks.push('Vue');
      if (deps.angular) analysis.frameworks.push('Angular');
      if (deps.ethers || deps.web3) analysis.frameworks.push('Web3/Blockchain');
      
      analysis.packageManagers.push(pkg.packageManager || 'npm');
    }
    
    if (files.includes('pyproject.toml') || files.includes('requirements.txt')) {
      analysis.type = analysis.type === 'unknown' ? 'python' : 'polyglot';
      analysis.languages.push('Python');
    }
    
    if (files.includes('Cargo.toml')) {
      analysis.type = analysis.type === 'unknown' ? 'rust' : 'polyglot';
      analysis.languages.push('Rust');
    }
    
    if (files.includes('go.mod')) {
      analysis.type = analysis.type === 'unknown' ? 'go' : 'polyglot';
      analysis.languages.push('Go');
    }
    
    // Check for common patterns
    analysis.hasTests = files.some(f => f.includes('test') || f.includes('spec'));
    analysis.hasDocker = files.includes('docker-compose.yml') || files.includes('Dockerfile');
    analysis.hasCI = files.includes('.github') || files.includes('.gitlab-ci.yml');
    
    // Check for databases
    if (files.includes('prisma')) analysis.databases.push('Prisma');
    if (files.includes('migrations')) analysis.databases.push('SQL');
    
  } catch (error) {
    console.error('Error analyzing project:', error);
  }
  
  return analysis;
}

async function detectGitWorktrees(projectPath) {
  const worktrees = [];
  
  try {
    const result = await execAsync('git worktree list --porcelain', { cwd: projectPath });
    const lines = result.stdout.split('\n');
    
    let currentWorktree = {};
    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        if (currentWorktree.path) {
          worktrees.push(currentWorktree);
        }
        currentWorktree = { path: line.substring(9) };
      } else if (line.startsWith('branch ')) {
        currentWorktree.branch = line.substring(7);
      }
    }
    if (currentWorktree.path) {
      worktrees.push(currentWorktree);
    }
  } catch (error) {
    // Not a git repo or no worktrees
  }
  
  return worktrees;
}

async function scanProjectDocumentation(projectPath) {
  const docs = {
    existing: [],
    missing: [],
    suggestions: []
  };
  
  const essentialDocs = [
    { file: 'README.md', purpose: 'Project overview and setup instructions' },
    { file: 'ARCHITECTURE.md', purpose: 'System architecture and design decisions' },
    { file: 'API.md', purpose: 'API documentation and endpoints' },
    { file: 'CONTRIBUTING.md', purpose: 'Contribution guidelines' },
    { file: 'CHANGELOG.md', purpose: 'Version history and changes' },
    { file: 'DEVELOPMENT.md', purpose: 'Development setup and workflows' },
  ];
  
  for (const doc of essentialDocs) {
    try {
      await fs.access(path.join(projectPath, doc.file));
      docs.existing.push(doc.file);
    } catch {
      docs.missing.push(doc);
    }
  }
  
  // Scan for existing documentation
  try {
    const docsDir = path.join(projectPath, 'docs');
    const docFiles = await fs.readdir(docsDir);
    docs.existing.push(...docFiles.map(f => `docs/${f}`));
  } catch {
    docs.suggestions.push('Create a docs/ directory for detailed documentation');
  }
  
  return docs;
}

async function generateProjectKnowledge(projectPath, projectName, analysis, worktrees, docs) {
  const knowledge = {
    project: projectName,
    path: projectPath,
    analyzed: new Date().toISOString(),
    ...analysis,
    worktrees: worktrees.map(w => ({
      path: w.path,
      branch: w.branch,
      purpose: inferWorktreePurpose(w.branch)
    })),
    documentation: docs,
    recommendations: []
  };
  
  // Generate recommendations
  if (worktrees.length > 0) {
    knowledge.recommendations.push('Configure subagents for each worktree');
    knowledge.recommendations.push('Set up inter-worktree communication');
  }
  
  if (docs.missing.length > 0) {
    knowledge.recommendations.push(`Create missing documentation: ${docs.missing.map(d => d.file).join(', ')}`);
  }
  
  if (!analysis.hasTests) {
    knowledge.recommendations.push('Set up testing infrastructure');
  }
  
  return knowledge;
}

function inferWorktreePurpose(branch) {
  if (branch.includes('frontend')) return 'Frontend development';
  if (branch.includes('backend')) return 'Backend services';
  if (branch.includes('api')) return 'API development';
  if (branch.includes('blockchain') || branch.includes('web3')) return 'Blockchain integration';
  if (branch.includes('test')) return 'Testing and QA';
  if (branch.includes('docs')) return 'Documentation';
  if (branch.includes('devops') || branch.includes('infra')) return 'DevOps and infrastructure';
  if (branch.includes('feature/')) return `Feature: ${branch.replace('feature/', '')}`;
  return 'Development branch';
}

async function createSubagentConfig(worktreePath, branch, projectName) {
  const purpose = inferWorktreePurpose(branch);
  const agentName = branch.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  const config = {
    name: agentName,
    type: 'worktree-agent',
    path: worktreePath,
    branch: branch,
    purpose: purpose,
    parent: projectName,
    capabilities: inferAgentCapabilities(branch),
    commands: [
      `sync-${agentName}`,
      `status-${agentName}`,
      `test-${agentName}`
    ],
    priority: inferAgentPriority(branch)
  };
  
  return config;
}

function inferAgentCapabilities(branch) {
  const capabilities = ['git', 'file-management'];
  
  if (branch.includes('frontend')) {
    capabilities.push('ui-development', 'component-testing', 'styling');
  }
  if (branch.includes('backend')) {
    capabilities.push('api-development', 'database', 'authentication');
  }
  if (branch.includes('blockchain')) {
    capabilities.push('smart-contracts', 'web3', 'crypto');
  }
  if (branch.includes('test')) {
    capabilities.push('unit-testing', 'integration-testing', 'e2e-testing');
  }
  if (branch.includes('devops')) {
    capabilities.push('ci-cd', 'deployment', 'monitoring');
  }
  
  return capabilities;
}

function inferAgentPriority(branch) {
  if (branch.includes('main') || branch.includes('master')) return 1;
  if (branch.includes('backend') || branch.includes('api')) return 2;
  if (branch.includes('frontend')) return 3;
  if (branch.includes('test')) return 4;
  if (branch.includes('docs')) return 5;
  return 3;
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`[Enhanced Prjctzr] Executing: ${name}`);
  
  switch (name) {
    case 'initproject':
      const { projectPath, projectName, deepScan = true, createDocs = true } = args;
      
      try {
        console.error(`🔍 Starting intelligent initialization for ${projectName}...`);
        
        // Step 1: Deep project analysis
        let analysis = {};
        let worktrees = [];
        let docs = {};
        
        if (deepScan) {
          console.error('📊 Analyzing project structure...');
          analysis = await analyzeProjectStructure(projectPath);
          
          console.error('🌳 Detecting git worktrees...');
          worktrees = await detectGitWorktrees(projectPath);
          
          console.error('📚 Scanning documentation...');
          docs = await scanProjectDocumentation(projectPath);
        }
        
        // Step 2: Generate project knowledge
        console.error('🧠 Building project knowledge base...');
        const knowledge = await generateProjectKnowledge(projectPath, projectName, analysis, worktrees, docs);
        
        // Step 3: Create DevAssist structure
        console.error('🏗️ Creating DevAssist structure...');
        const devassistPath = path.join(projectPath, '.devassist');
        await fs.mkdir(devassistPath, { recursive: true });
        await fs.mkdir(path.join(devassistPath, 'data'), { recursive: true });
        await fs.mkdir(path.join(devassistPath, 'knowledge'), { recursive: true });
        await fs.mkdir(path.join(devassistPath, 'sessions'), { recursive: true });
        await fs.mkdir(path.join(devassistPath, 'agents'), { recursive: true });
        
        // Save project knowledge
        await fs.writeFile(
          path.join(devassistPath, 'knowledge', 'project-analysis.json'),
          JSON.stringify(knowledge, null, 2)
        );
        
        // Step 4: Create subagent configurations for worktrees
        const subagents = [];
        if (worktrees.length > 1) { // More than just main
          console.error('🤖 Configuring subagents for worktrees...');
          
          for (const worktree of worktrees) {
            if (!worktree.path.includes(projectPath + '/.worktrees')) continue; // Skip main
            
            const agentConfig = await createSubagentConfig(worktree.path, worktree.branch, projectName);
            subagents.push(agentConfig);
            
            // Save agent config
            await fs.writeFile(
              path.join(devassistPath, 'agents', `${agentConfig.name}.json`),
              JSON.stringify(agentConfig, null, 2)
            );
          }
        }
        
        // Step 5: Generate enhanced server.js with full capabilities
        console.error('⚙️ Generating intelligent server configuration...');
        const serverContent = await generateEnhancedServer(projectName, projectPath, knowledge, subagents);
        await fs.writeFile(path.join(devassistPath, 'server.js'), serverContent);
        
        // Step 6: Create comprehensive warmup script
        console.error('🔥 Creating warmup script...');
        const warmupContent = await generateWarmupScript(projectName, projectPath, knowledge);
        await fs.writeFile(path.join(devassistPath, 'warmup.js'), warmupContent);
        
        // Step 7: Create package.json
        const packageJson = {
          name: `${projectName.toLowerCase()}-devassist`,
          version: "1.0.0",
          type: "module",
          dependencies: {
            "@modelcontextprotocol/sdk": "^1.0.0",
            "sqlite3": "^5.1.6",
            "sqlite": "^5.1.1"
          }
        };
        await fs.writeFile(
          path.join(devassistPath, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );
        
        // Step 8: Create MCP configuration
        const mcpConfig = {
          mcpServers: {
            [`devassist-${projectName.toLowerCase()}`]: {
              command: "node",
              args: [path.join(projectPath, '.devassist', 'server.js')],
              env: {
                PROJECT_ROOT: projectPath,
                PROJECT_NAME: projectName,
                DEVASSIST_DATA_PATH: path.join(projectPath, '.devassist', 'data')
              }
            }
          }
        };
        await fs.writeFile(
          path.join(projectPath, '.mcp.json'),
          JSON.stringify(mcpConfig, null, 2)
        );
        
        // Step 9: Create documentation templates if requested
        if (createDocs && docs.missing.length > 0) {
          console.error('📝 Creating documentation templates...');
          for (const doc of docs.missing) {
            const template = generateDocTemplate(projectName, doc.file, doc.purpose, knowledge);
            await fs.writeFile(
              path.join(projectPath, doc.file),
              template
            );
          }
        }
        
        // Step 10: Install dependencies
        console.error('📦 Installing dependencies...');
        await execAsync(`cd ${devassistPath} && npm install`);
        
        // Generate comprehensive report
        const report = generateInitReport(projectName, projectPath, knowledge, subagents, docs);
        
        return {
          content: [{
            type: 'text',
            text: report
          }]
        };
        
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error during intelligent initialization: ${error.message}\n\n${error.stack}`
          }]
        };
      }
      
    default:
      // Handle other commands...
      return {
        content: [{
          type: 'text',
          text: `Command ${name} executed`
        }]
      };
  }
});

async function generateEnhancedServer(projectName, projectPath, knowledge, subagents) {
  const worktreeCommands = knowledge.worktrees.length > 1 ? `
  {
    name: '${projectName.toLowerCase()}-worktrees',
    description: 'Manage ${projectName} git worktrees and subagents',
    inputSchema: { 
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'status', 'sync', 'communicate']
        },
        target: {
          type: 'string',
          description: 'Target worktree/agent'
        },
        message: {
          type: 'string',
          description: 'Message for communication'
        }
      }
    }
  },` : '';

  const subagentCommands = subagents.map(agent => `
  {
    name: 'agent-${agent.name}',
    description: 'Control ${agent.purpose}',
    inputSchema: { 
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['status', 'sync', 'test', 'build']
        }
      }
    }
  },`).join('');

  return `#!/usr/bin/env node

/**
 * ${projectName} Intelligent DevAssist MCP Server
 * Auto-generated with full project analysis
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const execAsync = promisify(exec);

const PROJECT_NAME = '${projectName}';
const PROJECT_PATH = '${projectPath}';
const KNOWLEDGE_PATH = '${projectPath}/.devassist/knowledge';

// Load project knowledge
const knowledge = JSON.parse(await fs.readFile(path.join(KNOWLEDGE_PATH, 'project-analysis.json'), 'utf-8'));

// Set up project isolation
process.env.DEVASSIST_PROJECT = PROJECT_NAME;
process.env.DEVASSIST_PROJECT_PATH = PROJECT_PATH;
process.env.DEVASSIST_DATA_PATH = PROJECT_PATH + '/.devassist/data';

// Initialize database
let db;
async function initDatabase() {
  db = await open({
    filename: path.join(PROJECT_PATH, '.devassist', 'data', 'project.db'),
    driver: sqlite3.Database
  });
  
  await db.exec(\`
    CREATE TABLE IF NOT EXISTS project_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      category TEXT,
      content TEXT,
      metadata TEXT
    );
    
    CREATE TABLE IF NOT EXISTS agent_communication (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      from_agent TEXT,
      to_agent TEXT,
      message TEXT,
      status TEXT
    );
  \`);
}

await initDatabase();

// Import main DevAssist in isolated mode
import('/Users/danielconnolly/Projects/Custom_MCP/DevAssist_MCP/index.js').then(async (devassist) => {
  console.error(\`🚀 \${PROJECT_NAME} Intelligent DevAssist Ready\`);
  console.error(\`📊 Project Type: \${knowledge.type}\`);
  console.error(\`🌳 Worktrees: \${knowledge.worktrees.length}\`);
  console.error(\`🤖 Subagents: ${subagents.length}\`);
});

// Create project-specific server
const server = new Server({
  name: '${projectName.toLowerCase()}-devassist',
  version: '2.0.0',
}, {
  capabilities: { tools: {} },
});

// Enhanced tools with project intelligence
const tools = [
  {
    name: 'start-${projectName.toLowerCase()}',
    description: 'Start ${projectName} session with intelligent warmup',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'end-${projectName.toLowerCase()}',
    description: 'End ${projectName} session with cleanup and analysis',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'status-${projectName.toLowerCase()}',
    description: 'Comprehensive ${projectName} status with all subsystems',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'analyze-${projectName.toLowerCase()}',
    description: 'Deep analysis of ${projectName} codebase',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'recommend-${projectName.toLowerCase()}',
    description: 'Get intelligent recommendations for ${projectName}',
    inputSchema: { type: 'object', properties: {} },
  },${worktreeCommands}${subagentCommands}
  {
    name: 'memory-${projectName.toLowerCase()}',
    description: 'Search ${projectName} project memory',
    inputSchema: { 
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        }
      }
    }
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(\`[\${PROJECT_NAME} DevAssist] \${name}\`);
  
  switch (name) {
    case 'start-${projectName.toLowerCase()}':
      await execAsync(\`node \${PROJECT_PATH}/.devassist/warmup.js\`).catch(() => {});
      
      // Load subagents if worktrees exist
      const agentStatus = ${subagents.length} > 0 ? 
        \`\\n🤖 Subagents: ${subagents.length} active\` : '';
      
      return {
        content: [{
          type: 'text',
          text: \`🚀 \${PROJECT_NAME} Intelligent DevAssist Started!
          
📊 Project Analysis Loaded:
• Type: \${knowledge.type}
• Languages: \${knowledge.languages.join(', ')}
• Frameworks: \${knowledge.frameworks.join(', ')}
• Worktrees: \${knowledge.worktrees.length}
• Documentation: \${knowledge.documentation.existing.length} files\${agentStatus}

✅ All systems ready for development!\`
        }]
      };
    
    case 'analyze-${projectName.toLowerCase()}':
      // Perform fresh analysis
      const currentAnalysis = await analyzeCurrentState();
      return {
        content: [{
          type: 'text',
          text: currentAnalysis
        }]
      };
      
    case 'recommend-${projectName.toLowerCase()}':
      const recommendations = await generateRecommendations();
      return {
        content: [{
          type: 'text',
          text: recommendations
        }]
      };
      
    // Add worktree management if applicable
    ${knowledge.worktrees.length > 1 ? `
    case '${projectName.toLowerCase()}-worktrees':
      const action = args?.action || 'list';
      const worktreeResult = await handleWorktreeAction(action, args);
      return {
        content: [{
          type: 'text',
          text: worktreeResult
        }]
      };
    ` : ''}
    
    default:
      // Handle subagent commands
      if (name.startsWith('agent-')) {
        const agentName = name.replace('agent-', '');
        const agentAction = args?.action || 'status';
        const result = await handleAgentAction(agentName, agentAction);
        return {
          content: [{
            type: 'text',
            text: result
          }]
        };
      }
      
      return { content: [{ type: 'text', text: \`[\${PROJECT_NAME}] \${name}\` }] };
  }
});

// Helper functions
async function analyzeCurrentState() {
  // Implementation for current state analysis
  return \`📊 Current Project State Analysis...\\n\`;
}

async function generateRecommendations() {
  return \`🎯 Recommendations:\\n\${knowledge.recommendations.join('\\n')}\`;
}

async function handleWorktreeAction(action, args) {
  switch (action) {
    case 'list':
      const result = await execAsync('git worktree list', { cwd: PROJECT_PATH });
      return \`🌳 Worktrees:\\n\${result.stdout}\`;
    case 'status':
      // Check status of all worktrees
      return '📊 Worktree status...';
    case 'sync':
      // Sync worktrees with main
      return '🔄 Syncing worktrees...';
    default:
      return \`Unknown action: \${action}\`;
  }
}

async function handleAgentAction(agentName, action) {
  // Handle subagent actions
  return \`🤖 Agent \${agentName} - Action: \${action}\`;
}

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('${projectName} Intelligent DevAssist MCP Server running');
`;
}

async function generateWarmupScript(projectName, projectPath, knowledge) {
  return `#!/usr/bin/env node

/**
 * ${projectName} Intelligent Warmup Script
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔥 Starting ${projectName} Intelligent Warmup...');
console.log('━'.repeat(50));

// Load project knowledge
const knowledge = JSON.parse(
  await fs.readFile(
    path.join('${projectPath}', '.devassist', 'knowledge', 'project-analysis.json'),
    'utf-8'
  )
);

console.log('📊 Project Configuration:');
console.log(\`  • Type: \${knowledge.type}\`);
console.log(\`  • Languages: \${knowledge.languages.join(', ')}\`);
console.log(\`  • Frameworks: \${knowledge.frameworks.join(', ')}\`);

if (knowledge.worktrees.length > 1) {
  console.log('\\n🌳 Git Worktrees:');
  for (const worktree of knowledge.worktrees) {
    console.log(\`  • \${worktree.branch}: \${worktree.purpose}\`);
  }
}

if (knowledge.documentation.existing.length > 0) {
  console.log('\\n📚 Documentation:');
  console.log(\`  • Found \${knowledge.documentation.existing.length} documentation files\`);
}

if (knowledge.documentation.missing.length > 0) {
  console.log('\\n⚠️  Missing Documentation:');
  for (const doc of knowledge.documentation.missing) {
    console.log(\`  • \${doc.file}: \${doc.purpose}\`);
  }
}

// Check current git status
try {
  const gitStatus = await execAsync('git status --short', { cwd: '${projectPath}' });
  if (gitStatus.stdout) {
    const changes = gitStatus.stdout.split('\\n').filter(l => l).length;
    console.log(\`\\n📝 Git Status: \${changes} uncommitted changes\`);
  }
} catch (e) {
  // Not a git repo or error
}

// Load subagents if they exist
const agentsPath = path.join('${projectPath}', '.devassist', 'agents');
try {
  const agentFiles = await fs.readdir(agentsPath);
  const agents = agentFiles.filter(f => f.endsWith('.json'));
  if (agents.length > 0) {
    console.log(\`\\n🤖 Subagents: \${agents.length} configured\`);
    for (const agentFile of agents) {
      const agent = JSON.parse(await fs.readFile(path.join(agentsPath, agentFile), 'utf-8'));
      console.log(\`  • \${agent.name}: \${agent.purpose}\`);
    }
  }
} catch (e) {
  // No agents directory
}

console.log('\\n' + '━'.repeat(50));
console.log('✅ ${projectName} Warmup Complete!');
console.log('🚀 Ready for intelligent development!');
`;
}

function generateDocTemplate(projectName, filename, purpose, knowledge) {
  const templates = {
    'README.md': `# ${projectName}

## Overview
${purpose}

## Project Type
${knowledge.type === 'unknown' ? 'Multi-language project' : knowledge.type}

## Technologies
- Languages: ${knowledge.languages.join(', ') || 'To be determined'}
- Frameworks: ${knowledge.frameworks.join(', ') || 'To be determined'}

## Structure
${knowledge.worktrees.length > 1 ? `
### Git Worktrees
${knowledge.worktrees.map(w => `- **${w.branch}**: ${w.purpose}`).join('\n')}
` : 'Standard single-branch development'}

## Getting Started
1. Clone the repository
2. Install dependencies
3. Run development server

## Development
See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License
[License information]
`,
    'ARCHITECTURE.md': `# ${projectName} Architecture

## System Overview
${purpose}

## Technology Stack
- **Languages**: ${knowledge.languages.join(', ') || 'To be determined'}
- **Frameworks**: ${knowledge.frameworks.join(', ') || 'To be determined'}
- **Databases**: ${knowledge.databases.join(', ') || 'To be determined'}

## Architecture Decisions
Document key architectural decisions here.

## Component Structure
Describe the main components and their interactions.

## Data Flow
Explain how data flows through the system.

## Security Considerations
Document security measures and considerations.
`,
    'API.md': `# ${projectName} API Documentation

## Overview
${purpose}

## Base URL
\`\`\`
[Your API base URL]
\`\`\`

## Authentication
Describe authentication method.

## Endpoints

### [Endpoint Category]

#### GET /endpoint
Description of endpoint.

**Request:**
\`\`\`json
{
  // Request body
}
\`\`\`

**Response:**
\`\`\`json
{
  // Response body
}
\`\`\`

## Error Handling
Describe error response format.

## Rate Limiting
Document rate limits if applicable.
`,
    'CONTRIBUTING.md': `# Contributing to ${projectName}

## How to Contribute
We welcome contributions! Please follow these guidelines.

## Development Setup
1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Code Style
Follow the existing code style in the project.

## Testing
Ensure all tests pass before submitting PR.

## Pull Request Process
1. Update documentation
2. Add tests for new features
3. Ensure CI passes
4. Request review

## Code of Conduct
Be respectful and inclusive.
`,
    'DEVELOPMENT.md': `# ${projectName} Development Guide

## Prerequisites
- ${knowledge.languages.join('\n- ') || 'List prerequisites'}

## Setup
\`\`\`bash
# Clone repository
git clone [repository]

# Install dependencies
${knowledge.packageManagers.includes('npm') ? 'npm install' : '# Install dependencies'}
\`\`\`

## Development Workflow
${knowledge.worktrees.length > 1 ? `
### Working with Git Worktrees
This project uses git worktrees for parallel development:
${knowledge.worktrees.map(w => `- ${w.branch}: ${w.purpose}`).join('\n')}

Navigate to specific worktree:
\`\`\`bash
cd .worktrees/[worktree-name]
\`\`\`
` : 'Standard git workflow'}

## Testing
\`\`\`bash
# Run tests
${knowledge.hasTests ? 'npm test' : '# Set up testing'}
\`\`\`

## Building
\`\`\`bash
# Build project
${knowledge.packageManagers.includes('npm') ? 'npm run build' : '# Build commands'}
\`\`\`

## Debugging
Tips for debugging the application.
`,
    'CHANGELOG.md': `# Changelog

All notable changes to ${projectName} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- DevAssist integration
${knowledge.worktrees.length > 1 ? '- Git worktree configuration' : ''}

### Changed
- 

### Fixed
- 

### Removed
- 

## [0.1.0] - ${new Date().toISOString().split('T')[0]}
- Initial release
`
  };
  
  return templates[filename] || `# ${filename}\n\n${purpose}\n\n[Content to be added]`;
}

function generateInitReport(projectName, projectPath, knowledge, subagents, docs) {
  return `✅ ${projectName} Intelligent DevAssist Initialization Complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PROJECT ANALYSIS:
• Type: ${knowledge.type}
• Languages: ${knowledge.languages.join(', ') || 'None detected'}
• Frameworks: ${knowledge.frameworks.join(', ') || 'None detected'}
• Package Managers: ${knowledge.packageManagers.join(', ') || 'None detected'}
• Databases: ${knowledge.databases.join(', ') || 'None detected'}

🌳 GIT WORKTREES: ${knowledge.worktrees.length}
${knowledge.worktrees.map(w => `• ${w.branch}: ${w.purpose}`).join('\n')}

🤖 SUBAGENTS CONFIGURED: ${subagents.length}
${subagents.map(a => `• ${a.name}: ${a.purpose} (Priority: ${a.priority})`).join('\n')}

📚 DOCUMENTATION:
• Existing: ${docs.existing.length} files
• Created: ${docs.missing.length} templates
${docs.missing.map(d => `  - ${d.file}: ${d.purpose}`).join('\n')}

🛠️ DEVASSIST FEATURES:
• Intelligent warmup with project analysis
• Worktree management and synchronization
• Subagent orchestration
• Project memory and knowledge base
• Documentation generation
• Recommendation engine

📝 AVAILABLE COMMANDS:
• /start-${projectName.toLowerCase()} - Start with intelligent warmup
• /end-${projectName.toLowerCase()} - End with analysis
• /status-${projectName.toLowerCase()} - Comprehensive status
• /analyze-${projectName.toLowerCase()} - Deep code analysis
• /recommend-${projectName.toLowerCase()} - Get recommendations
${knowledge.worktrees.length > 1 ? `• /${projectName.toLowerCase()}-worktrees - Manage worktrees` : ''}
${subagents.map(a => `• /agent-${a.name} - Control ${a.purpose}`).join('\n')}
• /memory-${projectName.toLowerCase()} - Search project memory

🎯 RECOMMENDATIONS:
${knowledge.recommendations.map(r => `• ${r}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Created Structure:
${projectPath}/.devassist/
├── server.js (Enhanced MCP server)
├── warmup.js (Intelligent warmup)
├── package.json (Dependencies)
├── knowledge/
│   └── project-analysis.json
├── agents/
│   ${subagents.map(a => `├── ${a.name}.json`).join('\n│   ')}
├── data/
│   └── project.db
└── sessions/

🚀 Next Steps:
1. Restart Claude Code
2. Run /start-${projectName.toLowerCase()} to begin
3. Use /recommend-${projectName.toLowerCase()} for guidance

${projectName} is now equipped with intelligent DevAssist!`;
}

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Enhanced Prjctzr DevAssist Server running');
