import { useParams, Link } from "react-router-dom";
import { projects } from "../data/projectData";

export default function ProjectDetails() {
    const { slug = "" } = useParams();
    const project = projects.find((p) => p.slug === slug);

    if (!project)
        return (
            <>
                <div className="py-40 text-center text-xl">Project not found.</div>
            </>
        );

    const { name, images, details } = project;

    return (
        <>
            {/* ▸ 面包屑（可选，可删） */}
            <nav className="bg-gray-50 py-3 text-sm">
                <div className="mx-auto max-w-6xl px-4">
                    <Link to="/" className="text-gray-600 hover:underline">
                        Home
                    </Link>{" "}
                    &gt;{" "}
                    <Link to="/projects" className="text-gray-600 hover:underline">
                        Projects
                    </Link>{" "}
                    &gt; <span className="text-gray-900">{name}</span>
                </div>
            </nav>

            {/* ▸ 主内容 */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* 图片 1 */}
                        <img
                            src={images[0]}
                            alt={name}
                            loading="lazy"
                            className="w-full h-64 md:h-full object-cover"
                        />

                        {/* 图片 2 */}
                        <img
                            src={images[1]}
                            alt={name}
                            loading="lazy"
                            className="w-full h-64 md:h-full object-cover"
                        />

                        {/* 信息 */}
                        <div className="flex flex-col justify-between">
                            <h2 className="mb-8 text-3xl font-semibold">{name}</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                {Object.entries(details).map(([label, value]) => (
                                    <div key={label}>
                                        <p className="mb-1 text-sm font-semibold text-gray-500">{label}</p>
                                        {Array.isArray(value) ? (
                                            value.map((v, i) => (
                                                <p key={i} className="text-sm text-gray-800">{v}</p>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-800">{value}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
