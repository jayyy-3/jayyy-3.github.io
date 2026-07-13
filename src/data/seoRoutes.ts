import stoneLibraryJson from '../../data/clean/stone_library.json';
import articleIndexJson from '../../public/articles/index.json';
import { projects } from './projectData';
import { products } from './productData';
import { siteFooterContact, siteLogoUrl, siteSocialLinks } from './siteChrome';

export const SITE_URL = 'https://urblo.com.au';
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-default.png`;
export const SEO_LAST_MODIFIED = '2026-06-12';

export type SeoChangeFrequency = 'weekly' | 'monthly' | 'yearly';

export interface SeoRoute {
    path: string;
    title: string;
    description: string;
    changeFrequency: SeoChangeFrequency;
    priority: number;
    lastModified: string;
    isIndexable: boolean;
    ogType?: 'website' | 'article';
    image?: string;
    breadcrumbs: SeoBreadcrumb[];
}

export interface SeoBreadcrumb {
    name: string;
    path: string;
}

export interface SeoMeta {
    title: string;
    description: string;
    canonicalUrl: string;
    image: string;
    ogType: 'website' | 'article';
    robots: string;
}

export interface SeoMetaDefaults {
    homepageTitle?: string | null;
    homepageDescription?: string | null;
    defaultShareImage?: string | null;
}

type JsonLd = Record<string, unknown>;

type StoneSeoSource = {
    stoneGroupId: string;
    displayName: string;
    type?: {
        display?: string | null;
        source?: string | null;
    };
    origin?: {
        countryDisplay?: string | null;
    };
    status?: string;
};

type StoneLibrarySeoSource = {
    stones: StoneSeoSource[];
};

type ArticleIndexEntry = {
    slug: string;
    title: string;
    date?: string;
    author?: string;
    excerpt?: string;
    cover?: string;
};

const stoneLibrary = stoneLibraryJson as StoneLibrarySeoSource;
const articleIndex = articleIndexJson as ArticleIndexEntry[];

const staticRoutes: SeoRoute[] = [
    route({
        path: '/',
        title: 'Urblo | Natural Stone Streetscape Systems',
        description:
            'Design-led, engineering-backed natural stone systems for streetscapes, public realm, and civic landscape projects.',
        changeFrequency: 'weekly',
        priority: 1,
        breadcrumbs: [{ name: 'Home', path: '/' }],
    }),
    route({
        path: '/projects',
        title: 'Public Realm Stone Projects | Urblo',
        description:
            'Review Urblo project examples across streetscapes, civic landscapes, campus settings, and commercial outdoor spaces.',
        changeFrequency: 'monthly',
        priority: 0.9,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
        ],
    }),
    route({
        path: '/stone-library',
        title: 'Natural Stone Library for Public Realm Projects | Urblo',
        description:
            'Explore Urblo natural stone types, finishes, origins, and availability for streetscape and civic landscape projects.',
        changeFrequency: 'monthly',
        priority: 0.9,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Stone Library', path: '/stone-library' },
        ],
    }),
    route({
        path: '/products',
        title: 'Modular Stone Streetscape Products | Urblo',
        description:
            'Browse Urblo modular stone product systems for streetscapes, seating, civic landscapes, and public realm applications.',
        changeFrequency: 'monthly',
        priority: 0.8,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
        ],
    }),
    route({
        path: '/capabilities',
        title: 'Stone Design, Fabrication, and Delivery Capabilities | Urblo',
        description:
            'See how Urblo supports design translation, specification, sourcing, fabrication, and delivery coordination for stone streetscape projects.',
        changeFrequency: 'monthly',
        priority: 0.85,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Capabilities', path: '/capabilities' },
        ],
    }),
    route({
        path: '/our-story',
        title: 'Our Story | Urblo',
        description:
            'Learn about Urblo, its natural stone systems approach, and its role in design-led public realm projects.',
        changeFrequency: 'yearly',
        priority: 0.55,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Our Story', path: '/our-story' },
        ],
    }),
    route({
        path: '/articles',
        title: 'Stone Streetscape Articles and Material Guides | Urblo',
        description:
            'Read Urblo articles on stone, surface finishes, sustainability, streetscapes, public realm, and landscape design.',
        changeFrequency: 'monthly',
        priority: 0.7,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/articles' },
        ],
    }),
    route({
        path: '/contact',
        title: 'Contact Urblo for Stone Streetscape Projects',
        description:
            'Contact Urblo to discuss project briefs, stone intent, sample requests, product specifications, and public realm applications.',
        changeFrequency: 'monthly',
        priority: 0.8,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
        ],
    }),
];

const projectRoutes: SeoRoute[] = projects.map((project) =>
    route({
        path: `/projects/${project.slug}`,
        title: `${project.name} Stone Streetscape Project | Urblo`,
        description: toMetaDescription(
            project.listing.summary ||
                project.lead ||
                `Review ${project.name}, an Urblo public realm stone project with project facts, material notes, and delivery proof.`,
        ),
        changeFrequency: 'monthly',
        priority: 0.75,
        image: project.hero?.image || project.listing.cover,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: project.name, path: `/projects/${project.slug}` },
        ],
    }),
);

const stoneRoutes: SeoRoute[] = stoneLibrary.stones.map((stone) => {
    const stoneType = stone.type?.display || stone.type?.source || 'natural stone';
    const origin = stone.origin?.countryDisplay ? ` from ${stone.origin.countryDisplay}` : '';

    return route({
        path: `/stone-library/${stone.stoneGroupId}`,
        title: `${stone.displayName} ${stoneType} | Urblo Stone Library`,
        description: toMetaDescription(
            `Review ${stone.displayName}${origin} in the Urblo Stone Library, including finish options, sourcing notes, and public realm application guidance.`,
        ),
        changeFrequency: 'monthly',
        priority: stone.status === 'active' ? 0.76 : 0.55,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Stone Library', path: '/stone-library' },
            { name: stone.displayName, path: `/stone-library/${stone.stoneGroupId}` },
        ],
    });
});

const productRoutes: SeoRoute[] = products.map((product) =>
    route({
        path: `/products/${product.slug}`,
        title: `${product.name} Stone Seating System | Urblo`,
        description: toMetaDescription(
            product.shortDesc ||
                `Explore ${product.name}, an Urblo modular stone product system for streetscape and public realm projects.`,
        ),
        changeFrequency: 'monthly',
        priority: 0.72,
        image: product.models[0]?.img,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            { name: product.name, path: `/products/${product.slug}` },
        ],
    }),
);

const articleRoutes: SeoRoute[] = articleIndex.map((article) =>
    route({
        path: `/articles/${article.slug}`,
        title: `${article.title} | Urblo`,
        description: toMetaDescription(
            article.excerpt ||
                `Read ${article.title}, an Urblo article on natural stone, public realm design, and streetscape delivery.`,
        ),
        changeFrequency: 'yearly',
        priority: 0.62,
        ogType: 'article',
        image: article.cover,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/articles' },
            { name: article.title, path: `/articles/${article.slug}` },
        ],
    }),
);

export const SEO_ROUTES: SeoRoute[] = [
    ...staticRoutes,
    ...projectRoutes,
    ...stoneRoutes,
    ...productRoutes,
    ...articleRoutes,
];

const seoRouteByPath = new Map(SEO_ROUTES.map((seoRoute) => [seoRoute.path, seoRoute]));

export function getIndexableSeoRoutes(): SeoRoute[] {
    return SEO_ROUTES.filter((seoRoute) => seoRoute.isIndexable);
}

export function getSeoRouteForPathname(pathname: string): SeoRoute | null {
    return seoRouteByPath.get(normalizePath(pathname)) ?? null;
}

export function getSeoMetaForPathname(pathname: string, defaults: SeoMetaDefaults = {}): SeoMeta {
    const normalizedPath = normalizePath(pathname);
    const seoRoute = getSeoRouteForPathname(normalizedPath);

    if (seoRoute) {
        const isHomepage = normalizedPath === '/';
        return {
            title: isHomepage && defaults.homepageTitle ? defaults.homepageTitle : seoRoute.title,
            description:
                isHomepage && defaults.homepageDescription
                    ? toMetaDescription(defaults.homepageDescription)
                    : seoRoute.description,
            canonicalUrl: canonicalUrlForPath(seoRoute.path),
            image: toAbsoluteUrl(seoRoute.image || defaults.defaultShareImage || DEFAULT_SHARE_IMAGE),
            ogType: seoRoute.ogType || 'website',
            robots: 'index,follow',
        };
    }

    if (normalizedPath.startsWith('/admin')) {
        return {
            title: 'Admin | Urblo',
            description: 'Protected Urblo admin console for content, media, lead, and launch operations.',
            canonicalUrl: canonicalUrlForPath(normalizedPath),
            image: toAbsoluteUrl(defaults.defaultShareImage || DEFAULT_SHARE_IMAGE),
            ogType: 'website',
            robots: 'noindex,nofollow',
        };
    }

    return {
        title: 'Page Not Found | Urblo',
        description:
            'The requested Urblo page could not be found. Explore projects, products, Stone Library, or contact pathways.',
        canonicalUrl: canonicalUrlForPath(normalizedPath),
        image: toAbsoluteUrl(defaults.defaultShareImage || DEFAULT_SHARE_IMAGE),
        ogType: 'website',
        robots: 'noindex,follow',
    };
}

export function getStructuredDataForPathname(pathname: string): JsonLd[] {
    const normalizedPath = normalizePath(pathname);
    const seoRoute = getSeoRouteForPathname(normalizedPath);

    if (!seoRoute) {
        return [];
    }

    const structuredData: JsonLd[] = [organizationSchema, websiteSchema, toBreadcrumbSchema(seoRoute)];
    const article = articleIndex.find((entry) => `/articles/${entry.slug}` === seoRoute.path);

    if (article) {
        structuredData.push(toArticleSchema(article, seoRoute));
    }

    return structuredData;
}

function route(input: Omit<SeoRoute, 'lastModified' | 'isIndexable'>): SeoRoute {
    return {
        ...input,
        lastModified: SEO_LAST_MODIFIED,
        isIndexable: true,
        description: toMetaDescription(input.description),
    };
}

function normalizePath(pathname: string): string {
    if (!pathname || pathname === '/') {
        return '/';
    }

    const withoutTrailingSlash = pathname.replace(/\/+$/, '');
    return withoutTrailingSlash || '/';
}

function canonicalUrlForPath(path: string): string {
    return new URL(path, SITE_URL).toString();
}

function toAbsoluteUrl(pathOrUrl: string): string {
    try {
        return new URL(pathOrUrl).toString();
    } catch {
        return new URL(pathOrUrl, SITE_URL).toString();
    }
}

function toMetaDescription(value: string, maxLength = 158): string {
    const normalized = value.replace(/\s+/g, ' ').trim();

    if (normalized.length <= maxLength) {
        return normalized;
    }

    const clipped = normalized.slice(0, maxLength - 1);
    const lastSpace = clipped.lastIndexOf(' ');

    return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length).trim()}.`;
}

const organizationSchema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Urblo',
    url: SITE_URL,
    logo: canonicalUrlForPath(siteLogoUrl),
    email: siteFooterContact.email,
    telephone: siteFooterContact.phone,
    address: {
        '@type': 'PostalAddress',
        streetAddress: siteFooterContact.address.join(' ').replace(',', ''),
        addressLocality: 'Oakleigh',
        addressRegion: 'VIC',
        postalCode: '3166',
        addressCountry: 'AU',
    },
    sameAs: siteSocialLinks.map((link) => link.href).filter(Boolean),
};

const websiteSchema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Urblo',
    url: SITE_URL,
    inLanguage: 'en-AU',
    publisher: {
        '@type': 'Organization',
        name: 'Urblo',
        url: SITE_URL,
    },
};

function toBreadcrumbSchema(seoRoute: SeoRoute): JsonLd {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: seoRoute.breadcrumbs.map((breadcrumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: breadcrumb.name,
            item: canonicalUrlForPath(breadcrumb.path),
        })),
    };
}

function toArticleSchema(article: ArticleIndexEntry, seoRoute: SeoRoute): JsonLd {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: seoRoute.description,
        datePublished: article.date,
        dateModified: seoRoute.lastModified,
        image: article.cover ? [toAbsoluteUrl(article.cover)] : [DEFAULT_SHARE_IMAGE],
        author: {
            '@type': 'Person',
            name: article.author || 'Urblo',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Urblo',
            logo: {
                '@type': 'ImageObject',
                url: canonicalUrlForPath(siteLogoUrl),
            },
        },
        mainEntityOfPage: canonicalUrlForPath(seoRoute.path),
    };
}
