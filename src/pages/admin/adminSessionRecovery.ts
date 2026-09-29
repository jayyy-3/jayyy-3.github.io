import { createContext, useContext } from 'react';

// In-place session recovery for protected admin screens. RequireAdmin provides it; screens reach
// it through useAdminFeedback().reportError(), so an expired sign-in opens the re-login panel
// instead of sending the editor to /admin/login and dropping the unsaved form.

export interface AdminSessionRecovery {
    /**
     * Opens the re-login panel. `retry` (for example the save that was rejected) runs once after
     * the same account has signed in again; a later request replaces an earlier retry.
     */
    requestReLogin: (retry?: (() => unknown) | null) => void;
    /** True while the browser has no usable session (expired or signed out in another tab). */
    sessionLost: boolean;
}

export const AdminSessionRecoveryContext = createContext<AdminSessionRecovery | null>(null);

export function useAdminSessionRecovery() {
    return useContext(AdminSessionRecoveryContext);
}
