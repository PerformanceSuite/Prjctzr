#!/usr/bin/env node

/**
 * Enhanced Cleanup Agent for DevAssist
 * Comprehensive cleanup with:
 * - Pattern-based file removal
 * - Log archival (>7 days)
 * - Test artifact cleaning
 * - Build directory management
 * - Safe operation with dry-run mode
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnhancedCleanupAgent {
  constructor(projectPath = process.cwd(), options = {}) {
    this.projectPath = projectPath;
    this.projectName = path.basename(projectPath);
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || true;
    
    // Cleanup patterns by category
    this.patterns = {
      // Temporary files
      temporary: [
        '*.tmp',
        '*.temp',
        '*.bak',
        '*.backup',
        '*.swp',
        '*.swo',
        '*~',
        '.DS_Store',
        'Thumbs.db',
        'desktop.ini'
      ],
      
      // Log files (except DevAssist logs)
      logs: [
        '*.log',
        '!.devassist/terminal_logs/*.log', // Exclude DevAssist logs
        'npm-debug.log*',
        'yarn-debug.log*',
        'yarn-error.log*',
        'lerna-debug.log*',
        'pnpm-debug.log*'
      ],
      
      // Test artifacts
      testArtifacts: [
        'coverage/',
        '.nyc_output/',
        'test-results/',
        '*.lcov',
        '.coverage',
        'htmlcov/',
        '.pytest_cache/',
        '__pycache__/',
        '*.pyc',
        '*.pyo'
      ],
      
      // Build artifacts
      buildArtifacts: [
        'dist/',
        'build/',
        'out/',
        '.next/',
        '.nuxt/',
        '.vuepress/dist/',
        '.cache/',
        '.parcel-cache/',
        '*.min.js.map',
        '*.min.css.map'
      ],
      
      // Package manager caches
      packageCaches: [
        'node_modules/.cache/',
        '.npm/',
        '.yarn/cache/',
        '.pnpm-store/',
        'bower_components/'
      ],
      
      // IDE files
      ideFiles: [
        '.idea/',
        '.vscode/settings.json',
        '*.sublime-workspace',
        '.history/'
      ]
    };
    
    // Safe directories to never delete
    this.safeDirs = [
      '.git',
      '.devassist/data',
      '.devassist/knowledge',
      'node_modules',
      'src',
      'app',
      'lib',
      'public',
      'assets'
    ];
    
    this.stats = {
      filesDeleted: 0,
      bytesFreed: 0,
      logsArchived: 0,
      errors: []
    };
  }

  /**
   * Main cleanup execution
   */
  async execute() {
    console.log('\n🧹 Enhanced Cleanup Agent Starting...');
    console.log(`  Project: ${this.projectName}`);
    console.log(`  Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log('');
    
    // 1. Clean temporary files
    await this.cleanTemporaryFiles();
    
    // 2. Archive old logs
    await this.archiveOldLogs();
    
    // 3. Clean test artifacts
    await this.cleanTestArtifacts();
    
    // 4. Clean build files
    await this.cleanBuildArtifacts();
    
    // 5. Clear package caches
    await this.clearPackageCaches();
    
    // 6. Clean IDE files
    await this.cleanIDEFiles();
    
    // 7. Git cleanup
    await this.gitCleanup();
    
    // Report results
    this.reportResults();
    
    return this.stats;
  }

  /**
   * Clean temporary files
   */
  async cleanTemporaryFiles() {
    console.log('📄 Cleaning temporary files...');
    
    for (const pattern of this.patterns.temporary) {
      await this.removeByPattern(pattern, 'temporary');
    }
  }

  /**
   * Archive logs older than 7 days
   */
  async archiveOldLogs() {
    console.log('\n📚 Archiving old logs...');
    
    const logsDir = path.join(this.projectPath, '.devassist', 'terminal_logs');
    const archiveDir = path.join(this.projectPath, '.devassist', 'archived_logs');
    
    if (!fs.existsSync(logsDir)) return;
    
    // Create archive directory if needed
    if (!this.dryRun && !fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    try {
      const files = fs.readdirSync(logsDir);
      
      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtimeMs < sevenDaysAgo) {
          const archivePath = path.join(archiveDir, file + '.gz');
          
          if (this.dryRun) {
            console.log(`  [DRY] Would archive: ${file}`);
          } else {
            // Compress and move
            try {
              execSync(`gzip -c "${filePath}" > "${archivePath}"`);
              fs.unlinkSync(filePath);
              console.log(`  ✓ Archived: ${file}`);
              this.stats.logsArchived++;
            } catch (error) {
              console.log(`  ⚠️  Failed to archive: ${file}`);
              this.stats.errors.push(`Archive failed: ${file}`);
            }
          }
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Log archival error: ${error.message}`);
    }
    
    if (this.stats.logsArchived > 0) {
      console.log(`  📦 Archived ${this.stats.logsArchived} old logs`);
    }
  }

  /**
   * Clean test artifacts
   */
  async cleanTestArtifacts() {
    console.log('\n🧪 Cleaning test artifacts...');
    
    for (const pattern of this.patterns.testArtifacts) {
      await this.removeByPattern(pattern, 'test');
    }
  }

  /**
   * Clean build artifacts
   */
  async cleanBuildArtifacts() {
    console.log('\n🏗️  Cleaning build artifacts...');
    
    // Check if it's safe to clean build dirs
    const hasSource = fs.existsSync(path.join(this.projectPath, 'src')) ||
                     fs.existsSync(path.join(this.projectPath, 'app')) ||
                     fs.existsSync(path.join(this.projectPath, 'lib'));
    
    if (!hasSource) {
      console.log('  ⏭️  Skipping build cleanup (no source directories found)');
      return;
    }
    
    for (const pattern of this.patterns.buildArtifacts) {
      await this.removeByPattern(pattern, 'build');
    }
  }

  /**
   * Clear package manager caches
   */
  async clearPackageCaches() {
    console.log('\n📦 Clearing package caches...');
    
    for (const pattern of this.patterns.packageCaches) {
      await this.removeByPattern(pattern, 'cache');
    }
  }

  /**
   * Clean IDE files
   */
  async cleanIDEFiles() {
    console.log('\n💻 Cleaning IDE files...');
    
    for (const pattern of this.patterns.ideFiles) {
      await this.removeByPattern(pattern, 'ide');
    }
  }

  /**
   * Git cleanup operations
   */
  async gitCleanup() {
    console.log('\n🔧 Git cleanup...');
    
    try {
      // Prune remote branches
      if (!this.dryRun) {
        execSync('git remote prune origin 2>/dev/null', { cwd: this.projectPath });
        console.log('  ✓ Pruned remote branches');
      }
      
      // Clean reflog
      if (!this.dryRun) {
        execSync('git reflog expire --expire=now --all 2>/dev/null', { cwd: this.projectPath });
        execSync('git gc --prune=now --aggressive 2>/dev/null', { cwd: this.projectPath });
        console.log('  ✓ Cleaned git reflog and garbage collected');
      }
    } catch (error) {
      console.log('  ℹ️  Git cleanup skipped (not a git repository or no remote)');
    }
  }

  /**
   * Remove files by pattern
   */
  async removeByPattern(pattern, category) {
    // Handle negation patterns (files to keep)
    if (pattern.startsWith('!')) {
      return;
    }
    
    try {
      const files = this.findFiles(pattern);
      
      for (const file of files) {
        // Safety check
        if (this.isSafeToDelete(file)) {
          const stats = fs.statSync(file);
          const size = stats.size;
          
          if (this.dryRun) {
            console.log(`  [DRY] Would delete: ${path.relative(this.projectPath, file)} (${this.formatBytes(size)})`);
          } else {
            if (stats.isDirectory()) {
              fs.rmSync(file, { recursive: true, force: true });
            } else {
              fs.unlinkSync(file);
            }
            console.log(`  ✓ Deleted: ${path.relative(this.projectPath, file)} (${this.formatBytes(size)})`);
            this.stats.filesDeleted++;
            this.stats.bytesFreed += size;
          }
        }
      }
    } catch (error) {
      // Silently skip if pattern doesn't match anything
    }
  }

  /**
   * Find files matching pattern
   */
  findFiles(pattern) {
    const files = [];
    
    // Simple glob implementation
    const isDirectory = pattern.endsWith('/');
    const cleanPattern = pattern.replace(/\/$/, '');
    
    const walk = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          
          // Skip safe directories
          if (this.safeDirs.includes(item)) continue;
          
          try {
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
              if (this.matchesPattern(item, cleanPattern) && isDirectory) {
                files.push(fullPath);
              } else {
                walk(fullPath); // Recurse
              }
            } else if (this.matchesPattern(item, pattern) && !isDirectory) {
              files.push(fullPath);
            }
          } catch (err) {
            // Skip inaccessible files
          }
        }
      } catch (err) {
        // Skip inaccessible directories
      }
    };
    
    walk(this.projectPath);
    return files;
  }

  /**
   * Check if filename matches pattern
   */
  matchesPattern(filename, pattern) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filename);
  }

  /**
   * Check if file is safe to delete
   */
  isSafeToDelete(filepath) {
    const relativePath = path.relative(this.projectPath, filepath);
    
    // Never delete these
    const forbidden = [
      '.git',
      '.devassist/data',
      '.devassist/knowledge',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'Cargo.toml',
      'Cargo.lock',
      'go.mod',
      'go.sum',
      'requirements.txt',
      'Pipfile',
      'Pipfile.lock',
      'README.md',
      'LICENSE',
      '.env',
      '.env.local'
    ];
    
    for (const item of forbidden) {
      if (relativePath.startsWith(item)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Report cleanup results
   */
  reportResults() {
    console.log('\n📊 Cleanup Summary');
    console.log('==================');
    console.log(`  Files deleted: ${this.stats.filesDeleted}`);
    console.log(`  Space freed: ${this.formatBytes(this.stats.bytesFreed)}`);
    console.log(`  Logs archived: ${this.stats.logsArchived}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`  Errors: ${this.stats.errors.length}`);
      this.stats.errors.forEach(err => {
        console.log(`    - ${err}`);
      });
    }
    
    if (this.dryRun) {
      console.log('\n  ℹ️  This was a dry run. No files were actually deleted.');
      console.log('     Run without --dry-run to perform cleanup.');
    }
  }
}

// Export for use
module.exports = EnhancedCleanupAgent;

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: !args.includes('--quiet')
  };
  
  const agent = new EnhancedCleanupAgent(process.cwd(), options);
  
  agent.execute().then((stats) => {
    process.exit(stats.errors.length > 0 ? 1 : 0);
  }).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}