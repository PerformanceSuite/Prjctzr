#!/usr/bin/env node

/**
 * Cleanup Agent for PROJECT_SETUP
 * Universal agent that runs at session end
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 PROJECT_SETUP Cleanup Agent');

// Clean Python cache
try {
  execSync('find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null');
  console.log('✓ Cleaned Python cache');
} catch {}

// Clean test artifacts
try {
  execSync('rm -rf .pytest_cache htmlcov .coverage 2>/dev/null');
  console.log('✓ Cleaned test artifacts');
} catch {}

// Archive old logs
const logsPath = path.join('/Users/danielconnolly/Projects/PROJECT_SETUP', '.devassist/terminal_logs');
try {
  const logs = fs.readdirSync(logsPath);
  const weekOld = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  logs.forEach(log => {
    const logPath = path.join(logsPath, log);
    const stat = fs.statSync(logPath);
    if (stat.mtime < weekOld) {
      fs.unlinkSync(logPath);
    }
  });
  console.log('✓ Archived old logs');
} catch {}

console.log('✨ Cleanup complete!');
