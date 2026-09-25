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
            `Your sign-in has expired. Open the admin in a new tab, sign in again, then come back here and save. ${keepYourChanges}`,
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
