//  src/pages/ArticlesPage.tsx
import { articles } from "../utils/articles";
import ArticleCard from "../components/ArticleCard";
import { motion } from "framer-motion";

export default function ArticlesPage() {
    // Sort articles by date (newest first)
    const sortedArticles = [...articles].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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
                    {sortedArticles.map((meta) => (
                        <ArticleCard key={meta.slug} meta={meta} />
                    ))}
                </div>
            </div>
        </section>
    );
}