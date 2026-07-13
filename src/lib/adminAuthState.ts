import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export type AdminRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface AdminProfile {
    user_id: string;
    email: string;
    display_name: string | null;
    role: AdminRole;
    is_active: boolean;
}

export type AdminAuthStatus =
    | 'config-missing'
    | 'loading'
    | 'unauthenticated'
    | 'unauthorized'
    | 'authenticated'
    | 'error';

export interface AdminAuthContextValue {
    status: AdminAuthStatus;
    user: User | null;
    profile: AdminProfile | null;
    error: string | null;
    refresh: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
