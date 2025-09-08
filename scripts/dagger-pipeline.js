/**
 * Dagger Pipeline for Prjctzr Projects
 * Provides CI/CD pipeline generation using Dagger
 */

import { connect } from "@dagger.io/dagger";
import { writeFileSync } from "fs";
import path from "path";

export class PrjctzrPipeline {
  constructor(projectPath, projectType) {
    this.projectPath = projectPath;
    this.projectType = projectType;
  }

  async generatePipeline() {
    // Connect to Dagger
    const client = await connect();

    try {
      // Generate pipeline based on project type
      let pipeline;
      
      switch (this.projectType) {
        case 'node':
          pipeline = await this.generateNodePipeline(client);
          break;
        case 'python':
          pipeline = await this.generatePythonPipeline(client);
          break;
        case 'go':
          pipeline = await this.generateGoPipeline(client);
          break;
        case 'rust':
          pipeline = await this.generateRustPipeline(client);
          break;
        case 'fullstack':
          pipeline = await this.generateFullstackPipeline(client);
          break;
        default:
          pipeline = await this.generateGenericPipeline(client);
      }

      // Write pipeline to project
      const pipelinePath = path.join(this.projectPath, 'dagger.mjs');
      writeFileSync(pipelinePath, pipeline);
      
      return {
        success: true,
        path: pipelinePath,
        message: `Generated Dagger pipeline for ${this.projectType} project`,
      };
    } finally {
      await client.close();
    }
  }

  async generateNodePipeline(client) {
    return `
import { connect } from "@dagger.io/dagger";

async function main() {
  const client = await connect();

  try {
    // Define the Node.js pipeline
    const source = client.host().directory(".", {
      exclude: ["node_modules", ".git", "dist"],
    });

    // Build stage
    const build = client
      .container()
      .from("node:20-alpine")
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["npm", "ci"])
      .withExec(["npm", "run", "build"]);

    // Test stage
    const test = build
      .withExec(["npm", "test"]);

    // Lint stage
    const lint = build
      .withExec(["npm", "run", "lint"]);

    // Security scan
    const security = build
      .withExec(["npm", "audit", "--audit-level=moderate"]);

    // Build Docker image
    const dockerImage = client
      .container()
      .from("node:20-alpine")
      .withDirectory("/app", build.directory("/app"))
      .withWorkdir("/app")
      .withExec(["npm", "ci", "--only=production"])
      .withEntrypoint(["node", "index.js"]);

    // Publish to registry
    const publish = dockerImage
      .withLabel("version", process.env.VERSION || "latest")
      .withLabel("build-date", new Date().toISOString());

    // Execute pipeline
    await Promise.all([
      test.sync(),
      lint.sync(),
      security.sync(),
    ]);

    // Publish if all checks pass
    const imageRef = await publish.publish(
      process.env.REGISTRY_URL || "ttl.sh/prjctzr-app:1h"
    );

    console.log(\`✅ Pipeline completed successfully!\`);
    console.log(\`📦 Image published to: \${imageRef}\`);
    
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
`;
  }

  async generatePythonPipeline(client) {
    return `
import { connect } from "@dagger.io/dagger";

async function main() {
  const client = await connect();

  try {
    const source = client.host().directory(".", {
      exclude: [".venv", "__pycache__", ".git", "dist"],
    });

    // Build stage with Poetry
    const build = client
      .container()
      .from("python:3.12-slim")
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["pip", "install", "poetry"])
      .withExec(["poetry", "install"]);

    // Test with pytest
    const test = build
      .withExec(["poetry", "run", "pytest", "--cov"]);

    // Lint with ruff
    const lint = build
      .withExec(["poetry", "run", "ruff", "check", "."]);

    // Type check with mypy
    const typeCheck = build
      .withExec(["poetry", "run", "mypy", "."]);

    // Security scan with bandit
    const security = build
      .withExec(["poetry", "run", "bandit", "-r", "."]);

    // Execute all checks
    await Promise.all([
      test.sync(),
      lint.sync(),
      typeCheck.sync(),
      security.sync(),
    ]);

    console.log("✅ Python pipeline completed successfully!");
    
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
`;
  }

  async generateGoPipeline(client) {
    return `
import { connect } from "@dagger.io/dagger";

async function main() {
  const client = await connect();

  try {
    const source = client.host().directory(".", {
      exclude: [".git", "vendor"],
    });

    // Build stage
    const build = client
      .container()
      .from("golang:1.22-alpine")
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withEnvVariable("CGO_ENABLED", "0")
      .withExec(["go", "mod", "download"])
      .withExec(["go", "build", "-o", "app", "."]);

    // Test
    const test = build
      .withExec(["go", "test", "-v", "./..."]);

    // Lint with golangci-lint
    const lint = build
      .withExec(["go", "install", "github.com/golangci/golangci-lint/cmd/golangci-lint@latest"])
      .withExec(["golangci-lint", "run"]);

    // Security scan
    const security = build
      .withExec(["go", "install", "github.com/securego/gosec/v2/cmd/gosec@latest"])
      .withExec(["gosec", "./..."]);

    await Promise.all([
      test.sync(),
      lint.sync(),
      security.sync(),
    ]);

    // Build final image
    const finalImage = client
      .container()
      .from("alpine:latest")
      .withFile("/app", build.file("/app/app"))
      .withEntrypoint(["/app"]);

    const imageRef = await finalImage.publish(
      process.env.REGISTRY_URL || "ttl.sh/go-app:1h"
    );

    console.log(\`✅ Go pipeline completed!\`);
    console.log(\`📦 Image: \${imageRef}\`);
    
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
`;
  }

  async generateRustPipeline(client) {
    return `
import { connect } from "@dagger.io/dagger";

async function main() {
  const client = await connect();

  try {
    const source = client.host().directory(".", {
      exclude: [".git", "target"],
    });

    // Build stage
    const build = client
      .container()
      .from("rust:1.75-slim")
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["cargo", "build", "--release"]);

    // Test
    const test = build
      .withExec(["cargo", "test"]);

    // Lint with clippy
    const lint = build
      .withExec(["cargo", "clippy", "--", "-D", "warnings"]);

    // Format check
    const format = build
      .withExec(["cargo", "fmt", "--", "--check"]);

    await Promise.all([
      test.sync(),
      lint.sync(),
      format.sync(),
    ]);

    console.log("✅ Rust pipeline completed successfully!");
    
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
`;
  }

  async generateFullstackPipeline(client) {
    return `
import { connect } from "@dagger.io/dagger";

async function main() {
  const client = await connect();

  try {
    const source = client.host().directory(".", {
      exclude: ["node_modules", ".git", "dist"],
    });

    // Frontend build
    const frontend = client
      .container()
      .from("node:20-alpine")
      .withDirectory("/app", source)
      .withWorkdir("/app/frontend")
      .withExec(["npm", "ci"])
      .withExec(["npm", "run", "build"])
      .withExec(["npm", "test"]);

    // Backend build
    const backend = client
      .container()
      .from("node:20-alpine")
      .withDirectory("/app", source)
      .withWorkdir("/app/backend")
      .withExec(["npm", "ci"])
      .withExec(["npm", "test"]);

    // Database migrations
    const migrations = backend
      .withExec(["npm", "run", "migrate:test"]);

    // E2E tests
    const e2e = client
      .container()
      .from("mcr.microsoft.com/playwright:v1.40.0")
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["npm", "ci"])
      .withExec(["npm", "run", "e2e"]);

    // Execute all stages
    await Promise.all([
      frontend.sync(),
      backend.sync(),
      migrations.sync(),
      e2e.sync(),
    ]);

    console.log("✅ Fullstack pipeline completed!");
    
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
`;
  }

  async generateGenericPipeline(client) {
    return `
import { connect } from "@dagger.io/dagger";

async function main() {
  const client = await connect();

  try {
    const source = client.host().directory(".", {
      exclude: [".git"],
    });

    // Generic build stage
    const build = client
      .container()
      .from("alpine:latest")
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["echo", "Add your build commands here"]);

    await build.sync();
    
    console.log("✅ Generic pipeline completed!");
    console.log("📝 Please customize this pipeline for your project");
    
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
`;
  }
}

// Export for use in main application
export default PrjctzrPipeline;
