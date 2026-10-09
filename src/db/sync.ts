import { db } from './index';
import { supabase } from '../lib/supabase';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
}

export async function syncVaultWithSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const now = Date.now();

    // 1. Sync Semesters
    const localSemesters = await db.semesters.toArray();
    for (const sem of localSemesters) {
      await supabase.from('semesters').upsert({
        id: sem.id,
        user_id: userId,
        name: sem.name,
        created_at: sem.createdAt || now,
        updated_at: now,
      });
    }

    // 2. Sync Subjects
    const localSubjects = await db.subjects.toArray();
    for (const subj of localSubjects) {
      await supabase.from('subjects').upsert({
        id: subj.id,
        user_id: userId,
        semester_id: subj.semesterId,
        name: subj.name,
        color: subj.color,
        icon: subj.icon,
        created_at: now,
        updated_at: now,
      });
    }

    // 3. Sync Topics
    const localTopics = await db.topics.toArray();
    for (const top of localTopics) {
      await supabase.from('topics').upsert({
        id: top.id,
        user_id: userId,
        subject_id: top.subjectId,
        name: top.name,
        mastery: top.mastery || 0,
        created_at: now,
        updated_at: now,
      });
    }

    // 4. Sync Items (Documents, Notes, Links)
    const localItems = await db.documents.toArray();
    for (const item of localItems) {
      await supabase.from('items').upsert({
        id: item.id,
        user_id: userId,
        subject_id: item.subjectId,
        topic_id: item.topicId || null,
        kind: item.kind,
        title: item.title,
        body: item.body || null,
        url: item.url || null,
        link_note: item.linkNote || null,
        file_path: item.filePath || null,
        file_hash: item.fileHash || null,
        page_count: item.pageCount || null,
        text_length: item.textLength || null,
        thumbnail: item.thumbnail || null,
        starred: item.starred || false,
        created_at: item.createdAt || now,
        updated_at: item.updatedAt || now,
      });
    }

    // 5. Sync Flashcards
    const localCards = await db.flashcards.toArray();
    for (const card of localCards) {
      await supabase.from('flashcards').upsert({
        id: card.id,
        user_id: userId,
        item_id: card.itemId,
        topic_id: card.topicId || null,
        q: card.q,
        a: card.a,
        explanation: card.explanation || null,
        box: card.box || 0,
        due_at: card.dueAt || now,
        created_at: now,
      });
    }

    localStorage.setItem('monofolio_last_synced', Date.now().toString());
    return { success: true };
  } catch (err: any) {
    console.error('Supabase cloud sync error:', err);
    return { success: false, error: err?.message || 'Sync failed' };
  }
}
