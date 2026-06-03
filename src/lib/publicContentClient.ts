import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';

let publicContentClient: SupabaseClient | null | undefined;

export function getPublicContentClient(): SupabaseClient | null {
  if (publicContentClient !== undefined) {
    return publicContentClient;
  }

  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!key) {
    publicContentClient = null;
    return publicContentClient;
  }

  publicContentClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return publicContentClient;
}
