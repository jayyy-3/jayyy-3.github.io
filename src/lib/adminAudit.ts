import type { SupabaseClient } from '@supabase/supabase-js';

interface AdminAuditInput {
    actorUserId: string;
    action: string;
    entityType: string;
    entityId?: number | null;
    metadata?: Record<string, unknown>;
}

export async function recordAdminAuditEvent(
    client: SupabaseClient,
    { actorUserId, action, entityType, entityId = null, metadata = {} }: AdminAuditInput,
) {
    const { error } = await client.from('admin_audit_events').insert({
        actor_user_id: actorUserId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
    });

    return error?.message ?? null;
}

export function withAuditNotice(message: string, auditError: string | null) {
    return auditError
        ? `${message} Change history was not recorded. Ask a Website owner or CMS manager to review this save: ${auditError}`
        : message;
}
