import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_SUPABASE_URL } from '../../src/lib/supabaseProject.ts';

// Shared Pages Functions runtime: configuration, JSON responses and identity transport only.
// Callers own their roles, error codes, messages and response headers.

/**
 * @param {Record<string, unknown>} env
 * @returns {{ url: string, serviceKey: string | undefined }}
 */
export function readServiceConfig(env) {
  const url = typeof env.SUPABASE_URL === 'string' && env.SUPABASE_URL ? env.SUPABASE_URL : PRODUCTION_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  return {
    url: url.replace(/\/$/, ''),
    serviceKey: typeof serviceKey === 'string' && serviceKey ? serviceKey : undefined,
  };
}

/** @param {{ url: string, serviceKey: string }} config */
export function createServiceClient(config) {
  return createClient(config.url, config.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

/**
 * The one JSON response builder. 204 responses carry no body; each module passes its own
 * header set (CORS, cache and content-type policy stay per endpoint).
 * @param {unknown} body
 * @param {{ status?: number, headers?: Record<string, string> }} [init]
 */
export function jsonResponse(body, init = {}) {
  const status = init.status || 200;
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
  });
}

/**
 * Binds jsonResponse to one endpoint's header policy.
 * @param {Record<string, string>} headers
 * @returns {(body: unknown, init?: { status?: number, headers?: Record<string, string> }) => Response}
 */
export function createJsonResponder(headers) {
  return (body, init = {}) => jsonResponse(body, { status: init.status, headers: { ...headers, ...(init.headers || {}) } });
}

/** @param {string} methods */
export function corsHeaders(methods) {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': methods,
    'access-control-allow-headers': 'authorization, content-type',
  };
}

/** @param {Request} request */
export function readBearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '');
  return match?.[1] ? match[1].trim() : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} accessToken
 */
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
