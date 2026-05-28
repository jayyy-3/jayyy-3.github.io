import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from '../../lib/adminAuth';
import AdminArticlesPage from './AdminArticlesPage';
import AdminDashboardPage from './AdminDashboardPage';
import AdminLoginPage from './AdminLoginPage';
import AdminMediaPage from './AdminMediaPage';
import AdminModulePage from './AdminModulePage';
import AdminProjectsPage from './AdminProjectsPage';
import AdminProductsPage from './AdminProductsPage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminStoneLibraryPage from './AdminStoneLibraryPage';
import AdminUnauthorizedPage from './AdminUnauthorizedPage';

export default function AdminApp() {
    return (
        <AdminAuthProvider>
            <Routes>
                <Route index element={<AdminDashboardPage />} />
                <Route path="login" element={<AdminLoginPage />} />
                <Route path="unauthorized" element={<AdminUnauthorizedPage />} />
                <Route path="leads" element={<AdminModulePage moduleKey="leads" />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="stone-library" element={<AdminStoneLibraryPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="articles" element={<AdminArticlesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="audit" element={<AdminModulePage moduleKey="audit" />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminAuthProvider>
    );
}
