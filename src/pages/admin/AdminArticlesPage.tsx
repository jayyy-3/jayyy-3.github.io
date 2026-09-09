import RequireAdmin from './RequireAdmin';
import ArticlesWorkspace from './articles/ArticlesWorkspace';

export default function AdminArticlesPage() {
    return (
        <RequireAdmin>
            <ArticlesWorkspace />
        </RequireAdmin>
    );
}
