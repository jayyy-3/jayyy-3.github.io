import { Link, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import { AdminConfigMissingState, AdminErrorState, AdminLoadingState, AdminState } from './AdminState';

export default function AdminUnauthorizedPage() {
    const auth = useAdminAuth();

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
        return <Navigate to="/admin/login" replace />;
    }

    if (auth.status === 'authenticated') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <AdminState
            eyebrow="Unauthorized"
            title="This account is not an active Urblo admin"
            copy="This login is valid, but it has not been given CMS access. Ask a Website owner or CMS manager to add this person in Settings before trying again."
            variant="warning"
            action={
                <>
                    <button
                        type="button"
                        onClick={() => void auth.signOut()}
                        className="urblo-button-inverse"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                    <Link to="/" className="urblo-button">
                        Return to site
                    </Link>
                </>
            }
        />
    );
}
