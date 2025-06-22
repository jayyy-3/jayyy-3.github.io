import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Home from './pages/Home';
import Products from './pages/Products';
import Articles from './pages/Articles';
import WelcomePopup from './components/WelcomePopup';
import DefaultLayout from './layouts/DefaultLayout';

function TitleUpdater() {
    const location = useLocation();
    const pageTitles: Record<string, string> = {
        '/': 'Home',
        '/products': 'Products',
        '/articles': 'Articles',
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
                        path="/articles"
                        element={
                            <DefaultLayout bgImage="https://urblo.com.au/wp-content/uploads/2024/12/bg-articles.jpg">
                                <Articles />
                            </DefaultLayout>
                        }
                    />
                </Routes>
            </HashRouter>
        </>
    );
}

export default App;
