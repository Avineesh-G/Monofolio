import { db, type Semester, type ID } from '../schema';
import { nanoid } from '../../lib/utils';

export const semestersRepo = {
  async getAll(): Promise<Semester[]> {
    return db.semesters.orderBy('order').toArray();
  },

  async getById(id: ID): Promise<Semester | undefined> {
    return db.semesters.get(id);
  },

  async create(name: string, order?: number): Promise<Semester> {
    const count = await db.semesters.count();
    const semester: Semester = {
      id: nanoid(),
      name: name.trim(),
      order: order ?? count,
      createdAt: Date.now(),
    };
    await db.semesters.add(semester);
    return semester;
  },

  async update(id: ID, updates: Partial<Omit<Semester, 'id' | 'createdAt'>>): Promise<void> {
    await db.semesters.update(id, updates);
  },

  async delete(id: ID): Promise<void> {
    await db.transaction('rw', [db.semesters, db.subjects, db.topics, db.items], async () => {
      const subjects = await db.subjects.where('semesterId').equals(id).toArray();
      const subjectIds = subjects.map(s => s.id);
      
      const topics = await db.topics.where('subjectId').anyOf(subjectIds).toArray();
      const topicIds = topics.map(t => t.id);

      await db.items.where('subjectId').anyOf(subjectIds).delete();
      await db.topics.where('id').anyOf(topicIds).delete();
      await db.subjects.where('id').anyOf(subjectIds).delete();
      await db.semesters.delete(id);
    });
  }
};
