import { db, type Subject, type ID } from '../schema';
import { nanoid } from '../../lib/utils';

export const subjectsRepo = {
  async getAll(): Promise<Subject[]> {
    return db.subjects.orderBy('order').toArray();
  },

  async getBySemester(semesterId: ID): Promise<Subject[]> {
    return db.subjects.where('semesterId').equals(semesterId).sortBy('order');
  },

  async getById(id: ID): Promise<Subject | undefined> {
    return db.subjects.get(id);
  },

  async create(semesterId: ID, name: string, color: string, icon = 'BookOpen', order?: number): Promise<Subject> {
    const count = await db.subjects.where('semesterId').equals(semesterId).count();
    const subject: Subject = {
      id: nanoid(),
      semesterId,
      name: name.trim(),
      color,
      icon,
      order: order ?? count,
    };
    await db.subjects.add(subject);
    return subject;
  },

  async update(id: ID, updates: Partial<Omit<Subject, 'id' | 'semesterId'>>): Promise<void> {
    await db.subjects.update(id, updates);
  },

  async delete(id: ID): Promise<void> {
    await db.transaction('rw', [db.subjects, db.topics, db.items], async () => {
      const topics = await db.topics.where('subjectId').equals(id).toArray();
      const topicIds = topics.map(t => t.id);

      await db.items.where('subjectId').equals(id).delete();
      await db.topics.where('id').anyOf(topicIds).delete();
      await db.subjects.delete(id);
    });
  }
};
