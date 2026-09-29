import type { AdminAuthStatus } from '../../lib/adminAuthState';

// Plain helpers for RequireAdmin's in-place session recovery, kept outside React so vitest can
// cover them. A protected screen stays mounted (with its unsaved form) while the sign-in is being
// renewed or has ended; it is replaced only for an explicit Sign out, a lost CMS profile, or a
// missing configuration.

export interface KeptSession<User extends { id: string }, Profile> {
    user: User;
    profile: Profile;
}

/**
 * Last verified account for the screen. Returns the previous object when the account and its
 * profile are unchanged, so token refreshes and re-login do not look like a new user to effects.
 */
export function resolveKeptSession<User extends { id: string }, Profile>(
    previous: KeptSession<User, Profile> | null,
    user: User,
    profile: Profile,
): KeptSession<User, Profile> {
    if (previous && previous.user.id === user.id && sameValue(previous.profile, profile)) return previous;
    return { user, profile };
}

/**
 * True when the protected screen should stay on screen. Once the screen has shown a verified
 * account, a renewal ("loading"), an ended session ("unauthenticated") or a failed re-check
 * ("error") keeps it; an explicit Sign out, "unauthorized" and "config-missing" do not.
 */
export function shouldKeepScreen(status: AdminAuthStatus, hasKeptSession: boolean, signedOutOnPurpose: boolean) {
    if (!hasKeptSession || signedOutOnPurpose) return false;
    return status === 'authenticated' || status === 'loading' || status === 'unauthenticated' || status === 'error';
}

function sameValue(left: unknown, right: unknown) {
    return JSON.stringify(left) === JSON.stringify(right);
}
