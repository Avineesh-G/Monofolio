import { db, type QuizCard, type ID } from '../schema';
import { nanoid } from '../../lib/utils';

export const quizzesRepo = {
  async getAll(): Promise<QuizCard[]> {
    return db.quizzes.toArray();
  },

  async getByItem(itemId: ID): Promise<QuizCard[]> {
    return db.quizzes.where('itemId').equals(itemId).toArray();
  },

  async getByTopic(topicId: ID): Promise<QuizCard[]> {
    return db.quizzes.where('topicId').equals(topicId).toArray();
  },

  async getDueCards(now = Date.now()): Promise<QuizCard[]> {
    return db.quizzes.where('dueAt').belowOrEqual(now).toArray();
  },

  async countDue(now = Date.now()): Promise<number> {
    return db.quizzes.where('dueAt').belowOrEqual(now).count();
  },

  async bulkAdd(cards: Omit<QuizCard, 'id'>[]): Promise<QuizCard[]> {
    const fullCards: QuizCard[] = cards.map(c => ({
      ...c,
      id: nanoid(),
    }));
    await db.quizzes.bulkAdd(fullCards);
    return fullCards;
  },

  async updateBox(id: ID, box: 0 | 1 | 2 | 3 | 4, nextDueAt: number): Promise<void> {
    await db.quizzes.update(id, {
      box,
      dueAt: nextDueAt,
    });
  },

  async delete(id: ID): Promise<void> {
    await db.quizzes.delete(id);
  }
};
