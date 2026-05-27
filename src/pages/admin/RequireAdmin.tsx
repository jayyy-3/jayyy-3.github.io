import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import { AdminConfigMissingState, AdminErrorState, AdminLoadingState } from './AdminState';

export default function RequireAdmin({ children }: { children: ReactNode }) {
    const auth = useAdminAuth();
    const location = useLocation();
    const next = `${location.pathname}${location.search}`;

    if (auth.status === 'loading') {
        return <AdminLoadingState />;
    }

    if (auth.status === 'config-missing') {
        return <AdminConfigMissingState />;
    }

    if (auth.status === 'error') {
        return <AdminErrorState />;
    }

    if (auth.status === 'unauthenticated') {
        return <Navigate to={`/admin/login?next=${encodeURIComponent(next)}`} replace />;
    }

    if (auth.status === 'unauthorized') {
        return <Navigate to="/admin/unauthorized" replace />;
    }

    return children;
}
