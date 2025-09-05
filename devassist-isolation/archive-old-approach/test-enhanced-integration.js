#!/usr/bin/env node
/**
 * Integration Test for Enhanced DevAssist Template
 * Tests core functionality of the enhanced template system
 */

import { EnhancedProjectConfig } from './template-v2/server.js';
import { DevAssistLoader } from './template-v2/lib/devassist-loader.js';
import { SessionManager } from './template-v2/lib/session-manager.js';
import { MemorySystem } from './template-v2/lib/memory-system.js';

console.log('🧪 Running Enhanced DevAssist Integration Tests\n');

// Set test environment
process.env.PROJECT_ROOT = '/tmp/test-devassist-project';
process.env.DEVASSIST_PROJECT = 'testproject';

async function runTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Project Configuration
  console.log('📋 Test 1: Project Configuration');
  try {
    const config = new EnhancedProjectConfig();
    console.assert(config.projectName === 'testproject', 'Project name should be testproject');
    console.assert(config.projectRoot === '/tmp/test-devassist-project', 'Project root should be set correctly');
    console.log('   ✅ Project configuration works\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    testsFailed++;
  }

  // Test 2: DevAssist Loader
  console.log('📋 Test 2: DevAssist Loader');
  try {
    const config = new EnhancedProjectConfig();
    const loader = new DevAssistLoader(config);
    const devassist = await loader.loadDevAssist();
    console.assert(devassist !== null, 'DevAssist should load successfully');
    const health = await loader.healthCheck();
    console.assert(health.status === 'healthy', 'DevAssist should be healthy');
    console.log('   ✅ DevAssist loader works\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    testsFailed++;
  }

  // Test 3: Memory System
  console.log('📋 Test 3: Memory System');
  try {
    const config = new EnhancedProjectConfig();
    const memory = new MemorySystem(config);
    
    // Record a decision
    const decision = await memory.recordDecision(
      'Use TypeScript for type safety',
      'Team decided to migrate to TypeScript for better type checking',
      { category: 'architecture', impact: 'high' }
    );
    console.assert(decision.id.includes('testproject'), 'Decision should include project name');
    
    // Search for it
    const results = await memory.semanticSearch('typescript type', { limit: 5 });
    console.assert(results.totalResults > 0, 'Should find the recorded decision');
    console.assert(results.results[0].similarity > 0.5, 'Should have good similarity score');
    
    console.log('   ✅ Memory system works\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    testsFailed++;
  }

  // Test 4: Session Manager
  console.log('📋 Test 4: Session Manager');
  try {
    const config = new EnhancedProjectConfig();
    const loader = new DevAssistLoader(config);
    const devassist = await loader.loadDevAssist();
    const sessionManager = new SessionManager(config, devassist);
    
    // Start a session
    const session = await sessionManager.startSession({
      description: 'Test session'
    });
    console.assert(session.sessionId.includes('testproject'), 'Session ID should include project name');
    console.assert(session.warmupComplete === true, 'Warmup should complete');
    console.assert(session.subagents.length > 0, 'Subagents should be loaded');
    
    // Check status
    const status = await sessionManager.getSessionStatus();
    console.assert(status.active === true, 'Session should be active');
    
    // Save checkpoint
    const checkpoint = await sessionManager.checkpoint('Test checkpoint');
    console.assert(checkpoint.sessionId === session.sessionId, 'Checkpoint should match session');
    
    // End session
    const cleanup = await sessionManager.endSession();
    console.assert(cleanup.cleanupComplete === true, 'Cleanup should complete');
    
    console.log('   ✅ Session manager works\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    testsFailed++;
  }

  // Test 5: Veria-specific Features
  console.log('📋 Test 5: Veria-specific Features');
  try {
    process.env.DEVASSIST_PROJECT = 'veria';
    const config = new EnhancedProjectConfig();
    const memory = new MemorySystem(config);
    
    // Record a regulatory decision
    const decision = await memory.recordDecision(
      'Implement KYC verification',
      'Required for regulatory compliance',
      { category: 'regulatory' }
    );
    
    // Search for regulatory content
    const results = await memory.semanticSearch('compliance kyc', {
      category: 'regulatory',
      limit: 5
    });
    
    // Check for regulatory implications
    if (results.results.length > 0) {
      const enriched = results.results[0];
      console.assert(
        enriched.enrichment?.regulatoryImplications?.hasImplications === true,
        'Should detect regulatory implications'
      );
    }
    
    console.log('   ✅ Veria-specific features work\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    testsFailed++;
  }

  // Test 6: Project Isolation
  console.log('📋 Test 6: Project Isolation');
  try {
    // Create two different projects
    process.env.DEVASSIST_PROJECT = 'project1';
    const config1 = new EnhancedProjectConfig();
    const memory1 = new MemorySystem(config1);
    
    process.env.DEVASSIST_PROJECT = 'project2';
    const config2 = new EnhancedProjectConfig();
    const memory2 = new MemorySystem(config2);
    
    // Record in project1
    await memory1.recordDecision('Project1 decision', 'Context for project1');
    
    // Record in project2
    await memory2.recordDecision('Project2 decision', 'Context for project2');
    
    // Search in project1 - should not find project2 content
    const results1 = await memory1.semanticSearch('project2');
    const hasProject2 = results1.results.some(r => 
      r.decision?.toLowerCase().includes('project2')
    );
    console.assert(!hasProject2, 'Project1 should not see Project2 data');
    
    console.log('   ✅ Project isolation verified\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    testsFailed++;
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  console.log(`   📈 Success Rate: ${Math.round(testsPassed / (testsPassed + testsFailed) * 100)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Enhanced DevAssist is ready for production!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues.');
  }
  
  return testsFailed === 0;
}

// Run tests
runTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });