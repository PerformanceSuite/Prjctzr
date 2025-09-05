#!/usr/bin/env node

/**
 * Project Intelligence Analyzer for DevAssist
 * Sprint 4: Smart project analysis and configuration
 * 
 * Features:
 * - Detect project type and stack
 * - Analyze dependencies and frameworks
 * - Suggest optimal subagents
 * - Create tailored documentation
 * - Detect testing approaches
 * - Security recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectIntelligenceAnalyzer {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.projectName = path.basename(projectPath);
    
    // Analysis results
    this.analysis = {
      projectType: 'unknown',
      primaryLanguage: null,
      languages: [],
      frameworks: [],
      testingFramework: null,
      packageManager: null,
      dependencies: [],
      devDependencies: [],
      buildTool: null,
      containerized: false,
      cicd: null,
      cloudProvider: null,
      database: null,
      apiType: null,
      uiFramework: null,
      stateManagement: null,
      styling: null,
      linting: null,
      formatting: null,
      monorepo: false,
      microservices: false,
      serverless: false,
      blockchain: false,
      ml: false,
      security: {
        hasSecrets: false,
        hasAuth: false,
        hasSSL: false,
        vulnerabilities: []
      },
      suggestedSubagents: [],
      suggestedWorkflows: [],
      suggestedDocs: [],
      testCommands: [],
      buildCommands: [],
      devCommands: []
    };
  }

  /**
   * Run complete project analysis
   */
  async analyze() {
    console.log('\n🔍 Project Intelligence Analysis');
    console.log('=================================\n');
    
    // 1. Detect languages
    await this.detectLanguages();
    
    // 2. Analyze package files
    await this.analyzePackageFiles();
    
    // 3. Detect frameworks
    await this.detectFrameworks();
    
    // 4. Analyze testing setup
    await this.analyzeTestingSetup();
    
    // 5. Detect build tools
    await this.detectBuildTools();
    
    // 6. Check for containerization
    await this.checkContainerization();
    
    // 7. Detect CI/CD
    await this.detectCICD();
    
    // 8. Analyze cloud setup
    await this.analyzeCloudSetup();
    
    // 9. Detect database
    await this.detectDatabase();
    
    // 10. Analyze API type
    await this.analyzeAPIType();
    
    // 11. Check for special patterns
    await this.checkSpecialPatterns();
    
    // 12. Security analysis
    await this.analyzeSecuritySetup();
    
    // 13. Generate suggestions
    await this.generateSuggestions();
    
    // 14. Create optimal configurations
    await this.createOptimalConfigurations();
    
    return this.analysis;
  }

  /**
   * Detect programming languages used
   */
  async detectLanguages() {
    console.log('📊 Detecting languages...');
    
    const languagePatterns = {
      'JavaScript': ['*.js', '*.jsx', '*.mjs'],
      'TypeScript': ['*.ts', '*.tsx'],
      'Python': ['*.py'],
      'Rust': ['*.rs'],
      'Go': ['*.go'],
      'Java': ['*.java'],
      'C++': ['*.cpp', '*.cc', '*.cxx', '*.hpp'],
      'C#': ['*.cs'],
      'Ruby': ['*.rb'],
      'PHP': ['*.php'],
      'Swift': ['*.swift'],
      'Kotlin': ['*.kt', '*.kts'],
      'Scala': ['*.scala'],
      'Elixir': ['*.ex', '*.exs'],
      'Dart': ['*.dart'],
      'Vue': ['*.vue'],
      'Svelte': ['*.svelte'],
      'SQL': ['*.sql'],
      'GraphQL': ['*.graphql', '*.gql'],
      'Solidity': ['*.sol'],
      'YAML': ['*.yml', '*.yaml'],
      'JSON': ['*.json'],
      'Markdown': ['*.md'],
      'Shell': ['*.sh', '*.bash'],
      'PowerShell': ['*.ps1'],
      'Dockerfile': ['Dockerfile*'],
      'Terraform': ['*.tf'],
      'Kubernetes': ['*.k8s.yml', '*.k8s.yaml']
    };
    
    const languageCounts = {};
    
    for (const [language, patterns] of Object.entries(languagePatterns)) {
      let count = 0;
      for (const pattern of patterns) {
        count += this.countFiles(pattern);
      }
      if (count > 0) {
        languageCounts[language] = count;
        this.analysis.languages.push({ name: language, files: count });
      }
    }
    
    // Determine primary language
    if (this.analysis.languages.length > 0) {
      this.analysis.languages.sort((a, b) => b.files - a.files);
      this.analysis.primaryLanguage = this.analysis.languages[0].name;
      
      // Determine project type based on primary language
      const typeMap = {
        'JavaScript': 'node',
        'TypeScript': 'node',
        'Python': 'python',
        'Rust': 'rust',
        'Go': 'go',
        'Java': 'java',
        'C#': 'dotnet',
        'Ruby': 'ruby',
        'PHP': 'php',
        'Swift': 'ios',
        'Kotlin': 'android',
        'Solidity': 'blockchain'
      };
      
      this.analysis.projectType = typeMap[this.analysis.primaryLanguage] || 'unknown';
    }
    
    console.log(`  Primary: ${this.analysis.primaryLanguage || 'Unknown'}`);
    console.log(`  Type: ${this.analysis.projectType}`);
  }

  /**
   * Analyze package files for dependencies
   */
  async analyzePackageFiles() {
    console.log('\n📦 Analyzing package files...');
    
    // Node.js
    if (fs.existsSync(path.join(this.projectPath, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
      
      this.analysis.dependencies = Object.keys(pkg.dependencies || {});
      this.analysis.devDependencies = Object.keys(pkg.devDependencies || {});
      
      // Detect package manager
      if (fs.existsSync(path.join(this.projectPath, 'yarn.lock'))) {
        this.analysis.packageManager = 'yarn';
      } else if (fs.existsSync(path.join(this.projectPath, 'pnpm-lock.yaml'))) {
        this.analysis.packageManager = 'pnpm';
      } else if (fs.existsSync(path.join(this.projectPath, 'package-lock.json'))) {
        this.analysis.packageManager = 'npm';
      }
      
      // Detect monorepo
      if (pkg.workspaces || fs.existsSync(path.join(this.projectPath, 'lerna.json'))) {
        this.analysis.monorepo = true;
      }
      
      console.log(`  Package Manager: ${this.analysis.packageManager || 'npm'}`);
      console.log(`  Dependencies: ${this.analysis.dependencies.length}`);
      console.log(`  Dev Dependencies: ${this.analysis.devDependencies.length}`);
    }
    
    // Python
    if (fs.existsSync(path.join(this.projectPath, 'requirements.txt'))) {
      const requirements = fs.readFileSync(path.join(this.projectPath, 'requirements.txt'), 'utf8');
      this.analysis.dependencies = requirements.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('==')[0].split('>=')[0].split('~=')[0].trim());
      
      this.analysis.packageManager = 'pip';
      console.log(`  Python dependencies: ${this.analysis.dependencies.length}`);
    }
    
    if (fs.existsSync(path.join(this.projectPath, 'Pipfile'))) {
      this.analysis.packageManager = 'pipenv';
    }
    
    if (fs.existsSync(path.join(this.projectPath, 'pyproject.toml'))) {
      this.analysis.packageManager = 'poetry';
    }
    
    // Rust
    if (fs.existsSync(path.join(this.projectPath, 'Cargo.toml'))) {
      this.analysis.packageManager = 'cargo';
      this.analysis.buildTool = 'cargo';
    }
    
    // Go
    if (fs.existsSync(path.join(this.projectPath, 'go.mod'))) {
      this.analysis.packageManager = 'go modules';
      this.analysis.buildTool = 'go';
    }
    
    // Java
    if (fs.existsSync(path.join(this.projectPath, 'pom.xml'))) {
      this.analysis.packageManager = 'maven';
      this.analysis.buildTool = 'maven';
    }
    
    if (fs.existsSync(path.join(this.projectPath, 'build.gradle')) || 
        fs.existsSync(path.join(this.projectPath, 'build.gradle.kts'))) {
      this.analysis.packageManager = 'gradle';
      this.analysis.buildTool = 'gradle';
    }
  }

  /**
   * Detect frameworks being used
   */
  async detectFrameworks() {
    console.log('\n🎨 Detecting frameworks...');
    
    const allDeps = [...this.analysis.dependencies, ...this.analysis.devDependencies];
    
    // Frontend frameworks
    if (allDeps.includes('react') || allDeps.includes('react-dom')) {
      this.analysis.frameworks.push('React');
      this.analysis.uiFramework = 'React';
    }
    
    if (allDeps.includes('vue')) {
      this.analysis.frameworks.push('Vue');
      this.analysis.uiFramework = 'Vue';
    }
    
    if (allDeps.includes('@angular/core')) {
      this.analysis.frameworks.push('Angular');
      this.analysis.uiFramework = 'Angular';
    }
    
    if (allDeps.includes('svelte')) {
      this.analysis.frameworks.push('Svelte');
      this.analysis.uiFramework = 'Svelte';
    }
    
    if (allDeps.includes('next')) {
      this.analysis.frameworks.push('Next.js');
    }
    
    if (allDeps.includes('nuxt')) {
      this.analysis.frameworks.push('Nuxt');
    }
    
    if (allDeps.includes('gatsby')) {
      this.analysis.frameworks.push('Gatsby');
    }
    
    // Backend frameworks
    if (allDeps.includes('express')) {
      this.analysis.frameworks.push('Express');
      this.analysis.apiType = 'REST';
    }
    
    if (allDeps.includes('koa')) {
      this.analysis.frameworks.push('Koa');
      this.analysis.apiType = 'REST';
    }
    
    if (allDeps.includes('fastify')) {
      this.analysis.frameworks.push('Fastify');
      this.analysis.apiType = 'REST';
    }
    
    if (allDeps.includes('@nestjs/core')) {
      this.analysis.frameworks.push('NestJS');
    }
    
    if (allDeps.includes('apollo-server') || allDeps.includes('graphql')) {
      this.analysis.frameworks.push('GraphQL');
      this.analysis.apiType = 'GraphQL';
    }
    
    // State management
    if (allDeps.includes('redux')) {
      this.analysis.stateManagement = 'Redux';
    }
    
    if (allDeps.includes('mobx')) {
      this.analysis.stateManagement = 'MobX';
    }
    
    if (allDeps.includes('zustand')) {
      this.analysis.stateManagement = 'Zustand';
    }
    
    if (allDeps.includes('recoil')) {
      this.analysis.stateManagement = 'Recoil';
    }
    
    // CSS frameworks
    if (allDeps.includes('tailwindcss')) {
      this.analysis.styling = 'Tailwind CSS';
    }
    
    if (allDeps.includes('styled-components')) {
      this.analysis.styling = 'Styled Components';
    }
    
    if (allDeps.includes('@emotion/react')) {
      this.analysis.styling = 'Emotion';
    }
    
    if (allDeps.includes('sass')) {
      this.analysis.styling = 'SASS';
    }
    
    // Python frameworks
    if (this.analysis.dependencies.includes('django')) {
      this.analysis.frameworks.push('Django');
    }
    
    if (this.analysis.dependencies.includes('flask')) {
      this.analysis.frameworks.push('Flask');
    }
    
    if (this.analysis.dependencies.includes('fastapi')) {
      this.analysis.frameworks.push('FastAPI');
      this.analysis.apiType = 'REST';
    }
    
    if (this.analysis.dependencies.includes('tensorflow') || 
        this.analysis.dependencies.includes('torch') ||
        this.analysis.dependencies.includes('scikit-learn')) {
      this.analysis.ml = true;
      this.analysis.frameworks.push('Machine Learning');
    }
    
    console.log(`  Frameworks: ${this.analysis.frameworks.join(', ') || 'None detected'}`);
  }

  /**
   * Analyze testing setup
   */
  async analyzeTestingSetup() {
    console.log('\n🧪 Analyzing testing setup...');
    
    const allDeps = [...this.analysis.dependencies, ...this.analysis.devDependencies];
    
    // JavaScript testing
    if (allDeps.includes('jest')) {
      this.analysis.testingFramework = 'Jest';
      this.analysis.testCommands.push('npm test', 'npm run test:coverage');
    }
    
    if (allDeps.includes('mocha')) {
      this.analysis.testingFramework = 'Mocha';
      this.analysis.testCommands.push('npm test');
    }
    
    if (allDeps.includes('vitest')) {
      this.analysis.testingFramework = 'Vitest';
      this.analysis.testCommands.push('npm run test', 'npm run test:coverage');
    }
    
    if (allDeps.includes('cypress')) {
      this.analysis.frameworks.push('Cypress (E2E)');
      this.analysis.testCommands.push('npm run cypress:open', 'npm run cypress:run');
    }
    
    if (allDeps.includes('playwright')) {
      this.analysis.frameworks.push('Playwright (E2E)');
      this.analysis.testCommands.push('npm run test:e2e');
    }
    
    // Python testing
    if (this.analysis.dependencies.includes('pytest')) {
      this.analysis.testingFramework = 'pytest';
      this.analysis.testCommands.push('pytest', 'pytest --cov');
    }
    
    if (this.analysis.dependencies.includes('unittest')) {
      this.analysis.testingFramework = 'unittest';
      this.analysis.testCommands.push('python -m unittest');
    }
    
    // Rust testing
    if (this.analysis.packageManager === 'cargo') {
      this.analysis.testCommands.push('cargo test');
    }
    
    // Go testing
    if (this.analysis.packageManager === 'go modules') {
      this.analysis.testCommands.push('go test ./...', 'go test -cover ./...');
    }
    
    console.log(`  Testing: ${this.analysis.testingFramework || 'Not detected'}`);
    
    // Check for test directories
    const testDirs = ['test', 'tests', '__tests__', 'spec', 'e2e', 'integration'];
    for (const dir of testDirs) {
      if (fs.existsSync(path.join(this.projectPath, dir))) {
        console.log(`  Test directory: ${dir}/`);
        break;
      }
    }
  }

  /**
   * Detect build tools
   */
  async detectBuildTools() {
    console.log('\n🔨 Detecting build tools...');
    
    const allDeps = [...this.analysis.dependencies, ...this.analysis.devDependencies];
    
    // JavaScript build tools
    if (allDeps.includes('webpack')) {
      this.analysis.buildTool = 'Webpack';
    }
    
    if (allDeps.includes('vite')) {
      this.analysis.buildTool = 'Vite';
    }
    
    if (allDeps.includes('parcel')) {
      this.analysis.buildTool = 'Parcel';
    }
    
    if (allDeps.includes('rollup')) {
      this.analysis.buildTool = 'Rollup';
    }
    
    if (allDeps.includes('esbuild')) {
      this.analysis.buildTool = 'esbuild';
    }
    
    if (allDeps.includes('@swc/core')) {
      this.analysis.buildTool = 'SWC';
    }
    
    // Linting
    if (allDeps.includes('eslint')) {
      this.analysis.linting = 'ESLint';
      this.analysis.devCommands.push('npm run lint');
    }
    
    if (allDeps.includes('prettier')) {
      this.analysis.formatting = 'Prettier';
      this.analysis.devCommands.push('npm run format');
    }
    
    // Build commands
    if (fs.existsSync(path.join(this.projectPath, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
      
      if (pkg.scripts?.build) {
        this.analysis.buildCommands.push('npm run build');
      }
      
      if (pkg.scripts?.dev) {
        this.analysis.devCommands.push('npm run dev');
      } else if (pkg.scripts?.start) {
        this.analysis.devCommands.push('npm start');
      }
    }
    
    console.log(`  Build Tool: ${this.analysis.buildTool || 'None detected'}`);
  }

  /**
   * Check for containerization
   */
  async checkContainerization() {
    console.log('\n🐳 Checking containerization...');
    
    if (fs.existsSync(path.join(this.projectPath, 'Dockerfile')) ||
        fs.existsSync(path.join(this.projectPath, 'docker-compose.yml')) ||
        fs.existsSync(path.join(this.projectPath, 'docker-compose.yaml'))) {
      this.analysis.containerized = true;
      console.log('  Docker: Yes');
      
      if (fs.existsSync(path.join(this.projectPath, 'docker-compose.yml'))) {
        this.analysis.devCommands.push('docker-compose up');
      }
    }
    
    if (fs.existsSync(path.join(this.projectPath, '.dockerignore'))) {
      this.analysis.containerized = true;
    }
    
    // Kubernetes
    if (this.countFiles('*.k8s.yml') > 0 || 
        this.countFiles('*.k8s.yaml') > 0 ||
        fs.existsSync(path.join(this.projectPath, 'k8s'))) {
      this.analysis.frameworks.push('Kubernetes');
      this.analysis.containerized = true;
      console.log('  Kubernetes: Yes');
    }
  }

  /**
   * Detect CI/CD setup
   */
  async detectCICD() {
    console.log('\n🔄 Detecting CI/CD...');
    
    if (fs.existsSync(path.join(this.projectPath, '.github', 'workflows'))) {
      this.analysis.cicd = 'GitHub Actions';
    } else if (fs.existsSync(path.join(this.projectPath, '.gitlab-ci.yml'))) {
      this.analysis.cicd = 'GitLab CI';
    } else if (fs.existsSync(path.join(this.projectPath, '.circleci'))) {
      this.analysis.cicd = 'CircleCI';
    } else if (fs.existsSync(path.join(this.projectPath, '.travis.yml'))) {
      this.analysis.cicd = 'Travis CI';
    } else if (fs.existsSync(path.join(this.projectPath, 'Jenkinsfile'))) {
      this.analysis.cicd = 'Jenkins';
    } else if (fs.existsSync(path.join(this.projectPath, 'azure-pipelines.yml'))) {
      this.analysis.cicd = 'Azure Pipelines';
    }
    
    if (this.analysis.cicd) {
      console.log(`  CI/CD: ${this.analysis.cicd}`);
    }
  }

  /**
   * Analyze cloud setup
   */
  async analyzeCloudSetup() {
    console.log('\n☁️  Analyzing cloud setup...');
    
    // AWS
    if (fs.existsSync(path.join(this.projectPath, 'serverless.yml')) ||
        fs.existsSync(path.join(this.projectPath, 'template.yaml')) ||
        fs.existsSync(path.join(this.projectPath, 'sam.yaml'))) {
      this.analysis.cloudProvider = 'AWS';
      this.analysis.serverless = true;
    }
    
    // Vercel
    if (fs.existsSync(path.join(this.projectPath, 'vercel.json'))) {
      this.analysis.cloudProvider = 'Vercel';
    }
    
    // Netlify
    if (fs.existsSync(path.join(this.projectPath, 'netlify.toml'))) {
      this.analysis.cloudProvider = 'Netlify';
    }
    
    // Firebase
    if (fs.existsSync(path.join(this.projectPath, 'firebase.json'))) {
      this.analysis.cloudProvider = 'Firebase';
    }
    
    // Heroku
    if (fs.existsSync(path.join(this.projectPath, 'Procfile'))) {
      this.analysis.cloudProvider = 'Heroku';
    }
    
    if (this.analysis.cloudProvider) {
      console.log(`  Provider: ${this.analysis.cloudProvider}`);
    }
  }

  /**
   * Detect database usage
   */
  async detectDatabase() {
    console.log('\n🗄️  Detecting database...');
    
    const allDeps = [...this.analysis.dependencies, ...this.analysis.devDependencies];
    
    // SQL databases
    if (allDeps.includes('pg') || allDeps.includes('postgres')) {
      this.analysis.database = 'PostgreSQL';
    } else if (allDeps.includes('mysql') || allDeps.includes('mysql2')) {
      this.analysis.database = 'MySQL';
    } else if (allDeps.includes('sqlite3') || allDeps.includes('better-sqlite3')) {
      this.analysis.database = 'SQLite';
    }
    
    // NoSQL databases
    if (allDeps.includes('mongodb') || allDeps.includes('mongoose')) {
      this.analysis.database = 'MongoDB';
    }
    
    if (allDeps.includes('redis') || allDeps.includes('ioredis')) {
      this.analysis.database = this.analysis.database ? 
        `${this.analysis.database} + Redis` : 'Redis';
    }
    
    // ORMs
    if (allDeps.includes('prisma')) {
      this.analysis.frameworks.push('Prisma ORM');
    }
    
    if (allDeps.includes('sequelize')) {
      this.analysis.frameworks.push('Sequelize ORM');
    }
    
    if (allDeps.includes('typeorm')) {
      this.analysis.frameworks.push('TypeORM');
    }
    
    if (this.analysis.database) {
      console.log(`  Database: ${this.analysis.database}`);
    }
  }

  /**
   * Analyze API type
   */
  async analyzeAPIType() {
    console.log('\n🌐 Analyzing API type...');
    
    const allDeps = [...this.analysis.dependencies, ...this.analysis.devDependencies];
    
    // Already detected in frameworks
    if (!this.analysis.apiType) {
      // Check for OpenAPI/Swagger
      if (fs.existsSync(path.join(this.projectPath, 'openapi.yml')) ||
          fs.existsSync(path.join(this.projectPath, 'swagger.yml')) ||
          allDeps.includes('swagger-ui-express')) {
        this.analysis.apiType = 'REST (OpenAPI)';
      }
      
      // Check for WebSocket
      if (allDeps.includes('socket.io') || allDeps.includes('ws')) {
        this.analysis.apiType = this.analysis.apiType ? 
          `${this.analysis.apiType} + WebSocket` : 'WebSocket';
      }
      
      // Check for gRPC
      if (allDeps.includes('@grpc/grpc-js')) {
        this.analysis.apiType = 'gRPC';
      }
    }
    
    if (this.analysis.apiType) {
      console.log(`  API Type: ${this.analysis.apiType}`);
    }
  }

  /**
   * Check for special patterns
   */
  async checkSpecialPatterns() {
    console.log('\n✨ Checking special patterns...');
    
    const allDeps = [...this.analysis.dependencies, ...this.analysis.devDependencies];
    
    // Blockchain
    if (allDeps.includes('web3') || 
        allDeps.includes('ethers') ||
        fs.existsSync(path.join(this.projectPath, 'truffle-config.js')) ||
        fs.existsSync(path.join(this.projectPath, 'hardhat.config.js'))) {
      this.analysis.blockchain = true;
      console.log('  Blockchain: Yes');
    }
    
    // Microservices
    if (this.analysis.containerized && 
        (fs.existsSync(path.join(this.projectPath, 'docker-compose.yml')) ||
         allDeps.includes('micro') ||
         allDeps.includes('seneca'))) {
      this.analysis.microservices = true;
      console.log('  Microservices: Yes');
    }
    
    // Machine Learning
    if (this.analysis.dependencies.includes('tensorflow') ||
        this.analysis.dependencies.includes('scikit-learn') ||
        this.analysis.dependencies.includes('pandas') ||
        this.analysis.dependencies.includes('numpy')) {
      this.analysis.ml = true;
      console.log('  Machine Learning: Yes');
    }
  }

  /**
   * Analyze security setup
   */
  async analyzeSecuritySetup() {
    console.log('\n🔒 Analyzing security...');
    
    const allDeps = [...this.analysis.dependencies, ...this.analysis.devDependencies];
    
    // Check for secrets management
    if (fs.existsSync(path.join(this.projectPath, '.env')) ||
        fs.existsSync(path.join(this.projectPath, '.env.example'))) {
      this.analysis.security.hasSecrets = true;
    }
    
    // Check for authentication
    if (allDeps.includes('passport') ||
        allDeps.includes('jsonwebtoken') ||
        allDeps.includes('bcrypt') ||
        allDeps.includes('argon2') ||
        allDeps.includes('@auth0/nextjs-auth0')) {
      this.analysis.security.hasAuth = true;
      console.log('  Authentication: Yes');
    }
    
    // Check for SSL/HTTPS
    if (allDeps.includes('helmet') || 
        allDeps.includes('cors')) {
      this.analysis.security.hasSSL = true;
    }
    
    // Security scanning recommendations
    if (this.analysis.projectType === 'node') {
      this.analysis.security.vulnerabilities.push(
        'Run: npm audit',
        'Consider: npm audit fix'
      );
    }
    
    if (this.analysis.projectType === 'python') {
      this.analysis.security.vulnerabilities.push(
        'Install: pip install safety',
        'Run: safety check'
      );
    }
  }

  /**
   * Generate suggestions based on analysis
   */
  async generateSuggestions() {
    console.log('\n💡 Generating suggestions...');
    
    // Suggest subagents based on project type
    this.analysis.suggestedSubagents = ['cleanup', 'warmup'];
    
    if (this.analysis.uiFramework === 'React') {
      this.analysis.suggestedSubagents.push('react-optimizer', 'component-generator');
    }
    
    if (this.analysis.apiType) {
      this.analysis.suggestedSubagents.push('api-tester', 'endpoint-validator');
    }
    
    if (this.analysis.testingFramework) {
      this.analysis.suggestedSubagents.push('test-runner', 'coverage-reporter');
    }
    
    if (this.analysis.database) {
      this.analysis.suggestedSubagents.push('db-migrator', 'query-optimizer');
    }
    
    if (this.analysis.containerized) {
      this.analysis.suggestedSubagents.push('docker-manager', 'container-health');
    }
    
    if (this.analysis.blockchain) {
      this.analysis.suggestedSubagents.push('blockchain-auditor', 'gas-optimizer');
    }
    
    if (this.analysis.ml) {
      this.analysis.suggestedSubagents.push('model-trainer', 'data-preprocessor');
    }
    
    // Suggest workflows
    if (this.analysis.testingFramework) {
      this.analysis.suggestedWorkflows.push({
        name: 'test-driven',
        description: 'Write tests → Run tests → Implement → Refactor',
        commands: this.analysis.testCommands
      });
    }
    
    if (this.analysis.cicd) {
      this.analysis.suggestedWorkflows.push({
        name: 'continuous-deployment',
        description: 'Develop → Test → Build → Deploy',
        commands: ['git push', ...this.analysis.buildCommands]
      });
    }
    
    // Suggest documentation
    this.analysis.suggestedDocs = ['README.md', 'ARCHITECTURE.md'];
    
    if (this.analysis.apiType) {
      this.analysis.suggestedDocs.push('API.md', 'ENDPOINTS.md');
    }
    
    if (this.analysis.database) {
      this.analysis.suggestedDocs.push('DATABASE.md', 'SCHEMA.md');
    }
    
    if (this.analysis.containerized) {
      this.analysis.suggestedDocs.push('DEPLOYMENT.md', 'DOCKER.md');
    }
    
    if (this.analysis.security.hasAuth) {
      this.analysis.suggestedDocs.push('SECURITY.md', 'AUTH.md');
    }
    
    console.log(`  Subagents: ${this.analysis.suggestedSubagents.length} suggested`);
    console.log(`  Workflows: ${this.analysis.suggestedWorkflows.length} suggested`);
    console.log(`  Documentation: ${this.analysis.suggestedDocs.length} suggested`);
  }

  /**
   * Create optimal configurations
   */
  async createOptimalConfigurations() {
    console.log('\n⚙️  Creating optimal configurations...');
    
    // This will be implemented to create actual config files
    // For now, we'll just return the configuration object
    
    return {
      devassist: {
        project: this.projectName,
        type: this.analysis.projectType,
        language: this.analysis.primaryLanguage,
        frameworks: this.analysis.frameworks,
        subagents: this.analysis.suggestedSubagents,
        workflows: this.analysis.suggestedWorkflows
      },
      commands: {
        dev: this.analysis.devCommands,
        test: this.analysis.testCommands,
        build: this.analysis.buildCommands
      },
      documentation: this.analysis.suggestedDocs
    };
  }

  /**
   * Count files matching pattern
   */
  countFiles(pattern) {
    try {
      const result = execSync(
        `find . -name "${pattern}" -type f 2>/dev/null | wc -l`,
        { cwd: this.projectPath, encoding: 'utf8' }
      );
      return parseInt(result.trim()) || 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Generate intelligent CLAUDE.md
   */
  async generateOptimalClaude() {
    const config = await this.createOptimalConfigurations();
    
    const claudeMd = `# Project: ${this.projectName}

## 🎯 Project Intelligence Analysis

### Technology Stack
- **Type:** ${this.analysis.projectType}
- **Primary Language:** ${this.analysis.primaryLanguage || 'Unknown'}
- **Frameworks:** ${this.analysis.frameworks.join(', ') || 'None'}
- **Package Manager:** ${this.analysis.packageManager || 'None'}
- **Build Tool:** ${this.analysis.buildTool || 'None'}

### Architecture
- **API Type:** ${this.analysis.apiType || 'N/A'}
- **Database:** ${this.analysis.database || 'None'}
- **UI Framework:** ${this.analysis.uiFramework || 'None'}
- **State Management:** ${this.analysis.stateManagement || 'None'}
- **Styling:** ${this.analysis.styling || 'Default'}

### Development Setup
- **Testing:** ${this.analysis.testingFramework || 'None'}
- **Linting:** ${this.analysis.linting || 'None'}
- **Formatting:** ${this.analysis.formatting || 'None'}
- **CI/CD:** ${this.analysis.cicd || 'None'}
- **Containerized:** ${this.analysis.containerized ? 'Yes' : 'No'}

### Special Characteristics
${this.analysis.monorepo ? '- ✅ Monorepo structure\n' : ''}${this.analysis.microservices ? '- ✅ Microservices architecture\n' : ''}${this.analysis.serverless ? '- ✅ Serverless deployment\n' : ''}${this.analysis.blockchain ? '- ✅ Blockchain integration\n' : ''}${this.analysis.ml ? '- ✅ Machine Learning components\n' : ''}

## 📋 Quick Commands

### Development
${this.analysis.devCommands.map(cmd => `- \`${cmd}\``).join('\n') || '- No dev commands detected'}

### Testing
${this.analysis.testCommands.map(cmd => `- \`${cmd}\``).join('\n') || '- No test commands detected'}

### Building
${this.analysis.buildCommands.map(cmd => `- \`${cmd}\``).join('\n') || '- No build commands detected'}

## 🤖 DevAssist Configuration

### Suggested Subagents
${this.analysis.suggestedSubagents.map(agent => `- **${agent}**: Auto-managed by DevAssist`).join('\n')}

### Workflows Available
${this.analysis.suggestedWorkflows.map(wf => `
#### ${wf.name}
${wf.description}
Commands: ${wf.commands.map(cmd => `\`${cmd}\``).join(', ')}`).join('\n') || 'Standard development workflow'}

## 📚 Recommended Documentation
${this.analysis.suggestedDocs.map(doc => `- ${doc}`).join('\n')}

## 🔒 Security Notes
${this.analysis.security.hasAuth ? '- Authentication system detected\n' : ''}${this.analysis.security.hasSecrets ? '- Environment variables in use\n' : ''}${this.analysis.security.vulnerabilities.length > 0 ? `
### Security Recommendations
${this.analysis.security.vulnerabilities.map(v => `- ${v}`).join('\n')}` : ''}

---
*Generated by DevAssist Project Intelligence Analyzer*
*Analysis Date: ${new Date().toISOString()}*
`;
    
    return claudeMd;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 Analysis Complete!');
    console.log('====================\n');
    
    console.log('Project Intelligence Summary:');
    console.log(`  Project: ${this.projectName}`);
    console.log(`  Type: ${this.analysis.projectType}`);
    console.log(`  Languages: ${this.analysis.languages.map(l => l.name).join(', ')}`);
    console.log(`  Frameworks: ${this.analysis.frameworks.join(', ')}`);
    console.log(`  Subagents: ${this.analysis.suggestedSubagents.join(', ')}`);
    console.log(`  Workflows: ${this.analysis.suggestedWorkflows.map(w => w.name).join(', ')}`);
    
    return this.analysis;
  }
}

// Export
module.exports = ProjectIntelligenceAnalyzer;

// CLI
if (require.main === module) {
  const analyzer = new ProjectIntelligenceAnalyzer();
  
  analyzer.analyze().then(async () => {
    analyzer.generateReport();
    
    // Generate optimal CLAUDE.md
    const claudeMd = await analyzer.generateOptimalClaude();
    
    // Write to file if requested
    if (process.argv[2] === '--write') {
      fs.writeFileSync(
        path.join(process.cwd(), 'CLAUDE_OPTIMIZED.md'),
        claudeMd
      );
      console.log('\n✅ CLAUDE_OPTIMIZED.md generated!');
    }
  }).catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}