import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    return (import.meta as any).env?.[key] || '';
  } catch {
    return '';
  }
};

const envUrl = getEnv('VITE_SUPABASE_URL') || 'https://atcssnweitazowngwtnk.supabase.co';
const envAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || 'sb_publishable_u_mRM1e7bKtFJbToXRTm_w_yMwqALqJ';

const getStoredConfig = () => {
  if (typeof window === 'undefined') return { url: envUrl, key: envAnonKey };
  const customUrl = localStorage.getItem('monofolio_supabase_url') || envUrl;
  const customKey = localStorage.getItem('monofolio_supabase_key') || envAnonKey;
  return { url: customUrl, key: customKey };
};

const { url, key } = getStoredConfig();

export const isSupabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient = createClient(
  url,
  key,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
