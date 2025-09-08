import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TemplateManager {
  constructor() {
    this.templatesPath = path.join(__dirname, '../../templates');
    this.templates = new Map();
  }

  async loadTemplates(templatesPath) {
    this.templatesPath = templatesPath || this.templatesPath;
    try {
      const templates = await fs.readdir(this.templatesPath);
      for (const template of templates.filter(t => !t.startsWith('.'))) {
        this.templates.set(template, { name: template });
      }
    } catch {
      // No templates found
    }
  }

  count() {
    return this.templates.size;
  }

  async listTemplates() {
    try {
      const templates = await fs.readdir(this.templatesPath);
      return templates.filter(t => !t.startsWith('.'));
    } catch {
      return [];
    }
  }

  async applyTemplate(projectPath, templateName) {
    return { success: true };
  }

  async getTemplateConfig(templateName) {
    return {
      name: templateName,
      description: 'Project template',
      files: []
    };
  }
}