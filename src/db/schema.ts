import Dexie, { type Table } from 'dexie';

export type ID = string;

export interface Semester {
  id: ID;
  name: string;
  order: number;
  createdAt: number;
}

export interface Subject {
  id: ID;
  semesterId: ID;
  name: string;
  color: string;
  icon: string;
  order: number;
}

export interface Topic {
  id: ID;
  subjectId: ID;
  name: string;
  mastery: number; // 0-100
  lastStudiedAt?: number;
}

export type ItemKind = 'pdf' | 'note' | 'link';

export interface Item {
  id: ID;
  kind: ItemKind;
  title: string;
  subjectId: ID;
  topicId?: ID;
  starred: boolean;
  createdAt: number;
  updatedAt: number;
  // pdf
  filePath?: string;
  fileHash?: string;
  pageCount?: number;
  textLength?: number;
  thumbnail?: string; // Base64 or cached canvas blob URL
  // note
  body?: string; // markdown
  // link
  url?: string;
  linkNote?: string; // why I saved it
}

export interface Analysis {
  id: ID;
  itemId: ID;
  fileHash: string;
  promptVersion: number;
  concepts: {
    name: string;
    importance: 1 | 2 | 3 | 4 | 5;
    why: string;
  }[];
  weakSpots: string[];
  learningOrder: string[];
  plan: {
    day: number;
    tasks: string[];
  }[];
  realityCheck: string;
  createdAt: number;
}

export interface QuizCard {
  id: ID;
  itemId: ID;
  topicId?: ID;
  q: string;
  a: string;
  explanation?: string;
  box: 0 | 1 | 2 | 3 | 4;
  dueAt: number;
}

export class StudyVaultDB extends Dexie {
  semesters!: Table<Semester, ID>;
  subjects!: Table<Subject, ID>;
  topics!: Table<Topic, ID>;
  items!: Table<Item, ID>;
  analyses!: Table<Analysis, ID>;
  quizzes!: Table<QuizCard, ID>;

  get documents(): Table<Item, ID> {
    return this.items;
  }
  get flashcards(): Table<QuizCard, ID> {
    return this.quizzes;
  }
  get savedLinks(): Table<Item, ID> {
    return this.items;
  }
  get coachAnalyses(): Table<Analysis, ID> {
    return this.analyses;
  }

  constructor() {
    super('studyvault_db');

    this.version(1).stores({
      semesters: 'id, order, createdAt',
      subjects: 'id, semesterId, order',
      topics: 'id, subjectId, mastery',
      items: 'id, subjectId, topicId, kind, starred, updatedAt, fileHash',
      analyses: 'id, itemId, fileHash, promptVersion',
      quizzes: 'id, itemId, topicId, box, dueAt',
    });
  }
}

export const db = new StudyVaultDB();
