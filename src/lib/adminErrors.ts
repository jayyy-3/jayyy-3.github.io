// Plain-English translation of the errors the older admin modules receive from Supabase
// (PostgREST, Postgres, Storage, Auth) and from the browser network layer. Colleagues see the
// translated sentence; the original text stays available behind a "Details" disclosure so the
// website team can still diagnose the problem. Mirrors the server-side mapping used by the
// Projects endpoint (functions/_lib/admin-projects.js) and adds network and session cases.

export type AdminErrorKind =
    | 'duplicate'
    | 'permission'
    | 'in_use'
    | 'invalid'
    | 'required'
    | 'session'
    | 'network'
    | 'server'
    | 'not_found'
    | 'too_large'
    | 'unknown';

export interface AdminErrorContext {
    /** What the editor was working on, e.g. "product", "article section", "media item". */
    entity?: string;
    /** What failed: saving (default), loading the screen, uploading a file or exporting. */
    action?: 'save' | 'load' | 'upload' | 'export';
}

export interface TranslatedAdminError {
    kind: AdminErrorKind;
    message: string;
    /** Original technical text for the Details disclosure; null when there is nothing to add. */
    detail: string | null;
}

interface ErrorFields {
    code: string;
    message: string;
    details: string;
    hint: string;
    status: number | null;
    name: string;
}

const keepYourChanges = 'Your changes are still on this page.';

function readFields(error: unknown): ErrorFields {
    if (typeof error === 'string') {
        return { code: '', message: error, details: '', hint: '', status: null, name: '' };
    }
    const outer = (error && typeof error === 'object' ? error : {}) as Record<string, unknown>;
    // Accept a whole Supabase response ({ error, status }) so the HTTP status is not lost:
    // PostgREST error objects themselves carry no status.
    const nested = outer.error && typeof outer.error === 'object' ? (outer.error as Record<string, unknown>) : null;
    const record = nested ? { status: outer.status, ...nested } : outer;
    const text = (value: unknown) => (typeof value === 'string' ? value : value == null ? '' : String(value));
    const rawStatus = record.status ?? record.statusCode;
    const status = typeof rawStatus === 'number' ? rawStatus : Number.parseInt(text(rawStatus), 10);
    return {
        code: text(record.code),
        message: text(record.message) || text(record.error_description) || text(record.error),
        details: text(record.details),
        hint: text(record.hint),
        status: Number.isFinite(status) ? status : null,
        name: text(record.name),
    };
}

export function describeRawAdminError(error: unknown): string | null {
    if (error == null) return null;
    const fields = readFields(error);
    const parts = [
        fields.message,
        fields.details && fields.details !== fields.message ? fields.details : '',
        fields.hint ? `Hint: ${fields.hint}` : '',
        fields.code ? `Code: ${fields.code}` : '',
        fields.status ? `HTTP ${fields.status}` : '',
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
}

function duplicateMessage(haystack: string, entity: string) {
    if (/slug/.test(haystack)) {
        return `That website URL key is already used by another ${entity}. Change the URL key and save again.`;
    }
    if (/model_key/.test(haystack)) {
        return 'That model website key is already used on this product. Change the model website key and save again.';
    }
    if (/material_category/.test(haystack)) {
        return 'This product already has a material default for that category. Select it in the list to edit it instead.';
    }
    if (/email/.test(haystack)) {
        return 'This email is already assigned to another CMS user.';
    }
    if (/object_path|resource already exists/.test(haystack)) {
        return 'A file with this name is already in the library. Rename the file and upload it again.';
    }
    return `This ${entity} would duplicate one that already exists, so it was not saved. Reload the page to see the latest version, then try again.`;
}

function looksLikeNetworkFailure(fields: ErrorFields) {
    const text = `${fields.name} ${fields.message}`.toLowerCase();
    return (
        /failed to fetch|fetch failed|networkerror|network request failed|load failed|err_internet_disconnected|err_network|the internet connection appears to be offline/.test(
            text,
        ) || (fields.name === 'TypeError' && /fetch/.test(text))
    );
}

function looksLikeExpiredSession(fields: ErrorFields) {
    const text = fields.message.toLowerCase();
    return (
        fields.code === 'PGRST301' ||
        fields.code === 'PGRST302' ||
        fields.code === 'bad_jwt' ||
        fields.code === 'session_not_found' ||
        fields.code === 'refresh_token_not_found' ||
        /jwt expired|jwt is expired|invalid jwt|token (?:has )?expired|auth session missing|refresh token not found|session (?:has )?expired|session_not_found/.test(
            text,
        ) ||
        (fields.status === 401 && fields.code !== '42501')
    );
}

export function translateAdminError(error: unknown, context: AdminErrorContext = {}): TranslatedAdminError {
    const entity = context.entity?.trim() || 'item';
    const action = context.action ?? 'save';
    const notDone =
        action === 'load'
            ? `The ${entity} could not be loaded`
            : action === 'upload'
              ? 'The file was not uploaded'
              : action === 'export'
                ? 'The export did not finish'
                : `This ${entity} was not saved`;
    const fields = readFields(error);
    const detail = describeRawAdminError(error);
    const haystack = `${fields.message} ${fields.details} ${fields.hint}`.toLowerCase();
    const result = (kind: AdminErrorKind, message: string): TranslatedAdminError => ({ kind, message, detail });

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return result('network', `You appear to be offline. Check your internet connection, then try again. ${keepYourChanges}`);
    }
    if (looksLikeNetworkFailure(fields)) {
        return result(
            'network',
            `Could not reach the website server. Check your internet connection, then try again. ${keepYourChanges}`,
        );
    }
    if (looksLikeExpiredSession(fields)) {
        return result(
            'session',
            `Your sign-in has expired. Sign in again to continue. ${keepYourChanges}`,
        );
    }
    if (
        fields.code === '42501' ||
        fields.status === 403 ||
        /row-level security|permission denied|not allowed|insufficient privilege|unauthorized/.test(haystack)
    ) {
        return result(
            'permission',
            'Your account is not allowed to make this change. Ask a Website owner or CMS manager to do it, or to change your role.',
        );
    }
    if (fields.code === '23505' || /duplicate key|already exists/.test(haystack) || fields.status === 409) {
        return result('duplicate', duplicateMessage(haystack, entity));
    }
    if (fields.code === '23503' || /foreign key/.test(haystack)) {
        return result(
            'in_use',
            `${notDone} because it is linked to something that was changed or is still in use elsewhere. Reload the page, check the linked image, stone or project, then try again.`,
        );
    }
    if (fields.code === '23502' || /null value in column/.test(haystack)) {
        return result('required', `A required field is empty. Fill in the missing information for this ${entity} and save again.`);
    }
    if (['23514', '22023', '22P02', '22001', '22007', '22008', 'PGRST204'].includes(fields.code) || /violates check constraint|invalid input/.test(haystack)) {
        return result(
            'invalid',
            `One of the values for this ${entity} is not in an accepted format. Check the fields you changed and save again.`,
        );
    }
    if (fields.code === 'PGRST116' || fields.status === 404 || fields.status === 406) {
        return result(
            'not_found',
            `This ${entity} was changed or removed by someone else. Reload the page to see the latest version. ${keepYourChanges}`,
        );
    }
    if (fields.status === 413 || /payload too large|exceeded the maximum allowed size|too large/.test(haystack)) {
        return result('too_large', 'This file is too large to upload. Use a smaller or compressed file and try again.');
    }
    if ((fields.status !== null && fields.status >= 500) || fields.code === '57014' || /timeout|timed out|service unavailable|bad gateway/.test(haystack)) {
        return result(
            'server',
            action === 'load'
                ? `The website server had a problem, so the ${entity} could not be loaded. Wait a minute and reload the page.`
                : `The website server had a problem and did not finish this change. Wait a minute and try again. ${keepYourChanges}`,
        );
    }
    return result(
        'unknown',
        `Something went wrong. ${notDone}. Try again, and if it keeps happening send the details below to the website team.`,
    );
}

export type AdminSignInErrorKind = 'credentials' | 'unconfirmed' | 'rate_limited' | 'config' | 'network' | 'server' | 'unknown';

export interface TranslatedAdminSignInError {
    kind: AdminSignInErrorKind;
    message: string;
    detail: string | null;
}

/**
 * Plain-English sign-in and password-reset errors for the login page and the in-place re-login
 * panel. Supabase Auth returns short English codes ("Invalid login credentials") that read as
 * system text; the original stays available for Details.
 */
export function translateAdminSignInError(error: unknown, mode: 'sign-in' | 'reset' = 'sign-in'): TranslatedAdminSignInError {
    const fields = readFields(error);
    const detail = describeRawAdminError(error);
    const text = `${fields.code} ${fields.message}`.toLowerCase();
    const result = (kind: AdminSignInErrorKind, message: string): TranslatedAdminSignInError => ({ kind, message, detail });

    if (/browser configuration is missing|vite_supabase/.test(text)) {
        return result('config', 'The admin login is not connected on this website yet. Ask the website team to finish the login setup.');
    }
    if ((typeof navigator !== 'undefined' && navigator.onLine === false) || looksLikeNetworkFailure(fields)) {
        return result('network', 'Could not reach the login server. Check your internet connection, then try again.');
    }
    if (fields.status === 429 || /rate limit|too many|over_request_rate_limit|over_email_send_rate_limit/.test(text)) {
        return result(
            'rate_limited',
            mode === 'reset'
                ? 'Too many password emails were requested. Wait a few minutes, then try again.'
                : 'Too many sign-in attempts. Wait a few minutes, then try again.',
        );
    }
    if (/invalid login credentials|invalid_credentials|invalid grant|invalid_grant/.test(text)) {
        return result('credentials', 'That email and password do not match an Urblo CMS login. Check both and try again, or use Forgot password.');
    }
    if (/email not confirmed|email_not_confirmed/.test(text)) {
        return result(
            'unconfirmed',
            'This login is not active yet. Open your invite email and set a password first, or ask a Website owner or CMS manager to send a new invite.',
        );
    }
    if ((fields.status !== null && fields.status >= 500) || /timeout|timed out|service unavailable|bad gateway/.test(text)) {
        return result('server', 'The login server had a problem. Wait a minute and try again.');
    }
    return result(
        'unknown',
        mode === 'reset'
            ? 'The password email could not be requested. Try again, and if it keeps happening send the details below to the website team.'
            : 'Sign-in did not work. Try again, and if it keeps happening send the details below to the website team.',
    );
}

// Must match withAuditNotice() in src/lib/adminAudit.ts, which appends the raw audit error to a
// success sentence. splitAuditNotice() turns that into a plain sentence plus Details text.
const auditNoticeMarker = ' Change history was not recorded. Ask a Website owner or CMS manager to review this save: ';

export interface SplitAuditNotice {
    message: string;
    /** Raw audit error for the Details disclosure; null when the history was recorded. */
    detail: string | null;
}

export function splitAuditNotice(text: string): SplitAuditNotice {
    const index = text.indexOf(auditNoticeMarker);
    if (index === -1) return { message: text, detail: null };
    const saved = text.slice(0, index);
    const raw = text.slice(index + auditNoticeMarker.length).trim();
    return {
        message: `${saved} The change is saved, but it was not added to Change history. Ask a Website owner or CMS manager to note it there.`,
        detail: raw || null,
    };
}
