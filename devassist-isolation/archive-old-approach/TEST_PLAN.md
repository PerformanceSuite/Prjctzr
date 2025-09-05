# DevAssist Project Isolation - Test Plan

## Test Strategy

### Testing Levels
1. **Unit Tests** - Individual component functionality
2. **Integration Tests** - Component interaction
3. **System Tests** - End-to-end functionality
4. **Acceptance Tests** - User-facing requirements

### Testing Tools
- Node.js built-in test runner
- MCP SDK test utilities
- Manual testing in Claude Code
- Automated CLI testing scripts

---

## Test Cases

### Sprint 1: Foundation Tests

#### TEST-1.1: Server Initialization
**Type**: Integration
**Priority**: Critical
```javascript
// Test that project server starts correctly
test('Project server initializes with DevAssist inheritance', async () => {
  // 1. Set project environment variables
  // 2. Start server
  // 3. Verify DevAssist functions available
  // 4. Check isolation from main DevAssist
});
```
**Expected**: Server starts, DevAssist functions available, isolated data

#### TEST-1.2: Command Registration
**Type**: Unit
**Priority**: Critical
```javascript
// Test command registration system
test('Commands register and appear in tool list', async () => {
  // 1. Register test command
  // 2. Query tool list
  // 3. Verify command appears
  // 4. Check command schema
});
```
**Expected**: Commands registered, appear in list, correct schema

#### TEST-1.3: Environment Isolation
**Type**: Unit
**Priority**: High
```javascript
// Test project environment isolation
test('Project environments are isolated', async () => {
  // 1. Start two project servers
  // 2. Set different env vars
  // 3. Verify no cross-contamination
  // 4. Check data isolation
});
```
**Expected**: Complete isolation between projects

#### TEST-1.4: Slash Command Discovery
**Type**: System
**Priority**: Critical
**Manual Test Steps**:
1. Start Claude Code
2. Navigate to project directory
3. Type "/" in chat
4. Verify project commands appear
5. Test command execution

**Expected**: Commands appear as slash commands and execute

---

### Sprint 2: Veria Implementation Tests

#### TEST-2.1: Veria Server Startup
**Type**: Integration
**Priority**: Critical
```bash
# Test Veria server starts with all commands
cd /Projects/Veria
node .devassist/server.js --test
```
**Expected**: All Veria commands registered

#### TEST-2.2: Blockchain Commands
**Type**: Functional
**Priority**: High
**Test Commands**:
- `/veria-blockchain deploy`
- `/veria-blockchain test`
- `/veria-blockchain audit`
- `/veria-blockchain status`

**Expected**: Each command executes correctly

#### TEST-2.3: Compliance Commands
**Type**: Functional
**Priority**: High
**Test Commands**:
- `/veria-compliance kyc`
- `/veria-compliance aml`
- `/veria-compliance securities`
- `/veria-compliance all`

**Expected**: Correct status returned for each check

---

### Sprint 3: Session Management Tests

#### TEST-3.1: Session Start
**Type**: System
**Priority**: Critical
**Test Sequence**:
1. Run `/veria-start`
2. Verify warmup animation appears
3. Check subagents load
4. Confirm session initialized
5. Test memory restoration

**Expected**: Full session initialization with visual feedback

#### TEST-3.2: Session End
**Type**: System
**Priority**: Critical
**Test Sequence**:
1. Start active session
2. Run `/veria-end`
3. Verify cleanup messages
4. Check state saved
5. Confirm resources released

**Expected**: Clean session termination with state persistence

#### TEST-3.3: Session Continuity
**Type**: Integration
**Priority**: High
```javascript
// Test session state persists across restarts
test('Session state persists', async () => {
  // 1. Start session
  // 2. Add data to session
  // 3. End session
  // 4. Start new session
  // 5. Verify data available
});
```
**Expected**: Session data persists across restarts

---

### Sprint 4: Comprehensive Testing

#### TEST-4.1: Load Testing
**Type**: Performance
**Priority**: Medium
```javascript
// Test system under load
test('Performance under load', async () => {
  // 1. Start multiple project servers
  // 2. Execute commands concurrently
  // 3. Measure response times
  // 4. Check resource usage
});
```
**Expected**: <2s response time, <100MB memory per instance

#### TEST-4.2: Error Recovery
**Type**: System
**Priority**: High
```javascript
// Test error handling and recovery
test('Graceful error recovery', async () => {
  // 1. Simulate various failures
  // 2. Verify error messages
  // 3. Check recovery mechanisms
  // 4. Test data integrity
});
```
**Expected**: Graceful failures, data integrity maintained

---

## Test Execution Plan

### Daily Testing
1. Run unit tests before each commit
2. Run integration tests after feature completion
3. Manual testing in Claude Code for UI/UX
4. Document any failures immediately

### Sprint Testing
1. Full test suite at sprint end
2. Performance testing
3. User acceptance testing
4. Bug fixing and retesting

### Release Testing
1. Complete regression testing
2. Multi-project testing
3. Load and stress testing
4. Security testing

---

## Test Results Tracking

### Sprint 1 Results
| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TEST-1.1 | Server Init | 🔄 Pending | |
| TEST-1.2 | Command Reg | 🔄 Pending | |
| TEST-1.3 | Env Isolation | 🔄 Pending | |
| TEST-1.4 | Slash Commands | 🔄 Pending | |

### Sprint 2 Results
| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TEST-2.1 | Veria Startup | 🔄 Pending | |
| TEST-2.2 | Blockchain Cmds | 🔄 Pending | |
| TEST-2.3 | Compliance Cmds | 🔄 Pending | |

### Sprint 3 Results
| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TEST-3.1 | Session Start | 🔄 Pending | |
| TEST-3.2 | Session End | 🔄 Pending | |
| TEST-3.3 | Session Continuity | 🔄 Pending | |

---

## Bug Tracking

### Active Bugs
| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| | | | |

### Fixed Bugs
| ID | Description | Fix | Sprint |
|----|-------------|-----|--------|
| | | | |

---

## Test Automation

### Automated Test Script
```bash
#!/bin/bash
# Run all tests
echo "Running DevAssist Isolation Tests..."

# Unit tests
npm test unit

# Integration tests  
npm test integration

# System tests
npm test system

# Generate report
npm run test:report
```

### CI/CD Integration
- Pre-commit hooks for unit tests
- GitHub Actions for full test suite
- Automated deployment after tests pass
