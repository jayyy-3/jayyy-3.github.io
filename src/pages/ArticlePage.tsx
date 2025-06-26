//  src/pages/ArticlePage.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import ReadingProgressBar from "../components/ReadingProgressBar";
import type { ArticleMeta } from "../types/article";

export default function ArticlePage() {
    const { slug = "" } = useParams<{ slug: string }>();
    const [html, setHtml] = useState("<p>Loading…</p>");
    const [articles, setArticles] = useState<ArticleMeta[]>([]);

    const meta = articles.find((a) => a.slug === slug);
    const index = articles.findIndex((a) => a.slug === slug);
    const prev = articles[index - 1];
    const next = articles[index + 1];

    // ✅ 加载 HTML 正文
    useEffect(() => {
        if (!slug || !meta) return;
        fetch(`${import.meta.env.BASE_URL}articles/${slug}/content.html`)
            .then((r) => r.text())
            .then((raw) => setHtml(DOMPurify.sanitize(raw)))
            .catch(() =>
                setHtml("<p class='text-red-600'>Failed to load article.</p>")
            );
    }, [slug, meta]);

    // ✅ 加载文章元数据列表
    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}articles/index.json`)
            .then((r) => r.json())
            .then(setArticles)
            .catch(console.error);
    }, []);

    // 🚫 404 fallback
    if (!meta)
        return (
            <p className="py-20 text-center text-red-600">
                Article not found.
            </p>
        );

    return (
        <>
            <ReadingProgressBar />

            {/* Hero */}
            <header className="relative bg-black">
                {meta.cover && (
                    <img
                        src={
                            meta.cover.startsWith("http")
                                ? meta.cover
                                : `${import.meta.env.BASE_URL}${meta.cover.replace(/^\/+/, "")}`
                        }
                        alt={meta.title}
                        className="w-full h-80 object-cover opacity-70"
                        loading="lazy"
                    />
                )}
                <h1 className="absolute inset-0 flex items-center justify-center px-4 text-center text-white text-3xl md:text-5xl font-semibold">
                    {meta.title}
                </h1>
            </header>

            {/* Body */}
            <div className="article-wrapper">
                <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
            {/* Nav */}
            <nav className="flex justify-between max-w-3xl mx-auto px-4">
                {prev ? (
                    <Link
                        to={`/articles/${prev.slug}`}
                        className="hover:text-emerald-600"
                    >
                        &larr; {prev.title}
                    </Link>
                ) : (
                    <span />
                )}

                {next ? (
                    <Link
                        to={`/articles/${next.slug}`}
                        className="hover:text-emerald-600"
                    >
                        {next.title} →
                    </Link>
                ) : (
                    <span />
                )}
            </nav>
        </>
    );
}
