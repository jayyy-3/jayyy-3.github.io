import MaterialCard from "../components/MaterialCard";

// 静态数据（后期可替换成 WPGraphQL fetch）
const materials = [
    {
        slug: "ken-black",
        name: "Ken Black",
        category: "Granite",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Ken-Black-1.jpg",
    },
    {
        slug: "ash-grey",
        name: "Ash Grey",
        category: "Granite",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Ash-Grey-1.jpg",
    },
    {
        slug: "new-grey",
        name: "New Grey",
        category: "Granite",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1.jpg",
    },
    {
        slug: "zen-grey",
        name: "Zen Grey",
        category: "Granite",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1-1.jpg",
    },
    {
        slug: "sesame-white",
        name: "Sesame White",
        category: "Granite",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Sesame-White-1.jpg",
    },
    {
        slug: "toscany",
        name: "Toscany",
        category: "Travertine",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Toscany-1-1.jpg",
    },
    {
        slug: "creama",
        name: "Creama",
        category: "Travertine",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Creama-1-1.jpg",
    },
    {
        slug: "belgium-blue",
        name: "Belgium Blue",
        category: "Limestone",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Belgium-Blue-1.jpg",
    },
    {
        slug: "antlin",
        name: "Antlin",
        category: "Blue Stone",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Antline-scaled-1.jpg",
    },
    {
        slug: "blue-ocean",
        name: "Blue Ocean",
        category: "Blue Stone",
        img: "https://urblo.com.au/wp-content/uploads/2024/12/Blueocean-Sawn-1.jpg",
    },
];

export default function Materials() {
    return (
        <>
            {/* ---------- Featured Range ---------- */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="mb-10 text-3xl font-semibold">
                        Our featured stone range
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {materials.map((m) => (
                            <MaterialCard link={""} key={m.slug} {...m} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- CTA Banner ---------- */}
            <section className="bg-slate-900">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
                    {/* 图片 */}
                    <img
                        src="https://urblo.com.au/wp-content/uploads/2024/12/idea-into-reality.png"
                        alt="Idea into reality"
                        className="mx-auto h-40 w-auto md:h-64"
                    />

                    {/* 文案 + 按钮 */}
                    <div className="text-center md:text-left">
                        <h3 className="mb-6 text-2xl font-semibold text-white">
                            Make your idea into reality
                        </h3>
                        <a
                            href="/sample-request"
                            className="inline-block rounded-full bg-emerald-500 px-8 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                            Sample request
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
