import { db, type Topic, type ID } from '../schema';
import { nanoid } from '../../lib/utils';

export const topicsRepo = {
  async getAll(): Promise<Topic[]> {
    return db.topics.toArray();
  },

  async getBySubject(subjectId: ID): Promise<Topic[]> {
    return db.topics.where('subjectId').equals(subjectId).toArray();
  },

  async getById(id: ID): Promise<Topic | undefined> {
    return db.topics.get(id);
  },

  async create(subjectId: ID, name: string): Promise<Topic> {
    const topic: Topic = {
      id: nanoid(),
      subjectId,
      name: name.trim(),
      mastery: 0,
      lastStudiedAt: undefined,
    };
    await db.topics.add(topic);
    return topic;
  },

  async updateMastery(id: ID, mastery: number): Promise<void> {
    const clamped = Math.max(0, Math.min(100, Math.round(mastery)));
    await db.topics.update(id, {
      mastery: clamped,
      lastStudiedAt: Date.now(),
    });
  },

  async update(id: ID, updates: Partial<Omit<Topic, 'id' | 'subjectId'>>): Promise<void> {
    await db.topics.update(id, updates);
  },

  async delete(id: ID): Promise<void> {
    await db.transaction('rw', [db.topics, db.items, db.quizzes], async () => {
      await db.items.where('topicId').equals(id).modify({ topicId: undefined });
      await db.quizzes.where('topicId').equals(id).modify({ topicId: undefined });
      await db.topics.delete(id);
    });
  }
};
