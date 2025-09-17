#!/usr/bin/env node

/**
 * Prjctzr MCP Server
 * Intelligent project initialization with containerization and masking
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { MaskingEngine } from './src/masking/engine.js';
import { ProjectAnalyzer } from './src/analyzer/analyzer.js';
import { ProjectInitializer } from './src/initializer/initializer.js';
import { TemplateManager } from './src/templates/manager.js';
import { ContainerManager } from './src/containers/manager.js';
import { DevAssistSetup } from './src/devassist-setup.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize components
const maskingEngine = new MaskingEngine();
const analyzer = new ProjectAnalyzer();
const initializer = new ProjectInitializer();
const templateManager = new TemplateManager();
const containerManager = new ContainerManager();

// Create MCP server
const server = new Server({
  name: 'prjctzr',
  version: '2.0.0',
}, {
  capabilities: { 
    tools: {}
  },
});

// Define masked tools
const tools = [
  {
    name: 'prjctzr:init',
    description: 'Initialize a new project with all best practices. Options: type (node/python/go/rust/fullstack/auto), features array (docker/dagger/devassist/testing/ci/docs)',
    handler: async (input) => {
      // Provide helpful defaults and suggestions if not specified
      const { 
        name, 
        type = 'auto',
        features = []
      } = input;
      
      // If no input provided, return helpful prompt
      if (!name) {
        return {
          error: 'Project name required',
          usage: 'prjctzr:init name="project-name" type="node|python|go|rust|fullstack" features=["docker", "dagger", "devassist", "testing", "ci", "docs"]',
          availableTypes: ['node', 'python', 'go', 'rust', 'fullstack', 'auto'],
          availableFeatures: {
            docker: 'Containerization with Docker & docker-compose',
            dagger: 'CI/CD pipelines with Dagger',
            devassist: 'Development tracking with DevAssist',
            testing: 'Testing framework setup',
            ci: 'GitHub Actions / GitLab CI',
            docs: 'Documentation with MkDocs/Sphinx'
          }
        };
      }
      
      // Analyze project requirements
      const analysis = await analyzer.analyze({ name, type });
      
      // Select appropriate template
      const template = await templateManager.getTemplate(analysis.templateId);
      
      // Initialize project structure
      const result = await initializer.create({
        name,
        template,
        features: features || analysis.recommendedFeatures,
        path: input.path || process.cwd(),
      });
      
      // Set up containerization if requested
      if (features?.includes('docker')) {
        await containerManager.setupDocker(result.path);
      }
      
      if (features?.includes('dagger')) {
        await containerManager.setupDagger(result.path);
      }
      
      // Check if DevAssist should be auto-initialized
      const setupDevAssist = features?.includes('devassist');
      
      // Setup DevAssist infrastructure if requested
      if (setupDevAssist) {
        const devAssistSetup = new DevAssistSetup();
        
        // Detect technologies for DevAssist
        const detectedTech = [
          type, // Primary language
          ...(features?.includes('docker') ? ['Docker'] : []),
          ...(features?.includes('dagger') ? ['Dagger'] : []),
          // Add more detected technologies here
        ].filter(Boolean);
        
        const devAssistResult = await devAssistSetup.setupDevAssist(
          result.path,
          name,
          type,
          detectedTech
        );
        
        result.devassist = {
          status: devAssistResult.success ? 'ready' : 'failed',
          message: devAssistResult.message,
          structure: devAssistResult.structure,
          next_steps: 'Run devassist:session-start to begin tracking'
        };
        
        result.message = `✅ Project "${name}" created successfully at ${result.path}\n` +
                         `🔗 DevAssist infrastructure created - ready for sessions\n` +
                         `   Run: devassist:session-start description="Initial development"`;
      } else {
        result.suggestions = {
          devassist: {
            message: 'Would you like to set up DevAssist to track this project?',
            command: 'devassist:initproject',
            params: {
              name: name,
              path: result.path,
              description: `${type} project created with Prjctzr`,
              tech_stack: type
            }
          }
        };
        
        result.message = `✅ Project "${name}" created successfully at ${result.path}\n\n` +
                         `💡 Tip: Use DevAssist to track architectural decisions and progress:\n` +
                         `   Run: devassist:initproject with name="${name}" and path="${result.path}"\n` +
                         `   Or include 'devassist' in features array when creating projects`;
      }
      
      return result;
    },
  },
  {
    name: 'prjctzr:enhance',
    description: 'Add features to existing project',
    handler: async (input) => {
      const { feature, path } = input;
      const projectPath = path || process.cwd();
      
      // Analyze existing project
      const analysis = await analyzer.analyzeExisting(projectPath);
      
      // Apply enhancement
      return await initializer.enhance({
        projectPath,
        feature,
        currentStack: analysis.stack,
      });
    },
  },
  {
    name: 'prjctzr:dockerize',
    description: 'Add Docker support to project',
    handler: async (input) => {
      const projectPath = input.path || process.cwd();
      return await containerManager.dockerize(projectPath, input.options);
    },
  },
  {
    name: 'prjctzr:analyze',
    description: 'Analyze project and recommend improvements',
    handler: async (input) => {
      const projectPath = input.path || process.cwd();
      const analysis = await analyzer.deepAnalyze(projectPath);
      
      return {
        ...analysis,
        recommendations: await analyzer.getRecommendations(analysis),
      };
    },
  },
  {
    name: 'prjctzr:template',
    description: 'Manage project templates',
    handler: async (input) => {
      const { action, template } = input;
      
      switch (action) {
        case 'list':
          return await templateManager.listTemplates();
        case 'add':
          return await templateManager.addTemplate(template);
        case 'remove':
          return await templateManager.removeTemplate(template.name);
        case 'update':
          return await templateManager.updateTemplate(template);
        default:
          throw new Error(`Unknown template action: ${action}`);
      }
    },
  },
];

// Register tools with masking
tools.forEach(tool => {
  maskingEngine.registerTool({
    name: tool.name,
    description: tool.description,
    handler: tool.handler,
    mask: {
      input: {
        // Exposed fields vary by tool
        exposed: getExposedFields(tool.name),
        // Hidden fields are system-injected
        hidden: {
          timestamp: new Date().toISOString(),
          user: process.env.USER,
          platform: process.platform,
        },
      },
      output: {
        // Filter sensitive information from output
        filter: ['path', 'name', 'features', 'status', 'message'],
      },
    },
  });
});

function getExposedFields(toolName) {
  const fields = {
    'prjctzr:init': {
      name: { type: 'string', required: true, description: 'Project name' },
      type: { 
        type: 'string', 
        enum: ['node', 'python', 'go', 'rust', 'fullstack', 'auto'],
        default: 'auto',
        description: 'Project type',
      },
      features: {
        type: 'array',
        items: { type: 'string' },
        description: 'Features to include (docker, dagger, devassist)',
        examples: [['docker', 'devassist'], ['dagger'], ['devassist']],
      },
    },
    'prjctzr:enhance': {
      feature: {
        type: 'string',
        required: true,
        enum: ['testing', 'ci', 'monitoring', 'security', 'docs'],
        description: 'Feature to add',
      },
      path: { type: 'string', description: 'Project path' },
    },
    'prjctzr:dockerize': {
      path: { type: 'string', description: 'Project path' },
      options: {
        type: 'object',
        properties: {
          multistage: { type: 'boolean', default: true },
          alpine: { type: 'boolean', default: true },
          compose: { type: 'boolean', default: true },
        },
      },
    },
    'prjctzr:analyze': {
      path: { type: 'string', description: 'Project path' },
      detailed: { type: 'boolean', default: false },
    },
    'prjctzr:template': {
      action: {
        type: 'string',
        required: true,
        enum: ['list', 'add', 'remove', 'update'],
      },
      template: { type: 'object' },
    },
  };
  
  return fields[toolName] || {};
}

// Initialize server
async function initialize() {
  console.error('[Prjctzr] Starting MCP server v2.0...');
  
  // Load templates
  await templateManager.loadTemplates(path.join(__dirname, 'templates'));
  console.error(`[Prjctzr] Loaded ${templateManager.count()} templates`);
  
  // Initialize container manager
  await containerManager.initialize();
  console.error('[Prjctzr] Container manager initialized');
  
  // Set up MCP handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const exposedTools = maskingEngine.getExposedTools();
    console.error(`[Prjctzr] Providing ${exposedTools.length} tools`);
    return { tools: exposedTools };
  });
  
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    console.error(`[Prjctzr] Executing: ${name}`);
    const startTime = Date.now();
    
    try {
      const result = await maskingEngine.execute(name, args);
      const duration = Date.now() - startTime;
      
      console.error(`[Prjctzr] ${name} completed in ${duration}ms`);
      
      // Format result based on type
      let output;
      if (typeof result === 'string') {
        output = result;
      } else if (result.message) {
        output = `✅ ${result.message}\n\n${JSON.stringify(result.details || {}, null, 2)}`;
      } else {
        output = JSON.stringify(result, null, 2);
      }
      
      return {
        content: [{
          type: 'text',
          text: output,
        }],
      };
    } catch (error) {
      console.error(`[Prjctzr] Error in ${name}:`, error);
      return {
        content: [{
          type: 'text',
          text: `❌ Error: ${error.message}`,
        }],
        isError: true,
      };
    }
  });
  
  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('[Prjctzr] MCP server ready');
  console.error('[Prjctzr] Available commands:');
  console.error('  - prjctzr:init - Create new project');
  console.error('  - prjctzr:enhance - Add features');
  console.error('  - prjctzr:dockerize - Add Docker support');
  console.error('  - prjctzr:analyze - Analyze project');
  console.error('  - prjctzr:template - Manage templates');
}

// Monitor parent process
if (process.ppid) {
  setInterval(() => {
    try {
      process.kill(process.ppid, 0);
    } catch (e) {
      console.error('[Prjctzr] Parent died, exiting...');
      process.exit(0);
    }
  }, 5000);
}

// Handle stdin closure
process.stdin.on('end', () => {
  console.error('[Prjctzr] stdin closed, exiting...');
  process.exit(0);
});

// Start server
initialize().catch(console.error);
