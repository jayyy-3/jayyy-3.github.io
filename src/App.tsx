import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
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

const SITE_URL = 'https://urblo.com.au';
const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-default.svg`;
const ROUTE_BANNERS = {
    products: '/media/launch/banners/products.jpg',
    materials: '/media/launch/banners/materials.jpg',
    projects: '/media/launch/banners/projects.jpg',
    ourStory: '/media/launch/banners/our-story.jpg',
    contact: '/media/launch/banners/our-story.jpg',
    articles: '/media/launch/banners/articles.jpg',
    articleDetail: '/media/launch/banners/article-detail.jpg',
} as const;

interface RouteMeta {
    title: string;
    description: string;
}

function getRouteMeta(pathname: string): RouteMeta {
    if (pathname === '/') {
        return {
            title: 'Urblo | Natural Stone Streetscape Systems',
            description:
                'Design-led, engineering-backed natural stone systems for streetscapes, public realm, and civic landscape projects.',
        };
    }

    if (pathname.startsWith('/stone-library/')) {
        return {
            title: 'Stone Detail | Urblo',
            description:
                'Review natural stone options, finishes, and application notes for Urblo streetscape projects.',
        };
    }

    if (pathname === '/stone-library') {
        return {
            title: 'Stone Library | Urblo',
            description:
                'Explore Urblo natural stone types, finishes, origins, and availability for public realm projects.',
        };
    }

    if (pathname.startsWith('/products/')) {
        return {
            title: 'Product Detail | Urblo',
            description:
                'Explore Urblo product systems, material defaults, models, and specifications for civic landscapes.',
        };
    }

    if (pathname === '/products') {
        return {
            title: 'Products | Urblo',
            description:
                'Browse Urblo modular stone product systems for streetscapes, seating, and civic landscape applications.',
        };
    }

    if (pathname.startsWith('/projects/')) {
        return {
            title: 'Project Detail | Urblo',
            description:
                'See how Urblo stone systems are applied across public realm and civic landscape projects.',
        };
    }

    if (pathname === '/projects') {
        return {
            title: 'Projects | Urblo',
            description:
                'Review Urblo project examples across streetscapes, civic landscapes, and commercial outdoor spaces.',
        };
    }

    if (pathname === '/our-story') {
        return {
            title: 'Our Story | Urblo',
            description:
                'Learn about Urblo, its natural stone system approach, and its role in public realm projects.',
        };
    }

    if (pathname === '/contact') {
        return {
            title: 'Contact | Urblo',
            description:
                'Contact Urblo to discuss project briefs, stone intent, sample requests, and public realm applications.',
        };
    }

    if (pathname.startsWith('/articles/')) {
        return {
            title: 'Article | Urblo',
            description:
                'Read Urblo insights on natural stone, streetscape design, public realm projects, and material systems.',
        };
    }

    if (pathname === '/articles') {
        return {
            title: 'Articles | Urblo',
            description:
                'Read Urblo articles on stone, surface finishes, sustainability, streetscapes, and landscape design.',
        };
    }

    return {
        title: 'Urblo | Natural Stone Streetscape Systems',
        description:
            'Design-led, engineering-backed natural stone systems for streetscapes, public realm, and civic landscape projects.',
    };
}

function TitleUpdater() {
    const location = useLocation();
    const meta = getRouteMeta(location.pathname);
    const canonicalUrl = new URL(location.pathname, SITE_URL).toString();

    return (
        <Helmet>
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:site_name" content="Urblo" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={DEFAULT_SHARE_IMAGE} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            <meta name="twitter:image" content={DEFAULT_SHARE_IMAGE} />
        </Helmet>
    );
}

export default function App() {
    return (
        <>
            <WelcomePopup />
            <BrowserRouter>
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
                            <DefaultLayout bgImage={ROUTE_BANNERS.products}>
                                <ProductsPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/products/:slug"
                        element={
                            <DefaultLayout bgImage={ROUTE_BANNERS.materials}>
                                <ProductDetailPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/projects"
                        element={
                            <DefaultLayout bgImage={ROUTE_BANNERS.projects}>
                                <ProjectsPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/projects/:slug"
                        element={
                            <DefaultLayout showBanner={false}>
                                <ProjectDetailsPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/our-story"
                        element={
                            <DefaultLayout bgImage={ROUTE_BANNERS.ourStory}>
                                <OurStoryPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/contact"
                        element={
                            <DefaultLayout bgImage={ROUTE_BANNERS.contact}>
                                <ContactPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/articles"
                        element={
                            <DefaultLayout bgImage={ROUTE_BANNERS.articles}>
                                <ArticlesPage />
                            </DefaultLayout>
                        }
                    />

                    <Route
                        path="/articles/:slug"
                        element={
                            <DefaultLayout bgImage={ROUTE_BANNERS.articleDetail}>
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
            </BrowserRouter>
        </>
    );
}
