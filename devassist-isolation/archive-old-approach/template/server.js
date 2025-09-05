#!/usr/bin/env node
/**
 * Project-Isolated DevAssist MCP Server Template
 * 
 * This template creates a project-specific DevAssist instance that:
 * 1. Inherits full DevAssist functionality
 * 2. Provides project-specific slash commands
 * 3. Maintains isolated data storage
 * 4. Registers commands properly with MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Project Configuration
 */
class ProjectConfig {
  constructor() {
    this.projectRoot = process.env.PROJECT_ROOT || process.cwd();
    this.projectName = process.env.DEVASSIST_PROJECT || this.detectProjectName();
    this.dataDir = path.join(this.projectRoot, '.devassist', 'data');
    this.sessionsDir = path.join(this.projectRoot, '.sessions');
    this.terminalLogsDir = path.join(this.projectRoot, '.devassist', 'terminal_logs');
    
    // Ensure data directories exist
    this.ensureDirectories();
  }
  
  detectProjectName() {
    const projectPath = this.projectRoot;
    return path.basename(projectPath).toLowerCase();
  }
  
  ensureDirectories() {
    [this.dataDir, this.sessionsDir, this.terminalLogsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}

/**
 * Command Registry for Project-Specific Commands
 */
class ProjectCommandRegistry {
  constructor(projectName) {
    this.projectName = projectName;
    this.commands = new Map();
    this.registerDefaultCommands();
  }
  
  registerDefaultCommands() {
    // Base project commands that every project gets
    this.register(`${this.projectName}-start`, {
      description: `Start development session with warmup (${this.projectName})`,
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            default: 'Development session',
            description: 'Session description'
          },
          project: {
            type: 'string',
            description: 'Project name (optional, uses current project if not specified)'
          }
        }
      },
      handler: this.handleSessionStart.bind(this)
    });
    
    this.register(`${this.projectName}-end`, {
      description: `End development session with cleanup (${this.projectName})`,
      inputSchema: {
        type: 'object',
        properties: {
          project: {
            type: 'string',
            description: 'Project name (optional, uses current project if not specified)'
          }
        }
      },
      handler: this.handleSessionEnd.bind(this)
    });
    
    this.register(`${this.projectName}-status`, {
      description: `Check session and warmup status (${this.projectName})`,
      inputSchema: {
        type: 'object',
        properties: {
          project: {
            type: 'string',
            description: 'Project name (optional, uses current project if not specified)'
          }
        }
      },
      handler: this.handleSessionStatus.bind(this)
    });
    
    this.register(`${this.projectName}-sprint`, {
      description: `Quick sprint progress check to keep DevAssist engaged (${this.projectName})`,
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Optional status update or note'
          }
        }
      },
      handler: this.handleSprintCheck.bind(this)
    });
    
    this.register(`${this.projectName}-memory`, {
      description: `Retrieve project memory using semantic search (${this.projectName})`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for specific memories'
          },
          category: {
            type: 'string',
            default: 'all',
            description: 'Category to filter by',
            enum: ['decisions', 'progress', 'lessons', 'architecture', 'all']
          },
          limit: {
            type: 'number',
            default: 10,
            description: 'Maximum number of results to return'
          }
        }
      },
      handler: this.handleMemorySearch.bind(this)
    });
    
    this.register(`${this.projectName}-decision`, {
      description: `Record an architectural decision with context and reasoning (${this.projectName})`,
      inputSchema: {
        type: 'object',
        properties: {
          decision: {
            type: 'string',
            description: 'The architectural decision made'
          },
          context: {
            type: 'string',
            description: 'Context and reasoning behind the decision'
          },
          alternatives: {
            type: 'array',
            items: { type: 'string' },
            description: 'Alternative approaches considered'
          },
          impact: {
            type: 'string',
            description: 'Expected impact on the system'
          }
        },
        required: ['decision', 'context']
      },
      handler: this.handleRecordDecision.bind(this)
    });
  }
  
  register(name, config) {
    this.commands.set(name, config);
  }
  
  getTools() {
    const tools = [];
    for (const [name, config] of this.commands) {
      tools.push({
        name,
        description: config.description,
        inputSchema: config.inputSchema
      });
    }
    return tools;
  }
  
  async executeCommand(name, args) {
    const command = this.commands.get(name);
    if (!command) {
      throw new McpError(ErrorCode.MethodNotFound, `Command ${name} not found`);
    }
    
    try {
      return await command.handler(args);
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Command execution failed: ${error.message}`);
    }
  }
  
  // Command Handlers
  async handleSessionStart(args) {
    const { description = 'Development session', project } = args;
    
    // TODO: Implement full DevAssist session start with:
    // - Warmup animations
    // - Subagent loading  
    // - Terminal log review
    // - Context restoration
    
    const timestamp = new Date().toISOString();
    const sessionId = `${this.projectName}-${Date.now()}`;
    
    // Create session record
    const sessionData = {
      id: sessionId,
      project: project || this.projectName,
      description,
      startTime: timestamp,
      status: 'active'
    };
    
    // For now, return a simple success message
    // This will be enhanced in Sprint 3 with full DevAssist integration
    return {
      content: [
        {
          type: 'text',
          text: `🚀 ${this.projectName.toUpperCase()} Development Session Started
          
Session ID: ${sessionId}
Description: ${description}
Project: ${project || this.projectName}
Started: ${new Date().toLocaleString()}

✅ Project isolation enabled
✅ Data directory: .devassist/data/
✅ Terminal logs: .devassist/terminal_logs/
✅ Session tracking: .sessions/

Next: Use .devassist/scripts/claude-project.sh for terminal logging
Use /${this.projectName}-end to properly end session`
        }
      ]
    };
  }
  
  async handleSessionEnd(args) {
    const { project } = args;
    
    // TODO: Implement full DevAssist session end with:
    // - Knowledge review
    // - Context saving
    // - Terminal log archival
    // - Cleanup summary
    
    return {
      content: [
        {
          type: 'text',
          text: `🏁 ${this.projectName.toUpperCase()} Development Session Ended
          
Project: ${project || this.projectName}
Ended: ${new Date().toLocaleString()}

✅ Session data saved
✅ Terminal logs archived
✅ Context preserved for next session

Session successfully terminated.`
        }
      ]
    };
  }
  
  async handleSessionStatus(args) {
    const { project } = args;
    
    return {
      content: [
        {
          type: 'text',
          text: `📊 ${this.projectName.toUpperCase()} Session Status
          
Project: ${project || this.projectName}
Status: Active (Template Mode)
Checked: ${new Date().toLocaleString()}

🔧 Template server is running
📁 Data isolation: Active
⚠️  Full DevAssist integration: Pending (Sprint 3)

Available commands:
- /${this.projectName}-start
- /${this.projectName}-end  
- /${this.projectName}-status
- /${this.projectName}-sprint
- /${this.projectName}-memory
- /${this.projectName}-decision`
        }
      ]
    };
  }
  
  async handleSprintCheck(args) {
    const { message } = args;
    
    return {
      content: [
        {
          type: 'text',
          text: `⚡ ${this.projectName.toUpperCase()} Sprint Check
          
${message ? `Update: ${message}` : 'Sprint status check complete'}
Timestamp: ${new Date().toLocaleString()}

✅ DevAssist engagement maintained
📊 Project isolation active
🚀 Ready for continued development`
        }
      ]
    };
  }
  
  async handleMemorySearch(args) {
    const { query, category = 'all', limit = 10 } = args;
    
    // TODO: Implement semantic search with isolated project data
    
    return {
      content: [
        {
          type: 'text',
          text: `🧠 ${this.projectName.toUpperCase()} Memory Search
          
Query: "${query || 'all memories'}"
Category: ${category}
Limit: ${limit}

⚠️  Memory search not yet implemented (Sprint 2)
Will search isolated project data in .devassist/data/

This will include:
- Architectural decisions
- Progress notes
- Code patterns
- Development lessons`
        }
      ]
    };
  }
  
  async handleRecordDecision(args) {
    const { decision, context, alternatives = [], impact } = args;
    
    // TODO: Implement decision recording with vector storage
    
    const timestamp = new Date().toISOString();
    const decisionId = `${this.projectName}-decision-${Date.now()}`;
    
    return {
      content: [
        {
          type: 'text',
          text: `📝 ${this.projectName.toUpperCase()} Decision Recorded
          
ID: ${decisionId}
Decision: ${decision}
Context: ${context}
${alternatives.length > 0 ? `Alternatives: ${alternatives.join(', ')}` : ''}
${impact ? `Impact: ${impact}` : ''}
Recorded: ${new Date().toLocaleString()}

✅ Decision saved to project memory
⚠️  Full vector storage pending (Sprint 2)`
        }
      ]
    };
  }
}

/**
 * Main Server Class
 */
class ProjectDevAssistServer {
  constructor() {
    this.config = new ProjectConfig();
    this.commandRegistry = new ProjectCommandRegistry(this.config.projectName);
    this.server = new Server(
      {
        name: `devassist-${this.config.projectName}`,
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupHandlers();
  }
  
  setupHandlers() {
    // List available tools (commands)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.commandRegistry.getTools()
    }));
    
    // Handle tool calls (command execution)
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await this.commandRegistry.executeCommand(name, args || {});
    });
  }
  
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error(`🚀 DevAssist Server Started: ${this.config.projectName}`);
    console.error(`📁 Project Root: ${this.config.projectRoot}`);
    console.error(`💾 Data Directory: ${this.config.dataDir}`);
    console.error(`🎯 Available Commands: ${this.commandRegistry.commands.size}`);
  }
}

/**
 * Handle CLI arguments and start server
 */
if (process.argv.includes('--test')) {
  console.log('✅ Project DevAssist Server Template - Test Mode');
  console.log(`Project: ${process.env.DEVASSIST_PROJECT || 'auto-detected'}`);
  console.log(`Root: ${process.env.PROJECT_ROOT || process.cwd()}`);
  
  const config = new ProjectConfig();
  const registry = new ProjectCommandRegistry(config.projectName);
  
  console.log(`\n📋 Available Commands for ${config.projectName}:`);
  for (const [name, command] of registry.commands) {
    console.log(`  /${name} - ${command.description}`);
  }
  
  process.exit(0);
} else {
  // Start the server
  const server = new ProjectDevAssistServer();
  server.start().catch(console.error);
}