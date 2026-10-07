import { db, type Item, type ItemKind, type ID } from '../schema';
import { nanoid } from '../../lib/utils';

export interface CreateItemInput {
  kind: ItemKind;
  title: string;
  subjectId: ID;
  topicId?: ID;
  starred?: boolean;
  filePath?: string;
  fileHash?: string;
  pageCount?: number;
  textLength?: number;
  thumbnail?: string;
  body?: string;
  url?: string;
  linkNote?: string;
}

export const itemsRepo = {
  async getAll(): Promise<Item[]> {
    return db.items.orderBy('updatedAt').reverse().toArray();
  },

  async getById(id: ID): Promise<Item | undefined> {
    return db.items.get(id);
  },

  async getBySubject(subjectId: ID): Promise<Item[]> {
    return db.items.where('subjectId').equals(subjectId).reverse().sortBy('updatedAt');
  },

  async getByTopic(topicId: ID): Promise<Item[]> {
    return db.items.where('topicId').equals(topicId).reverse().sortBy('updatedAt');
  },

  async getByKind(kind: ItemKind): Promise<Item[]> {
    return db.items.where('kind').equals(kind).reverse().sortBy('updatedAt');
  },

  async getStarred(): Promise<Item[]> {
    return db.items.filter(item => Boolean(item.starred)).reverse().sortBy('updatedAt');
  },

  async getByFileHash(fileHash: string): Promise<Item | undefined> {
    return db.items.where('fileHash').equals(fileHash).first();
  },

  async create(input: CreateItemInput): Promise<Item> {
    const now = Date.now();
    const item: Item = {
      id: nanoid(),
      kind: input.kind,
      title: input.title.trim(),
      subjectId: input.subjectId,
      topicId: input.topicId,
      starred: input.starred ?? false,
      createdAt: now,
      updatedAt: now,
      filePath: input.filePath,
      fileHash: input.fileHash,
      pageCount: input.pageCount,
      textLength: input.textLength,
      thumbnail: input.thumbnail,
      body: input.body,
      url: input.url,
      linkNote: input.linkNote,
    };
    await db.items.add(item);
    return item;
  },

  async update(id: ID, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<void> {
    await db.items.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async toggleStar(id: ID): Promise<boolean> {
    const item = await db.items.get(id);
    if (!item) return false;
    const newStarred = !item.starred;
    await db.items.update(id, { starred: newStarred, updatedAt: Date.now() });
    return newStarred;
  },

  async delete(id: ID): Promise<void> {
    await db.transaction('rw', [db.items, db.analyses, db.quizzes], async () => {
      await db.analyses.where('itemId').equals(id).delete();
      await db.quizzes.where('itemId').equals(id).delete();
      await db.items.delete(id);
    });
  },

  async bulkAdd(items: Item[]): Promise<void> {
    await db.items.bulkAdd(items);
  },

  async clear(): Promise<void> {
    await db.items.clear();
  }
};
