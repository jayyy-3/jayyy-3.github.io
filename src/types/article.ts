// ===========================
// src/types/article.ts
// ===========================
export interface ArticleMeta {
    /** folder name under /src/articles/<slug> */
    slug: string;
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