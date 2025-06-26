//  src/pages/ArticlesPage.tsx
import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { motion } from "framer-motion";
import type { ArticleMeta } from "../types/article";


export default function ArticlesPage() {
    const [articles, setArticles] = useState<ArticleMeta[]>([]);

    useEffect(() => {
        // vite 会把 import.meta.env.BASE_URL 处理成 ‘’(dev) 或 ‘/<repo>/’(prod)
        fetch(`${import.meta.env.BASE_URL}articles/index.json`)
            .then((r) => r.json())
            .then((list: ArticleMeta[]) =>
                setArticles(
                    list.sort(
                        (a, b) =>
                            new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
                    )
                )
            )
            .catch(console.error);
    }, []);

    return (
        <section className="py-16 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold mb-10"
                >
                    Articles
                </motion.h1>

                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {articles.map((meta) => (
                        <ArticleCard key={meta.slug} meta={meta} />
                    ))}
                </div>
            </div>
        </section>
    );
}
