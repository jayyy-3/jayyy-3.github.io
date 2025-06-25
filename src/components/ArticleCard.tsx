// ──────────────────────────────────────────────────────────────
//  4‑1  ArticleCard – 列表页单卡片
// --------------------------------------------------------------
//  src/components/ArticleCard.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type {ArticleMeta} from "../types/article";

interface Props { meta: ArticleMeta; }
export default function ArticleCard({ meta }: Props) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}
            className="bg-white overflow-hidden shadow-sm"
        >
            <Link to={`/articles/${meta.slug}`} className="block">
                {meta.cover && (
                    <img
                        src={meta.cover}
                        alt={meta.title}
                        className="w-full h-48 object-cover"
                    />
                )}
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{meta.title}</h3>
                    <p className="text-sm text-slate-500">
                        {new Date(meta.date).toLocaleDateString()}
                    </p>
                    {meta.excerpt && (
                        <p className="mt-2 text-sm text-slate-700 line-clamp-3">
                            {meta.excerpt}
                        </p>
                    )}
                </div>
            </Link>
        </motion.article>
    );
}