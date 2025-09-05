#!/bin/bash

# Create test projects for different stacks
# This will create sample projects to test our /initproject command

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Creating Test Projects for DevAssist${NC}"
echo "======================================="

BASE_DIR="test-projects"
mkdir -p "$BASE_DIR"

# 1. JavaScript/TypeScript React Project
create_js_react() {
    echo -e "\n${BLUE}1. Creating JavaScript/React project...${NC}"
    mkdir -p "$BASE_DIR/js-react-app"
    cd "$BASE_DIR/js-react-app"
    
    cat > package.json << 'EOF'
{
  "name": "js-react-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.0.0",
    "react-router-dom": "^6.0.0",
    "zustand": "^4.0.0"
  },
  "devDependencies": {
    "vite": "^4.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.0.0"
  }
}
EOF
    
    # Create source files
    mkdir -p src/components
    echo "export default function App() { return <div>React App</div> }" > src/App.jsx
    echo "import React from 'react'" > src/components/Header.jsx
    
    # Create config files
    echo "module.exports = {}" > jest.config.js
    echo "module.exports = {}" > .eslintrc.js
    echo "module.exports = {}" > tailwind.config.js
    
    echo -e "${GREEN}✅ JavaScript/React project created${NC}"
    cd ../..
}

# 2. Python FastAPI Project
create_python_fastapi() {
    echo -e "\n${BLUE}2. Creating Python/FastAPI project...${NC}"
    mkdir -p "$BASE_DIR/python-fastapi-app"
    cd "$BASE_DIR/python-fastapi-app"
    
    cat > requirements.txt << 'EOF'
fastapi==0.104.0
uvicorn==0.24.0
sqlalchemy==2.0.0
psycopg2-binary==2.9.0
redis==5.0.0
pytest==7.4.0
black==23.10.0
flake8==6.1.0
pandas==2.1.0
numpy==1.25.0
scikit-learn==1.3.0
EOF
    
    cat > pyproject.toml << 'EOF'
[tool.black]
line-length = 88

[tool.pytest.ini_options]
testpaths = ["tests"]
EOF
    
    # Create source files
    mkdir -p app tests
    cat > app/main.py << 'EOF'
from fastapi import FastAPI
from sqlalchemy import create_engine

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
EOF
    
    cat > app/models.py << 'EOF'
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
EOF
    
    echo "def test_example(): assert True" > tests/test_main.py
    
    # Create Dockerfile
    cat > Dockerfile << 'EOF'
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
EOF
    
    echo -e "${GREEN}✅ Python/FastAPI project created${NC}"
    cd ../..
}

# 3. Rust Project
create_rust_project() {
    echo -e "\n${BLUE}3. Creating Rust project...${NC}"
    mkdir -p "$BASE_DIR/rust-app"
    cd "$BASE_DIR/rust-app"
    
    cat > Cargo.toml << 'EOF'
[package]
name = "rust-app"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.6"
serde = { version = "1", features = ["derive"] }
sqlx = { version = "0.7", features = ["postgres"] }
tracing = "0.1"

[dev-dependencies]
criterion = "0.5"
EOF
    
    mkdir -p src
    cat > src/main.rs << 'EOF'
use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(handler));
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn handler() -> &'static str {
    "Hello, Rust!"
}
EOF
    
    cat > src/lib.rs << 'EOF'
pub mod models;
pub mod handlers;
EOF
    
    echo -e "${GREEN}✅ Rust project created${NC}"
    cd ../..
}

# 4. Go Project
create_go_project() {
    echo -e "\n${BLUE}4. Creating Go project...${NC}"
    mkdir -p "$BASE_DIR/go-app"
    cd "$BASE_DIR/go-app"
    
    cat > go.mod << 'EOF'
module github.com/user/go-app

go 1.21

require (
    github.com/gin-gonic/gin v1.9.0
    github.com/go-redis/redis/v8 v8.11.5
    gorm.io/gorm v1.25.0
    gorm.io/driver/postgres v1.5.0
)
EOF
    
    cat > main.go << 'EOF'
package main

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func main() {
    r := gin.Default()
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "Hello Go!"})
    })
    r.Run()
}
EOF
    
    mkdir -p cmd/server pkg internal
    cat > cmd/server/main.go << 'EOF'
package main

import "fmt"

func main() {
    fmt.Println("Server starting...")
}
EOF
    
    # Create Dockerfile
    cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
COPY --from=builder /app/main /main
CMD ["/main"]
EOF
    
    echo -e "${GREEN}✅ Go project created${NC}"
    cd ../..
}

# 5. Mixed/Monorepo Project
create_mixed_project() {
    echo -e "\n${BLUE}5. Creating Mixed/Monorepo project...${NC}"
    mkdir -p "$BASE_DIR/monorepo-app"
    cd "$BASE_DIR/monorepo-app"
    
    # Root package.json for monorepo
    cat > package.json << 'EOF'
{
  "name": "monorepo-app",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "lerna": "^7.0.0"
  }
}
EOF
    
    # Frontend app
    mkdir -p apps/web
    cat > apps/web/package.json << 'EOF'
{
  "name": "@monorepo/web",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}
EOF
    
    # Backend API
    mkdir -p apps/api
    cat > apps/api/package.json << 'EOF'
{
  "name": "@monorepo/api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "graphql": "^16.0.0",
    "apollo-server": "^3.0.0"
  }
}
EOF
    
    # Shared packages
    mkdir -p packages/ui packages/utils
    cat > packages/ui/package.json << 'EOF'
{
  "name": "@monorepo/ui",
  "version": "1.0.0"
}
EOF
    
    # Add some Python scripts
    mkdir -p scripts
    cat > scripts/analyze.py << 'EOF'
import pandas as pd
import numpy as np

def analyze_data():
    print("Analyzing data...")
EOF
    
    # Add blockchain contract
    mkdir -p contracts
    cat > contracts/Token.sol << 'EOF'
pragma solidity ^0.8.0;

contract Token {
    string public name = "Token";
}
EOF
    
    cat > hardhat.config.js << 'EOF'
module.exports = {
  solidity: "0.8.19",
};
EOF
    
    # CI/CD
    mkdir -p .github/workflows
    cat > .github/workflows/ci.yml << 'EOF'
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
EOF
    
    echo -e "${GREEN}✅ Mixed/Monorepo project created${NC}"
    cd ../..
}

# Create all projects
create_js_react
create_python_fastapi
create_rust_project
create_go_project
create_mixed_project

echo ""
echo -e "${GREEN}✅ All test projects created successfully!${NC}"
echo ""
echo "Test projects created in:"
echo "  • $BASE_DIR/js-react-app     - JavaScript/React with Vite"
echo "  • $BASE_DIR/python-fastapi-app - Python/FastAPI with ML"
echo "  • $BASE_DIR/rust-app         - Rust with Axum"
echo "  • $BASE_DIR/go-app           - Go with Gin"
echo "  • $BASE_DIR/monorepo-app     - Mixed monorepo with blockchain"
echo ""
echo "Run /initproject in each to test!"