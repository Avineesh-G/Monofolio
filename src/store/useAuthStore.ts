import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user || null, loading: false, initialized: true });

      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ session: newSession, user: newSession?.user || null, loading: false });
      });
    } catch (e) {
      console.warn('Supabase auth init warning:', e);
      set({ loading: false, initialized: true });
    }
  },

  signInWithEmail: async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e };
    }
  },

  signUpWithEmail: async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e };
    }
  },

  signInWithGoogle: async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
