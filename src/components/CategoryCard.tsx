import { Link } from "react-router-dom";
import type { MaterialCategory } from "../data/materialData";

export default function CategoryCard({ slug, title, hero }: MaterialCategory) {
    return (
        <Link
            to={`/materials/${slug}`}
            className="group block overflow-hidden shadow transition-shadow hover:shadow-lg"
        >
            <img
                src={hero}
                alt={title}
                className="h-48 w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                loading="lazy"
            />
            <h3 className="mt-3 px-2 pb-4 text-xl font-thin leading-tight text-primary-100">
                {title}
            </h3>
        </Link>
    );
}
