import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    BrowserRouter,
    Route,
    Routes,
    useLocation,
    useNavigationType,
} from 'react-router-dom';
import WelcomePopup from './components/WelcomePopup';
import RouteState from './components/RouteState';
import { getSeoMetaForPathname, getStructuredDataForPathname } from './data/seoRoutes';
import DefaultLayout from './layouts/DefaultLayout';
import HomepageLayout from './layouts/HomepageLayout';
import { PublicSiteSettingsProvider } from './lib/PublicSiteSettingsProvider';
import { usePublicSiteSettings } from './lib/publicSiteSettings';

const Home = lazy(() => import('./pages/Home'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ProjectsPage = lazy(() => import('./pages/Projects'));
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetails'));
const StoneLibraryPage = lazy(() => import('./pages/StoneLibraryPage'));
const StoneLibraryDetailPage = lazy(() => import('./pages/StoneLibraryDetailPage'));
const OurStoryPage = lazy(() => import('./pages/OurStory'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CapabilitiesPage = lazy(() => import('./pages/CapabilitiesPage'));
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const ROUTE_BANNERS = {
    products: '/media/launch/banners/products.jpg',
    materials: '/media/launch/banners/materials.jpg',
    projects: '/media/launch/banners/projects.jpg',
    ourStory: '/media/launch/banners/our-story.jpg',
    contact: '/media/launch/banners/our-story.jpg',
    articles: '/media/launch/banners/articles.jpg',
} as const;

function TitleUpdater() {
    const location = useLocation();
    const settings = usePublicSiteSettings();

    useEffect(() => {
        const meta = getSeoMetaForPathname(location.pathname, {
            homepageTitle: settings.seo.title,
            homepageDescription: settings.seo.description,
            defaultShareImage: settings.seo.defaultShareImage,
        });
        const structuredData = getStructuredDataForPathname(location.pathname);

        document.title = meta.title;
        upsertMeta('name', 'description', meta.description);
        upsertMeta('name', 'robots', meta.robots);
        upsertCanonical(meta.canonicalUrl);
        upsertMeta('property', 'og:site_name', settings.companyName);
        upsertMeta('property', 'og:type', meta.ogType);
        upsertMeta('property', 'og:title', meta.title);
        upsertMeta('property', 'og:description', meta.description);
        upsertMeta('property', 'og:url', meta.canonicalUrl);
        upsertMeta('property', 'og:image', meta.image);
        upsertMeta('property', 'og:image:type', getImageMimeType(meta.image));
        upsertMeta('property', 'og:image:width', '1200');
        upsertMeta('property', 'og:image:height', '630');
        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', meta.title);
        upsertMeta('name', 'twitter:description', meta.description);
        upsertMeta('name', 'twitter:image', meta.image);
        upsertJsonLd('urblo-structured-data', structuredData);
    }, [
        location.pathname,
        settings.companyName,
        settings.seo.defaultShareImage,
        settings.seo.description,
        settings.seo.title,
    ]);

    return null;
}

function upsertMeta(attributeName: 'name' | 'property', attributeValue: string, content: string) {
    const selector = `meta[${attributeName}="${attributeValue}"]`;
    let tag = document.head.querySelector<HTMLMetaElement>(selector);

    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, attributeValue);
        document.head.appendChild(tag);
    }

    tag.content = content;
}

function upsertCanonical(href: string) {
    let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!tag) {
        tag = document.createElement('link');
        tag.rel = 'canonical';
        document.head.appendChild(tag);
    }

    tag.href = href;
}

function getImageMimeType(imageUrl: string) {
    let pathname = imageUrl;

    try {
        pathname = new URL(imageUrl, window.location.origin).pathname;
    } catch {
        // Keep the original value and use the safe default below.
    }

    const normalized = pathname.toLowerCase();
    if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
    if (normalized.endsWith('.webp')) return 'image/webp';
    if (normalized.endsWith('.avif')) return 'image/avif';
    if (normalized.endsWith('.gif')) return 'image/gif';
    return 'image/png';
}

function upsertJsonLd(id: string, structuredData: Record<string, unknown>[]) {
    let tag = document.head.querySelector<HTMLScriptElement>(`script#${id}`);

    if (!structuredData.length) {
        tag?.remove();
        return;
    }

    if (!tag) {
        tag = document.createElement('script');
        tag.id = id;
        tag.type = 'application/ld+json';
        document.head.appendChild(tag);
    }

    tag.removeAttribute('data-owner');
    tag.textContent = JSON.stringify(structuredData);
}

function ScrollRestoration() {
    const location = useLocation();
    const navigationType = useNavigationType();

    useLayoutEffect(() => {
        if (navigationType === 'POP') {
            return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname, location.search, navigationType]);

    return null;
}

function WelcomePopupGate() {
    const location = useLocation();

    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return <WelcomePopup />;
}

function PageLoading({ headerOffset = false }: { headerOffset?: boolean }) {
    return (
        <RouteState
            eyebrow="Loading"
            title="Preparing content"
            copy="The page is loading. This should only take a moment."
            headerOffset={headerOffset}
        />
    );
}

function loadPage(page: ReactNode, options: { headerOffset?: boolean } = {}) {
    return <Suspense fallback={<PageLoading headerOffset={options.headerOffset} />}>{page}</Suspense>;
}

function AnimatedRoutes() {
    const location = useLocation();
    const shouldReduceMotion = useReducedMotion();
    const routeTransitionKey = location.pathname.startsWith('/admin') ? 'admin' : location.pathname;

    return (
        <motion.div
            key={routeTransitionKey}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
            <Routes location={location}>
                <Route
                    path="/"
                    element={
                        <HomepageLayout>
                            {loadPage(<Home />)}
                        </HomepageLayout>
                    }
                />

                <Route
                    path="/stone-library"
                    element={
                        <DefaultLayout>
                            {loadPage(<StoneLibraryPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/stone-library/:stoneGroupId"
                    element={
                        <DefaultLayout>
                            {loadPage(<StoneLibraryDetailPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/products"
                    element={
                        <DefaultLayout bgImage={ROUTE_BANNERS.products}>
                            {loadPage(<ProductsPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/products/:slug"
                    element={
                        <DefaultLayout bgImage={ROUTE_BANNERS.materials}>
                            {loadPage(<ProductDetailPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/projects"
                    element={
                        <DefaultLayout>
                            {loadPage(<ProjectsPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/projects/:slug"
                    element={
                        <DefaultLayout>
                            {loadPage(<ProjectDetailsPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/our-story"
                    element={
                        <DefaultLayout bgImage={ROUTE_BANNERS.ourStory}>
                            {loadPage(<OurStoryPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/capabilities"
                    element={
                        <DefaultLayout showBanner={false} headerSurface="overlay">
                            {loadPage(<CapabilitiesPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/contact"
                    element={
                        <DefaultLayout bgImage={ROUTE_BANNERS.contact}>
                            {loadPage(<ContactPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/articles"
                    element={
                        <DefaultLayout bgImage={ROUTE_BANNERS.articles}>
                            {loadPage(<ArticlesPage />)}
                        </DefaultLayout>
                    }
                />

                <Route
                    path="/articles/:slug"
                    element={
                        <DefaultLayout showBanner={false} headerSurface="overlay">
                            {loadPage(<ArticlePage />, { headerOffset: true })}
                        </DefaultLayout>
                    }
                />

                <Route path="/admin/*" element={loadPage(<AdminApp />)} />

                <Route
                    path="*"
                    element={
                        <DefaultLayout showBanner={false}>
                            {loadPage(<NotFoundPage />, { headerOffset: true })}
                        </DefaultLayout>
                    }
                />
            </Routes>
        </motion.div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRuntime />
        </BrowserRouter>
    );
}

function AppRuntime() {
    const location = useLocation();

    if (location.pathname.startsWith('/admin')) {
        return <AppRuntimeContent />;
    }

    return (
        <PublicSiteSettingsProvider>
            <AppRuntimeContent />
        </PublicSiteSettingsProvider>
    );
}

function AppRuntimeContent() {
    return (
        <>
            <WelcomePopupGate />
            <TitleUpdater />
            <ScrollRestoration />
            <AnimatedRoutes />
        </>
    );
}
