#!/usr/bin/env node
/**
 * Veria Enhanced DevAssist Server
 * 
 * Uses template-v2 with full DevAssist integration and Veria-specific enhancements
 */

// Set Veria-specific environment before importing template
process.env.PROJECT_ROOT = '/Users/danielconnolly/Projects/PROJECT_SETUP/veria-project';
process.env.DEVASSIST_PROJECT = 'veria';

// Import the enhanced template
import('/Users/danielconnolly/Projects/PROJECT_SETUP/devassist-isolation/template-v2/server.js');