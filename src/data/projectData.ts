export interface ProjectData {
    slug: string;
    name: string;
    images: string[];
    details: Record<string, string | string[]>;
    listing: ProjectListing;
    hero?: ProjectHero;
    lead?: string;
    projectStory?: ProjectStoryBlock[];
    scopeItems?: ProjectScopeItem[];
    materialMap?: ProjectMaterialMap;
    materials?: ProjectMaterial[];
    gallery?: ProjectGalleryImage[];
    cta?: ProjectCta;
}

export interface ProjectListing {
    title: string;
    location: string;
    date: string;
    cover: string;
    summary?: string;
}

export interface ProjectHero {
    image: string;
    alt: string;
    caption?: string;
}

export interface ProjectStoryBlock {
    title: string;
    body: string;
}

export interface ProjectScopeItem {
    title: string;
    body: string;
}

export type ProjectHotspotKind = 'material' | 'detail' | 'experience' | 'scope';

export interface ProjectHotspot {
    id: string;
    kind: ProjectHotspotKind;
    x: number;
    y: number;
    title: string;
    label: string;
    stoneName?: string;
    stoneGroupId?: string;
    finish?: string;
    application: string;
    body: string;
    designerNote: string;
    image: string;
    imageAlt: string;
    ctaLabel?: string;
    ctaTo?: string;
}

export interface ProjectMaterialMap {
    image: string;
    imageAlt: string;
    intro: string;
    hotspots: ProjectHotspot[];
}

export interface ProjectMaterial {
    stoneGroupId?: string;
    name: string;
    finish: string;
    application: string;
    role: string;
    image?: string;
    imageAlt?: string;
}

export interface ProjectGalleryImage {
    src: string;
    alt: string;
    label: string;
    caption: string;
}

export interface ProjectCta {
    title: string;
    body: string;
    primaryLabel: string;
    primaryTo: string;
    secondaryLabel?: string;
    secondaryTo?: string;
}

const moonGateAssetRoot = '/images/projects/moon-gate';

export const projects: ProjectData[] = [
    {
        slug: "australian-catholic-university",
        name: "Australian Catholic University",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.47.48.jpeg",
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.47.49.jpeg",
        ],
        listing: {
            title: "Australian Catholic University",
            location: "Victoria",
            date: "December 18, 2024",
            cover: "https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg",
        },
        details: {
            Stone: "Bluestone",
            Finish: "Sawn",
            Quantity: "17 linear metres",
            "Carbon Offset": "Not available",
            "Landscape Architect": "Aspect Studio",
            Contractor: "Living Landscapes",
            Date: "May 2023 (completed)",
            Address: "115B Victoria Parade, Fitzroy, VIC 3065",
        },
    },
    {
        slug: "west-side-place",
        name: "West Side Place",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.30.49-scaled.jpeg",
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.30.57-scaled.jpeg",
        ],
        listing: {
            title: "West Side Place",
            location: "Victoria",
            date: "December 16, 2024",
            cover: "https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2.jpg",
        },
        details: {
            Stone: [
                "Bluestone (various tones)",
                "Granite (various tones)",
            ],
            Finish: "Sawn · Split · Polished · Flamed",
            Quantity: "500 linear metres",
            "Carbon Offset": "Not available",
            "Landscape Architect": "Rush Wright Associates",
            Contractor: "Not available",
            Date: "2023 (completed)",
            Address: "250 Spencer St, Melbourne, VIC 3000",
        },
    },
    {
        slug: "xavier-college",
        name: "Xavier College",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-16.00.24-1-scaled.jpeg",
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-16.00.24-scaled.jpeg",
        ],
        listing: {
            title: "Xavier College",
            location: "Victoria",
            date: "December 15, 2024",
            cover: "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-14.55.37-1.jpeg",
        },
        details: {
            Stone: "Sandstone",
            Finish: "Sparrow Peck",
            Quantity: "12 linear metres",
            "Carbon Offset": "Not available",
            "Landscape Architect": "Openwork Pty Ltd",
            Contractor: "Delta Group",
            Date: "2023 (completed)",
            Address: "135 Barkers Rd, Kew, VIC 3101",
        },
    },
    {
        slug: "artisan-park-yarrabend",
        name: "Artisan Park | YarraBend",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/IMG_3557-1-scaled.jpg",
            "https://urblo.com.au/wp-content/uploads/2024/12/DJI_0212-scaled-1.png",
        ],
        listing: {
            title: "Artisan Park | YarraBend",
            location: "Victoria",
            date: "December 14, 2024",
            cover: "https://urblo.com.au/wp-content/uploads/2025/01/WhatsApp-Image-2024-12-18-at-13.19.23-scaled-1.png",
        },
        details: {
            Stone: "New Grey",
            Finish: "Flamed",
            Quantity: "115 linear metres",
            "Carbon Offset": "Yes",
            "Landscape Architect": "Aspect Studio",
            Contractor: "Living Landscapes",
            Date: "April 2024 (completed)",
            Address: "55 Parkview Rd, Alphington, VIC 3078",
        },
    },
    {
        slug: "moon-gate-woolley-street",
        name: "Moon Gate | Woolley Street",
        images: [
            `${moonGateAssetRoot}/moon-gate-hero.jpg`,
            `${moonGateAssetRoot}/moon-gate-seat-detail.jpg`,
        ],
        listing: {
            title: "Moon Gate | Woolley Street",
            location: "ACT",
            date: "December 17, 2024",
            cover: `${moonGateAssetRoot}/moon-gate-front-alignment.jpg`,
            summary: "A sculptural stone threshold and seating sequence for Dickson's dining precinct.",
        },
        hero: {
            image: `${moonGateAssetRoot}/moon-gate-hero.jpg`,
            alt: "Polished black stone moon gate framing Woolley Street through a circular opening",
        },
        lead:
            "A polished stone threshold framing movement, reflection, and pause in Dickson's public realm.",
        details: {
            Client: "ACT Government",
            Stone: ["Angola Black", "New Grey"],
            Finish: ["Angola Black: Polished", "New Grey: Flamed"],
            Quantity: "5 bespoke stone elements",
            "Carbon Offset": "Yes",
            "Landscape Architect": "AECOM",
            Contractor: "Complex Co.",
            Date: "2023",
            Address: "Woolley Street, Dickson, ACT 2602",
        },
        projectStory: [
            {
                title: "Surface",
                body:
                    "Polished Angola Black gives the work a dark, reflective body. Trees, lanterns, paving, and passing movement appear across the stone surface, making the object change with the street.",
            },
            {
                title: "Void",
                body:
                    "The circular opening turns stone mass into a civic threshold. It frames the next view, slows the pedestrian sequence, and gives the plaza a quiet moment of arrival.",
            },
            {
                title: "Pause",
                body:
                    "Flamed New Grey seating lowers the register of the composition. The lighter, tactile stone gives people places to wait, meet, sit briefly, and occupy the edge of the work.",
            },
        ],
        scopeItems: [
            {
                title: "Designer material consultation",
                body:
                    "Urblo's project role is framed around material decision support: stone tone, finish contrast, tactile behavior, and how the black and grey elements work together in a civic setting.",
            },
            {
                title: "Custom stone element package",
                body:
                    "The scope presents a bespoke natural stone package for moon gate forms, seating pieces, and integrated public-realm elements rather than an off-the-shelf paving supply.",
            },
            {
                title: "Finish and detail coordination",
                body:
                    "Polished Angola Black and flamed New Grey are positioned as a deliberate finish pairing: reflective marker surfaces for identity, textured seating surfaces for everyday contact.",
            },
            {
                title: "Carbon offset project supply",
                body:
                    "The project is recorded as carbon offset, keeping sustainability visible without overstating performance claims beyond the confirmed project-level yes/no status.",
            },
        ],
        materialMap: {
            image: `${moonGateAssetRoot}/moon-gate-hero.jpg`,
            imageAlt: "Front view through the Moon Gate stone opening toward Woolley Street",
            intro:
                "Three readings hold the project together: a reflective surface, a cut-through void, and a quieter field of seating.",
            hotspots: [
                {
                    id: "angola-black-marker",
                    kind: "material",
                    x: 61,
                    y: 32,
                    title: "Surface",
                    label: "Polished Angola Black",
                    stoneName: "Angola Black",
                    stoneGroupId: "angola-black",
                    finish: "Polished",
                    application: "Moon gate body and reflective side faces",
                    body:
                        "The black polished surface carries the project's visual gravity. It reflects canopy, lanterns, paving, and passing activity rather than standing apart from the precinct.",
                    designerNote:
                        "A high-reflection finish can create civic presence, but it should be placed with care around glare, maintenance, and touch expectations.",
                    image: `${moonGateAssetRoot}/moon-gate-context-lanterns.jpg`,
                    imageAlt: "Polished black moon gate stone reflecting trees beneath red street lanterns",
                    ctaLabel: "View Angola Black",
                    ctaTo: "/stone-library/angola-black",
                },
                {
                    id: "circular-aperture",
                    kind: "detail",
                    x: 48,
                    y: 42,
                    title: "Void",
                    label: "Circular threshold",
                    stoneName: "Angola Black",
                    stoneGroupId: "angola-black",
                    finish: "Polished",
                    application: "Cut-through opening and view alignment",
                    body:
                        "The circular opening is the project's spatial act. It turns a stone block into a frame, drawing the eye through the street and giving the plaza a deliberate pause.",
                    designerNote:
                        "The mass matters, but the void makes it architectural.",
                    image: `${moonGateAssetRoot}/moon-gate-detail-arch-view.jpg`,
                    imageAlt: "View through the circular stone opening toward seating and trees",
                },
                {
                    id: "new-grey-seating",
                    kind: "material",
                    x: 57,
                    y: 80,
                    title: "Pause",
                    label: "Flamed New Grey",
                    stoneName: "New Grey",
                    stoneGroupId: "new-grey",
                    finish: "Flamed",
                    application: "Cylindrical seating pods and low public-realm elements",
                    body:
                        "New Grey brings the project down to hand and body scale. The flamed finish gives the seating elements a quieter tactility beside the polished moon gate.",
                    designerNote:
                        "This is where the marker becomes usable public realm.",
                    image: `${moonGateAssetRoot}/moon-gate-seating-close.jpg`,
                    imageAlt: "Close view of flamed New Grey cylindrical seating elements",
                    ctaLabel: "View New Grey",
                    ctaTo: "/stone-library/new-grey",
                },
            ],
        },
        materials: [
            {
                stoneGroupId: "angola-black",
                name: "Angola Black",
                finish: "Polished",
                application: "Moon gate marker forms",
                role:
                    "Reflective black stone used to create visual depth, strong civic identity, and a clear threshold in the streetscape.",
                image: `${moonGateAssetRoot}/moon-gate-context-lanterns.jpg`,
                imageAlt: "Polished Angola Black moon gate stone beneath red street lanterns",
            },
            {
                stoneGroupId: "new-grey",
                name: "New Grey",
                finish: "Flamed",
                application: "Seating pods and low elements",
                role:
                    "Light grey tactile stone used for everyday contact points, informal seating, and quieter public-realm rhythm.",
                image: `${moonGateAssetRoot}/moon-gate-seating-field.jpg`,
                imageAlt: "Flamed New Grey seating pods arranged around planting and paving",
            },
        ],
        gallery: [
            {
                src: `${moonGateAssetRoot}/moon-gate-landscape-threshold.jpg`,
                alt: "Moon gate stone elements set among trees and seating in Woolley Street",
                label: "Context",
                caption: "The moon gate reads through the tree canopy as a civic marker within the upgraded street.",
            },
            {
                src: `${moonGateAssetRoot}/moon-gate-front-alignment.jpg`,
                alt: "Front alignment through repeated circular moon gate openings",
                label: "Alignment",
                caption: "Repeated circular openings create framed views and a slower pedestrian sequence.",
            },
            {
                src: `${moonGateAssetRoot}/moon-gate-seating-close.jpg`,
                alt: "Close view of New Grey stone seating elements",
                label: "Tactility",
                caption: "Flamed New Grey brings a lower-sheen seating surface into the material palette.",
            },
            {
                src: `${moonGateAssetRoot}/moon-gate-seat-detail.jpg`,
                alt: "Close view of grey stone seat battens on a black polished stone base",
                label: "Detail",
                caption: "The seating interface makes the sculptural marker usable at everyday scale.",
            },
        ],
        cta: {
            title: "Designing a stone threshold, civic marker, or custom seating element?",
            body:
                "Use Moon Gate as a starting point for discussing stone tone, finish behavior, custom element scope, and carbon offset supply in an early-stage public realm project.",
            primaryLabel: "Discuss a similar project",
            primaryTo: "/contact",
            secondaryLabel: "Browse stone options",
            secondaryTo: "/stone-library",
        },
    }
];

export const projectListingMeta = projects.map((project) => ({
    slug: project.slug,
    title: project.listing.title,
    location: project.listing.location,
    date: project.listing.date,
    cover: project.listing.cover,
}));
