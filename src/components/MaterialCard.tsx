import { Link } from "react-router-dom";

interface Material {
    slug: string;          // Jump Details Page in future
    name: string;
    category: string;
    img: string;
}

export default function MaterialCard({ slug, name, category, img }: Material) {
    return (
        <Link
            to={`/materials/${slug}`}       // details page in future
            className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-xl"
        >
            <div className="aspect-square overflow-hidden">
                <img
                    src={img}
                    alt={name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                />
            </div>
            <div className="flex items-center justify-between p-4">
                <div>
                    <h3 className="text-base font-semibold">{name}</h3>
                    <p className="text-xs text-gray-500">{category}</p>
                </div>
                {/* arrow icon can be added here  / add to favorites icon can be added here */}
            </div>
        </Link>
    );
}
