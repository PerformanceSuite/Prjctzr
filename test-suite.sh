#!/bin/bash

# Prjctzr Integration Test Suite
# Tests all functionality of the devassist-init script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test directory
TEST_DIR="/tmp/prjctzr-tests-$$"
SCRIPT_PATH="/Users/danielconnolly/bin/devassist-init"

# Helper functions
print_test() {
    echo -e "\n${YELLOW}[TEST]${NC} $1"
    TESTS_RUN=$((TESTS_RUN + 1))
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

cleanup() {
    rm -rf "$TEST_DIR"
}

trap cleanup EXIT

# Create test directory
mkdir -p "$TEST_DIR"

echo "======================================"
echo "  Prjctzr Integration Test Suite"
echo "======================================"

# Test 1: Basic initialization
print_test "Basic project initialization"
mkdir -p "$TEST_DIR/basic-project"
cd "$TEST_DIR/basic-project"
if $SCRIPT_PATH > /dev/null 2>&1; then
    if [ -d ".devassist" ] && [ -f ".mcp.json" ] && [ -f "CLAUDE.md" ]; then
        print_pass "Basic initialization works"
    else
        print_fail "Missing expected files"
    fi
else
    print_fail "Script failed to run"
fi

# Test 2: React project detection
print_test "React framework detection"
mkdir -p "$TEST_DIR/react-app"
cd "$TEST_DIR/react-app"
cat > package.json <<EOF
{
  "name": "test-react",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
EOF
if output=$($SCRIPT_PATH 2>&1); then
    if echo "$output" | grep -q "React"; then
        print_pass "React detected correctly"
    else
        print_fail "React not detected"
    fi
else
    print_fail "Script failed for React project"
fi

# Test 3: Django project detection
print_test "Django framework detection"
mkdir -p "$TEST_DIR/django-app"
cd "$TEST_DIR/django-app"
echo "Django==4.2.0" > requirements.txt
touch manage.py
if output=$($SCRIPT_PATH 2>&1); then
    if echo "$output" | grep -q "Django"; then
        print_pass "Django detected correctly"
    else
        print_fail "Django not detected"
    fi
else
    print_fail "Script failed for Django project"
fi

# Test 4: Go with Gin detection
print_test "Go Gin framework detection"
mkdir -p "$TEST_DIR/go-gin"
cd "$TEST_DIR/go-gin"
cat > go.mod <<EOF
module test-app

go 1.20

require github.com/gin-gonic/gin v1.9.0
EOF
if output=$($SCRIPT_PATH 2>&1); then
    if echo "$output" | grep -q "Gin"; then
        print_pass "Gin framework detected correctly"
    else
        print_fail "Gin not detected"
    fi
else
    print_fail "Script failed for Go project"
fi

# Test 5: Performance test
print_test "Performance (< 2 seconds)"
mkdir -p "$TEST_DIR/perf-test"
cd "$TEST_DIR/perf-test"
echo '{"name": "perf-test"}' > package.json
start_time=$(date +%s%N)
$SCRIPT_PATH > /dev/null 2>&1
end_time=$(date +%s%N)
elapsed=$(( (end_time - start_time) / 1000000 ))
if [ "$elapsed" -lt 2000 ]; then
    print_pass "Completed in ${elapsed}ms (< 2000ms)"
else
    print_fail "Too slow: ${elapsed}ms"
fi

# Test 6: Already initialized project
print_test "Handling already initialized project"
cd "$TEST_DIR/basic-project"
if output=$($SCRIPT_PATH 2>&1); then
    if echo "$output" | grep -q "already initialized"; then
        print_pass "Correctly detected existing initialization"
    else
        print_fail "Did not detect existing initialization"
    fi
else
    print_fail "Unexpected error on reinitialization"
fi

# Test 7: Docker detection
print_test "Docker configuration detection"
mkdir -p "$TEST_DIR/docker-project"
cd "$TEST_DIR/docker-project"
touch Dockerfile
touch docker-compose.yml
if output=$($SCRIPT_PATH 2>&1); then
    if echo "$output" | grep -q "Docker"; then
        print_pass "Docker configuration detected"
    else
        print_fail "Docker not detected"
    fi
else
    print_fail "Script failed for Docker project"
fi

# Test 8: Mixed project (Node + Docker)
print_test "Mixed technology detection"
mkdir -p "$TEST_DIR/mixed-project"
cd "$TEST_DIR/mixed-project"
echo '{"name": "mixed", "dependencies": {"express": "^4.0.0"}}' > package.json
touch Dockerfile
if output=$($SCRIPT_PATH 2>&1); then
    if echo "$output" | grep -q "Express" && echo "$output" | grep -q "Docker"; then
        print_pass "Both Express and Docker detected"
    else
        print_fail "Mixed technologies not fully detected"
    fi
else
    print_fail "Script failed for mixed project"
fi

# Test 9: Edge case - empty package.json
print_test "Edge case: empty package.json"
mkdir -p "$TEST_DIR/edge-empty"
cd "$TEST_DIR/edge-empty"
echo "{}" > package.json
if $SCRIPT_PATH > /dev/null 2>&1; then
    print_pass "Handled empty package.json gracefully"
else
    print_fail "Failed on empty package.json"
fi

# Test 10: Framework commands in CLAUDE.md
print_test "Framework-specific commands in CLAUDE.md"
mkdir -p "$TEST_DIR/vue-app"
cd "$TEST_DIR/vue-app"
echo '{"dependencies": {"vue": "^3.0.0"}}' > package.json
$SCRIPT_PATH > /dev/null 2>&1
if grep -q "Vue Commands" CLAUDE.md && grep -q "npm run serve" CLAUDE.md; then
    print_pass "Framework commands added to CLAUDE.md"
else
    print_fail "Framework commands missing from CLAUDE.md"
fi

# Results
echo ""
echo "======================================"
echo "  Test Results"
echo "======================================"
echo -e "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}"
    exit 1
fi