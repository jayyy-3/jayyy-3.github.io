import { cloneElement } from 'react';
import * as React from "react";

/* helper to dupe children for infinite loop */
function Track({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) {
    const duplicated = [children, children];

    return (
        <div
            className={`
        flex min-w-max gap-6
        ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}
      `}
        >
            {duplicated.flatMap((group, groupIdx) =>
                React.Children.map(group, (child, i) =>
                    React.isValidElement(child)
                        ? cloneElement(child, { key: `${groupIdx}-${i}` })
                        : child
                )
            )}
        </div>
    );
}

const ITEMS = [
    { num: '01', title: 'Sketch & concept design', img: 'https://urblo.com.au/wp-content/uploads/2024/12/sketch-concept-design.jpeg' },
    { num: '02', title: 'Product development',     icon: 'tool' },
    { num: '03', title: 'Engineering design',      img: 'https://urblo.com.au/wp-content/uploads/2024/12/engineering-design.jpeg' },
    { num: '04', title: 'Cost control Budgeting',  icon: 'dollar' },
    { num: '05', title: 'Specification',           icon: 'spec' },
    { num: '06', title: 'Shop drawing',            img: 'https://urblo.com.au/wp-content/uploads/2024/12/shop-drawing.jpeg' },
    { num: '07', title: 'Off-site pre-assembly',   icon: 'assembly' },
    { num: '08', title: 'Manufacture',             img: 'https://urblo.com.au/wp-content/uploads/2024/12/manufacture.jpeg' },
    { num: '09', title: 'Installation',            icon: 'install' },
];

function Card({
                  num,
                  title,
                  img,
              }: {
    num: string;
    title: string;
    img?: string;
    icon?: string;
}) {
    return (
        <div
            className={`
        flex w-60 shrink-0 flex-col overflow-hidden rounded-xl
        shadow-md ${img ? 'bg-neutral-900' : 'bg-white'}
      `}
        >
            {img ? (
                <img src={img} alt={title} className="h-36 w-full object-cover opacity-80" />
            ) : (
                <div className="flex h-36 items-center justify-center">
                    {/* placeholder icon slot */}
                </div>
            )}
            <div className="p-4 text-white">
                <div className="text-4xl font-bold">{num}</div>
                <div className="text-lg">{title}</div>
            </div>
        </div>
    );
}

export default function ProcessSliderPanel() {
    return (
        <div className="flex flex-col gap-12">
            <Track>
                {ITEMS.slice(0, 5).map((it) => (
                    <Card key={it.num} {...it} />
                ))}
            </Track>

            <Track reverse>
                {ITEMS.slice(5).map((it) => (
                    <Card key={it.num} {...it} />
                ))}
            </Track>
        </div>
    );
}
