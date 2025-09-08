import fs from 'fs/promises';
import path from 'path';

export class ProjectInitializer {
  async initProject(options) {
    const { name, type = 'generic', path: projectPath } = options;
    
    const fullPath = path.resolve(projectPath || '.', name);
    
    await fs.mkdir(fullPath, { recursive: true });
    
    return {
      success: true,
      path: fullPath,
      type,
      message: `Project ${name} initialized at ${fullPath}`
    };
  }

  async setupGit(projectPath) {
    return { success: true };
  }

  async createReadme(projectPath, projectName) {
    const content = `# ${projectName}\n\nProject created with Prjctzr\n`;
    await fs.writeFile(path.join(projectPath, 'README.md'), content);
  }
}