//  src/utils/articles.ts
// --------------------------------------------------------------
import type {ArticleMeta} from "../types/article";

// vite 的 import.meta.glob 会在构建时把 json 变成对象
const metaModules = import.meta.glob<ArticleMeta>(
    "/src/data/articles/**/meta.json",
    { eager: true }
);

export const articles: ArticleMeta[] = Object.values(metaModules).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);