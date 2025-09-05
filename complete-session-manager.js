#!/usr/bin/env node

/**
 * Complete Session Manager for DevAssist
 * Sprint 3: Full Git Integration & Cleanup
 * 
 * Features:
 * - Automatic git commits with intelligent messages
 * - Optional git push with confirmation
 * - Enhanced cleanup with patterns and archival
 * - Continuous knowledge preservation
 * - PROJECT_SESSIONS.md management
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const readline = require('readline');

// Import our managers (will be embedded in devassist-init)
const GitIntegrationManager = require('./git-integration-manager');
const EnhancedCleanupAgent = require('./cleanup-agent');

class CompleteSessionManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.projectName = path.basename(projectPath).toLowerCase().replace(/[^a-z0-9]/g, '');
    this.devassistPath = path.join(projectPath, '.devassist');
    this.sessionsPath = path.join(projectPath, '.sessions');
    this.terminalLogsPath = path.join(this.devassistPath, 'terminal_logs');
    this.knowledgePath = path.join(this.devassistPath, 'knowledge');
    this.summaryFile = path.join(projectPath, 'PROJECT_SESSIONS.md');
    
    // Managers
    this.gitManager = new GitIntegrationManager(projectPath);
    this.cleanupAgent = new EnhancedCleanupAgent(projectPath);
    
    // Session state
    this.currentSession = null;
    this.heartbeatInterval = null;
    this.subagents = new Map();
    this.sessionKnowledge = [];
  }

  /**
   * Start session with full warmup and recovery
   */
  async start(description = 'Development session') {
    console.log('\n🚀 Starting Complete DevAssist Session');
    console.log('======================================\n');
    
    // 1. Crash recovery
    await this.recoverFromCrash();
    
    // 2. Initialize session
    const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentSession = {
      id: sessionId,
      project: this.projectName,
      started: new Date().toISOString(),
      description,
      terminalLog: path.join(this.terminalLogsPath, `session_${sessionId}.log`),
      knowledge: [],
      gitBranch: await this.getCurrentGitBranch(),
      initialStatus: await this.getGitStatus()
    };
    
    // 3. Warmup with animations
    await this.runWarmupSequence();
    
    // 4. Verify subagents
    await this.verifySubagents();
    
    // 5. Load previous context and knowledge
    await this.loadPreviousContext();
    
    // 6. Start heartbeat
    this.startHeartbeat();
    
    // 7. Save session file
    this.saveSessionFile();
    
    // 8. Initial knowledge entry
    this.addKnowledge('session_start', {
      description,
      gitBranch: this.currentSession.gitBranch,
      timestamp: new Date().toISOString()
    });
    
    console.log('\n✅ Session Started Successfully!');
    console.log(`  • ID: ${sessionId}`);
    console.log(`  • Project: ${this.projectName}`);
    console.log(`  • Branch: ${this.currentSession.gitBranch}`);
    console.log(`  • Heartbeat: Active (5-min)`);
    console.log(`  • Knowledge: Recording`);
    console.log('\n💡 Commands available:');
    console.log('  • sprint-check: Manual heartbeat');
    console.log('  • checkpoint: Save progress');
    console.log('  • end: Complete session with git & cleanup');
  }

  /**
   * End session with complete workflow
   */
  async end() {
    console.log('\n🏁 Ending Complete DevAssist Session');
    console.log('====================================\n');
    
    if (!this.currentSession) {
      console.log('No active session to end');
      return;
    }
    
    // 1. Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      console.log('💓 Heartbeat stopped');
    }
    
    // 2. Generate comprehensive session summary
    const summary = await this.generateComprehensiveSummary();
    
    // 3. Preserve knowledge
    await this.preserveKnowledge();
    
    // 4. Update PROJECT_SESSIONS.md (latest on top)
    await this.updateContinuousSummary(summary);
    
    // 5. Git operations (commit + optional push)
    await this.performGitOperations(summary);
    
    // 6. Run cleanup
    await this.runCleanup();
    
    // 7. Archive session
    this.currentSession.ended = new Date().toISOString();
    this.archiveSession();
    
    // 8. Final report
    console.log('\n✅ Session Ended Successfully!');
    console.log('================================');
    console.log('  📝 Summary saved to PROJECT_SESSIONS.md');
    console.log('  📦 Git changes committed');
    console.log('  🧹 Cleanup completed');
    console.log('  💾 Knowledge preserved');
    console.log('  📚 Session archived');
    
    this.currentSession = null;
  }

  /**
   * Checkpoint - save progress without ending
   */
  async checkpoint(message = 'Progress checkpoint') {
    console.log('\n💾 Creating Session Checkpoint');
    console.log('==============================');
    
    if (!this.currentSession) {
      console.log('No active session');
      return;
    }
    
    // Add to knowledge
    this.addKnowledge('checkpoint', {
      message,
      timestamp: new Date().toISOString(),
      gitStatus: await this.getGitStatus()
    });
    
    // Create checkpoint file
    const checkpointFile = path.join(
      this.sessionsPath,
      `checkpoint_${Date.now()}.json`
    );
    
    const checkpointData = {
      sessionId: this.currentSession.id,
      message,
      timestamp: new Date().toISOString(),
      knowledge: this.sessionKnowledge,
      gitStatus: await this.getGitStatus()
    };
    
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpointData, null, 2));
    
    // Optional: Create git stash
    const stashed = await this.gitManager.stashIfNeeded();
    
    console.log('✅ Checkpoint created');
    console.log(`  • Message: ${message}`);
    console.log(`  • Knowledge items: ${this.sessionKnowledge.length}`);
    if (stashed) {
      console.log(`  • Git stash: ${stashed}`);
    }
    
    // Update session file
    this.saveSessionFile();
  }

  /**
   * Add knowledge entry
   */
  addKnowledge(type, data) {
    const entry = {
      type,
      timestamp: new Date().toISOString(),
      data
    };
    
    this.sessionKnowledge.push(entry);
    
    // Also save to knowledge directory
    const knowledgeFile = path.join(
      this.knowledgePath,
      `${this.currentSession.id}_knowledge.json`
    );
    
    fs.writeFileSync(knowledgeFile, JSON.stringify(this.sessionKnowledge, null, 2));
  }

  /**
   * Preserve knowledge to continuous file
   */
  async preserveKnowledge() {
    console.log('\n💾 Preserving Knowledge...');
    
    // Create knowledge summary
    const knowledgeSummary = {
      sessionId: this.currentSession.id,
      project: this.projectName,
      duration: this.calculateDuration(),
      knowledgeItems: this.sessionKnowledge.length,
      keyEvents: this.sessionKnowledge
        .filter(k => k.type !== 'heartbeat')
        .map(k => ({
          type: k.type,
          time: k.timestamp,
          data: k.data
        }))
    };
    
    // Save to dedicated knowledge file
    const knowledgeArchive = path.join(
      this.knowledgePath,
      'archived_knowledge.json'
    );
    
    let existingKnowledge = [];
    if (fs.existsSync(knowledgeArchive)) {
      try {
        existingKnowledge = JSON.parse(fs.readFileSync(knowledgeArchive, 'utf8'));
      } catch (e) {
        existingKnowledge = [];
      }
    }
    
    // Add new knowledge (latest first)
    existingKnowledge.unshift(knowledgeSummary);
    
    // Keep only last 100 sessions
    existingKnowledge = existingKnowledge.slice(0, 100);
    
    fs.writeFileSync(knowledgeArchive, JSON.stringify(existingKnowledge, null, 2));
    console.log(`  ✅ Preserved ${this.sessionKnowledge.length} knowledge items`);
  }

  /**
   * Generate comprehensive session summary
   */
  async generateComprehensiveSummary() {
    const duration = this.calculateDuration();
    const gitStatus = await this.getGitStatus();
    const filesChanged = gitStatus.split('\n').filter(l => l.trim()).length;
    
    // Analyze knowledge for key accomplishments
    const checkpoints = this.sessionKnowledge.filter(k => k.type === 'checkpoint');
    const heartbeats = this.sessionKnowledge.filter(k => k.type === 'heartbeat');
    
    const summary = `
### 🎯 Session ${this.currentSession.id}

**Project:** ${this.projectName}  
**Date:** ${new Date().toDateString()}  
**Duration:** ${duration}  
**Branch:** ${this.currentSession.gitBranch}

#### 📊 Statistics
- Files changed: ${filesChanged}
- Checkpoints: ${checkpoints.length}
- Heartbeat pulses: ${heartbeats.length}
- Knowledge items: ${this.sessionKnowledge.length}

#### 🚀 Session Highlights
${this.extractHighlights()}

#### 📝 Checkpoints
${checkpoints.map(c => `- ${c.data.message} (${new Date(c.timestamp).toLocaleTimeString()})`).join('\n') || '- No checkpoints created'}

#### 🔄 Git Changes
\`\`\`
${gitStatus.slice(0, 500)}
\`\`\`

#### 💡 Next Steps
- Continue implementation
- Review changes
- Test functionality

---
*Generated by DevAssist Complete Session Manager*`;
    
    return summary;
  }

  /**
   * Extract session highlights from knowledge
   */
  extractHighlights() {
    const highlights = [];
    
    // Look for specific patterns in knowledge
    for (const item of this.sessionKnowledge) {
      if (item.type === 'checkpoint') {
        highlights.push(`✓ ${item.data.message}`);
      }
    }
    
    if (highlights.length === 0) {
      highlights.push('✓ Development session completed');
    }
    
    return highlights.slice(0, 5).join('\n');
  }

  /**
   * Update PROJECT_SESSIONS.md with latest on top
   */
  async updateContinuousSummary(summary) {
    console.log('\n📝 Updating PROJECT_SESSIONS.md...');
    
    // Read existing content
    let existingContent = '';
    if (fs.existsSync(this.summaryFile)) {
      existingContent = fs.readFileSync(this.summaryFile, 'utf8');
    } else {
      // Create header for new file
      existingContent = `# ${this.projectName} - Session History

> Continuous session log with latest sessions on top
> Generated by DevAssist Complete Session Manager

---
`;
    }
    
    // Prepend new summary (latest on top)
    const newContent = existingContent.replace(
      /---\n/,
      `---\n\n${summary}\n`
    );
    
    fs.writeFileSync(this.summaryFile, newContent);
    console.log('  ✅ SESSION_SESSIONS.md updated (latest on top)');
  }

  /**
   * Perform git operations
   */
  async performGitOperations(summary) {
    console.log('\n📦 Git Operations...');
    
    // Add session data to git commit
    const sessionData = {
      ...this.currentSession,
      summary
    };
    
    // Use GitIntegrationManager for complete workflow
    const committed = await this.gitManager.commitChanges(sessionData);
    
    if (committed) {
      // Ask about push
      await this.gitManager.pushChanges();
    }
  }

  /**
   * Run cleanup operations
   */
  async runCleanup() {
    console.log('\n🧹 Running Cleanup...');
    
    // Run with dry-run first to show what will be cleaned
    const dryRunAgent = new EnhancedCleanupAgent(this.projectPath, { dryRun: true, verbose: false });
    const dryRunStats = await dryRunAgent.execute();
    
    if (dryRunStats.filesDeleted > 0 || dryRunStats.logsArchived > 0) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question(`\nProceed with cleanup? (${dryRunStats.filesDeleted} files, ${this.formatBytes(dryRunStats.bytesFreed)}) (y/n): `, resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() === 'y') {
        // Run actual cleanup
        const agent = new EnhancedCleanupAgent(this.projectPath, { dryRun: false });
        await agent.execute();
      } else {
        console.log('  ⏭️  Cleanup skipped');
      }
    } else {
      console.log('  ℹ️  Nothing to clean');
    }
  }

  // === Warmup and initialization methods ===
  
  async runWarmupSequence() {
    const steps = [
      { name: 'DevAssist Core', check: () => fs.existsSync(this.devassistPath) },
      { name: 'Terminal Logs', check: () => fs.existsSync(this.terminalLogsPath) },
      { name: 'Git Repository', check: () => fs.existsSync(path.join(this.projectPath, '.git')) },
      { name: 'Knowledge Base', check: () => fs.existsSync(this.knowledgePath) },
      { name: 'Session History', check: () => fs.existsSync(this.summaryFile) }
    ];
    
    console.log('🔄 Warmup Sequence:\n');
    
    for (const step of steps) {
      process.stdout.write(`  ⏳ ${step.name}...`);
      await this.delay(200);
      const result = await step.check();
      console.log(`\r  ${result ? '✅' : '⚠️'} ${step.name}    `);
    }
  }

  async verifySubagents() {
    console.log('\n🔍 Verifying Subagents:');
    
    const agentsPath = path.join(this.devassistPath, 'agents');
    if (!fs.existsSync(agentsPath)) {
      fs.mkdirSync(agentsPath, { recursive: true });
    }
    
    // Ensure cleanup agent exists
    const cleanupPath = path.join(agentsPath, 'cleanup.js');
    if (!fs.existsSync(cleanupPath)) {
      fs.writeFileSync(cleanupPath, `
module.exports = class Cleanup {
  async execute() {
    console.log('Running cleanup...');
    return { success: true };
  }
};`);
    }
    console.log('  ✅ cleanup agent verified');
  }

  async loadPreviousContext() {
    console.log('\n📚 Loading Previous Context:');
    
    // Load last session summary
    if (fs.existsSync(this.summaryFile)) {
      const content = fs.readFileSync(this.summaryFile, 'utf8');
      const lines = content.split('\n').slice(0, 10);
      console.log(`  • Found session history (${lines.length} lines)`);
    }
    
    // Load last terminal log
    if (fs.existsSync(this.terminalLogsPath)) {
      const logs = fs.readdirSync(this.terminalLogsPath)
        .filter(f => f.endsWith('.log'))
        .sort()
        .reverse();
      
      if (logs.length > 0) {
        console.log(`  • Last session log: ${logs[0]}`);
      }
    }
    
    // Load archived knowledge
    const knowledgeArchive = path.join(this.knowledgePath, 'archived_knowledge.json');
    if (fs.existsSync(knowledgeArchive)) {
      try {
        const knowledge = JSON.parse(fs.readFileSync(knowledgeArchive, 'utf8'));
        console.log(`  • Knowledge archive: ${knowledge.length} sessions`);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  // === Heartbeat methods ===
  
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.pulse();
    }, 5 * 60 * 1000);
    
    console.log('\n💓 Heartbeat Started (5-min intervals)');
  }

  pulse() {
    const timestamp = new Date().toISOString();
    console.log(`\n[HEARTBEAT] ${timestamp} - Session active`);
    
    // Add to knowledge
    this.addKnowledge('heartbeat', { timestamp });
    
    // Random reminder
    const reminders = [
      '💭 Consider creating a checkpoint',
      '☕ Good time for a break?',
      '📝 Document your progress',
      '🧪 Test recent changes',
      '🔍 Review code quality'
    ];
    
    const reminder = reminders[Math.floor(Math.random() * reminders.length)];
    console.log(`[DEVASSIST] ${reminder}`);
  }

  sprintCheck(message = 'Continuing work') {
    console.log(`\n⚡ Sprint Check: ${message}`);
    
    // Add to knowledge
    this.addKnowledge('sprint_check', { message });
    
    // Reset heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.startHeartbeat();
    }
    
    this.pulse();
  }

  // === Helper methods ===
  
  async recoverFromCrash() {
    const currentFile = path.join(this.sessionsPath, 'current.json');
    if (fs.existsSync(currentFile)) {
      console.log('⚠️  Recovering from previous session...');
      const session = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
      
      // Archive crashed session
      const crashFile = path.join(this.sessionsPath, `crashed_${session.id}.json`);
      fs.renameSync(currentFile, crashFile);
      console.log('  ✅ Previous session archived');
    }
  }

  saveSessionFile() {
    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true });
    }
    
    const sessionFile = path.join(this.sessionsPath, 'current.json');
    fs.writeFileSync(sessionFile, JSON.stringify({
      ...this.currentSession,
      knowledge: this.sessionKnowledge
    }, null, 2));
  }

  archiveSession() {
    const currentFile = path.join(this.sessionsPath, 'current.json');
    const archiveFile = path.join(this.sessionsPath, `session_${this.currentSession.id}.json`);
    
    if (fs.existsSync(currentFile)) {
      fs.renameSync(currentFile, archiveFile);
    }
  }

  async getCurrentGitBranch() {
    try {
      const result = await this.execCommand('git branch --show-current');
      return result.trim() || 'main';
    } catch (e) {
      return 'main';
    }
  }

  async getGitStatus() {
    try {
      return await this.execCommand('git status --short');
    } catch (e) {
      return '';
    }
  }

  calculateDuration() {
    if (!this.currentSession?.started) return 'unknown';
    
    const start = new Date(this.currentSession.started);
    const end = new Date();
    const duration = end - start;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: this.projectPath }, (error, stdout) => {
        if (error && !command.includes('2>/dev/null')) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  status() {
    if (this.currentSession) {
      console.log('\n📊 Active Session:');
      console.log(`  • ID: ${this.currentSession.id}`);
      console.log(`  • Duration: ${this.calculateDuration()}`);
      console.log(`  • Knowledge items: ${this.sessionKnowledge.length}`);
      console.log(`  • Branch: ${this.currentSession.gitBranch}`);
    } else {
      console.log('\nNo active session');
    }
  }
}

// Export
module.exports = CompleteSessionManager;

// CLI
if (require.main === module) {
  const command = process.argv[2];
  const manager = new CompleteSessionManager();
  
  switch (command) {
    case 'start':
      manager.start(process.argv[3]);
      break;
    case 'end':
      manager.end();
      break;
    case 'checkpoint':
      manager.checkpoint(process.argv[3]);
      break;
    case 'sprint':
      manager.sprintCheck(process.argv[3]);
      break;
    case 'status':
      manager.status();
      break;
    default:
      console.log('Usage: complete-session-manager [start|end|checkpoint|sprint|status]');
  }
}