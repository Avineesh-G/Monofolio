import { db, type Analysis, type ID } from '../schema';
import { nanoid } from '../../lib/utils';

export const analysesRepo = {
  async getByItemId(itemId: ID): Promise<Analysis | undefined> {
    return db.analyses.where('itemId').equals(itemId).first();
  },

  async getByHashAndVersion(fileHash: string, promptVersion: number): Promise<Analysis | undefined> {
    return db.analyses
      .where('fileHash')
      .equals(fileHash)
      .and(a => a.promptVersion === promptVersion)
      .first();
  },

  async save(analysis: Omit<Analysis, 'id' | 'createdAt'>): Promise<Analysis> {
    const existing = await this.getByHashAndVersion(analysis.fileHash, analysis.promptVersion);
    if (existing) {
      const updated: Analysis = {
        ...existing,
        ...analysis,
      };
      await db.analyses.put(updated);
      return updated;
    }

    const newAnalysis: Analysis = {
      ...analysis,
      id: nanoid(),
      createdAt: Date.now(),
    };
    await db.analyses.add(newAnalysis);
    return newAnalysis;
  },

  async delete(id: ID): Promise<void> {
    await db.analyses.delete(id);
  }
};
