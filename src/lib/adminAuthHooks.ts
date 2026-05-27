import { useContext } from 'react';
import { AdminAuthContext } from './adminAuthState';
import { supabaseConfig } from './supabaseClient';

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }

    return context;
}

export function getAdminConfigStatus() {
    return supabaseConfig;
}
