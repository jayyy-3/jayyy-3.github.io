import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Home from './pages/Home';
import Products from './pages/ProductsPage.tsx';
import WelcomePopup from './components/WelcomePopup';
import DefaultLayout from './layouts/DefaultLayout';
import Materials from "./pages/Materials.tsx";
import Projects from "./pages/Projects.tsx";
import ProjectDetails from "./pages/ProjectDetails.tsx";
import MaterialsHome from "./pages/MaterialsHome.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import MaterialDetailPage from "./pages/MaterialDetailPage.tsx";
import OurStory from "./pages/OurStory.tsx";
import ArticlesPage from "./pages/ArticlesPage.tsx";
import ArticlePage from "./pages/ArticlePage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";

function TitleUpdater() {
    const location = useLocation();
    const pageTitles: Record<string, string> = {
        '/': 'Home',
        '/materials': 'Materials',
        '/products': 'Products',
        '/articles': 'Articles',
        '/projects': 'Projects',
    };
    const currentTitle = pageTitles[location.pathname] || 'Urblo';
    return (
        <Helmet>
            <title>{`Urblo - ${currentTitle}`}</title>
        </Helmet>
    )
}

function App() {
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
                        path="/products"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-products.jpg">
                                <Products />
                            </DefaultLayout>
                        }
                    />
                    <Route
                        path="/materials"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-materials.jpg">
                                <Materials />
                            </DefaultLayout>
                        }
                    />
                    <Route path="/materials-home" element={
                        <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-materials.jpg">
                            <MaterialsHome />
                        </DefaultLayout>
                    } />

                    {/* 顶层品类页 */}
                    <Route path="/materials/:category" element={
                        <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-materials.jpg">
                            <CategoryPage />
                        </DefaultLayout>
                    } />

                    <Route
                        path="/materials/:category/:subcategory/:slug"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-material-details.jpg">
                                <MaterialDetailPage />
                            </DefaultLayout>
                        }
                    />
                    <Route
                        path="/projects"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-products.jpg">
                                <Projects />
                            </DefaultLayout>
                        }
                    />
                    <Route
                        path="projects/:slug"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-project-details.jpg">
                                <ProjectDetails />
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
                    <Route
                        path="our-story"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-our-story.jpg">
                                <OurStory />
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
                        path="/products"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-products.jpg">
                                <Products />
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

                </Routes>
            </HashRouter>
        </>
    );
}

export default App;
