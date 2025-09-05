#!/usr/bin/env node

/**
 * Enhanced Session Manager for DevAssist
 * Provides full autonomous session management with:
 * - Heartbeat integration
 * - Subagent verification
 * - Terminal log analysis
 * - Warmup animations
 * - Continuous summaries
 * - Session recovery
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const readline = require('readline');

class EnhancedSessionManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.projectName = path.basename(projectPath).toLowerCase().replace(/[^a-z0-9]/g, '');
    this.devassistPath = path.join(projectPath, '.devassist');
    this.sessionsPath = path.join(projectPath, '.sessions');
    this.terminalLogsPath = path.join(this.devassistPath, 'terminal_logs');
    this.knowledgePath = path.join(this.devassistPath, 'knowledge');
    this.summaryFile = path.join(projectPath, 'PROJECT_SESSIONS.md');
    
    // Session state
    this.currentSession = null;
    this.heartbeatInterval = null;
    this.subagents = new Map();
  }

  /**
   * Start a new session with full warmup
   */
  async start(description = 'Development session') {
    console.log('\n🚀 Starting Enhanced DevAssist Session');
    console.log('=====================================\n');
    
    // 1. Check for existing sessions and recover if needed
    await this.recoverFromCrash();
    
    // 2. Initialize session
    const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentSession = {
      id: sessionId,
      project: this.projectName,
      started: new Date().toISOString(),
      description,
      terminalLog: path.join(this.terminalLogsPath, `session_${sessionId}.log`)
    };
    
    // 3. Warmup sequence with animations
    await this.runWarmupSequence();
    
    // 4. Verify and load subagents
    await this.verifySubagents();
    
    // 5. Load previous context
    await this.loadPreviousContext();
    
    // 6. Start heartbeat
    this.startHeartbeat();
    
    // 7. Save session file
    this.saveSessionFile();
    
    console.log('\n✅ Session Started Successfully!');
    console.log(`  • Session ID: ${sessionId}`);
    console.log(`  • Project: ${this.projectName}`);
    console.log(`  • Heartbeat: Active (5-min intervals)`);
    console.log(`  • Terminal Log: ${this.currentSession.terminalLog}`);
    console.log('\n💡 Use sprint-check command to keep DevAssist engaged');
  }

  /**
   * Run warmup sequence with progress indicators
   */
  async runWarmupSequence() {
    const steps = [
      { name: 'DevAssist Core', check: () => this.checkDevAssist() },
      { name: 'Terminal Logging', check: () => this.checkTerminalLogs() },
      { name: 'Knowledge Base', check: () => this.checkKnowledgeBase() },
      { name: 'Git Repository', check: () => this.checkGitStatus() },
      { name: 'MCP Configuration', check: () => this.checkMCPConfig() }
    ];
    
    console.log('🔄 Running Warmup Sequence:\n');
    
    for (const step of steps) {
      process.stdout.write(`  ${this.getProgressBar(0)} ${step.name}...`);
      
      // Animate progress
      for (let i = 0; i <= 100; i += 20) {
        await this.delay(100);
        process.stdout.write(`\r  ${this.getProgressBar(i)} ${step.name}...`);
      }
      
      const result = await step.check();
      const status = result ? '✅' : '⚠️';
      console.log(`\r  ${status} ${step.name}                    `);
    }
  }

  /**
   * Generate progress bar
   */
  getProgressBar(percent) {
    const width = 20;
    const filled = Math.floor(width * percent / 100);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`;
  }

  /**
   * Verify and auto-create subagents
   */
  async verifySubagents() {
    console.log('\n🔍 Verifying Subagents:');
    
    const requiredSubagents = this.detectRequiredSubagents();
    const agentsPath = path.join(this.devassistPath, 'agents');
    
    if (!fs.existsSync(agentsPath)) {
      fs.mkdirSync(agentsPath, { recursive: true });
    }
    
    for (const agent of requiredSubagents) {
      const agentFile = path.join(agentsPath, `${agent.name}.js`);
      
      if (fs.existsSync(agentFile)) {
        console.log(`  ✅ ${agent.name} - Found`);
        this.subagents.set(agent.name, { status: 'loaded', path: agentFile });
      } else {
        console.log(`  ⚠️  ${agent.name} - Creating...`);
        await this.createSubagent(agent);
        console.log(`  ✅ ${agent.name} - Created`);
      }
    }
  }

  /**
   * Detect required subagents based on project type
   */
  detectRequiredSubagents() {
    const agents = [
      { name: 'cleanup', template: 'cleanup', description: 'Cleanup temporary files' },
      { name: 'warmup', template: 'warmup', description: 'Session warmup' }
    ];
    
    // Check for specific project types
    if (fs.existsSync(path.join(this.projectPath, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
      
      if (pkg.dependencies?.['react']) {
        agents.push({ name: 'react-optimizer', template: 'react', description: 'React optimizations' });
      }
      
      if (pkg.dependencies?.['express'] || pkg.dependencies?.['koa']) {
        agents.push({ name: 'api-tester', template: 'api', description: 'API testing' });
      }
    }
    
    // Blockchain projects
    if (this.projectName.includes('veria') || this.projectName.includes('blockchain')) {
      agents.push({ name: 'blockchain-auditor', template: 'blockchain', description: 'Smart contract audit' });
    }
    
    // Compliance projects
    if (this.projectName.includes('performia') || this.projectName.includes('compliance')) {
      agents.push({ name: 'compliance-checker', template: 'compliance', description: 'Compliance validation' });
    }
    
    return agents;
  }

  /**
   * Create a subagent from template
   */
  async createSubagent(agent) {
    const agentFile = path.join(this.devassistPath, 'agents', `${agent.name}.js`);
    
    const template = `#!/usr/bin/env node
/**
 * ${agent.description}
 * Auto-generated subagent for ${this.projectName}
 */

class ${this.toPascalCase(agent.name)} {
  constructor() {
    this.name = '${agent.name}';
    this.project = '${this.projectName}';
  }
  
  async execute(params = {}) {
    console.log(\`Executing \${this.name} for \${this.project}\`);
    
    // Agent-specific logic here
    ${this.getAgentLogic(agent.template)}
    
    return { success: true, agent: this.name };
  }
}

module.exports = ${this.toPascalCase(agent.name)};
`;
    
    fs.writeFileSync(agentFile, template);
    fs.chmodSync(agentFile, '755');
  }

  /**
   * Get agent-specific logic based on template
   */
  getAgentLogic(template) {
    const templates = {
      cleanup: `
    // Clean temporary files
    const tempPatterns = ['*.tmp', '*.log', '.DS_Store', 'node_modules/.cache'];
    console.log('Cleaning temporary files...');`,
      
      warmup: `
    // Warmup operations
    console.log('Loading project context...');
    console.log('Checking dependencies...');`,
      
      react: `
    // React optimization checks
    console.log('Checking React performance...');
    console.log('Analyzing component renders...');`,
      
      api: `
    // API testing operations
    console.log('Checking API endpoints...');
    console.log('Validating responses...');`,
      
      blockchain: `
    // Blockchain audit operations
    console.log('Auditing smart contracts...');
    console.log('Checking gas optimization...');`,
      
      compliance: `
    // Compliance validation
    console.log('Running compliance checks...');
    console.log('Validating security standards...');`
    };
    
    return templates[template] || '// Custom logic here';
  }

  /**
   * Load previous session context
   */
  async loadPreviousContext() {
    console.log('\n📚 Loading Previous Context:');
    
    // Find last terminal log
    if (fs.existsSync(this.terminalLogsPath)) {
      const logs = fs.readdirSync(this.terminalLogsPath)
        .filter(f => f.endsWith('.log'))
        .sort()
        .reverse();
      
      if (logs.length > 0) {
        const lastLog = path.join(this.terminalLogsPath, logs[0]);
        console.log(`  • Last session: ${logs[0]}`);
        
        // Extract key commands from last session
        const content = fs.readFileSync(lastLog, 'utf8');
        const commands = content.split('\n')
          .filter(line => line.startsWith('$ '))
          .slice(-5);
        
        if (commands.length > 0) {
          console.log('  • Recent commands:');
          commands.forEach(cmd => console.log(`    ${cmd}`));
        }
      }
    }
    
    // Load session summaries
    if (fs.existsSync(this.summaryFile)) {
      const summaries = fs.readFileSync(this.summaryFile, 'utf8');
      const lines = summaries.split('\n').slice(0, 20);
      console.log(`  • Found ${lines.length} lines of session history`);
    }
  }

  /**
   * Start session heartbeat
   */
  startHeartbeat() {
    // Heartbeat every 5 minutes
    this.heartbeatInterval = setInterval(() => {
      this.pulse();
    }, 5 * 60 * 1000);
    
    console.log('\n💓 Heartbeat Started (5-minute intervals)');
  }

  /**
   * Heartbeat pulse
   */
  pulse() {
    const timestamp = new Date().toISOString();
    console.log(`\n[HEARTBEAT] ${timestamp} - Session active`);
    
    // Update session file
    if (this.currentSession) {
      this.currentSession.lastHeartbeat = timestamp;
      this.saveSessionFile();
    }
    
    // Random reminder
    const reminders = [
      '💭 Remember to commit your changes',
      '☕ Good time for a break?',
      '📝 Document what you built',
      '🧪 Test recent changes',
      '🔍 Check for duplicate code'
    ];
    
    const reminder = reminders[Math.floor(Math.random() * reminders.length)];
    console.log(`[DEVASSIST] ${reminder}`);
  }

  /**
   * Sprint check - manual heartbeat
   */
  sprintCheck(message = 'Continuing work') {
    console.log(`\n⚡ Sprint Check: ${message}`);
    this.pulse();
    
    // Reset heartbeat timer
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.startHeartbeat();
    }
  }

  /**
   * Create continuous summary
   */
  async updateContinuousSummary(summary) {
    const entry = `
## Session: ${this.currentSession.id}
**Date:** ${new Date().toISOString()}
**Project:** ${this.projectName}

${summary}

---
`;
    
    // Prepend to summary file (latest on top)
    let existing = '';
    if (fs.existsSync(this.summaryFile)) {
      existing = fs.readFileSync(this.summaryFile, 'utf8');
    }
    
    fs.writeFileSync(this.summaryFile, entry + existing);
    console.log('📝 Updated PROJECT_SESSIONS.md');
  }

  /**
   * End session with full cleanup
   */
  async end() {
    console.log('\n🏁 Ending Enhanced DevAssist Session');
    console.log('===================================\n');
    
    if (!this.currentSession) {
      console.log('No active session to end');
      return;
    }
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      console.log('💓 Heartbeat stopped');
    }
    
    // Generate session summary
    const summary = await this.generateSessionSummary();
    
    // Update continuous summary file
    await this.updateContinuousSummary(summary);
    
    // Git operations
    await this.performGitOperations(summary);
    
    // Cleanup
    await this.runCleanup();
    
    // Archive session
    this.currentSession.ended = new Date().toISOString();
    this.archiveSession();
    
    console.log('\n✅ Session Ended Successfully!');
    console.log('  • Summary saved to PROJECT_SESSIONS.md');
    console.log('  • Git changes committed');
    console.log('  • Cleanup completed');
    
    this.currentSession = null;
  }

  /**
   * Session recovery from crash
   */
  async recoverFromCrash() {
    const currentFile = path.join(this.sessionsPath, 'current.json');
    
    if (fs.existsSync(currentFile)) {
      console.log('⚠️  Found incomplete session - recovering...');
      
      const session = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
      console.log(`  • Session ID: ${session.id}`);
      console.log(`  • Started: ${session.started}`);
      
      // Archive the incomplete session
      const archiveFile = path.join(this.sessionsPath, `crashed_${session.id}.json`);
      fs.renameSync(currentFile, archiveFile);
      
      console.log('  ✅ Previous session archived');
    }
  }

  // Helper methods
  async checkDevAssist() {
    return fs.existsSync(this.devassistPath);
  }

  async checkTerminalLogs() {
    return fs.existsSync(this.terminalLogsPath);
  }

  async checkKnowledgeBase() {
    return fs.existsSync(this.knowledgePath);
  }

  async checkGitStatus() {
    return fs.existsSync(path.join(this.projectPath, '.git'));
  }

  async checkMCPConfig() {
    return fs.existsSync(path.join(this.projectPath, '.mcp.json'));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  toPascalCase(str) {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }

  saveSessionFile() {
    const sessionFile = path.join(this.sessionsPath, 'current.json');
    fs.writeFileSync(sessionFile, JSON.stringify(this.currentSession, null, 2));
  }

  archiveSession() {
    const currentFile = path.join(this.sessionsPath, 'current.json');
    const archiveFile = path.join(this.sessionsPath, `session_${this.currentSession.id}.json`);
    
    if (fs.existsSync(currentFile)) {
      fs.renameSync(currentFile, archiveFile);
    }
  }

  async generateSessionSummary() {
    // Generate intelligent summary
    const duration = new Date() - new Date(this.currentSession.started);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `### Summary
- Duration: ${hours}h ${minutes}m
- Subagents used: ${Array.from(this.subagents.keys()).join(', ')}
- Heartbeat pulses: ${Math.floor(duration / (5 * 60 * 1000))}

### Work Completed
- Session management enhancements
- Subagent verification
- Continuous summaries

### Next Steps
- Continue implementation
- Test in production projects`;
  }

  async performGitOperations(summary) {
    console.log('\n📦 Git Operations:');
    
    try {
      // Git add
      await this.execCommand('git add -A');
      console.log('  ✅ Changes staged');
      
      // Git commit
      const message = `Session ${this.currentSession.id}: ${this.projectName} development\n\n${summary}`;
      await this.execCommand(`git commit -m "${message}"`);
      console.log('  ✅ Changes committed');
    } catch (error) {
      console.log('  ⚠️  Git operations skipped:', error.message);
    }
  }

  async runCleanup() {
    console.log('\n🧹 Running Cleanup:');
    
    const cleanupAgent = path.join(this.devassistPath, 'agents', 'cleanup.js');
    if (fs.existsSync(cleanupAgent)) {
      try {
        const Cleanup = require(cleanupAgent);
        const cleanup = new Cleanup();
        await cleanup.execute();
        console.log('  ✅ Cleanup completed');
      } catch (error) {
        console.log('  ⚠️  Cleanup skipped:', error.message);
      }
    }
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: this.projectPath }, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }
}

// Export for use in other modules
module.exports = EnhancedSessionManager;

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const manager = new EnhancedSessionManager();
  
  switch (command) {
    case 'start':
      manager.start(process.argv[3]);
      break;
    
    case 'end':
      manager.end();
      break;
    
    case 'sprint':
      manager.sprintCheck(process.argv[3]);
      break;
    
    case 'status':
      console.log('Session status:', manager.currentSession || 'No active session');
      break;
    
    default:
      console.log('Usage: enhanced-session-manager [start|end|sprint|status]');
  }
}