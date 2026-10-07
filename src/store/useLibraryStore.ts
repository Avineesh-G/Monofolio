import { create } from 'zustand';
import { db, type Item, type Subject, type Topic, type Semester, type ItemKind, type ID } from '../db/schema';
import { itemsRepo, semestersRepo, subjectsRepo, topicsRepo } from '../db/repos';

interface LibraryState {
  semesters: Semester[];
  subjects: Subject[];
  topics: Topic[];
  items: Item[];
  selectedSemesterId: ID | null;
  selectedSubjectId: ID | null;
  selectedTopicId: ID | null;
  filterKind: 'all' | ItemKind | 'starred';
  searchQuery: string;
  isLoading: boolean;

  // Actions
  loadInitialData: () => Promise<void>;
  setSelectedSemester: (id: ID | null) => void;
  setSelectedSubject: (id: ID | null) => void;
  setSelectedTopic: (id: ID | null) => void;
  setFilterKind: (kind: 'all' | ItemKind | 'starred') => void;
  setSearchQuery: (query: string) => void;
  toggleStar: (id: ID) => Promise<void>;
  deleteItem: (id: ID) => Promise<void>;
  refreshItems: () => Promise<void>;
  refreshAll: () => Promise<void>;
  seedDemoData: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  semesters: [],
  subjects: [],
  topics: [],
  items: [],
  selectedSemesterId: null,
  selectedSubjectId: null,
  selectedTopicId: null,
  filterKind: 'all',
  searchQuery: '',
  isLoading: false,

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const [semesters, subjects, topics, items] = await Promise.all([
        semestersRepo.getAll(),
        subjectsRepo.getAll(),
        topicsRepo.getAll(),
        itemsRepo.getAll(),
      ]);

      // If empty DB on first run, create a default semester and subject
      if (semesters.length === 0) {
        const sem1 = await semestersRepo.create('Semester 1 (Fall)');
        const sub1 = await subjectsRepo.create(sem1.id, 'Computer Networks', '#3b82f6', 'Network');
        await subjectsRepo.create(sem1.id, 'Operating Systems', '#8b5cf6', 'Cpu');
        await subjectsRepo.create(sem1.id, 'Database Systems', '#10b981', 'Database');

        const top1 = await topicsRepo.create(sub1.id, 'TCP/IP Model & Sockets');
        const top2 = await topicsRepo.create(sub1.id, 'Routing Algorithms');
        await topicsRepo.updateMastery(top1.id, 65);
        await topicsRepo.updateMastery(top2.id, 40);

        // Add welcome note
        await itemsRepo.create({
          kind: 'note',
          title: 'Welcome to StudyVault',
          subjectId: sub1.id,
          topicId: top1.id,
          starred: true,
          body: '# Welcome to StudyVault\n\n- Store your PDFs, notes, and curated links.\n- Use the AI Coach to cut through fluff and get straight to exam essentials.\n- Generate Leitner flashcards and master weak spots.',
        });

        const refreshedSemesters = await semestersRepo.getAll();
        const refreshedSubjects = await subjectsRepo.getAll();
        const refreshedTopics = await topicsRepo.getAll();
        const refreshedItems = await itemsRepo.getAll();

        set({
          semesters: refreshedSemesters,
          subjects: refreshedSubjects,
          topics: refreshedTopics,
          items: refreshedItems,
          selectedSemesterId: sem1.id,
          isLoading: false,
        });
        return;
      }

      set({
        semesters,
        subjects,
        topics,
        items,
        selectedSemesterId: semesters[0]?.id ?? null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load library data:', err);
      set({ isLoading: false });
    }
  },

  setSelectedSemester: (id) => set({ selectedSemesterId: id, selectedSubjectId: null, selectedTopicId: null }),
  setSelectedSubject: (id) => set({ selectedSubjectId: id, selectedTopicId: null }),
  setSelectedTopic: (id) => set({ selectedTopicId: id }),
  setFilterKind: (filterKind) => set({ filterKind }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleStar: async (id: ID) => {
    const newStarred = await itemsRepo.toggleStar(id);
    set(state => ({
      items: state.items.map(item => item.id === id ? { ...item, starred: newStarred } : item)
    }));
  },

  deleteItem: async (id: ID) => {
    await itemsRepo.delete(id);
    set(state => ({
      items: state.items.filter(item => item.id !== id)
    }));
  },

  refreshItems: async () => {
    const items = await itemsRepo.getAll();
    set({ items });
  },

  refreshAll: async () => {
    const [semesters, subjects, topics, items] = await Promise.all([
      semestersRepo.getAll(),
      subjectsRepo.getAll(),
      topicsRepo.getAll(),
      itemsRepo.getAll(),
    ]);
    set({ semesters, subjects, topics, items });
  },

  seedDemoData: async () => {
    set({ isLoading: true });
    // Seed 500 benchmark items to test 60fps virtualization acceptance criteria
    const currentSubjects = get().subjects;
    if (currentSubjects.length === 0) return;

    const sampleSubjects = currentSubjects.map(s => s.id);
    const kinds: ItemKind[] = ['pdf', 'note', 'link'];
    const titles = [
      'Distributed Consensus & Paxos Deep Dive',
      'Virtual Memory Management & Page Tables',
      'B-Tree Indexing and Write-Ahead Logging',
      'TCP Congestion Control - BBR vs Cubic',
      'Compiler Optimization: SSA Form and DCE',
      'Graph Neural Networks: Message Passing',
      'Cryptographic Hash Functions and Signatures',
      'Async Runtime Architecture: Event Loops & Epoll',
      'Cache Coherence Protocols: MESI and MOESI',
      'Dynamic Programming: Knapsack Variations'
    ];

    const benchmarkItems: Item[] = [];
    const now = Date.now();

    for (let i = 1; i <= 500; i++) {
      const subjectId = sampleSubjects[i % sampleSubjects.length];
      const kind = kinds[i % kinds.length];
      const title = `${titles[i % titles.length]} #${i}`;
      
      benchmarkItems.push({
        id: `bench_${i}_${now}`,
        kind,
        title,
        subjectId,
        starred: i % 7 === 0,
        createdAt: now - (i * 3600000),
        updatedAt: now - (i * 3600000),
        pageCount: kind === 'pdf' ? (10 + (i % 80)) : undefined,
        body: kind === 'note' ? `Benchmark note content for item ${i}. Detailed technical explanation with equations and analysis.` : undefined,
        url: kind === 'link' ? `https://cs.stanford.edu/study/${i}` : undefined,
        linkNote: kind === 'link' ? `Reference for semester exam preparation topic #${i}` : undefined,
      });
    }

    await db.items.bulkAdd(benchmarkItems);
    const items = await itemsRepo.getAll();
    set({ items, isLoading: false });
  }
}));
