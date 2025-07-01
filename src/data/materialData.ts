// Centralised material catalogue for the new multi‑level pages
// ────────────────────────────────────────────────────────────

export interface MaterialItem {
    slug: string;          // e.g. "/materials/granite/classic/ken-black"
    name: string;          // Display name
    img: string;           // Thumbnail / swatch
}

export interface MaterialSubCategory {
    slug: string;          // e.g. "classic" / "tumbled"
    title: string;         // Heading shown on page
    hero?: string;         // Optional banner image
    blurb?: string;        // Optional paragraph shown under the heading
    items: MaterialItem[]; // The actual SKUs
}

export interface MaterialCategory {
    slug: string;              // e.g. "granite"
    title: string;             // e.g. "Granite"
    hero: string;              // Category‑level hero
    intro: string;             // Category description paragraph
    subCategories: MaterialSubCategory[];
}

// ────────────────────────────────────────────────────────────
// Temporary data — real project will replace this with WPGraphQL fetch
// ────────────────────────────────────────────────────────────

export const materialCategories: MaterialCategory[] = [
    {
        slug: "granite",
        title: "Granite",
        hero: "https://urblo.com.au/wp-content/uploads/2024/12/Ken-Black-1.jpg",
        intro:
            "Granite is one of the hardest natural stones we supply – dense, durable and perfect for high‑traffic outdoor surfaces.",
        subCategories: [
            {
                slug: "classic",
                title: "Classic Granite",
                items: [
                    {
                        slug: "ken-black",
                        name: "Ken Black",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Ken-Black-1.jpg",
                    },
                    {
                        slug: "ash-grey",
                        name: "Ash Grey",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Ash-Grey-1.jpg",
                    },
                    {
                        slug: "new-grey",
                        name: "New Grey",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1.jpg",
                    },
                    {
                        slug: "zen-grey",
                        name: "Zen Grey",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1-1.jpg",
                    },
                    {
                        slug: "sesame-white",
                        name: "Sesame White",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Sesame-White-1.jpg",
                    },
                ],
            },
        ],
    },

    {
        slug: "travertine",
        title: "Travertine",
        hero: "https://urblo.com.au/wp-content/uploads/2024/12/Toscany-1-1.jpg",
        intro:
            "Our travertine range carries a warm palette and natural voids that add unmistakable character to patios and pool surrounds.",
        subCategories: [
            {
                slug: "classic",
                title: "Classic Travertine",
                items: [
                    {
                        slug: "toscany",
                        name: "Toscany",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Toscany-1-1.jpg",
                    },
                    {
                        slug: "creama",
                        name: "Creama",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Creama-1-1.jpg",
                    },
                ],
            },
        ],
    },

    {
        slug: "limestone",
        title: "Limestone",
        hero: "https://urblo.com.au/wp-content/uploads/2024/12/Belgium-Blue-1.jpg",
        intro:
            "Limestone’s subtle tonal variations and soft texture make it a perennial favourite for both modern and traditional projects.",
        subCategories: [
            {
                slug: "classic",
                title: "Classic Limestone",
                items: [
                    {
                        slug: "belgium-blue",
                        name: "Belgium Blue",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Belgium-Blue-1.jpg",
                    },
                ],
            },
        ],
    },

    {
        slug: "blue-stone",
        title: "Blue Stone",
        hero: "https://urblo.com.au/wp-content/uploads/2024/12/Antline-scaled-1.jpg",
        intro:
            "Bluestone delivers a moody palette and slip‑resistant texture – ideal for sleek contemporary landscapes.",
        subCategories: [
            {
                slug: "classic",
                title: "Classic Blue Stone",
                items: [
                    {
                        slug: "antline",
                        name: "Antline",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Antline-scaled-1.jpg",
                    },
                    {
                        slug: "blue-ocean",
                        name: "Blue Ocean",
                        img: "https://urblo.com.au/wp-content/uploads/2024/12/Blueocean-Sawn-1.jpg",
                    },
                ],
            },
        ],
    },
];

export interface MaterialItem {
    slug: string;
    name: string;
    img: string;                // 列表缩略图
    hero?: string;              // 详情页顶图（缺省用 img）
    description?: string;       // 富文本 / markdown
    specsPdf?: string;          // e.g. ".../Arbon_Limestone_Spec.pdf"
    gallery?: string[];         // 额外大图
    finishes?: string[];        // e.g. ["Tumbled", "Brushed"]
    sizes?: string[];           // e.g. ["Random Length 600 mm x 400 mm", "Custom"]
}

export const stoneMaterials: readonly MaterialItem[] =
    materialCategories.flatMap((cat) =>
        cat.subCategories.flatMap((sub) => sub.items)
    );

