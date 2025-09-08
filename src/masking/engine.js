/**
 * Masking Engine for Prjctzr
 * Provides clean tool interfaces with hidden complexity
 */

export class MaskingEngine {
  constructor() {
    this.tools = new Map();
    this.metrics = {
      calls: 0,
      errors: 0,
      totalDuration: 0,
    };
  }

  registerTool({ name, description, handler, mask }) {
    this.tools.set(name, {
      name,
      description,
      handler,
      mask: mask || {},
    });
    
    console.error(`[Masking] Registered tool: ${name}`);
  }

  getExposedTools() {
    const exposed = [];
    
    for (const [name, tool] of this.tools) {
      exposed.push({
        name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: tool.mask.input?.exposed || {},
          required: Object.entries(tool.mask.input?.exposed || {})
            .filter(([_, schema]) => schema.required)
            .map(([key]) => key),
        },
      });
    }
    
    return exposed;
  }

  async execute(toolName, input) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      this.metrics.errors++;
      throw new Error(`Unknown tool: ${toolName}`);
    }

    const startTime = Date.now();
    this.metrics.calls++;

    try {
      // Merge exposed input with hidden values
      const fullInput = {
        ...input,
        ...(tool.mask.input?.hidden || {}),
      };

      // Process system variables
      for (const [key, value] of Object.entries(fullInput)) {
        if (typeof value === 'string' && value.includes('$$')) {
          fullInput[key] = this.processSystemVariables(value);
        }
      }

      // Execute handler
      const result = await tool.handler(fullInput);

      // Filter output if specified
      let output = result;
      if (tool.mask.output?.filter && typeof result === 'object') {
        output = {};
        for (const field of tool.mask.output.filter) {
          if (field in result) {
            output[field] = result[field];
          }
        }
      }

      const duration = Date.now() - startTime;
      this.metrics.totalDuration += duration;

      return output;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  processSystemVariables(value) {
    return value
      .replace('$$TIMESTAMP$$', new Date().toISOString())
      .replace('$$USER$$', process.env.USER || 'unknown')
      .replace('$$HOME$$', process.env.HOME || '/')
      .replace('$$PLATFORM$$', process.platform)
      .replace('$$NODE_VERSION$$', process.version);
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgDuration: this.metrics.calls > 0 
        ? Math.round(this.metrics.totalDuration / this.metrics.calls)
        : 0,
      successRate: this.metrics.calls > 0
        ? ((this.metrics.calls - this.metrics.errors) / this.metrics.calls * 100).toFixed(2)
        : 0,
    };
  }
}
