#!/usr/bin/env node
/**
 * Sprint 1 Validation Tests
 * Tests the foundation for project isolation with DevAssist inheritance
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const TEMPLATE_DIR = path.join(process.cwd(), 'devassist-isolation', 'template-v2');
const TEST_PROJECT = path.join(process.cwd(), 'test-isolation-project');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test 1: Server Startup
 */
async function testServerStartup() {
  log('\n📋 Test 1: Server Startup', 'blue');
  
  return new Promise((resolve) => {
    const serverProcess = spawn('node', [path.join(TEST_PROJECT, '.devassist/server.js')], {
      cwd: TEST_PROJECT,
      env: {
        ...process.env,
        PROJECT_ROOT: TEST_PROJECT,
        DEVASSIST_PROJECT: 'test-isolation-project',
        DEVASSIST_ISOLATED: 'true'
      }
    });

    let timeout = setTimeout(() => {
      serverProcess.kill();
      log('  ✅ Server starts without errors', 'green');
      resolve(true);
    }, 2000);

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      log(`  ❌ Server failed to start: ${err.message}`, 'red');
      resolve(false);
    });

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Error') || output.includes('error')) {
        clearTimeout(timeout);
        serverProcess.kill();
        log(`  ❌ Server error: ${output}`, 'red');
        resolve(false);
      }
    });
  });
}

/**
 * Test 2: Command Registration
 */
async function testCommandRegistration() {
  log('\n📋 Test 2: Command Registration', 'blue');
  
  return new Promise((resolve) => {
    const serverProcess = spawn('node', [path.join(TEST_PROJECT, '.devassist/server.js')], {
      cwd: TEST_PROJECT,
      env: {
        ...process.env,
        PROJECT_ROOT: TEST_PROJECT,
        DEVASSIST_PROJECT: 'test-isolation-project'
      }
    });

    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    });

    serverProcess.stdin.write(request + '\n');

    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      try {
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.trim() && line.startsWith('{')) {
            const response = JSON.parse(line);
            if (response.result && response.result.tools) {
              const tools = response.result.tools;
              const expectedCommands = [
                'testisolationproject-start',
                'testisolationproject-end',
                'testisolationproject-status',
                'testisolationproject-memory',
                'testisolationproject-decision'
              ];
              
              const foundCommands = tools.map(t => t.name);
              let allFound = true;
              
              for (const cmd of expectedCommands) {
                if (foundCommands.includes(cmd)) {
                  log(`  ✅ Command registered: ${cmd}`, 'green');
                } else {
                  log(`  ❌ Command missing: ${cmd}`, 'red');
                  allFound = false;
                }
              }
              
              serverProcess.kill();
              resolve(allFound);
              return;
            }
          }
        }
      } catch (e) {
        // Keep collecting output
      }
    });

    setTimeout(() => {
      serverProcess.kill();
      log('  ❌ Timeout waiting for command list', 'red');
      resolve(false);
    }, 3000);
  });
}

/**
 * Test 3: Environment Isolation
 */
async function testEnvironmentIsolation() {
  log('\n📋 Test 3: Environment Isolation', 'blue');
  
  const dataDir = path.join(TEST_PROJECT, '.devassist', 'data');
  const sessionsDir = path.join(TEST_PROJECT, '.sessions');
  
  // Check if isolation directories exist
  if (fs.existsSync(dataDir)) {
    log('  ✅ Project data directory exists', 'green');
  } else {
    log('  ❌ Project data directory missing', 'red');
    return false;
  }
  
  if (fs.existsSync(sessionsDir)) {
    log('  ✅ Sessions directory exists', 'green');
  } else {
    log('  ❌ Sessions directory missing', 'red');
    return false;
  }
  
  return true;
}

/**
 * Test 4: MCP Configuration
 */
async function testMCPConfiguration() {
  log('\n📋 Test 4: MCP Configuration', 'blue');
  
  const mcpConfigPath = path.join(TEST_PROJECT, '.mcp.json');
  
  if (!fs.existsSync(mcpConfigPath)) {
    log('  ❌ .mcp.json file missing', 'red');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    
    if (config.mcpServers && config.mcpServers['test-isolation-project']) {
      log('  ✅ MCP server configured', 'green');
      
      const serverConfig = config.mcpServers['test-isolation-project'];
      
      if (serverConfig.command === 'node') {
        log('  ✅ Correct command specified', 'green');
      } else {
        log('  ❌ Incorrect command', 'red');
        return false;
      }
      
      if (serverConfig.env && serverConfig.env.DEVASSIST_ISOLATED === 'true') {
        log('  ✅ Isolation flag set', 'green');
      } else {
        log('  ❌ Isolation flag missing', 'red');
        return false;
      }
      
      return true;
    } else {
      log('  ❌ Server not configured in .mcp.json', 'red');
      return false;
    }
  } catch (err) {
    log(`  ❌ Failed to parse .mcp.json: ${err.message}`, 'red');
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  log('\n🚀 Sprint 1 Validation Tests', 'yellow');
  log('================================', 'yellow');
  
  const results = {
    serverStartup: false,
    commandRegistration: false,
    environmentIsolation: false,
    mcpConfiguration: false
  };
  
  // Run tests
  results.serverStartup = await testServerStartup();
  results.commandRegistration = await testCommandRegistration();
  results.environmentIsolation = await testEnvironmentIsolation();
  results.mcpConfiguration = await testMCPConfiguration();
  
  // Summary
  log('\n📊 Test Summary', 'yellow');
  log('================', 'yellow');
  
  let passed = 0;
  let total = 0;
  
  for (const [test, result] of Object.entries(results)) {
    total++;
    if (result) {
      passed++;
      log(`  ✅ ${test}`, 'green');
    } else {
      log(`  ❌ ${test}`, 'red');
    }
  }
  
  log(`\nResult: ${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('\n🎉 Sprint 1 Foundation Complete!', 'green');
    log('All criteria met for project isolation with DevAssist inheritance', 'green');
  } else {
    log('\n⚠️  Sprint 1 incomplete - some tests failed', 'red');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(console.error);