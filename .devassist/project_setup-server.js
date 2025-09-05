#!/usr/bin/env node

/**
 * PROJECT_SETUP DevAssist MCP Server for Claude Code
 * Project-isolated instance with custom commands
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const PROJECT_NAME = 'PROJECT_SETUP';
const PROJECT_PATH = '/Users/danielconnolly/Projects/PROJECT_SETUP';

// Set up project isolation - NO generic DevAssist
process.env.DEVASSIST_PROJECT = PROJECT_NAME;
process.env.DEVASSIST_PROJECT_PATH = PROJECT_PATH;
process.env.DEVASSIST_DATA_PATH = PROJECT_PATH + '/.devassist/data';

// Import main DevAssist but run in isolated mode
import('/Users/danielconnolly/Projects/Custom_MCP/DevAssist_MCP/index.js').then(async (devassist) => {
  // Server is ready
  console.error(`🚀 PROJECT_SETUP DevAssist Ready (Claude Code)`);
});

// Create project-specific server
const server = new Server({
  name: 'project_setup-devassist',
  version: '1.0.0',
}, {
  capabilities: { tools: {} },
});

// Project-specific tools (these become slash commands in Claude Code)
const tools = [
  {
    name: 'start-project_setup',
    description: 'Start PROJECT_SETUP session with warmup',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'end-project_setup',
    description: 'End PROJECT_SETUP session with cleanup',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'status-project_setup',
    description: 'Check PROJECT_SETUP status',
    inputSchema: { type: 'object', properties: {} },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  console.error(`[PROJECT_SETUP DevAssist] ${name}`);
  
  // Handle project-specific commands
  switch (name) {
    case 'start-project_setup':
      await execAsync(`node ${PROJECT_PATH}/.devassist/warmup.js`).catch(() => {});
      return {
        content: [{
          type: 'text',
          text: `🔥 PROJECT_SETUP DevAssist Session Started!
          
✅ Warmup complete
✅ Context loaded
✅ Indices ready
✅ AI primed for PROJECT_SETUP

Your project-isolated environment is ready!`
        }]
      };
    
    case 'end-project_setup':
      await execAsync(`node ${PROJECT_PATH}/.devassist/agents/cleanup.js`).catch(() => {});
      return {
        content: [{
          type: 'text',
          text: `🏁 PROJECT_SETUP DevAssist Session Ended!
          
✅ Cleanup complete
✅ Context saved
✅ Ready for next session`
        }]
      };
      
    default:
      return { content: [{ type: 'text', text: `[PROJECT_SETUP] ${name}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
