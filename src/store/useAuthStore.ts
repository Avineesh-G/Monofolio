import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

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
      // 1. Fetch current session
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user || null, loading: false, initialized: true });

      // 2. Listen to active auth state changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ session: newSession, user: newSession?.user || null, loading: false });
      });

      // 3. Register native deep-link listener for Android APK OAuth returns
      if (Capacitor.isNativePlatform()) {
        CapApp.addListener('appUrlOpen', async (data) => {
          const url = data.url;
          if (url && (url.includes('access_token=') || url.includes('refresh_token=') || url.includes('code='))) {
            try {
              // Close the in-app browser tab immediately upon return
              await Browser.close().catch(() => {});

              // Handle token hash fragments (OAuth flow)
              if (url.includes('#')) {
                const fragment = url.split('#')[1];
                const params = new URLSearchParams(fragment);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');

                if (access_token && refresh_token) {
                  const { data: authData, error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                  });
                  if (!error && authData?.session) {
                    set({ session: authData.session, user: authData.session.user, loading: false });
                  }
                }
              }
            } catch (deepErr) {
              console.warn('[DeepLink Auth Error]:', deepErr);
            }
          }
        });
      }
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
      const isNative = Capacitor.isNativePlatform();
      const redirectUrl = isNative
        ? 'com.monofolio.app://auth-callback'
        : (typeof window !== 'undefined' ? window.location.origin : undefined);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: isNative, // For native APK, open in custom tab
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      // If running inside Android APK, open in native Chrome Custom Tab (seamlessly returns to app)
      if (isNative && data?.url) {
        await Browser.open({
          url: data.url,
          windowName: '_self',
          presentationStyle: 'popover',
        });
      }

      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
