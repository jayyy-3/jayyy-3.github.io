import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.ts';
import { PRODUCTION_SUPABASE_URL } from './supabaseProject.ts';

export type PublicContentClient = SupabaseClient<Database>;

let publicContentClient: PublicContentClient | null | undefined;
let publicContentClientPromise: Promise<PublicContentClient | null> | null = null;

export function isPublicContentConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export async function getPublicContentClient(): Promise<PublicContentClient | null> {
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
        publicContentClient = createClient<Database>(
          import.meta.env.VITE_SUPABASE_URL || PRODUCTION_SUPABASE_URL,
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
