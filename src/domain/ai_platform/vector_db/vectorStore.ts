/**
 * OmniPOS Enterprise Vector Database
 * Multi-Tenant Isolated Embedding Index with Cosine, Euclidean & Dot-Product Similarity Search
 */

import {
  VectorDocumentChunk,
  DistanceMetric,
} from '../types';

export interface VectorQueryOptions {
  tenantId: string;
  queryEmbedding: number[];
  topK?: number;
  minScoreThreshold?: number;
  metric?: DistanceMetric;
  filters?: {
    category?: string;
    branchId?: string;
    sensitivityLevel?: string;
    tags?: string[];
    documentId?: string;
  };
}

export class EnterpriseVectorStore {
  // Partitioned by tenantId -> chunks array
  private tenantPartitions: Map<string, VectorDocumentChunk[]> = new Map();

  constructor() {
    this.seedDefaultVectorDocuments();
  }

  private seedDefaultVectorDocuments() {
    const tenantId = 'TENANT-DEFAULT-01';
    const sampleDocs: { title: string; category: string; text: string; tags: string[] }[] = [
      {
        title: 'ZATCA Phase 2 E-Invoicing Technical Mandate',
        category: 'REGULATION',
        text: 'All B2C tax invoices in Saudi Arabia must feature a cryptographic Tag 1-9 Base64 QR code signed with an ECDSA secp256k1 key. Invoices must maintain an unbroken SHA-256 sequential hash chain with zero tolerance for sequence gaps or retroactive edits.',
        tags: ['zatca', 'tax', 'qr', 'ecdsa'],
      },
      {
        title: 'HACCP Food Safety & Safe Holding Temperatures',
        category: 'SOP',
        text: 'Perishable poultry and minced beef must maintain cold holding below 4°C (39°F) and cook to an internal core temperature of at least 74°C (165°F) for 15 seconds. Food in the temperature danger zone (4°C to 60°C) must not exceed 2 hours.',
        tags: ['haccp', 'kitchen', 'food-safety', 'temperature'],
      },
      {
        title: 'Saudi Labor Law: Article 84 & 85 End-of-Service Calculation',
        category: 'HR',
        text: 'Article 84 stipulates half month wage per year for the first 5 years, and a full month wage for each subsequent year upon standard contract termination. Article 85 applies resignation deduction tiers: 0 for < 2 years, 1/3 for 2-5 years, 2/3 for 5-10 years, and 100% for 10+ years.',
        tags: ['hr', 'eosg', 'labor-law', 'payroll'],
      },
      {
        title: 'Master Recipe: Artisan Wagyu MB7+ Brioche Burger',
        category: 'RECIPES',
        text: 'Ingredients: 180g freshly ground Wagyu beef (80/20 lean-to-fat), 1 French butter brioche bun toasted with clarified ghee, 20g black truffle aioli, 30g aged red cheddar, 15g caramelized shallots. Standard prep time 4.5 minutes. Standard plate prime cost 19.40 SAR.',
        tags: ['recipes', 'wagyu', 'burger', 'cogs'],
      },
      {
        title: 'Cash Drawer Variance & Daily Z-Report Closing SOP',
        category: 'POS',
        text: 'At the end of every shift, the cashier must perform a blind cash count. A drawer variance exceeding +/- 20 SAR requires mandatory shift supervisor biometric approval and generates an automated audit entry.',
        tags: ['pos', 'cash', 'drawer', 'shift'],
      },
    ];

    sampleDocs.forEach((doc, idx) => {
      const embedding = this.generateDeterministicEmbedding(doc.text, 64);
      this.upsertChunk({
        id: `chk-seed-${idx + 1}`,
        documentId: `doc-seed-${idx + 1}`,
        tenantId,
        chunkIndex: 0,
        text: doc.text,
        embedding,
        tokenCount: Math.ceil(doc.text.length / 4),
        metadata: {
          title: doc.title,
          category: doc.category,
          sensitivityLevel: 'INTERNAL',
          tags: doc.tags,
          createdAt: new Date().toISOString(),
        },
      });
    });
  }

  public upsertChunk(chunk: VectorDocumentChunk): void {
    if (!this.tenantPartitions.has(chunk.tenantId)) {
      this.tenantPartitions.set(chunk.tenantId, []);
    }
    const partition = this.tenantPartitions.get(chunk.tenantId)!;
    const existingIndex = partition.findIndex(c => c.id === chunk.id);
    if (existingIndex >= 0) {
      partition[existingIndex] = chunk;
    } else {
      partition.push(chunk);
    }
  }

  public upsertBatch(chunks: VectorDocumentChunk[]): void {
    chunks.forEach(chunk => this.upsertChunk(chunk));
  }

  public deleteDocumentChunks(tenantId: string, documentId: string): number {
    const partition = this.tenantPartitions.get(tenantId);
    if (!partition) return 0;
    const initialLen = partition.length;
    const filtered = partition.filter(c => c.documentId !== documentId);
    this.tenantPartitions.set(tenantId, filtered);
    return initialLen - filtered.length;
  }

  public search(options: VectorQueryOptions): { chunk: VectorDocumentChunk; score: number }[] {
    const partition = this.tenantPartitions.get(options.tenantId) || [];
    const metric = options.metric || 'COSINE_SIMILARITY';
    const topK = options.topK || 5;
    const minThreshold = options.minScoreThreshold !== undefined ? options.minScoreThreshold : 0.0;

    // Apply metadata filters first
    const filteredChunks = partition.filter(chunk => {
      if (options.filters?.category && chunk.metadata.category !== options.filters.category) {
        return false;
      }
      if (options.filters?.branchId && chunk.metadata.branchId && chunk.metadata.branchId !== options.filters.branchId) {
        return false;
      }
      if (options.filters?.sensitivityLevel && chunk.metadata.sensitivityLevel !== options.filters.sensitivityLevel) {
        return false;
      }
      if (options.filters?.documentId && chunk.documentId !== options.filters.documentId) {
        return false;
      }
      if (options.filters?.tags && options.filters.tags.length > 0) {
        const hasTag = options.filters.tags.some(t => chunk.metadata.tags.includes(t));
        if (!hasTag) return false;
      }
      return true;
    });

    // Score and rank
    const scored = filteredChunks.map(chunk => {
      let score = 0;
      if (metric === 'COSINE_SIMILARITY') {
        score = this.cosineSimilarity(options.queryEmbedding, chunk.embedding);
      } else if (metric === 'DOT_PRODUCT') {
        score = this.dotProduct(options.queryEmbedding, chunk.embedding);
      } else if (metric === 'EUCLIDEAN_DISTANCE') {
        // Convert distance to 0..1 similarity
        const dist = this.euclideanDistance(options.queryEmbedding, chunk.embedding);
        score = 1 / (1 + dist);
      }
      return { chunk, score: Number(score.toFixed(4)) };
    });

    return scored
      .filter(item => item.score >= minThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const mag = Math.sqrt(normA) * Math.sqrt(normB);
    return mag === 0 ? 0 : Math.max(0, Math.min(1, dot / mag));
  }

  public dotProduct(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }
    return dot;
  }

  public euclideanDistance(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
    let sumSq = 0;
    for (let i = 0; i < vecA.length; i++) {
      const diff = vecA[i] - vecB[i];
      sumSq += diff * diff;
    }
    return Math.sqrt(sumSq);
  }

  public generateDeterministicEmbedding(text: string, dimensions: number = 64): number[] {
    // High-precision pseudo-embedding hash function for fast local indexing
    const vec = new Array(dimensions).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, '');
    const tokens = clean.split(/\s+/).filter(Boolean);

    tokens.forEach((token, tIdx) => {
      for (let i = 0; i < token.length; i++) {
        const charCode = token.charCodeAt(i);
        const dimIndex = (charCode * 31 + i * 17 + tIdx * 7) % dimensions;
        vec[dimIndex] += Math.sin(charCode + i) * 1.5;
      }
    });

    // L2 Normalize
    let norm = 0;
    for (let i = 0; i < dimensions; i++) norm += vec[i] * vec[i];
    const mag = Math.sqrt(norm) || 1;
    return vec.map(v => Number((v / mag).toFixed(5)));
  }

  public getTenantChunkCount(tenantId: string): number {
    return (this.tenantPartitions.get(tenantId) || []).length;
  }

  public getAllChunks(tenantId: string): VectorDocumentChunk[] {
    return this.tenantPartitions.get(tenantId) || [];
  }
}

export const vectorStore = new EnterpriseVectorStore();
