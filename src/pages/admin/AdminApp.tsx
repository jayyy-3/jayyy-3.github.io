import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from '../../lib/adminAuth';
import AdminDashboardPage from './AdminDashboardPage';
import AdminLoginPage from './AdminLoginPage';
import AdminModulePage from './AdminModulePage';
import AdminUnauthorizedPage from './AdminUnauthorizedPage';

export default function AdminApp() {
    return (
        <AdminAuthProvider>
            <Routes>
                <Route index element={<AdminDashboardPage />} />
                <Route path="login" element={<AdminLoginPage />} />
                <Route path="unauthorized" element={<AdminUnauthorizedPage />} />
                <Route path="leads" element={<AdminModulePage moduleKey="leads" />} />
                <Route path="media" element={<AdminModulePage moduleKey="media" />} />
                <Route path="stone-library" element={<AdminModulePage moduleKey="stone-library" />} />
                <Route path="projects" element={<AdminModulePage moduleKey="projects" />} />
                <Route path="products" element={<AdminModulePage moduleKey="products" />} />
                <Route path="articles" element={<AdminModulePage moduleKey="articles" />} />
                <Route path="settings" element={<AdminModulePage moduleKey="settings" />} />
                <Route path="audit" element={<AdminModulePage moduleKey="audit" />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminAuthProvider>
    );
}
