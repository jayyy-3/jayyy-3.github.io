import { materialCategories } from "../data/materialData";
import CategoryCard from "../components/CategoryCard";

export default function MaterialsHome() {
    return (
        <>
            {/* Hero */}
            <header className="relative h-[60vh] min-h-[520px] w-full">
                <img
                    src="https://www.eco-outdoor.com/_next/image?url=https%3A%2F%2Fmedia.eco-outdoor.com%2Fm%2F22ce06e97e32fbfe%2FOriginal_Image-Endicott_CrazyPaving_EcoOutdoor.PNG&w=1536&q=75"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                />
                <h1 className="absolute bottom-10 left-6 text-5xl font-heading text-white">
                    Materials
                </h1>
            </header>

            {/* Browse by category */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-6xl space-y-10 px-4">
                    <h2 className="text-3xl font-semibold">Browse by category</h2>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {materialCategories.map((cat) => (
                            <CategoryCard key={cat.slug} {...cat} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
