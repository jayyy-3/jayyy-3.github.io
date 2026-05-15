import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import WelcomePopup from './components/WelcomePopup';
import DefaultLayout from './layouts/DefaultLayout';
import HomepageLayout from './layouts/HomepageLayout';
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
import ContactPage from './pages/ContactPage';

function TitleUpdater() {
    const location = useLocation();

    let currentTitle = 'Urblo';

    if (location.pathname === '/') {
        currentTitle = 'Home';
    } else if (location.pathname.startsWith('/stone-library/')) {
        currentTitle = 'Stone Detail';
    } else if (location.pathname === '/stone-library') {
        currentTitle = 'Stone Library';
    } else if (location.pathname.startsWith('/products/')) {
        currentTitle = 'Product Detail';
    } else if (location.pathname === '/products') {
        currentTitle = 'Products';
    } else if (location.pathname.startsWith('/projects/')) {
        currentTitle = 'Project Detail';
    } else if (location.pathname === '/projects') {
        currentTitle = 'Projects';
    } else if (location.pathname === '/our-story') {
        currentTitle = 'Our Story';
    } else if (location.pathname === '/contact') {
        currentTitle = 'Contact Us';
    } else if (location.pathname.startsWith('/articles/')) {
        currentTitle = 'Article';
    } else if (location.pathname === '/articles') {
        currentTitle = 'Articles';
    }

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
                            <HomepageLayout>
                                <Home />
                            </HomepageLayout>
                        }
                    />

                    <Route
                        path="/stone-library"
                        element={
                            <DefaultLayout>
                                <StoneLibraryPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/stone-library/:stoneGroupId"
                        element={
                            <DefaultLayout>
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
                        path="/contact"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg">
                                <ContactPage />
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
                            <HomepageLayout>
                                <Home />
                            </HomepageLayout>
                        }
                    />
                </Routes>
            </HashRouter>
        </>
    );
}
