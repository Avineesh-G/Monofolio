import { db } from './schema';

export interface BackupData {
  version: number;
  timestamp: number;
  semesters: unknown[];
  subjects: unknown[];
  topics: unknown[];
  items: unknown[];
  analyses: unknown[];
  quizzes: unknown[];
}

export async function exportBackup(): Promise<string> {
  const [semesters, subjects, topics, items, analyses, quizzes] = await Promise.all([
    db.semesters.toArray(),
    db.subjects.toArray(),
    db.topics.toArray(),
    db.items.toArray(),
    db.analyses.toArray(),
    db.quizzes.toArray(),
  ]);

  const backup: BackupData = {
    version: 1,
    timestamp: Date.now(),
    semesters,
    subjects,
    topics,
    items,
    analyses,
    quizzes,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importBackup(jsonString: string): Promise<{ count: number }> {
  const data = JSON.parse(jsonString) as BackupData;
  if (!data || data.version !== 1) {
    throw new Error('Invalid backup file format');
  }

  let totalCount = 0;
  await db.transaction('rw', [db.semesters, db.subjects, db.topics, db.items, db.analyses, db.quizzes], async () => {
    await Promise.all([
      db.semesters.clear(),
      db.subjects.clear(),
      db.topics.clear(),
      db.items.clear(),
      db.analyses.clear(),
      db.quizzes.clear(),
    ]);

    if (data.semesters?.length) {
      await db.semesters.bulkAdd(data.semesters as never);
      totalCount += data.semesters.length;
    }
    if (data.subjects?.length) {
      await db.subjects.bulkAdd(data.subjects as never);
      totalCount += data.subjects.length;
    }
    if (data.topics?.length) {
      await db.topics.bulkAdd(data.topics as never);
      totalCount += data.topics.length;
    }
    if (data.items?.length) {
      await db.items.bulkAdd(data.items as never);
      totalCount += data.items.length;
    }
    if (data.analyses?.length) {
      await db.analyses.bulkAdd(data.analyses as never);
      totalCount += data.analyses.length;
    }
    if (data.quizzes?.length) {
      await db.quizzes.bulkAdd(data.quizzes as never);
      totalCount += data.quizzes.length;
    }
  });

  return { count: totalCount };
}
