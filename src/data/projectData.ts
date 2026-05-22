export interface ProjectData {
    slug: string;
    name: string;
    images: string[];
    details: Record<string, string | string[]>;
    listing: ProjectListing;
    hero?: ProjectHero;
    lead?: string;
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

export interface ProjectHotspot {
    id: string;
    x: number;
    y: number;
    stoneGroupId: string;
    finishKey: string;
    application: string;
    note: string;
    image?: string;
    imageAlt?: string;
}

export interface ProjectMaterialMap {
    image: string;
    imageAlt: string;
    title: string;
    intro: string;
    hotspots: ProjectHotspot[];
}

export interface ProjectMaterial {
    stoneGroupId: string;
    finishKey: string;
    application: string;
    note: string;
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
const legacyProjectAssetRoot = '/media/launch/projects';

export const projects: ProjectData[] = [
    {
        slug: "australian-catholic-university",
        name: "Australian Catholic University",
        images: [
            `${legacyProjectAssetRoot}/australian-catholic-university/detail-1.jpg`,
            `${legacyProjectAssetRoot}/australian-catholic-university/detail-2.jpg`,
        ],
        listing: {
            title: "Australian Catholic University",
            location: "Victoria",
            date: "December 18, 2024",
            cover: "/media/launch/contact/project-contact.jpg",
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
            `${legacyProjectAssetRoot}/west-side-place/detail-1.jpg`,
            `${legacyProjectAssetRoot}/west-side-place/detail-2.jpg`,
        ],
        listing: {
            title: "West Side Place",
            location: "Victoria",
            date: "December 16, 2024",
            cover: `${legacyProjectAssetRoot}/west-side-place/cover.jpg`,
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
            `${legacyProjectAssetRoot}/xavier-college/detail-1.jpg`,
            `${legacyProjectAssetRoot}/xavier-college/detail-2.jpg`,
        ],
        listing: {
            title: "Xavier College",
            location: "Victoria",
            date: "December 15, 2024",
            cover: `${legacyProjectAssetRoot}/xavier-college/cover.jpg`,
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
            `${legacyProjectAssetRoot}/artisan-park-yarrabend/detail-1.jpg`,
            `${legacyProjectAssetRoot}/artisan-park-yarrabend/detail-2.png`,
        ],
        listing: {
            title: "Artisan Park | YarraBend",
            location: "Victoria",
            date: "December 14, 2024",
            cover: `${legacyProjectAssetRoot}/artisan-park-yarrabend/cover.png`,
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
        materialMap: {
            image: `${moonGateAssetRoot}/moon-gate-hero.jpg`,
            imageAlt: "Front view through the Moon Gate stone opening toward Woolley Street",
            title: "Stone and finish placement",
            intro:
                "Tap the project photograph to see where each stone and finish appears in the built work.",
            hotspots: [
                {
                    id: "angola-black-marker",
                    x: 61,
                    y: 32,
                    stoneGroupId: "angola-black",
                    finishKey: "polished",
                    application: "Moon gate body and reflective side faces",
                    note:
                        "Polished Angola Black gives the threshold its dark civic presence and reflects canopy, lanterns, paving, and passing movement.",
                    image: `${moonGateAssetRoot}/moon-gate-context-lanterns.jpg`,
                    imageAlt: "Polished black moon gate stone reflecting trees beneath red street lanterns",
                },
                {
                    id: "new-grey-seating",
                    x: 57,
                    y: 80,
                    stoneGroupId: "new-grey",
                    finishKey: "flamed",
                    application: "Cylindrical seating pods and low public-realm elements",
                    note:
                        "Flamed New Grey lowers the register of the composition at body-contact points, adding tactile grip and a quieter seating rhythm.",
                    image: `${moonGateAssetRoot}/moon-gate-seating-close.jpg`,
                    imageAlt: "Close view of flamed New Grey cylindrical seating elements",
                },
            ],
        },
        materials: [
            {
                stoneGroupId: "angola-black",
                finishKey: "polished",
                application: "Moon gate marker forms",
                note:
                    "Reflective black stone used to create visual depth, strong civic identity, and a clear threshold in the streetscape.",
                image: `${moonGateAssetRoot}/moon-gate-context-lanterns.jpg`,
                imageAlt: "Polished Angola Black moon gate stone beneath red street lanterns",
            },
            {
                stoneGroupId: "new-grey",
                finishKey: "flamed",
                application: "Seating pods and low elements",
                note:
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
