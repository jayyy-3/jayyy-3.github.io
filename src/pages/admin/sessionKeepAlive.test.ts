import { describe, expect, it } from 'vitest';
import { resolveKeptSession, shouldKeepScreen } from './sessionKeepAlive';

const user = { id: 'user-1', email: 'owner@urblo.example.test' };
const profile = { user_id: 'user-1', email: 'owner@urblo.example.test', role: 'owner', is_active: true };

describe('session keep-alive', () => {
    it('keeps the screen through renewal, expiry and a failed re-check once an account was shown', () => {
        for (const status of ['authenticated', 'loading', 'unauthenticated', 'error'] as const) {
            expect(shouldKeepScreen(status, true, false)).toBe(true);
        }
    });

    it('lets Sign out, a lost CMS profile and missing configuration replace the screen', () => {
        expect(shouldKeepScreen('unauthenticated', true, true)).toBe(false);
        expect(shouldKeepScreen('unauthorized', true, false)).toBe(false);
        expect(shouldKeepScreen('config-missing', true, false)).toBe(false);
    });

    it('never keeps a screen that has not shown a verified account (first load goes to login)', () => {
        expect(shouldKeepScreen('unauthenticated', false, false)).toBe(false);
        expect(shouldKeepScreen('loading', false, false)).toBe(false);
    });

    it('returns the same kept session for the same account so effects do not reload the form', () => {
        const kept = resolveKeptSession(null, user, profile);
        expect(resolveKeptSession(kept, { ...user }, { ...profile })).toBe(kept);
    });

    it('replaces the kept session when the role or account changes', () => {
        const kept = resolveKeptSession(null, user, profile);
        expect(resolveKeptSession(kept, user, { ...profile, role: 'viewer' })).not.toBe(kept);
        const other = resolveKeptSession(kept, { id: 'user-2', email: 'x@urblo.example.test' }, { ...profile, user_id: 'user-2' });
        expect(other.user.id).toBe('user-2');
    });
});
