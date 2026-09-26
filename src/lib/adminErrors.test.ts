import { afterEach, describe, expect, it, vi } from 'vitest';
import { describeRawAdminError, translateAdminError, type AdminErrorKind } from './adminErrors';

// Raw text that must never reach a colleague as the main message.
const technicalFragments = [
    'violates',
    'constraint',
    'row-level',
    'JWT',
    'PGRST',
    'duplicate key',
    'foreign key',
    'Failed to fetch',
    'TypeError',
    'Synthetic',
    'LOCAL_FAULT',
    'relation',
    'syntax',
];

const cases: Array<{
    name: string;
    error: unknown;
    entity?: string;
    action?: 'save' | 'load' | 'upload' | 'export';
    kind: AdminErrorKind;
    message: RegExp;
}> = [
    {
        name: 'duplicate product URL key (Postgres 23505)',
        error: {
            code: '23505',
            message: 'duplicate key value violates unique constraint "products_slug_key"',
            details: 'Key (slug)=(stone-bench) already exists.',
            hint: null,
        },
        entity: 'product',
        kind: 'duplicate',
        message: /^That website URL key is already used by another product\./,
    },
    {
        name: 'duplicate article URL key inside a Supabase response',
        error: {
            error: { code: '23505', message: 'duplicate key value violates unique constraint "articles_slug_key"', details: '', hint: '' },
            status: 409,
        },
        entity: 'article',
        kind: 'duplicate',
        message: /another article/,
    },
    {
        name: 'duplicate row without a URL key (Postgres detail text says "already exists")',
        error: { code: '23505', message: 'duplicate key value violates unique constraint "enquiries_pkey"', details: 'Key (id)=(7) already exists.' },
        entity: 'lead',
        kind: 'duplicate',
        message: /^This lead would duplicate one that already exists, so it was not saved\. Reload the page/,
    },
    {
        name: 'duplicate model website key',
        error: { code: '23505', message: 'duplicate key value violates unique constraint "product_models_product_id_model_key_key"' },
        entity: 'model',
        kind: 'duplicate',
        message: /model website key is already used on this product/,
    },
    {
        name: 'duplicate file in Storage',
        error: { statusCode: '409', error: 'Duplicate', message: 'The resource already exists' },
        entity: 'file',
        action: 'upload',
        kind: 'duplicate',
        message: /file with this name is already in the library/,
    },
    {
        name: 'row-level security denial (42501)',
        error: { code: '42501', message: 'new row violates row-level security policy for table "products"', details: null, hint: null },
        entity: 'product',
        kind: 'permission',
        message: /^Your account is not allowed to make this change\. Ask a Website owner or CMS manager/,
    },
    {
        name: 'Storage row-level security denial without a Postgres code',
        error: { statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy' },
        entity: 'file',
        action: 'upload',
        kind: 'permission',
        message: /not allowed to make this change/,
    },
    {
        name: 'foreign key in use (23503)',
        error: {
            code: '23503',
            message: 'insert or update on table "products" violates foreign key constraint "products_hero_media_id_fkey"',
            details: 'Key (hero_media_id)=(99) is not present in table "media_assets".',
        },
        entity: 'product',
        kind: 'in_use',
        message: /^This product was not saved because it is linked to something/,
    },
    {
        name: 'expired sign-in (PostgREST JWT expired)',
        error: { code: 'PGRST301', message: 'JWT expired', details: null, hint: null },
        entity: 'article',
        kind: 'session',
        message: /^Your sign-in has expired\. Open the admin in a new tab, sign in again/,
    },
    {
        name: 'expired sign-in reported only by HTTP 401',
        error: { error: { code: '', message: 'Invalid JWT', details: '', hint: '' }, status: 401 },
        kind: 'session',
        message: /sign-in has expired/,
    },
    {
        name: 'network failure in Chrome (TypeError: Failed to fetch)',
        error: new TypeError('Failed to fetch'),
        kind: 'network',
        message: /^Could not reach the website server\. Check your internet connection/,
    },
    {
        name: 'network failure relayed by supabase-js',
        error: { code: '', message: 'TypeError: Failed to fetch', details: 'TypeError: Failed to fetch', hint: '' },
        kind: 'network',
        message: /Could not reach the website server/,
    },
    {
        name: 'network failure in Safari (Load failed)',
        error: new TypeError('Load failed'),
        kind: 'network',
        message: /Could not reach the website server/,
    },
    {
        name: 'network failure in Firefox',
        error: new TypeError('NetworkError when attempting to fetch resource.'),
        kind: 'network',
        message: /Could not reach the website server/,
    },
    {
        name: 'server error (HTTP 500 response)',
        error: { error: { code: 'LOCAL_FAULT', message: 'Synthetic article save failure', details: null, hint: null }, status: 500 },
        entity: 'article',
        kind: 'server',
        message: /^The website server had a problem and did not finish this change\. Wait a minute and try again\./,
    },
    {
        name: 'server error while loading',
        error: { error: { code: '', message: 'upstream connect error', details: '', hint: '' }, status: 503 },
        entity: 'product library',
        action: 'load',
        kind: 'server',
        message: /product library could not be loaded\. Wait a minute and reload the page\./,
    },
    {
        name: 'statement timeout (57014)',
        error: { code: '57014', message: 'canceling statement due to statement timeout' },
        kind: 'server',
        message: /server had a problem/,
    },
    {
        name: 'check constraint (23514)',
        error: { code: '23514', message: 'new row for relation "products" violates check constraint "products_status_check"' },
        entity: 'product',
        kind: 'invalid',
        message: /^One of the values for this product is not in an accepted format/,
    },
    {
        name: 'invalid input syntax (22P02)',
        error: { code: '22P02', message: 'invalid input syntax for type bigint: "abc"' },
        entity: 'model',
        kind: 'invalid',
        message: /values for this model is not in an accepted format/,
    },
    {
        name: 'required value missing (23502)',
        error: { code: '23502', message: 'null value in column "spec_label" of relation "product_specs" violates not-null constraint' },
        entity: 'specification',
        kind: 'required',
        message: /^A required field is empty\. Fill in the missing information for this specification/,
    },
    {
        name: 'row changed or removed (PGRST116)',
        error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: 'The result contains 0 rows' },
        entity: 'media item',
        kind: 'not_found',
        message: /^This media item was changed or removed by someone else\. Reload the page/,
    },
    {
        name: 'file too large (413)',
        error: { statusCode: '413', error: 'Payload too large', message: 'The object exceeded the maximum allowed size' },
        entity: 'file',
        action: 'upload',
        kind: 'too_large',
        message: /^This file is too large to upload/,
    },
    {
        name: 'unrecognised error keeps a plain fallback',
        error: { code: 'XX999', message: 'relation "mystery" is weird' },
        entity: 'lead',
        kind: 'unknown',
        message: /^Something went wrong\. This lead was not saved\. Try again, and if it keeps happening send the details below/,
    },
];

describe('translateAdminError', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it.each(cases)('$name → $kind', ({ error, entity, action, kind, message }) => {
        const translated = translateAdminError(error, { entity, action });
        expect(translated.kind).toBe(kind);
        expect(translated.message).toMatch(message);
        for (const fragment of technicalFragments) {
            expect(translated.message).not.toContain(fragment);
        }
        // The original text is kept for the Details disclosure.
        expect(translated.detail).toBe(describeRawAdminError(error));
        expect(translated.detail).toBeTruthy();
    });

    it('keeps the original message, details and code in the Details text', () => {
        const detail = describeRawAdminError({
            code: '23505',
            message: 'duplicate key value violates unique constraint "products_slug_key"',
            details: 'Key (slug)=(stone-bench) already exists.',
            hint: 'Pick another slug',
        });
        expect(detail).toContain('products_slug_key');
        expect(detail).toContain('Key (slug)=(stone-bench) already exists.');
        expect(detail).toContain('Hint: Pick another slug');
        expect(detail).toContain('Code: 23505');
        expect(describeRawAdminError({ error: { message: 'Boom', code: 'X' }, status: 502 })).toContain('HTTP 502');
        expect(describeRawAdminError(null)).toBeNull();
    });

    it('reports offline browsers as a network problem before reading the error', () => {
        vi.stubGlobal('navigator', { onLine: false });
        const translated = translateAdminError({ code: '23505', message: 'duplicate key value' }, { entity: 'product' });
        expect(translated.kind).toBe('network');
        expect(translated.message).toMatch(/^You appear to be offline\./);
    });

    it('uses a neutral entity when none is given', () => {
        expect(translateAdminError({ code: '23514', message: 'violates check constraint' }).message).toMatch(/this item/);
    });
});
