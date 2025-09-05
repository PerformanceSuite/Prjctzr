/**
 * Vector-Based Memory System
 * 
 * Implements semantic search and knowledge management with complete project isolation.
 * Uses vector embeddings for contextual memory retrieval.
 */

import fs from 'fs';
import path from 'path';

export class MemorySystem {
  constructor(projectConfig) {
    this.config = projectConfig;
    this.memoryDbPath = path.join(projectConfig.dataDir, 'memory.db');
    this.embeddingsDir = path.join(projectConfig.dataDir, 'embeddings');
    this.knowledgeDir = path.join(projectConfig.dataDir, 'knowledge');
    
    this.ensureDirectories();
    this.initializeDatabase();
  }

  /**
   * Ensure all memory directories exist
   */
  ensureDirectories() {
    [this.embeddingsDir, this.knowledgeDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initialize the memory database (SQLite simulation)
   */
  initializeDatabase() {
    // In a real implementation, this would initialize SQLite with vector extensions
    // For now, we'll use a JSON-based approach
    
    this.memories = [];
    this.decisions = [];
    this.progress = [];
    this.lessons = [];

    // Load existing memories if database exists
    this.loadExistingMemories();
  }

  /**
   * Perform semantic search across project memories
   */
  async semanticSearch(query, options = {}) {
    const {
      category = 'all',
      limit = 10,
      minSimilarity = 0.5,
      includeContext = true
    } = options;

    console.error(`🔍 Searching ${this.config.projectName} memory: "${query}"`);
    console.error(`📂 Category: ${category}, Limit: ${limit}`);

    // Simulate vector similarity search
    await this.delay(100);

    let searchResults = [];

    // Search across different memory categories
    if (category === 'all' || category === 'decisions') {
      searchResults.push(...this.searchDecisions(query, minSimilarity));
    }
    
    if (category === 'all' || category === 'progress') {
      searchResults.push(...this.searchProgress(query, minSimilarity));
    }
    
    if (category === 'all' || category === 'lessons') {
      searchResults.push(...this.searchLessons(query, minSimilarity));
    }

    if (category === 'all' || category === 'architecture') {
      searchResults.push(...this.searchArchitecture(query, minSimilarity));
    }

    // Add project-specific categories
    if (this.config.projectName === 'veria') {
      if (category === 'all' || category === 'regulatory') {
        searchResults.push(...this.searchRegulatory(query, minSimilarity));
      }
      
      if (category === 'all' || category === 'blockchain') {
        searchResults.push(...this.searchBlockchain(query, minSimilarity));
      }
    }

    // Sort by relevance and apply limit
    searchResults.sort((a, b) => b.similarity - a.similarity);
    searchResults = searchResults.slice(0, limit);

    // Add context if requested
    if (includeContext) {
      searchResults = await this.enrichWithContext(searchResults);
    }

    return {
      query,
      category,
      projectName: this.config.projectName,
      totalResults: searchResults.length,
      searchTime: '~100ms',
      results: searchResults
    };
  }

  /**
   * Record a new decision with vector embedding
   */
  async recordDecision(decision, context, metadata = {}) {
    const record = {
      id: `dec-${this.config.projectName}-${Date.now()}`,
      type: 'decision',
      project: this.config.projectName,
      decision,
      context,
      metadata: {
        category: metadata.category || 'general',
        impact: metadata.impact,
        alternatives: metadata.alternatives || [],
        tags: metadata.tags || [],
        ...metadata
      },
      timestamp: new Date().toISOString(),
      embedding: await this.generateEmbedding(`${decision} ${context}`)
    };

    this.decisions.push(record);
    await this.persistMemory('decisions', record);

    console.error(`✅ Decision recorded: ${record.id}`);
    return record;
  }

  /**
   * Record progress notes
   */
  async recordProgress(milestone, status, notes, metadata = {}) {
    const record = {
      id: `prog-${this.config.projectName}-${Date.now()}`,
      type: 'progress',
      project: this.config.projectName,
      milestone,
      status,
      notes,
      metadata,
      timestamp: new Date().toISOString(),
      embedding: await this.generateEmbedding(`${milestone} ${notes}`)
    };

    this.progress.push(record);
    await this.persistMemory('progress', record);

    return record;
  }

  /**
   * Record lessons learned
   */
  async recordLesson(lesson, context, category = 'general') {
    const record = {
      id: `lesson-${this.config.projectName}-${Date.now()}`,
      type: 'lesson',
      project: this.config.projectName,
      lesson,
      context,
      category,
      timestamp: new Date().toISOString(),
      embedding: await this.generateEmbedding(`${lesson} ${context}`)
    };

    this.lessons.push(record);
    await this.persistMemory('lessons', record);

    return record;
  }

  /**
   * Search architectural decisions
   */
  searchDecisions(query, minSimilarity) {
    return this.decisions
      .map(decision => ({
        ...decision,
        similarity: this.calculateSimilarity(query, decision.decision + ' ' + decision.context),
        type: 'architectural_decision'
      }))
      .filter(item => item.similarity >= minSimilarity);
  }

  /**
   * Search progress records
   */
  searchProgress(query, minSimilarity) {
    return this.progress
      .map(progress => ({
        ...progress,
        similarity: this.calculateSimilarity(query, progress.milestone + ' ' + progress.notes),
        type: 'progress_note'
      }))
      .filter(item => item.similarity >= minSimilarity);
  }

  /**
   * Search lessons learned
   */
  searchLessons(query, minSimilarity) {
    return this.lessons
      .map(lesson => ({
        ...lesson,
        similarity: this.calculateSimilarity(query, lesson.lesson + ' ' + lesson.context),
        type: 'lesson_learned'
      }))
      .filter(item => item.similarity >= minSimilarity);
  }

  /**
   * Search architecture-related memories
   */
  searchArchitecture(query, minSimilarity) {
    const architecturalTerms = ['architecture', 'design', 'pattern', 'structure', 'component', 'system'];
    
    return this.decisions
      .filter(decision => 
        decision.metadata.category === 'architecture' ||
        architecturalTerms.some(term => 
          decision.decision.toLowerCase().includes(term) ||
          decision.context.toLowerCase().includes(term)
        )
      )
      .map(decision => ({
        ...decision,
        similarity: this.calculateSimilarity(query, decision.decision + ' ' + decision.context),
        type: 'architectural_pattern'
      }))
      .filter(item => item.similarity >= minSimilarity);
  }

  /**
   * Search regulatory decisions (Veria-specific)
   */
  searchRegulatory(query, minSimilarity) {
    const regulatoryTerms = ['compliance', 'regulatory', 'kyc', 'aml', 'securities', 'legal'];
    
    return this.decisions
      .filter(decision => 
        decision.metadata.category === 'regulatory' ||
        regulatoryTerms.some(term => 
          decision.decision.toLowerCase().includes(term) ||
          decision.context.toLowerCase().includes(term)
        )
      )
      .map(decision => ({
        ...decision,
        similarity: this.calculateSimilarity(query, decision.decision + ' ' + decision.context),
        type: 'regulatory_decision',
        complianceContext: this.extractComplianceContext(decision)
      }))
      .filter(item => item.similarity >= minSimilarity);
  }

  /**
   * Search blockchain decisions (Veria-specific)
   */
  searchBlockchain(query, minSimilarity) {
    const blockchainTerms = ['blockchain', 'smart contract', 'token', 'defi', 'web3', 'ethereum'];
    
    return this.decisions
      .filter(decision => 
        decision.metadata.category === 'blockchain' ||
        blockchainTerms.some(term => 
          decision.decision.toLowerCase().includes(term) ||
          decision.context.toLowerCase().includes(term)
        )
      )
      .map(decision => ({
        ...decision,
        similarity: this.calculateSimilarity(query, decision.decision + ' ' + decision.context),
        type: 'blockchain_decision',
        technicalContext: this.extractTechnicalContext(decision)
      }))
      .filter(item => item.similarity >= minSimilarity);
  }

  /**
   * Enrich results with additional context
   */
  async enrichWithContext(results) {
    return results.map(result => {
      // Add related memories
      const related = this.findRelatedMemories(result, 3);
      
      // Add project-specific enrichment
      let enrichment = {
        projectContext: this.config.projectName,
        relatedMemories: related.length
      };

      if (this.config.projectName === 'veria') {
        enrichment.regulatoryImplications = this.assessRegulatoryImplications(result);
        enrichment.blockchainRelevance = this.assessBlockchainRelevance(result);
      }

      return {
        ...result,
        enrichment,
        related
      };
    });
  }

  /**
   * Generate vector embedding (simulated)
   */
  async generateEmbedding(text) {
    // In a real implementation, this would use a proper embedding model
    // For now, we'll create a simple hash-based representation
    
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(384).fill(0); // Simulate 384-dimensional embedding
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      vector[hash % 384] += 1 / (index + 1); // Position weighting
    });

    return vector;
  }

  /**
   * Calculate similarity between query and stored text (simulated)
   */
  calculateSimilarity(query, text) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    queryWords.forEach(word => {
      if (textWords.some(textWord => textWord.includes(word) || word.includes(textWord))) {
        matches++;
      }
    });

    return matches / Math.max(queryWords.length, 1);
  }

  /**
   * Simple hash function for embedding simulation
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Find related memories
   */
  findRelatedMemories(memory, limit) {
    const allMemories = [...this.decisions, ...this.progress, ...this.lessons];
    
    return allMemories
      .filter(mem => mem.id !== memory.id)
      .map(mem => ({
        id: mem.id,
        type: mem.type,
        similarity: this.calculateSimilarity(memory.decision || memory.milestone || memory.lesson, 
          mem.decision || mem.milestone || mem.lesson),
        timestamp: mem.timestamp
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Extract compliance context (Veria-specific)
   */
  extractComplianceContext(decision) {
    const complianceKeywords = {
      kyc: ['identity', 'verification', 'customer'],
      aml: ['money laundering', 'suspicious', 'transaction'],
      securities: ['token', 'investment', 'security', 'regulation']
    };

    const context = {};
    const text = (decision.decision + ' ' + decision.context).toLowerCase();
    
    Object.entries(complianceKeywords).forEach(([area, keywords]) => {
      context[area] = keywords.some(keyword => text.includes(keyword));
    });

    return context;
  }

  /**
   * Extract technical context (Veria-specific)
   */
  extractTechnicalContext(decision) {
    const technicalKeywords = {
      smartContract: ['contract', 'solidity', 'ethereum'],
      tokenomics: ['token', 'supply', 'distribution'],
      defi: ['liquidity', 'yield', 'staking']
    };

    const context = {};
    const text = (decision.decision + ' ' + decision.context).toLowerCase();
    
    Object.entries(technicalKeywords).forEach(([area, keywords]) => {
      context[area] = keywords.some(keyword => text.includes(keyword));
    });

    return context;
  }

  /**
   * Assess regulatory implications
   */
  assessRegulatoryImplications(memory) {
    const regulatoryTerms = ['compliance', 'regulatory', 'legal', 'kyc', 'aml', 'securities'];
    const text = (memory.decision || memory.milestone || memory.lesson || '').toLowerCase();
    
    return {
      hasImplications: regulatoryTerms.some(term => text.includes(term)),
      riskLevel: text.includes('security') || text.includes('compliance') ? 'high' : 'medium',
      reviewRequired: text.includes('regulatory') || text.includes('legal')
    };
  }

  /**
   * Assess blockchain relevance
   */
  assessBlockchainRelevance(memory) {
    const blockchainTerms = ['blockchain', 'smart contract', 'token', 'defi'];
    const text = (memory.decision || memory.milestone || memory.lesson || '').toLowerCase();
    
    return {
      isRelevant: blockchainTerms.some(term => text.includes(term)),
      technicalDepth: text.includes('solidity') || text.includes('ethereum') ? 'high' : 'medium',
      gasImplications: text.includes('gas') || text.includes('optimization')
    };
  }

  /**
   * Load existing memories from storage
   */
  loadExistingMemories() {
    const categories = ['decisions', 'progress', 'lessons'];
    
    categories.forEach(category => {
      const filePath = path.join(this.knowledgeDir, `${category}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          this[category] = JSON.parse(data);
          console.error(`📚 Loaded ${this[category].length} ${category} from storage`);
        } catch (error) {
          console.error(`⚠️  Failed to load ${category}: ${error.message}`);
          this[category] = [];
        }
      }
    });
  }

  /**
   * Persist memory to storage
   */
  async persistMemory(category, record) {
    const filePath = path.join(this.knowledgeDir, `${category}.json`);
    
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(this[category], null, 2));
    } catch (error) {
      console.error(`⚠️  Failed to persist ${category}: ${error.message}`);
    }
  }

  /**
   * Get memory statistics
   */
  getStats() {
    return {
      project: this.config.projectName,
      totalMemories: this.decisions.length + this.progress.length + this.lessons.length,
      decisions: this.decisions.length,
      progress: this.progress.length,
      lessons: this.lessons.length,
      lastUpdate: new Date().toISOString(),
      storageLocation: this.knowledgeDir
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}// Export only what this file defines
export default { MemorySystem };
