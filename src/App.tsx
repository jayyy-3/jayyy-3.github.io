import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import WelcomePopup from './components/WelcomePopup';
import DefaultLayout from './layouts/DefaultLayout';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProjectsPage from './pages/Projects';
import ProjectDetailsPage from './pages/ProjectDetails';
import StoneLibraryPage from './pages/StoneLibraryPage';
import StoneLibraryDetailPage from './pages/StoneLibraryDetailPage';
import OurStoryPage from './pages/OurStory';
import ArticlesPage from './pages/ArticlesPage';
import ArticlePage from './pages/ArticlePage';

function TitleUpdater() {
    const location = useLocation();

    const pageTitles: Record<string, string> = {
        '/': 'Home',
        '/stone-library': 'Stone Library',
        '/products': 'Products',
        '/articles': 'Articles',
        '/projects': 'Projects',
    };

    const currentTitle = pageTitles[location.pathname] || 'Urblo';

    return (
        <Helmet>
            <title>{`Urblo - ${currentTitle}`}</title>
        </Helmet>
    );
}

export default function App() {
    return (
        <>
            <WelcomePopup />
            <HashRouter>
                <TitleUpdater />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-home.jpg">
                                <Home />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/stone-library"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-materials.jpg">
                                <StoneLibraryPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/stone-library/:stoneGroupId"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-material-details.jpg">
                                <StoneLibraryDetailPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/products"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-products.jpg">
                                <ProductsPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/products/:slug"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-materials.jpg">
                                <ProductDetailPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/projects"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-products.jpg">
                                <ProjectsPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/projects/:slug"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-project-details.jpg">
                                <ProjectDetailsPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/our-story"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-our-story.jpg">
                                <OurStoryPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/articles"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-articles.jpg">
                                <ArticlesPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/articles/:slug"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-article-details.jpg">
                                <ArticlePage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-404.jpg">
                                <Home />
                            </DefaultLayout>
                        }
                    />
                </Routes>
            </HashRouter>
        </>
    );
}
