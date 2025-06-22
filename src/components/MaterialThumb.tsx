import {Link} from "react-router-dom";
import type {MaterialItem} from "../data/materialData";

interface Props extends MaterialItem {
    category: string;
    sub: string;
}

export default function MaterialThumb({
                                          category,
                                          sub,
                                          slug,
                                          name,
                                          img,
                                      }: Props) {
    return (
        <Link
            to={`/materials/${category}/${sub}/${slug}`}
            className="group block"
        >
            <img
                src={img}
                alt={name}
                className="h-40 w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                loading="lazy"
            />
            <p className="mt-2 text-primary-80">{name}</p>
        </Link>
    );
}
