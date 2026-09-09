import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';

// Configuration and identity transport only. Callers own roles, errors and responses.
export function readServiceConfig(env) {
  return {
    url: (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, ''),
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY,
  };
}

export function createServiceClient(config) {
  return createClient(config.url, config.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export function readBearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '');
  return match?.[1] ? match[1].trim() : null;
}

export async function readAdminIdentity(supabase, accessToken) {
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) return { user, userError, profile: null, profileError: null };
  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('user_id,role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  return { user, userError, profile, profileError };
}
