import { useState } from "react";
import clsx from "clsx";

interface Props {
    hero: string;
    gallery?: string[];
    name: string;
}

export default function ImageGallery({ hero, gallery = [], name }: Props) {
    const images = [hero, ...gallery];
    const [active, setActive] = useState(0);

    return (
        <div className="flex flex-col-reverse lg:flex-row">
            {/* Thumbs */}
            <ul className="mt-4 flex shrink-0 gap-3 overflow-x-auto lg:mt-0 lg:flex-col lg:pr-2">
                {images.map((src, i) => (
                    <li key={src} className="shrink-0">
                        <button
                            type="button"
                            onClick={() => setActive(i)}
                            className={clsx(
                                "block h-20 w-20 overflow-hidden rounded-lg border transition-opacity hover:opacity-80 lg:h-24 lg:w-24",
                                i === active ? "border-primary-100" : "border-transparent"
                            )}
                        >
                            <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                    </li>
                ))}
            </ul>

            {/* Main */}
            <figure className="relative w-full overflow-hidden rounded-lg shadow">
                <img
                    src={images[active]}
                    alt={name}
                    className="h-[420px] w-full object-cover lg:h-[520px]"
                    loading={active === 0 ? "eager" : "lazy"}
                />
            </figure>
        </div>
    );
}
