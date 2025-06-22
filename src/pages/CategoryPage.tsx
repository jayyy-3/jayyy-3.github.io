import { useParams, Navigate } from "react-router-dom";
import { materialCategories } from "../data/materialData";
import MaterialThumb from "../components/MaterialThumb";

export default function CategoryPage() {
    const { category = "" } = useParams();
    const cat = materialCategories.find((c) => c.slug === category);

    if (!cat) return <Navigate to="/materials" replace />;

    return (
        <>
            <header className="relative h-[60vh] min-h-[520px]">
                <img
                    src={cat.hero}
                    alt={cat.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                />
            </header>

            <section className="bg-accent-white -mt-16 rounded-t-3xl pb-12 pt-20">
                <div className="mx-auto max-w-5xl space-y-6 px-4">
                    <h1 className="text-4.5xl font-heading">{cat.title}</h1>
                    <p className="text-primary-70">{cat.intro}</p>
                </div>
            </section>

            {/* 子系列网格 */}
            {cat.subCategories.map((sub) => (
                <section
                    key={sub.slug}
                    className="border-t border-primary-30 bg-accent-white py-12"
                >
                    <div className="mx-auto max-w-6xl space-y-6 px-4">
                        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
                            {sub.items.slice(0, 8).map((m) => (
                                <MaterialThumb
                                    key={m.slug}
                                    category={cat.slug}
                                    sub={sub.slug}
                                    {...m}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
}
