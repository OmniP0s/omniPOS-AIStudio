/**
 * OmniPOS Enterprise RAG Engine
 * Document Ingestion, Intelligent Chunking, Dense-Sparse Hybrid Search & Provenance Citations
 */

import {
  RagIngestionDocument,
  VectorDocumentChunk,
  RagSearchResult,
  RagCitation,
  ChunkingStrategy,
} from '../types';
import { vectorStore } from '../vector_db/vectorStore';

export class EnterpriseRagEngine {
  private ingestedDocuments: Map<string, RagIngestionDocument> = new Map();

  constructor() {
    this.seedIngestedDocuments();
  }

  private seedIngestedDocuments() {
    const defaultDoc: RagIngestionDocument = {
      id: 'DOC-OMNI-SOP-01',
      tenantId: 'TENANT-DEFAULT-01',
      title: 'OmniPOS Standard Operating Procedures & Food Quality Standards',
      category: 'OPERATIONS',
      fileType: 'MARKDOWN',
      sensitivityLevel: 'INTERNAL',
      metadata: { author: 'VP of Quality Assurance', version: '2026.1' },
      createdAt: '2026-08-01T00:00:00Z',
      content: `# Section 1: Kitchen Opening Routine
All line cooks must verify prep station holding temperatures at 09:00 AM before receiving POS orders.
Hot holding wells must register > 60°C.
Refrigerated line drawers must register < 4°C.

# Section 2: ZATCA Phase 2 E-Invoicing Compliance
Every customer checkout generates a cryptographic UBL 2.1 invoice. The QR code must contain the seller name, 15-digit VAT TIN (starting/ending with 3), timestamp, total invoice amount, and 15% VAT component.
In case of network partition, the POS terminal caches offline transactions with vector clocks and automatically syncs to cloud on reconnect.

# Section 3: Shift Reconciliation & Float Drop
Cash drawers must open with a 500 SAR baseline float. Any closing variance exceeding 20 SAR must be flagged for management review.`,
    };

    this.ingestDocument(defaultDoc, 'SEMANTIC_PARAGRAPH');
  }

  public ingestDocument(
    doc: RagIngestionDocument,
    strategy: ChunkingStrategy = 'SEMANTIC_PARAGRAPH',
    chunkSize: number = 300,
    chunkOverlap: number = 50
  ): { documentId: string; chunksCreated: number } {
    this.ingestedDocuments.set(doc.id, doc);

    // 1. Chunk document
    const rawChunks = this.chunkText(doc.content, strategy, chunkSize, chunkOverlap);

    // 2. Generate embeddings & vector chunks
    const vectorChunks: VectorDocumentChunk[] = rawChunks.map((text, idx) => {
      const embedding = vectorStore.generateDeterministicEmbedding(text, 64);
      return {
        id: `${doc.id}-chk-${idx + 1}`,
        documentId: doc.id,
        tenantId: doc.tenantId,
        chunkIndex: idx,
        text,
        embedding,
        tokenCount: Math.ceil(text.length / 4),
        metadata: {
          title: doc.title,
          category: doc.category,
          sensitivityLevel: doc.sensitivityLevel,
          tags: [doc.category.toLowerCase(), doc.fileType.toLowerCase()],
          createdAt: new Date().toISOString(),
        },
      };
    });

    // 3. Upsert to Vector Database
    vectorStore.upsertBatch(vectorChunks);
    doc.chunkCount = vectorChunks.length;

    return { documentId: doc.id, chunksCreated: vectorChunks.length };
  }

  public chunkText(
    content: string,
    strategy: ChunkingStrategy,
    chunkSize: number = 300,
    chunkOverlap: number = 50
  ): string[] {
    if (strategy === 'SEMANTIC_PARAGRAPH') {
      // Split on double newlines or markdown headers (#)
      const paragraphs = content
        .split(/(?=\n#+ )|\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 20);
      return paragraphs.length > 0 ? paragraphs : [content];
    }

    if (strategy === 'FIXED_SIZE_WITH_OVERLAP') {
      const words = content.split(/\s+/);
      const chunks: string[] = [];
      const wordChunkSize = Math.max(20, Math.floor(chunkSize / 5));
      const wordOverlap = Math.max(5, Math.floor(chunkOverlap / 5));

      for (let i = 0; i < words.length; i += (wordChunkSize - wordOverlap)) {
        const slice = words.slice(i, i + wordChunkSize).join(' ');
        if (slice.trim().length > 0) {
          chunks.push(slice);
        }
        if (i + wordChunkSize >= words.length) break;
      }
      return chunks;
    }

    // Default: RECURSIVE_HEADING
    return content.split(/\n(?=#)/).map(s => s.trim()).filter(Boolean);
  }

  public hybridSearch(
    tenantId: string,
    query: string,
    topK: number = 4
  ): { results: RagSearchResult[]; citations: RagCitation[] } {
    // 1. Dense Semantic Vector Search
    const queryEmbedding = vectorStore.generateDeterministicEmbedding(query, 64);
    const vectorResults = vectorStore.search({
      tenantId,
      queryEmbedding,
      topK: topK * 2,
      minScoreThreshold: 0.1,
    });

    // 2. Sparse Lexical BM25 Scoring
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const allTenantChunks = vectorStore.getAllChunks(tenantId);

    const scoredResults: RagSearchResult[] = vectorResults.map(vr => {
      const chunkTextLower = vr.chunk.text.toLowerCase();
      let termMatches = 0;
      queryTerms.forEach(term => {
        if (chunkTextLower.includes(term)) termMatches += 1;
      });
      const bm25Score = queryTerms.length > 0 ? termMatches / queryTerms.length : 0;

      // Reciprocal Rank Fusion / Weighted Combination: 70% Dense + 30% Sparse
      const combinedHybridScore = Number((vr.score * 0.7 + bm25Score * 0.3).toFixed(4));

      return {
        chunk: vr.chunk,
        similarityScore: vr.score,
        bm25Score: Number(bm25Score.toFixed(4)),
        combinedHybridScore,
      };
    });

    // Sort by combined score descending
    const sorted = scoredResults.sort((a, b) => b.combinedHybridScore - a.combinedHybridScore).slice(0, topK);

    // Format citations
    const citations: RagCitation[] = sorted.map(r => ({
      documentId: r.chunk.documentId,
      documentTitle: r.chunk.metadata.title,
      chunkId: r.chunk.id,
      snippet: r.chunk.text.substring(0, 160) + '...',
      score: r.combinedHybridScore,
    }));

    return { results: sorted, citations };
  }

  public getAllIngestedDocuments(tenantId?: string): RagIngestionDocument[] {
    const docs = Array.from(this.ingestedDocuments.values());
    if (tenantId) {
      return docs.filter(d => d.tenantId === tenantId);
    }
    return docs;
  }
}

export const ragEngine = new EnterpriseRagEngine();
