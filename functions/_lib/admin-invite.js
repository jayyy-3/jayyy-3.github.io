import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://npkidywzwddbnfrnxlmo.supabase.co';
const VALID_ROLES = ['owner', 'admin', 'editor', 'viewer'];

class AdminInviteError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function adminInviteOptionsResponse() {
  return jsonResponse({}, { status: 204 });
}

export function adminInviteMethodNotAllowedResponse() {
  return jsonResponse(
    { error: 'method_not_allowed', message: 'Use POST to invite a CMS user.' },
    { status: 405 },
  );
}

export async function handleAdminInviteUserRequest(request, env) {
  try {
    const config = getSupabaseConfig(env);
    const accessToken = getBearerToken(request);
    const input = await parseInviteInput(request);
    const supabase = createServiceClient(config);
    const actor = await requireManagingAdmin(supabase, accessToken, input.role);
    await assertNoExistingCmsAccess(supabase, input.email);
    const redirectTo = input.redirectTo || `${new URL(request.url).origin}/admin/login`;

    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      input.email,
      {
        data: input.displayName ? { display_name: input.displayName } : undefined,
        redirectTo,
      },
    );

    if (inviteError || !inviteData?.user?.id) {
      throw new AdminInviteError(
        502,
        'invite_failed',
        inviteError?.message || 'The invite email could not be sent.',
      );
    }

    const invitedUser = inviteData.user;
    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        user_id: invitedUser.id,
        email: input.email,
        display_name: input.displayName || null,
        role: input.role,
        is_active: true,
      })
      .select('user_id,email,display_name,role,is_active,created_at,updated_at')
      .single();

    if (profileError || !profile) {
      throw new AdminInviteError(
        409,
        'profile_create_failed',
        profileError?.message ||
          'The invite was sent, but CMS access could not be created. Check People and access before inviting again.',
      );
    }

    const { error: auditError } = await supabase.from('admin_audit_events').insert({
      actor_user_id: actor.user.id,
      action: 'admin_profile.invite',
      entity_type: 'admin_profiles',
      metadata: {
        targetUserId: profile.user_id,
        email: profile.email,
        role: profile.role,
        redirectTo,
        source: 'functions/api/admin/invite-user.js',
      },
    });

    return jsonResponse({
      profile,
      auditRecorded: !auditError,
      auditError: auditError?.message || null,
    });
  } catch (error) {
    if (error instanceof AdminInviteError) {
      return jsonResponse({ error: error.code, message: error.message }, { status: error.status });
    }

    return jsonResponse(
      {
        error: 'admin_invite_failed',
        message: 'The CMS invite could not be completed. Ask a Website owner or CMS manager to review it.',
      },
      { status: 500 },
    );
  }
}

function getSupabaseConfig(env) {
  const url = (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

  if (!serviceKey) {
    throw new AdminInviteError(
      500,
      'server_not_configured',
      'CMS invites are not configured yet. Add the server Supabase service key in Cloudflare Pages.',
    );
  }

  return { url, serviceKey };
}

function createServiceClient(config) {
  return createClient(config.url, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getBearerToken(request) {
  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);

  if (!match?.[1]) {
    throw new AdminInviteError(401, 'missing_session', 'Sign in before inviting a CMS user.');
  }

  return match[1].trim();
}

async function parseInviteInput(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw new AdminInviteError(400, 'invalid_json', 'Send a valid JSON invite request.');
  }

  const email = normalizeEmail(String(body?.email || ''));
  const displayName = String(body?.displayName || '').trim();
  const role = String(body?.role || 'editor').trim().toLowerCase();
  const redirectTo = String(body?.redirectTo || '').trim();

  if (!isEmail(email)) {
    throw new AdminInviteError(400, 'invalid_email', 'Enter a valid invite email address.');
  }

  if (!VALID_ROLES.includes(role)) {
    throw new AdminInviteError(400, 'invalid_role', 'Choose a valid CMS role.');
  }

  if (redirectTo && !/^https?:\/\//i.test(redirectTo)) {
    throw new AdminInviteError(400, 'invalid_redirect', 'Invite redirect URLs must start with http:// or https://.');
  }

  return { email, displayName, role, redirectTo };
}

async function requireManagingAdmin(supabase, accessToken, requestedRole) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    throw new AdminInviteError(401, 'invalid_session', 'Sign in again before inviting a CMS user.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('user_id,email,role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (profileError || !profile || !['owner', 'admin'].includes(profile.role)) {
    throw new AdminInviteError(403, 'not_allowed', 'Only Website owners and CMS managers can invite CMS users.');
  }

  if (requestedRole === 'owner' && profile.role !== 'owner') {
    throw new AdminInviteError(403, 'owner_required', 'Only a Website owner can invite another Website owner.');
  }

  return { user, profile };
}

async function assertNoExistingCmsAccess(supabase, email) {
  const { data: profiles, error } = await supabase
    .from('admin_profiles')
    .select('user_id,email,is_active');

  if (error) {
    throw new AdminInviteError(
      502,
      'profile_lookup_failed',
      'Existing CMS access could not be checked. Try again before sending an invite.',
    );
  }

  const existingProfile = (profiles || []).find(
    (profile) => normalizeEmail(profile.email || '') === email,
  );

  if (existingProfile) {
    throw new AdminInviteError(
      409,
      'existing_cms_access',
      'This email already has CMS access. Edit the existing person instead of sending another invite.',
    );
  }
}

function jsonResponse(body, init = {}) {
  return new Response(init.status === 204 ? null : JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type',
      ...(init.headers || {}),
    },
  });
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
