import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CheckCircle2, KeyRound, Pencil, Plus, Save, ShieldCheck, UserPlus, Users, X } from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { CmsLiveRuleCard, CmsStatusMeaning, CmsStatusPill } from './AdminCmsPrimitives';

type SiteSettingsStatus = 'draft' | 'published' | 'archived';
type AdminRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface SiteSettingsRow {
    id: number;
    settings_key: string;
    status: SiteSettingsStatus;
    company_name: string;
    primary_email: string | null;
    primary_phone: string | null;
    social_links: Record<string, unknown>;
    footer_columns: unknown[];
    seo: Record<string, unknown>;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
}

interface SettingsFormState {
    status: SiteSettingsStatus;
    companyName: string;
    primaryEmail: string;
    primaryPhone: string;
    instagram: string;
    linkedin: string;
    seoTitle: string;
    seoDescription: string;
    defaultShareImage: string;
    footerColumns: FooterColumnForm[];
}

type FooterDestinationKind = 'text' | 'internal' | 'external';

interface FooterItemForm {
    label: string;
    destinationKind: FooterDestinationKind;
    destination: string;
}

interface FooterColumnForm {
    title: string;
    items: FooterItemForm[];
}

interface AdminProfileRow {
    user_id: string;
    email: string;
    display_name: string | null;
    role: AdminRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface AdminProfileFormState {
    userId: string;
    email: string;
    displayName: string;
    role: AdminRole;
    isActive: boolean;
}

interface AdminInviteFormState {
    email: string;
    displayName: string;
    role: AdminRole;
}

const emptyForm: SettingsFormState = {
    status: 'published',
    companyName: 'Urblo',
    primaryEmail: '',
    primaryPhone: '',
    instagram: '',
    linkedin: '',
    seoTitle: '',
    seoDescription: '',
    defaultShareImage: '',
    footerColumns: [
        {
            title: 'Contact',
            items: [{ label: 'Email', destinationKind: 'text', destination: 'info@urblo.com.au' }],
        },
    ],
};

const emptyProfileForm: AdminProfileFormState = {
    userId: '',
    email: '',
    displayName: '',
    role: 'editor',
    isActive: true,
};

const emptyInviteForm: AdminInviteFormState = {
    email: '',
    displayName: '',
    role: 'editor',
};

const adminProfileSelect = 'user_id,email,display_name,role,is_active,created_at,updated_at';

const roleRank: Record<AdminRole, number> = {
    owner: 0,
    admin: 1,
    editor: 2,
    viewer: 3,
};

const roleLabels: Record<AdminRole, string> = {
    owner: 'Website owner',
    admin: 'CMS manager',
    editor: 'Editor',
    viewer: 'Viewer',
};

const roleDescriptions: Record<AdminRole, string> = {
    owner: 'Full CMS control, including website settings and team access.',
    admin: 'Can manage settings, team access, content, media, and leads.',
    editor: 'Can edit content and media, but cannot manage settings or leads export.',
    viewer: 'Can inspect CMS content without saving changes.',
};

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export default function AdminSettingsPage() {
    return (
        <RequireAdmin>
            <AdminSettingsContent />
        </RequireAdmin>
    );
}

function AdminSettingsContent() {
    const { profile, user } = useAdminAuth();
    const canEdit = profile?.role === 'owner' || profile?.role === 'admin';
    const [row, setRow] = useState<SiteSettingsRow | null>(null);
    const [form, setForm] = useState<SettingsFormState>(emptyForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        if (!supabase) {
            return;
        }

        const client: SupabaseClient = supabase;
        setIsLoading(true);
        setError(null);
        setNotice(null);

        const { data, error: loadError } = await client
            .from('site_settings')
            .select(
                'id,settings_key,status,company_name,primary_email,primary_phone,social_links,footer_columns,seo,published_at,archived_at,updated_at',
            )
            .eq('settings_key', 'default')
            .maybeSingle<SiteSettingsRow>();

        if (loadError) {
            setError(loadError.message);
            setIsLoading(false);
            return;
        }

        setRow(data ?? null);
        setForm(rowToForm(data));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

    const statusNote = useMemo(() => {
        if (!row) {
            return 'Site settings have not been created yet. A CMS manager can save this screen to create the first public settings draft.';
        }

        return `Site settings loaded. Last saved ${new Date(row.updated_at).toLocaleString()}.`;
    }, [row]);

    function updateField<Key extends keyof SettingsFormState>(key: Key, value: SettingsFormState[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateFooterColumn(index: number, nextColumn: FooterColumnForm) {
        setForm((current) => ({
            ...current,
            footerColumns: current.footerColumns.map((column, columnIndex) =>
                columnIndex === index ? nextColumn : column,
            ),
        }));
        setNotice(null);
    }

    function addFooterColumn() {
        setForm((current) => ({
            ...current,
            footerColumns: [...current.footerColumns, { title: 'New column', items: [] }],
        }));
        setNotice(null);
    }

    function hideFooterColumn(index: number) {
        setForm((current) => ({
            ...current,
            footerColumns: current.footerColumns.filter((_, columnIndex) => columnIndex !== index),
        }));
        setNotice(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!supabase || !canEdit || !user) {
            return;
        }

        const validation = validateSettings(form);
        if (validation.error) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            settings_key: 'default',
            status: form.status,
            company_name: form.companyName.trim(),
            primary_email: form.primaryEmail.trim() || null,
            primary_phone: form.primaryPhone.trim() || null,
            social_links: {
                instagram: form.instagram.trim() || undefined,
                linkedin: form.linkedin.trim() || undefined,
            },
            footer_columns: validation.footerColumns,
            seo: {
                title: form.seoTitle.trim() || undefined,
                description: form.seoDescription.trim() || undefined,
                defaultShareImage: form.defaultShareImage.trim() || undefined,
            },
            published_at: form.status === 'published' ? (row?.published_at ?? now) : row?.published_at,
            archived_at: form.status === 'archived' ? now : null,
        };

        setIsSaving(true);
        setError(null);
        setNotice(null);

        const response = row
            ? await supabase
                  .from('site_settings')
                  .update(payload)
                  .eq('id', row.id)
                  .select(
                      'id,settings_key,status,company_name,primary_email,primary_phone,social_links,footer_columns,seo,published_at,archived_at,updated_at',
                  )
                  .single<SiteSettingsRow>()
            : await supabase
                  .from('site_settings')
                  .insert(payload)
                  .select(
                      'id,settings_key,status,company_name,primary_email,primary_phone,social_links,footer_columns,seo,published_at,archived_at,updated_at',
                  )
                  .single<SiteSettingsRow>();

        setIsSaving(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        setRow(response.data);
        setForm(rowToForm(response.data));
        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: row ? 'site_settings.update' : 'site_settings.create',
            entityType: 'site_settings',
            entityId: response.data.id,
            metadata: {
                settingsKey: response.data.settings_key,
                status: response.data.status,
            },
        });
        setNotice(withAuditNotice('Site settings saved.', auditError));
    }

    return (
        <AdminShell title="Site Settings" eyebrow={canEdit ? 'Website settings' : 'Read only'}>
            <div className="space-y-6">
                <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <section className="space-y-5">
                    <div className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Default site identity
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">Global contact and search defaults</h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">{statusNote}</p>
                            </div>
                            <CmsStatusPill status={form.status} />
                        </div>

                        <div className="mt-5">
                            <CmsLiveRuleCard>
                                <CmsStatusMeaning compact />
                            </CmsLiveRuleCard>
                        </div>

                        {isLoading ? (
                            <div className="mt-7 grid gap-4 md:grid-cols-2">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-16 animate-pulse rounded border border-black/10 bg-black/[0.04]"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-7 grid gap-4 md:grid-cols-2">
                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Company name
                                    <input
                                        value={form.companyName}
                                        onChange={(event) => updateField('companyName', event.target.value)}
                                        disabled={!canEdit || isSaving}
                                        required
                                        className={fieldClass}
                                    />
                                </label>

                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Status
                                    <select
                                        value={form.status}
                                        onChange={(event) =>
                                            updateField('status', event.target.value as SiteSettingsStatus)
                                        }
                                        disabled={!canEdit || isSaving}
                                        className={fieldClass}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </label>

                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Primary email
                                    <input
                                        type="email"
                                        value={form.primaryEmail}
                                        onChange={(event) => updateField('primaryEmail', event.target.value)}
                                        disabled={!canEdit || isSaving}
                                        className={fieldClass}
                                    />
                                </label>

                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Primary phone
                                    <input
                                        value={form.primaryPhone}
                                        onChange={(event) => updateField('primaryPhone', event.target.value)}
                                        disabled={!canEdit || isSaving}
                                        className={fieldClass}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="border border-black/10 bg-white p-5 md:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Social links
                        </p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Instagram
                                <input
                                    value={form.instagram}
                                    onChange={(event) => updateField('instagram', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                LinkedIn
                                <input
                                    value={form.linkedin}
                                    onChange={(event) => updateField('linkedin', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="border border-black/10 bg-white p-5 md:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Search defaults
                        </p>
                        <div className="mt-5 grid gap-4">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Default title
                                <input
                                    value={form.seoTitle}
                                    onChange={(event) => updateField('seoTitle', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Default description
                                <textarea
                                    value={form.seoDescription}
                                    onChange={(event) => updateField('seoDescription', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    rows={3}
                                    className={`${fieldClass} py-3 leading-6`}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Default share image
                                <input
                                    value={form.defaultShareImage}
                                    onChange={(event) => updateField('defaultShareImage', event.target.value)}
                                    disabled={!canEdit || isSaving || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Footer content
                                </p>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Edit footer columns as labels and links. Internal pages start with `/`; external
                                    links should use `https://`.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addFooterColumn}
                                disabled={!canEdit || isSaving || isLoading}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Plus className="h-4 w-4" />
                                Add column
                            </button>
                        </div>
                        <FooterColumnsEditor
                            columns={form.footerColumns}
                            disabled={!canEdit || isSaving || isLoading}
                            onChange={updateFooterColumn}
                            onHideColumn={hideFooterColumn}
                        />
                    </div>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <CheckCircle2 className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">CMS manager only</h2>
                        <p className="mt-3 text-sm leading-6 text-white/68">
                            Viewers and editors can inspect this screen. CMS managers and website owners are required
                            for site settings, team access, publishing, and archive actions.
                        </p>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldCheck className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">What this changes</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Company, email, phone, social links, footer content, and search defaults are site-wide.</li>
                            <li>Published settings are the public-ready website settings.</li>
                            <li>CMS team changes affect who can edit the CMS, not public website content.</li>
                            <li>A login account must exist before CMS access is granted here.</li>
                        </ul>
                    </section>

                    {error ? (
                        <section className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                            {error}
                        </section>
                    ) : null}

                    {notice ? (
                        <section className="border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] p-4 text-sm font-semibold leading-6 text-black">
                            {notice}
                        </section>
                    ) : null}

                    {!canEdit ? (
                        <section className="border border-black/10 bg-white p-5 text-sm leading-6 text-black/62">
                            Current role is read-only for Settings. Ask a CMS manager to make global site identity
                            changes.
                        </section>
                    ) : null}

                    <button
                        type="submit"
                        disabled={!canEdit || isLoading || isSaving}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/30"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving' : 'Save settings'}
                    </button>
                </aside>
                </form>

                <AdminProfilesManager
                    canManage={canEdit}
                    currentRole={profile?.role ?? null}
                    currentUserId={user?.id ?? null}
                />
            </div>
        </AdminShell>
    );
}

function AdminProfilesManager({
    canManage,
    currentRole,
    currentUserId,
}: {
    canManage: boolean;
    currentRole: AdminRole | null;
    currentUserId: string | null;
}) {
    const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
    const [form, setForm] = useState<AdminProfileFormState>(emptyProfileForm);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);
    const [inviteForm, setInviteForm] = useState<AdminInviteFormState>(emptyInviteForm);

    const loadProfiles = useCallback(async () => {
        if (!supabase || !canManage) {
            setProfiles([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        const { data, error: loadError } = await supabase
            .from('admin_profiles')
            .select(adminProfileSelect)
            .order('email', { ascending: true });

        setIsLoading(false);

        if (loadError) {
            setError(loadError.message);
            return;
        }

        const rows = ((data ?? []) as AdminProfileRow[]).sort((left, right) => {
            const roleDelta = roleRank[left.role] - roleRank[right.role];
            return roleDelta || left.email.localeCompare(right.email);
        });

        setProfiles(rows);
    }, [canManage]);

    useEffect(() => {
        void loadProfiles();
    }, [loadProfiles]);

    const roleOptions = useMemo<AdminRole[]>(
        () => (currentRole === 'owner' ? ['owner', 'admin', 'editor', 'viewer'] : ['admin', 'editor', 'viewer']),
        [currentRole],
    );

    function updateProfileField<Key extends keyof AdminProfileFormState>(
        key: Key,
        value: AdminProfileFormState[Key],
    ) {
        setForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateInviteField<Key extends keyof AdminInviteFormState>(
        key: Key,
        value: AdminInviteFormState[Key],
    ) {
        setInviteForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function startEdit(profile: AdminProfileRow) {
        setEditingUserId(profile.user_id);
        setForm(profileRowToForm(profile));
        setError(null);
        setNotice(null);
    }

    function resetProfileForm() {
        setEditingUserId(null);
        setForm(emptyProfileForm);
        setError(null);
        setNotice(null);
    }

    async function copyAccountId(userId: string) {
        try {
            await navigator.clipboard.writeText(userId);
            setCopiedAccountId(userId);
            setNotice('Login setup code copied. Paste it into Login setup code when granting CMS access.');
            setTimeout(() => setCopiedAccountId(null), 2400);
        } catch {
            setError('Could not copy the login setup code. Select the code text and copy it manually.');
        }
    }

    async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!supabase || !canManage || !currentUserId) {
            return;
        }

        const validation = validateAdminProfileForm(form, {
            currentRole,
            currentUserId,
            editingUserId,
            existingProfiles: profiles,
        });

        if (validation) {
            setError(validation);
            return;
        }

        const payload = {
            email: form.email.trim().toLowerCase(),
            display_name: form.displayName.trim() || null,
            role: form.role,
            is_active: form.isActive,
        };

        setIsSaving(true);
        setError(null);
        setNotice(null);

        const response = editingUserId
            ? await supabase
                  .from('admin_profiles')
                  .update(payload)
                  .eq('user_id', editingUserId)
                  .select(adminProfileSelect)
                  .single<AdminProfileRow>()
            : await supabase
                  .from('admin_profiles')
                  .insert({
                      user_id: form.userId.trim(),
                      ...payload,
                  })
                  .select(adminProfileSelect)
                  .single<AdminProfileRow>();

        setIsSaving(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const targetUserId = response.data.user_id;
        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: currentUserId,
            action: editingUserId ? 'admin_profile.update' : 'admin_profile.create',
            entityType: 'admin_profiles',
            metadata: {
                targetUserId,
                email: response.data.email,
                role: response.data.role,
                isActive: response.data.is_active,
            },
        });

        setNotice(withAuditNotice(editingUserId ? 'CMS access updated.' : 'CMS access granted.', auditError));
        setEditingUserId(null);
        setForm(emptyProfileForm);
        await loadProfiles();
    }

    async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!supabase || !canManage) {
            return;
        }

        const validation = validateAdminInviteForm(inviteForm, {
            currentRole,
            existingProfiles: profiles,
        });

        if (validation) {
            setError(validation);
            return;
        }

        setIsInviting(true);
        setError(null);
        setNotice(null);

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            setIsInviting(false);
            setError(sessionError?.message || 'Sign in again before inviting a CMS user.');
            return;
        }

        const response = await fetch('/api/admin/invite-user', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${session.access_token}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                email: inviteForm.email.trim(),
                displayName: inviteForm.displayName.trim(),
                role: inviteForm.role,
                redirectTo: `${window.location.origin}/admin/login`,
            }),
        });

        const result = (await response.json().catch(() => null)) as {
            profile?: AdminProfileRow;
            auditRecorded?: boolean;
            auditError?: string | null;
            message?: string;
        } | null;

        setIsInviting(false);

        if (!response.ok || !result?.profile) {
            setError(result?.message || 'The invite could not be sent. Ask a Website owner or CMS manager to review it.');
            return;
        }

        setInviteForm(emptyInviteForm);
        setNotice(
            withAuditNotice(
                `Invite sent to ${result.profile.email}. CMS access is ready when they accept the email and sign in.`,
                result.auditRecorded ? null : result.auditError || 'Change history was not recorded.',
            ),
        );
        await loadProfiles();
    }

    const activeOwnerCount = profiles.filter((profile) => profile.role === 'owner' && profile.is_active).length;

    return (
        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="border border-black/10 bg-white p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            CMS team
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">People and access</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/58">
                            Invite new CMS users, manage existing access, and keep each person on the lowest role they
                            need.
                        </p>
                    </div>
                    <span className="inline-flex h-8 items-center rounded border border-black/10 bg-black/[0.04] px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black/58">
                        {profiles.length} people
                    </span>
                </div>

                {!canManage ? (
                    <div className="mt-6 border border-black/10 bg-black/[0.03] p-4 text-sm leading-6 text-black/62">
                        CMS team access is restricted to CMS managers and website owners.
                    </div>
                ) : null}

                {isLoading ? (
                    <div className="mt-6 grid gap-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-16 animate-pulse rounded border border-black/10 bg-black/[0.04]" />
                        ))}
                    </div>
                ) : null}

                {canManage && !isLoading && profiles.length === 0 ? (
                    <div className="mt-6 border border-black/10 bg-black/[0.03] p-4 text-sm leading-6 text-black/62">
                        No CMS access records were returned for this account.
                    </div>
                ) : null}

                {canManage && !isLoading && profiles.length > 0 ? (
                    <div className="mt-6 divide-y divide-black/10 border border-black/10">
                        {profiles.map((adminProfile) => {
                            const canEditProfile = currentRole === 'owner' || adminProfile.role !== 'owner';
                            return (
                                <div
                                    key={adminProfile.user_id}
                                    className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-bold text-black">{adminProfile.email}</p>
                                            <StatusPill active={adminProfile.is_active} />
                                            <span className="rounded border border-black/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-black/55">
                                                {roleLabels[adminProfile.role]}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-black/52">
                                            {adminProfile.display_name || 'No display name'} · Setup code{' '}
                                            <span className="font-mono">{formatAccountSetupCode(adminProfile.user_id)}</span>
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-black/45">
                                            {roleDescriptions[adminProfile.role]}
                                        </p>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                                        <button
                                            type="button"
                                            onClick={() => void copyAccountId(adminProfile.user_id)}
                                            disabled={isSaving}
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                                            title="Copy the full login setup code for CMS access setup."
                                        >
                                            <KeyRound className="h-3.5 w-3.5" />
                                            {copiedAccountId === adminProfile.user_id ? 'Copied' : 'Copy setup code'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => startEdit(adminProfile)}
                                            disabled={!canEditProfile || isSaving}
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>

            <aside className="space-y-5">
                <section className="border border-black/10 bg-black p-5 text-white">
                    <Users className="h-5 w-5 text-[var(--urblo-lime)]" />
                    <h2 className="mt-5 text-xl font-semibold">Team access rules</h2>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                        Website owner access can only be changed by another website owner. CMS managers can maintain
                        non-owner access. Editors can edit content. Viewers can inspect the CMS without saving changes.
                    </p>
                </section>

                <section className="border border-black/10 bg-white p-5">
                    <KeyRound className="h-5 w-5 text-black" />
                    <h2 className="mt-5 text-xl font-semibold text-black">Access setup checklist</h2>
                    <ol className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                        <li>1. Use Invite and grant access for a new CMS user.</li>
                        <li>2. Choose the lowest role they need.</li>
                        <li>3. Ask them to accept the invite email and sign in at `/admin`.</li>
                        <li>4. Use Grant existing login only when the person already has a login account.</li>
                    </ol>
                    <p className="mt-4 text-xs leading-5 text-black/45">
                        Invite and grant access sends the login email from the secure server endpoint; the browser never
                        sees the private Supabase service key.
                    </p>
                </section>

                <section className="border border-black/10 bg-white p-5">
                    <ShieldCheck className="h-5 w-5 text-black" />
                    <h2 className="mt-5 text-xl font-semibold text-black">Role guide</h2>
                    <dl className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                        {(['owner', 'admin', 'editor', 'viewer'] as const).map((role) => (
                            <div key={role}>
                                <dt className="font-semibold text-black">{roleLabels[role]}</dt>
                                <dd>{roleDescriptions[role]}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {error ? (
                    <section className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                        {error}
                    </section>
                ) : null}

                {notice ? (
                    <section className="border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] p-4 text-sm font-semibold leading-6 text-black">
                        {notice}
                    </section>
                ) : null}

                <form onSubmit={(event) => void handleInviteSubmit(event)} className="border border-black/10 bg-white p-5">
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-black/65" />
                        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                            Invite and grant access
                        </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-black/58">
                        Send a login invite and create the person's CMS access in one step.
                    </p>

                    <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Email
                        <input
                            type="email"
                            value={inviteForm.email}
                            onChange={(event) => updateInviteField('email', event.target.value)}
                            disabled={!canManage || isInviting}
                            className={fieldClass}
                        />
                    </label>

                    <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Display name
                        <input
                            value={inviteForm.displayName}
                            onChange={(event) => updateInviteField('displayName', event.target.value)}
                            disabled={!canManage || isInviting}
                            className={fieldClass}
                        />
                    </label>

                    <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Role
                        <select
                            value={inviteForm.role}
                            onChange={(event) => updateInviteField('role', event.target.value as AdminRole)}
                            disabled={!canManage || isInviting}
                            className={fieldClass}
                        >
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                    {roleLabels[role]}
                                </option>
                            ))}
                        </select>
                        <span className="mt-2 block text-xs normal-case leading-5 tracking-normal text-black/48">
                            {roleDescriptions[inviteForm.role]}
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={!canManage || isInviting}
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/30"
                    >
                        <UserPlus className="h-4 w-4" />
                        {isInviting ? 'Sending invite' : 'Send invite'}
                    </button>
                </form>

                <form onSubmit={(event) => void handleProfileSubmit(event)} className="border border-black/10 bg-white p-5">
                    <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-black/65" />
                        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                            {editingUserId ? 'Edit CMS access' : 'Grant existing login'}
                        </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-black/58">
                        Use this backup path when a login account already exists and you have its setup code.
                    </p>

                    <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Login setup code
                        <input
                            value={form.userId}
                            onChange={(event) => updateProfileField('userId', event.target.value)}
                            disabled={!canManage || isSaving || Boolean(editingUserId)}
                            placeholder="00000000-0000-0000-0000-000000000000"
                            className={fieldClass}
                        />
                        <span className="mt-2 block text-xs normal-case leading-5 tracking-normal text-black/48">
                            Paste the code from the already-created login account. Email alone cannot grant CMS access.
                        </span>
                    </label>

                    <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Email
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) => updateProfileField('email', event.target.value)}
                            disabled={!canManage || isSaving}
                            className={fieldClass}
                        />
                    </label>

                    <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Display name
                        <input
                            value={form.displayName}
                            onChange={(event) => updateProfileField('displayName', event.target.value)}
                            disabled={!canManage || isSaving}
                            className={fieldClass}
                        />
                    </label>

                    <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Role
                        <select
                            value={form.role}
                            onChange={(event) => updateProfileField('role', event.target.value as AdminRole)}
                            disabled={!canManage || isSaving}
                            className={fieldClass}
                        >
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                    {roleLabels[role]}
                                </option>
                            ))}
                        </select>
                        <span className="mt-2 block text-xs normal-case leading-5 tracking-normal text-black/48">
                            {roleDescriptions[form.role]}
                        </span>
                    </label>

                    <label className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) => updateProfileField('isActive', event.target.checked)}
                            disabled={!canManage || isSaving}
                            className="h-4 w-4 accent-[var(--urblo-lime)]"
                        />
                        Active access
                    </label>

                    <div className="mt-5 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={!canManage || isSaving}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/30"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            {isSaving ? 'Saving' : editingUserId ? 'Save access' : 'Grant access'}
                        </button>
                        {editingUserId ? (
                            <button
                                type="button"
                                onClick={resetProfileForm}
                                disabled={isSaving}
                                className="inline-flex min-h-10 w-full items-center justify-center rounded border border-black/15 px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                Cancel edit
                            </button>
                        ) : null}
                    </div>

                    <p className="mt-4 text-xs leading-5 text-black/48">
                        Active website owners: {activeOwnerCount}. After saving, the person can sign in at `/admin`
                        with their existing login account.
                    </p>
                </form>
            </aside>
        </section>
    );
}

function rowToForm(row: SiteSettingsRow | null): SettingsFormState {
    if (!row) {
        return emptyForm;
    }

    return {
        status: row.status,
        companyName: row.company_name ?? 'Urblo',
        primaryEmail: row.primary_email ?? '',
        primaryPhone: row.primary_phone ?? '',
        instagram: stringFromRecord(row.social_links, 'instagram'),
        linkedin: stringFromRecord(row.social_links, 'linkedin'),
        seoTitle: stringFromRecord(row.seo, 'title'),
        seoDescription: stringFromRecord(row.seo, 'description'),
        defaultShareImage: stringFromRecord(row.seo, 'defaultShareImage'),
        footerColumns: normalizeFooterColumns(row.footer_columns ?? []),
    };
}

function stringFromRecord(record: Record<string, unknown> | null | undefined, key: string) {
    const value = record?.[key];
    return typeof value === 'string' ? value : '';
}

function profileRowToForm(row: AdminProfileRow): AdminProfileFormState {
    return {
        userId: row.user_id,
        email: row.email,
        displayName: row.display_name ?? '',
        role: row.role,
        isActive: row.is_active,
    };
}

function formatAccountSetupCode(userId: string) {
    return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}

function StatusPill({ active }: { active: boolean }) {
    return (
        <span
            className={
                active
                    ? 'rounded border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-black'
                    : 'rounded border border-black/10 bg-black/[0.04] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-black/45'
            }
        >
            {active ? 'active' : 'inactive'}
        </span>
    );
}

function FooterColumnsEditor({
    columns,
    disabled,
    onChange,
    onHideColumn,
}: {
    columns: FooterColumnForm[];
    disabled?: boolean;
    onChange: (index: number, column: FooterColumnForm) => void;
    onHideColumn: (index: number) => void;
}) {
    if (!columns.length) {
        return (
            <div className="mt-5 border border-black/10 bg-black/[0.03] p-4 text-sm leading-6 text-black/58">
                No footer columns are configured. Add a column to show footer contact or navigation links.
            </div>
        );
    }

    return (
        <div className="mt-5 space-y-4">
            {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="border border-black/10 bg-[#f8f9f5] p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Column title
                            <input
                                value={column.title}
                                onChange={(event) =>
                                    onChange(columnIndex, { ...column, title: event.target.value })
                                }
                                disabled={disabled}
                                className={fieldClass}
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => onHideColumn(columnIndex)}
                            disabled={disabled}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                        >
                            <X className="h-4 w-4" />
                            Hide column
                        </button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {column.items.map((item, itemIndex) => (
                            <FooterItemRow
                                key={itemIndex}
                                item={item}
                                disabled={disabled}
                                onChange={(nextItem) => {
                                    const nextItems = column.items.map((currentItem, currentIndex) =>
                                        currentIndex === itemIndex ? nextItem : currentItem,
                                    );
                                    onChange(columnIndex, { ...column, items: nextItems });
                                }}
                                onHide={() => {
                                    onChange(columnIndex, {
                                        ...column,
                                        items: column.items.filter((_, currentIndex) => currentIndex !== itemIndex),
                                    });
                                }}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            onChange(columnIndex, {
                                ...column,
                                items: [
                                    ...column.items,
                                    { label: 'New item', destinationKind: 'internal', destination: '/' },
                                ],
                            })
                        }
                        disabled={disabled}
                        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                    >
                        <Plus className="h-4 w-4" />
                        Add item
                    </button>
                </div>
            ))}
        </div>
    );
}

function FooterItemRow({
    item,
    disabled,
    onChange,
    onHide,
}: {
    item: FooterItemForm;
    disabled?: boolean;
    onChange: (item: FooterItemForm) => void;
    onHide: () => void;
}) {
    return (
        <div className="grid gap-3 border border-black/10 bg-white p-3 md:grid-cols-[1fr_150px_1.2fr_auto] md:items-end">
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                Item label
                <input
                    value={item.label}
                    onChange={(event) => onChange({ ...item, label: event.target.value })}
                    disabled={disabled}
                    className={fieldClass}
                />
            </label>
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                Type
                <select
                    value={item.destinationKind}
                    onChange={(event) =>
                        onChange({
                            ...item,
                            destinationKind: event.target.value as FooterDestinationKind,
                        })
                    }
                    disabled={disabled}
                    className={fieldClass}
                >
                    <option value="text">Text</option>
                    <option value="internal">Internal page</option>
                    <option value="external">External link</option>
                </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                {item.destinationKind === 'text' ? 'Text value' : 'Destination'}
                <input
                    value={item.destination}
                    onChange={(event) => onChange({ ...item, destination: event.target.value })}
                    disabled={disabled}
                    placeholder={getFooterItemPlaceholder(item.destinationKind)}
                    className={fieldClass}
                />
            </label>
            <button
                type="button"
                onClick={onHide}
                disabled={disabled}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
            >
                <X className="h-4 w-4" />
                Hide item
            </button>
        </div>
    );
}

function validateSettings(form: SettingsFormState): { error: string | null; footerColumns: unknown[] } {
    if (!form.companyName.trim()) {
        return { error: 'Company name is required.', footerColumns: [] };
    }

    const footerColumns = serializeFooterColumns(form.footerColumns);
    if (footerColumns.error) {
        return { error: footerColumns.error, footerColumns: [] };
    }

    return { error: null, footerColumns: footerColumns.value };
}

function normalizeFooterColumns(columns: unknown[]): FooterColumnForm[] {
    return columns
        .map((column) => {
            if (!isRecord(column)) return null;
            const title = typeof column.title === 'string' ? column.title : '';
            const rawItems = Array.isArray(column.items) ? column.items : [];
            const items = rawItems
                .map((item) => {
                    if (!isRecord(item)) return null;
                    const label = typeof item.label === 'string' ? item.label : '';
                    if (typeof item.to === 'string') {
                        return { label, destinationKind: 'internal' as const, destination: item.to };
                    }
                    if (typeof item.href === 'string') {
                        return { label, destinationKind: 'external' as const, destination: item.href };
                    }
                    if (typeof item.value === 'string') {
                        return { label, destinationKind: 'text' as const, destination: item.value };
                    }
                    return { label, destinationKind: 'text' as const, destination: '' };
                })
                .filter((item): item is FooterItemForm => item !== null);

            return { title, items };
        })
        .filter((column): column is FooterColumnForm => column !== null);
}

function serializeFooterColumns(columns: FooterColumnForm[]): { error: string | null; value: unknown[] } {
    const serialized = [];

    for (const column of columns) {
        const title = column.title.trim();
        if (!title) {
            return { error: 'Every footer column needs a title.', value: [] };
        }

        const items = [];
        for (const item of column.items) {
            const label = item.label.trim();
            const destination = item.destination.trim();
            if (!label || !destination) {
                return { error: 'Every footer item needs a label and text or link destination.', value: [] };
            }

            if (item.destinationKind === 'internal') {
                if (!destination.startsWith('/')) {
                    return { error: 'Internal footer links must start with `/`.', value: [] };
                }
                items.push({ label, to: destination });
                continue;
            }

            if (item.destinationKind === 'external') {
                if (!/^https?:\/\//i.test(destination)) {
                    return { error: 'External footer links must start with `https://` or `http://`.', value: [] };
                }
                items.push({ label, href: destination });
                continue;
            }

            items.push({ label, value: destination });
        }

        serialized.push({ title, items });
    }

    return { error: null, value: serialized };
}

function getFooterItemPlaceholder(kind: FooterDestinationKind) {
    if (kind === 'internal') return '/projects';
    if (kind === 'external') return 'https://example.com';
    return 'Displayed text';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateAdminProfileForm(
    form: AdminProfileFormState,
    {
        currentRole,
        currentUserId,
        editingUserId,
        existingProfiles,
    }: {
        currentRole: AdminRole | null;
        currentUserId: string;
        editingUserId: string | null;
        existingProfiles: AdminProfileRow[];
    },
) {
    const userId = form.userId.trim();
    const email = form.email.trim();
    const editingProfile = editingUserId
        ? existingProfiles.find((profile) => profile.user_id === editingUserId)
        : null;

    if (!editingUserId && !isUuid(userId)) {
        return 'Paste a valid login account ID before granting CMS access.';
    }

    if (!isEmail(email)) {
        return 'A valid email address is required.';
    }

    if (!editingUserId && existingProfiles.some((profile) => profile.user_id === userId)) {
        return 'This login account already has CMS access.';
    }

    const duplicateEmailProfile = existingProfiles.find(
        (profile) =>
            profile.user_id !== editingUserId && profile.email.trim().toLowerCase() === email.toLowerCase(),
    );
    if (duplicateEmailProfile) {
        return 'This email is already assigned to another CMS user.';
    }

    if (currentRole !== 'owner') {
        if (form.role === 'owner') {
            return 'Only a website owner can assign the Website owner role.';
        }

        if (editingProfile?.role === 'owner') {
            return 'Only a website owner can change Website owner access.';
        }
    }

    if (editingUserId === currentUserId && (!form.isActive || (form.role !== 'owner' && form.role !== 'admin'))) {
        return 'Do not remove your own active CMS manager access from this screen.';
    }

    const activeOwnerCount = existingProfiles.filter((profile) => profile.role === 'owner' && profile.is_active).length;
    const editingLastActiveOwner =
        editingProfile?.role === 'owner' && editingProfile.is_active && activeOwnerCount <= 1;

    if (editingLastActiveOwner && (!form.isActive || form.role !== 'owner')) {
        return 'At least one active website owner must remain.';
    }

    return null;
}

function validateAdminInviteForm(
    form: AdminInviteFormState,
    {
        currentRole,
        existingProfiles,
    }: {
        currentRole: AdminRole | null;
        existingProfiles: AdminProfileRow[];
    },
) {
    const email = form.email.trim();

    if (!isEmail(email)) {
        return 'Enter a valid invite email address.';
    }

    if (existingProfiles.some((profile) => profile.email.trim().toLowerCase() === email.toLowerCase())) {
        return 'This email already has CMS access.';
    }

    if (form.role === 'owner' && currentRole !== 'owner') {
        return 'Only a website owner can invite another Website owner.';
    }

    return null;
}

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
