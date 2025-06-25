//  src/pages/ArticlePage.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { articles } from "../utils/articles";

export default function ArticlePage() {
    const { slug } = useParams<{ slug: string }>();
    const [html, setHtml] = useState("<p>Loading…</p>");

    const meta = articles.find((a) => a.slug === slug);

    // fetch html (client‑side) — vite 会把它当作静态文件
    useEffect(() => {
        fetch(`/src/data/articles/${slug}/content.html`)
            .then((r) => r.text())
            .then((raw) => setHtml(DOMPurify.sanitize(raw)));
    }, [slug]);

    if (!meta) return <p className="py-20 text-center">Article not found.</p>;

    const index = articles.findIndex((a) => a.slug === slug);
    const prev = articles[index - 1];
    const next = articles[index + 1];

    return (
        <>
            <ReadingProgressBar />

            {/* Hero */}
            <header className="relative bg-black">
                {meta.cover && (
                    <img
                        src={meta.cover}
                        alt={meta.title}
                        className="w-full h-80 object-cover opacity-70"
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
                        className="text-emerald-600 hover:underline"
                    >
                        &larr; {prev.title}
                    </Link>
                ) : (
                    <span />
                )}

                {next ? (
                    <Link
                        to={`/articles/${next.slug}`}
                        className="text-emerald-600 hover:underline"
                    >
                        {next.title} &rarr;
                    </Link>
                ) : (
                    <span />
                )}
            </nav>
        </>
    );
}
