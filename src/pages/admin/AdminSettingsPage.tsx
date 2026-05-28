import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CheckCircle2, Save } from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

type SiteSettingsStatus = 'draft' | 'published' | 'archived';

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
        </AdminShell>
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
