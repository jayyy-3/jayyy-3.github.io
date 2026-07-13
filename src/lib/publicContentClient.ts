import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';

let publicContentClient: SupabaseClient | null | undefined;
let publicContentClientPromise: Promise<SupabaseClient | null> | null = null;

export async function getPublicContentClient(): Promise<SupabaseClient | null> {
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

  if (!publicContentClientPromise) {
    publicContentClientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => {
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
      })
      .catch(() => {
        publicContentClientPromise = null;
        return null;
      });
  }

  return publicContentClientPromise;
}
