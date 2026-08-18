import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from '../../lib/adminAuth';
import { AdminLoadingState } from './AdminState';

const AdminAuditPage = lazy(() => import('./AdminAuditPage'));
const AdminAccountSetupPage = lazy(() => import('./AdminAccountSetupPage'));
const AdminArticlesPage = lazy(() => import('./AdminArticlesPage'));
const AdminDashboardPage = lazy(() => import('./AdminDashboardPage'));
const AdminImageQrPage = lazy(() => import('./AdminImageQrPage'));
const AdminLeadsPage = lazy(() => import('./AdminLeadsPage'));
const AdminLoginPage = lazy(() => import('./AdminLoginPage'));
const AdminMediaPage = lazy(() => import('./AdminMediaPage'));
const AdminProjectsPage = lazy(() => import('./AdminProjectsPage'));
const AdminProductsPage = lazy(() => import('./AdminProductsPage'));
const AdminSettingsPage = lazy(() => import('./AdminSettingsPage'));
const AdminStoneLibraryPage = lazy(() => import('./AdminStoneLibraryPage'));
const AdminUnauthorizedPage = lazy(() => import('./AdminUnauthorizedPage'));

export default function AdminApp() {
    return (
        <AdminAuthProvider>
            <Suspense fallback={<AdminLoadingState />}>
                <Routes>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="account-setup" element={<AdminAccountSetupPage />} />
                    <Route path="login" element={<AdminLoginPage />} />
                    <Route path="unauthorized" element={<AdminUnauthorizedPage />} />
                    <Route path="leads" element={<AdminLeadsPage />} />
                    <Route path="media" element={<AdminMediaPage />} />
                    <Route path="image-qr" element={<AdminImageQrPage />} />
                    <Route path="stone-library" element={<AdminStoneLibraryPage />} />
                    <Route path="projects" element={<AdminProjectsPage />} />
                    <Route path="projects/:projectId" element={<AdminProjectsPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="articles" element={<AdminArticlesPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="audit" element={<AdminAuditPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </Suspense>
        </AdminAuthProvider>
    );
}
