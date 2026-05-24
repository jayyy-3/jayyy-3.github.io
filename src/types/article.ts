// ===========================
// src/types/article.ts
// ===========================
export interface ArticleMeta {
    /** folder name under /src/articles/<slug> */
    slug: string;
    /** Legacy content folder under /public/articles when public slug differs. */
    sourceSlug?: string;
    /** Previous public URLs that should resolve to the canonical slug. */
    legacySlugs?: string[];
    /** Article title */
    title: string;
    /** ISO‑8601 publish date */
    date: string;
    /** Optional author name */
    author?: string;
    /** Optional cover image URL */
    cover?: string;
    /** One‑line excerpt shown on list page */
    excerpt?: string;
    /** Simple tag array for future filtering */
    tags?: string[];
}
