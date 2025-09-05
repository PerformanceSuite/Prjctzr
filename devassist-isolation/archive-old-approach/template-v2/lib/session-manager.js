/**
 * Session State Manager
 * 
 * Handles session persistence, state management, and context restoration
 * across Claude Code restarts with complete project isolation.
 */

import fs from 'fs';
import path from 'path';

export class SessionManager {
  constructor(projectConfig, devassistCore) {
    this.config = projectConfig;
    this.devassist = devassistCore;
    this.currentSession = null;
    this.sessionFile = path.join(projectConfig.sessionsDir, 'current.json');
    this.stateFile = path.join(projectConfig.sessionsDir, 'state.json');
  }

  /**
   * Start a new session with full warmup and context loading
   */
  async startSession(sessionConfig = {}) {
    console.error(`\n🚀 Starting ${this.config.projectName.toUpperCase()} Development Session`);
    
    // Check for previous session
    const previousSession = await this.loadPreviousSession();
    if (previousSession) {
      console.error(`📚 Found previous session: ${previousSession.id}`);
      console.error(`📅 Last active: ${new Date(previousSession.lastActive).toLocaleString()}`);
    }

    // Start new session with DevAssist integration
    const session = await this.devassist.startSession({
      description: sessionConfig.description || `${this.config.projectName} development session`,
      previousSession: previousSession?.id,
      loadContext: sessionConfig.loadContext !== false,
      loadBlockchain: sessionConfig.loadBlockchain,
      ...sessionConfig
    });

    // Load terminal logs if available
    await this.loadTerminalLogs(session);
    
    // Load project context and memory
    await this.loadProjectContext(session);

    // Save current session
    this.currentSession = session;
    await this.saveCurrentSession();

    return {
      sessionId: session.id,
      project: this.config.projectName,
      startTime: session.startTime,
      subagents: session.subagents,
      memoryCount: session.memory.length,
      contextLoaded: true,
      warmupComplete: true
    };
  }

  /**
   * End current session with proper cleanup and archival
   */
  async endSession(options = {}) {
    if (!this.currentSession) {
      throw new Error('No active session to end');
    }

    console.error(`\n🏁 Ending ${this.config.projectName.toUpperCase()} Session`);

    // Archive current work and context
    await this.archiveCurrentWork();

    // End DevAssist session
    const cleanup = await this.devassist.endSession(this.currentSession.id);

    // Save final session state
    await this.saveFinalSessionState(cleanup);

    // Clear current session
    const endedSession = this.currentSession;
    this.currentSession = null;
    
    // Clean up current session file
    if (fs.existsSync(this.sessionFile)) {
      fs.unlinkSync(this.sessionFile);
    }

    return {
      sessionId: endedSession.id,
      duration: cleanup.duration,
      memoriesCreated: cleanup.memoriesCreated,
      subagentsActive: cleanup.subagentsActive,
      cleanupComplete: true
    };
  }

  /**
   * Save checkpoint during session
   */
  async checkpoint(summary) {
    if (!this.currentSession) {
      throw new Error('No active session for checkpoint');
    }

    const checkpoint = {
      sessionId: this.currentSession.id,
      timestamp: new Date().toISOString(),
      summary,
      memoryCount: this.currentSession.memory.length,
      workingDirectory: process.cwd()
    };

    // Save checkpoint
    const checkpointFile = path.join(
      this.config.sessionsDir, 
      `checkpoint-${Date.now()}.json`
    );
    
    await fs.promises.writeFile(checkpointFile, JSON.stringify(checkpoint, null, 2));
    
    // Update session with checkpoint
    this.currentSession.lastCheckpoint = checkpoint;
    await this.saveCurrentSession();

    console.error(`📍 Checkpoint saved: ${summary}`);
    
    return checkpoint;
  }

  /**
   * Get current session status
   */
  async getSessionStatus() {
    if (!this.currentSession) {
      return {
        active: false,
        message: 'No active session'
      };
    }

    const now = new Date();
    const startTime = new Date(this.currentSession.startTime);
    const duration = Math.floor((now - startTime) / 1000);

    return {
      active: true,
      sessionId: this.currentSession.id,
      project: this.config.projectName,
      duration: `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`,
      subagents: this.currentSession.subagents.length,
      memoryCount: this.currentSession.memory.length,
      lastCheckpoint: this.currentSession.lastCheckpoint?.timestamp,
      devassistIntegration: 'active'
    };
  }

  /**
   * Load previous session if exists
   */
  async loadPreviousSession() {
    if (!fs.existsSync(this.stateFile)) {
      return null;
    }

    try {
      const stateData = await fs.promises.readFile(this.stateFile, 'utf8');
      const state = JSON.parse(stateData);
      return state.lastSession;
    } catch (error) {
      console.error(`⚠️  Failed to load previous session: ${error.message}`);
      return null;
    }
  }

  /**
   * Load terminal logs from previous sessions
   */
  async loadTerminalLogs(session) {
    const terminalLogsPath = this.config.terminalLogsDir;
    
    if (!fs.existsSync(terminalLogsPath)) {
      return;
    }

    try {
      const logFiles = fs.readdirSync(terminalLogsPath)
        .filter(file => file.endsWith('.log'))
        .sort()
        .slice(-5); // Last 5 log files

      if (logFiles.length > 0) {
        console.error(`📜 Loading terminal logs: ${logFiles.length} recent sessions`);
        
        // In a real implementation, this would parse and integrate logs
        session.terminalLogsLoaded = logFiles.length;
        session.lastTerminalSession = logFiles[logFiles.length - 1];
      }
    } catch (error) {
      console.error(`⚠️  Failed to load terminal logs: ${error.message}`);
    }
  }

  /**
   * Load project-specific context and memory
   */
  async loadProjectContext(session) {
    console.error(`📚 Loading ${this.config.projectName} project context...`);
    
    // Load project memory
    const projectMemory = await this.devassist.loadProjectMemory();
    session.memory = projectMemory;
    
    // Load project-specific configurations
    const projectConfigFile = path.join(this.config.dataDir, 'project-config.json');
    if (fs.existsSync(projectConfigFile)) {
      try {
        const projectData = await fs.promises.readFile(projectConfigFile, 'utf8');
        session.projectConfig = JSON.parse(projectData);
        console.error(`⚙️  Project configuration loaded`);
      } catch (error) {
        console.error(`⚠️  Failed to load project config: ${error.message}`);
      }
    }

    // Load recent decisions and progress
    const recentMemory = await this.devassist.searchMemory('', { 
      category: 'all', 
      limit: 20 
    });
    
    session.recentContext = recentMemory.results;
    console.error(`🧠 Context loaded: ${session.memory.length} memories, ${session.recentContext.length} recent items`);
  }

  /**
   * Save current session state
   */
  async saveCurrentSession() {
    if (!this.currentSession) {
      return;
    }

    // Ensure sessions directory exists
    if (!fs.existsSync(this.config.sessionsDir)) {
      fs.mkdirSync(this.config.sessionsDir, { recursive: true });
    }

    try {
      await fs.promises.writeFile(
        this.sessionFile, 
        JSON.stringify(this.currentSession, null, 2)
      );
    } catch (error) {
      console.error(`⚠️  Failed to save current session: ${error.message}`);
    }
  }

  /**
   * Archive current work before ending session
   */
  async archiveCurrentWork() {
    console.error(`📁 Archiving current session work...`);
    
    // Create archive entry
    const archive = {
      sessionId: this.currentSession.id,
      project: this.config.projectName,
      archiveTime: new Date().toISOString(),
      workSummary: {
        memoryCount: this.currentSession.memory.length,
        subagentsActive: this.currentSession.subagents.length,
        terminalLogsLoaded: this.currentSession.terminalLogsLoaded || 0,
        checkpoints: this.currentSession.lastCheckpoint ? 1 : 0
      }
    };

    // Save archive
    const archiveFile = path.join(
      this.config.sessionsDir,
      'archives',
      `${this.currentSession.id}-archive.json`
    );

    // Ensure archive directory exists
    const archiveDir = path.dirname(archiveFile);
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    await fs.promises.writeFile(archiveFile, JSON.stringify(archive, null, 2));
    console.error(`✅ Work archived: ${archiveFile}`);
  }

  /**
   * Save final session state for future reference
   */
  async saveFinalSessionState(cleanup) {
    const finalState = {
      lastSession: {
        id: this.currentSession.id,
        project: this.config.projectName,
        startTime: this.currentSession.startTime,
        endTime: new Date().toISOString(),
        duration: cleanup.duration,
        memoriesCreated: cleanup.memoriesCreated,
        lastActive: new Date().toISOString()
      },
      projectStats: {
        totalSessions: await this.getTotalSessionCount(),
        totalMemories: cleanup.memoriesCreated,
        lastUpdate: new Date().toISOString()
      }
    };

    await fs.promises.writeFile(this.stateFile, JSON.stringify(finalState, null, 2));
    console.error(`💾 Final session state saved`);
  }

  /**
   * Get total number of sessions for this project
   */
  async getTotalSessionCount() {
    try {
      const archiveDir = path.join(this.config.sessionsDir, 'archives');
      if (!fs.existsSync(archiveDir)) {
        return 1;
      }
      
      const archives = fs.readdirSync(archiveDir).filter(file => file.endsWith('-archive.json'));
      return archives.length;
    } catch (error) {
      return 1;
    }
  }
}// Export only what this file defines
export default { SessionManager };
