import { Link } from "react-router-dom";
import type { MaterialItem } from "../data/materialData";

interface Props extends MaterialItem {
    link: string;
}

export default function MaterialCard({ name, img, link }: Props) {
    return (
        <Link
            to={link}
            className="group block overflow-hidden shadow transition-shadow hover:shadow-lg"
        >
            <img
                src={img}
                alt={name}
                className="h-56 w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                loading="lazy"
            />
            <h3 className="mt-3 px-2 pb-4 text-lg font-normal text-primary-80">
                {name}
            </h3>
        </Link>
    );
}
