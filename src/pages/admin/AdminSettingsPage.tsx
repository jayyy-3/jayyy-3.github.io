import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CheckCircle2, Pencil, Save, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

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
    footerColumnsJson: string;
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
    footerColumnsJson: '[]',
};

const emptyProfileForm: AdminProfileFormState = {
    userId: '',
    email: '',
    displayName: '',
    role: 'editor',
    isActive: true,
};

const adminProfileSelect = 'user_id,email,display_name,role,is_active,created_at,updated_at';

const roleRank: Record<AdminRole, number> = {
    owner: 0,
    admin: 1,
    editor: 2,
    viewer: 3,
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
            return 'No default settings row was returned. Owner/admin can create it from this screen.';
        }

        return `Default settings row ${row.id}; last updated ${new Date(row.updated_at).toLocaleString()}.`;
    }, [row]);

    function updateField<Key extends keyof SettingsFormState>(key: Key, value: SettingsFormState[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
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
        <AdminShell title="Site Settings" eyebrow={canEdit ? 'Owner/Admin' : 'Read only'}>
            <div className="space-y-6">
                <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <section className="space-y-5">
                    <div className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Default site identity
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">Global contact and SEO</h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">{statusNote}</p>
                            </div>
                            <span className="inline-flex h-8 items-center rounded border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black">
                                {form.status}
                            </span>
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
                            SEO defaults
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
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Footer columns JSON
                        </p>
                        <p className="mt-2 text-sm leading-6 text-black/58">
                            Structured footer data stays editable while preserving the current field contract.
                        </p>
                        <textarea
                            value={form.footerColumnsJson}
                            onChange={(event) => updateField('footerColumnsJson', event.target.value)}
                            disabled={!canEdit || isSaving || isLoading}
                            rows={10}
                            spellCheck={false}
                            className={`${fieldClass} mt-5 font-mono text-xs leading-6`}
                        />
                    </div>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <CheckCircle2 className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Settings are RLS protected</h2>
                        <p className="mt-3 text-sm leading-6 text-white/68">
                            Viewer/editor roles can inspect this row. Owner/admin roles are required for save,
                            publish, and archive actions.
                        </p>
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
                            Current role is read-only for Settings. Ask an owner/admin to make global site
                            identity changes.
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
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

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

        setNotice(withAuditNotice(editingUserId ? 'Admin profile updated.' : 'Admin profile added.', auditError));
        setEditingUserId(null);
        setForm(emptyProfileForm);
        await loadProfiles();
    }

    const activeOwnerCount = profiles.filter((profile) => profile.role === 'owner' && profile.is_active).length;

    return (
        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="border border-black/10 bg-white p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Admin team
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">Profiles and access</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/58">
                            Manage existing Supabase Auth users by mapping their user ID to an Urblo role. First
                            admin bootstrap still happens outside this screen.
                        </p>
                    </div>
                    <span className="inline-flex h-8 items-center rounded border border-black/10 bg-black/[0.04] px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black/58">
                        {profiles.length} profiles
                    </span>
                </div>

                {!canManage ? (
                    <div className="mt-6 border border-black/10 bg-black/[0.03] p-4 text-sm leading-6 text-black/62">
                        Admin profile management is restricted to owner/admin roles.
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
                        No admin profile rows were returned for this account.
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
                                                {adminProfile.role}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-black/52">
                                            {adminProfile.display_name || 'No display name'} · User ID{' '}
                                            {adminProfile.user_id}
                                        </p>
                                    </div>
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
                            );
                        })}
                    </div>
                ) : null}
            </div>

            <aside className="space-y-5">
                <section className="border border-black/10 bg-black p-5 text-white">
                    <Users className="h-5 w-5 text-[var(--urblo-lime)]" />
                    <h2 className="mt-5 text-xl font-semibold">Owner protection is enforced</h2>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                        Admins can maintain non-owner roles. Owner role assignment and owner-profile changes are
                        reserved for owners, with no destructive delete controls in this screen.
                    </p>
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

                <form onSubmit={(event) => void handleProfileSubmit(event)} className="border border-black/10 bg-white p-5">
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-black/65" />
                        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                            {editingUserId ? 'Edit profile' : 'Add profile'}
                        </h3>
                    </div>

                    <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        Auth user ID
                        <input
                            value={form.userId}
                            onChange={(event) => updateProfileField('userId', event.target.value)}
                            disabled={!canManage || isSaving || Boolean(editingUserId)}
                            placeholder="00000000-0000-0000-0000-000000000000"
                            className={fieldClass}
                        />
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
                                    {role}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) => updateProfileField('isActive', event.target.checked)}
                            disabled={!canManage || isSaving}
                            className="h-4 w-4 accent-[var(--urblo-lime)]"
                        />
                        Active profile
                    </label>

                    <div className="mt-5 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={!canManage || isSaving}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/30"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            {isSaving ? 'Saving' : editingUserId ? 'Save profile' : 'Add profile'}
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
                        Active owner profiles: {activeOwnerCount}. Existing Auth users must be created before a
                        profile row can be added here.
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
        footerColumnsJson: JSON.stringify(row.footer_columns ?? [], null, 2),
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

function validateSettings(form: SettingsFormState): { error: string | null; footerColumns: unknown[] } {
    if (!form.companyName.trim()) {
        return { error: 'Company name is required.', footerColumns: [] };
    }

    try {
        const parsed = JSON.parse(form.footerColumnsJson) as unknown;

        if (!Array.isArray(parsed)) {
            return { error: 'Footer columns JSON must be an array.', footerColumns: [] };
        }

        return { error: null, footerColumns: parsed };
    } catch {
        return { error: 'Footer columns JSON is not valid.', footerColumns: [] };
    }
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
        return 'A valid Supabase Auth user ID is required.';
    }

    if (!isEmail(email)) {
        return 'A valid email address is required.';
    }

    if (!editingUserId && existingProfiles.some((profile) => profile.user_id === userId)) {
        return 'This Supabase Auth user ID already has an admin profile.';
    }

    const duplicateEmailProfile = existingProfiles.find(
        (profile) =>
            profile.user_id !== editingUserId && profile.email.trim().toLowerCase() === email.toLowerCase(),
    );
    if (duplicateEmailProfile) {
        return 'Admin profile email is already assigned to another user.';
    }

    if (currentRole !== 'owner') {
        if (form.role === 'owner') {
            return 'Only an owner can assign the owner role.';
        }

        if (editingProfile?.role === 'owner') {
            return 'Only an owner can change an owner profile.';
        }
    }

    if (editingUserId === currentUserId && (!form.isActive || (form.role !== 'owner' && form.role !== 'admin'))) {
        return 'Do not remove your own active admin access from this screen.';
    }

    const activeOwnerCount = existingProfiles.filter((profile) => profile.role === 'owner' && profile.is_active).length;
    const editingLastActiveOwner =
        editingProfile?.role === 'owner' && editingProfile.is_active && activeOwnerCount <= 1;

    if (editingLastActiveOwner && (!form.isActive || form.role !== 'owner')) {
        return 'At least one active owner profile must remain.';
    }

    return null;
}

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
