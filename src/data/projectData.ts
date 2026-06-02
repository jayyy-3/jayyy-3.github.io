export interface ProjectData {
    slug: string;
    name: string;
    images: string[];
    details: Record<string, string | string[]>;
    listing: ProjectListing;
    hero?: ProjectHero;
    lead?: string;
    story?: string[];
    materialMap?: ProjectMaterialMap;
    mediaBlocks?: ProjectMediaBlock[];
    materials?: ProjectMaterial[];
    gallery?: ProjectGalleryImage[];
    cta?: ProjectCta;
}

export interface ProjectListing {
    title: string;
    location: string;
    state: string;
    date: string;
    year: string;
    sector: string;
    category: string;
    cover: string;
    imageAlt?: string;
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
    title?: string;
    description?: string;
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

export type ProjectMediaBlock =
    | ProjectNormalImageBlock
    | ProjectHotspotImageBlock
    | ProjectYoutubeVideoBlock;

export interface ProjectNormalImageBlock {
    id: string;
    type: 'normal_image';
    src: string;
    alt: string;
    title?: string;
    label?: string;
    caption?: string;
}

export interface ProjectHotspotImageBlock {
    id: string;
    type: 'hotspot_image';
    image: string;
    imageAlt: string;
    title: string;
    intro?: string;
    caption?: string;
    hotspots: ProjectHotspot[];
}

export interface ProjectYoutubeVideoBlock {
    id: string;
    type: 'youtube_video';
    youtubeId: string;
    title: string;
    caption?: string;
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
        slug: 'australian-catholic-university',
        name: 'Australian Catholic University',
        images: [
            `${legacyProjectAssetRoot}/australian-catholic-university/detail-1.jpg`,
            `${legacyProjectAssetRoot}/australian-catholic-university/detail-2.jpg`,
        ],
        listing: {
            title: 'Australian Catholic University',
            location: 'Fitzroy VIC',
            state: 'VIC',
            date: 'May 2023',
            year: '2023',
            sector: 'Education',
            category: 'Institutional landscape',
            cover: '/media/launch/contact/project-contact.jpg',
            imageAlt: 'Bluestone seating and paving in an institutional landscape setting',
            summary:
                'Bluestone elements for a high-use campus landscape, coordinated with the project team for a calm civic edge.',
        },
        lead:
            'A compact bluestone seating and landscape package for a busy institutional public realm.',
        story: [
            'The ACU project is a small but precise example of stone doing practical work in a daily civic setting: forming edges, seats, and pause points without dominating the campus landscape.',
            'The record is intentionally fact-led for now. It captures the confirmed stone, finish, quantity, project team, and site address so future admin updates can add more narrative once the client team approves it.',
        ],
        details: {
            Stone: 'Bluestone',
            Finish: 'Sawn',
            Quantity: '17 linear metres',
            'Carbon Offset': 'Not available',
            'Landscape Architect': 'Aspect Studio',
            Contractor: 'Living Landscapes',
            Date: 'May 2023 (completed)',
            Address: '115B Victoria Parade, Fitzroy, VIC 3065',
        },
        mediaBlocks: [
            {
                id: 'acu-detail-1',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/australian-catholic-university/detail-1.jpg`,
                alt: 'Australian Catholic University bluestone landscape detail',
                label: 'Built detail',
                caption: 'Sawn bluestone used as a restrained public-realm edge in a high-use education setting.',
            },
            {
                id: 'acu-detail-2',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/australian-catholic-university/detail-2.jpg`,
                alt: 'Australian Catholic University stone seating and paving context',
                label: 'Site context',
                caption: 'The stone package is scaled to support movement and pause without visual clutter.',
            },
        ],
    },
    {
        slug: 'west-side-place',
        name: 'West Side Place',
        images: [
            `${legacyProjectAssetRoot}/west-side-place/detail-1.jpg`,
            `${legacyProjectAssetRoot}/west-side-place/detail-2.jpg`,
        ],
        listing: {
            title: 'West Side Place',
            location: 'Melbourne VIC',
            state: 'VIC',
            date: '2023',
            year: '2023',
            sector: 'Commercial',
            category: 'High-rise plaza and public realm',
            cover: `${legacyProjectAssetRoot}/west-side-place/cover.jpg`,
            imageAlt: 'West Side Place public realm with stone seating and planting edges',
            summary:
                'A high-volume stone package across a dense city precinct, balancing tonal variation, finish mix, and delivery scale.',
        },
        lead:
            'A large-format stone package for a city precinct where quantity, finish coordination, and site rhythm all matter.',
        story: [
            'West Side Place shows Urblo working at precinct scale: multiple stone tones, multiple finishes, and hundreds of linear metres brought into one public-realm language.',
            'The value of the record is the delivery pattern. Stone selection, finish behavior, and installation coordination had to be resolved across a dense Melbourne address rather than treated as isolated decorative elements.',
        ],
        details: {
            Stone: [
                'Bluestone (various tones)',
                'Granite (various tones)',
            ],
            Finish: 'Sawn · Split · Polished · Flamed',
            Quantity: '500 linear metres',
            'Carbon Offset': 'Not available',
            'Landscape Architect': 'Rush Wright Associates',
            Contractor: 'Not available',
            Date: '2023 (completed)',
            Address: '250 Spencer St, Melbourne, VIC 3000',
        },
        mediaBlocks: [
            {
                id: 'west-side-place-cover',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/west-side-place/cover.jpg`,
                alt: 'West Side Place plaza stone works in an urban public realm',
                label: 'Precinct scale',
                caption: 'Stone elements work as repeated civic infrastructure across the public realm.',
            },
            {
                id: 'west-side-place-detail-1',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/west-side-place/detail-1.jpg`,
                alt: 'West Side Place stone detail and planting interface',
                label: 'Finish coordination',
                caption: 'A mix of stone tones and finishes supports the precinct hierarchy.',
            },
            {
                id: 'west-side-place-detail-2',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/west-side-place/detail-2.jpg`,
                alt: 'West Side Place stone seating and paving detail',
                label: 'Built interface',
                caption: 'The package balances seating, edge, paving, and planting conditions.',
            },
        ],
    },
    {
        slug: 'xavier-college',
        name: 'Xavier College',
        images: [
            `${legacyProjectAssetRoot}/xavier-college/detail-1.jpg`,
            `${legacyProjectAssetRoot}/xavier-college/detail-2.jpg`,
        ],
        listing: {
            title: 'Xavier College',
            location: 'Kew VIC',
            state: 'VIC',
            date: '2023',
            year: '2023',
            sector: 'Education',
            category: 'Education and heritage landscape',
            cover: `${legacyProjectAssetRoot}/xavier-college/cover.jpg`,
            imageAlt: 'Sandstone landscape detailing at Xavier College',
            summary:
                'Warm sandstone detailing for an education setting, supporting a quieter heritage landscape register.',
        },
        lead:
            'Sandstone detailing for an education landscape where tone, texture, and campus character needed to stay measured.',
        story: [
            'Xavier College is carried by material restraint. Sandstone and sparrow-peck finish create a warmer register than the darker civic stones used elsewhere in the portfolio.',
            'The project record keeps the confirmed delivery facts close to the photography so designers can assess the relationship between finish, institutional context, and landscape edge conditions.',
        ],
        details: {
            Stone: 'Sandstone',
            Finish: 'Sparrow Peck',
            Quantity: '12 linear metres',
            'Carbon Offset': 'Not available',
            'Landscape Architect': 'Openwork Pty Ltd',
            Contractor: 'Delta Group',
            Date: '2023 (completed)',
            Address: '135 Barkers Rd, Kew, VIC 3101',
        },
        mediaBlocks: [
            {
                id: 'xavier-cover',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/xavier-college/cover.jpg`,
                alt: 'Xavier College sandstone landscape context',
                label: 'Campus context',
                caption: 'Sandstone introduces a warmer, quieter stone language for the education landscape.',
            },
            {
                id: 'xavier-detail-1',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/xavier-college/detail-1.jpg`,
                alt: 'Xavier College sandstone detail in the landscape',
                label: 'Material tone',
                caption: 'The finish reads as tactile rather than glossy, supporting everyday campus use.',
            },
            {
                id: 'xavier-detail-2',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/xavier-college/detail-2.jpg`,
                alt: 'Xavier College sandstone edge and paving detail',
                label: 'Built edge',
                caption: 'Stone is used as a quiet edge condition rather than a decorative feature.',
            },
        ],
    },
    {
        slug: 'artisan-park-yarrabend',
        name: 'Artisan Park | YarraBend',
        images: [
            `${legacyProjectAssetRoot}/artisan-park-yarrabend/detail-1.jpg`,
            `${legacyProjectAssetRoot}/artisan-park-yarrabend/detail-2.png`,
        ],
        listing: {
            title: 'Artisan Park | YarraBend',
            location: 'Alphington VIC',
            state: 'VIC',
            date: 'April 2024',
            year: '2024',
            sector: 'Public realm',
            category: 'Urban community park',
            cover: `${legacyProjectAssetRoot}/artisan-park-yarrabend/cover.png`,
            imageAlt: 'Artisan Park stone blocks integrated with planting and public seating',
            summary:
                'Flamed New Grey blocks for a community park where landscape seating, scale, and carbon-offset scope were part of the brief.',
        },
        lead:
            'A carbon-offset stone package for a community park, using flamed New Grey across seating and landscape elements.',
        story: [
            'Artisan Park demonstrates how a single stone and finish can support a clear public-realm rhythm. The material language is robust, repeatable, and quiet enough to sit inside a community park rather than overpower it.',
            'The project is also useful as a carbon-offset proof point in the current portfolio. The record separates that confirmed project fact from broader sustainability claims that still need project-by-project scope.',
        ],
        details: {
            Stone: 'New Grey',
            Finish: 'Flamed',
            Quantity: '115 linear metres',
            'Carbon Offset': 'Yes',
            'Landscape Architect': 'Aspect Studio',
            Contractor: 'Living Landscapes',
            Date: 'April 2024 (completed)',
            Address: '55 Parkview Rd, Alphington, VIC 3078',
        },
        mediaBlocks: [
            {
                id: 'artisan-cover',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/artisan-park-yarrabend/cover.png`,
                alt: 'Artisan Park stone blocks and landscape planting',
                label: 'Park sequence',
                caption: 'Flamed New Grey provides a repeated stone language through the community park.',
            },
            {
                id: 'artisan-detail-1',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/artisan-park-yarrabend/detail-1.jpg`,
                alt: 'Artisan Park New Grey stone block detail',
                label: 'Tactile finish',
                caption: 'The flamed finish supports grip and a lower-sheen civic surface.',
            },
            {
                id: 'artisan-detail-2',
                type: 'normal_image',
                src: `${legacyProjectAssetRoot}/artisan-park-yarrabend/detail-2.png`,
                alt: 'Artisan Park stone seating and planting detail',
                label: 'Landscape interface',
                caption: 'Stone elements are sized as usable landscape infrastructure, not isolated objects.',
            },
        ],
    },
    {
        slug: 'moon-gate-woolley-street',
        name: 'Moon Gate | Woolley Street',
        images: [
            `${moonGateAssetRoot}/moon-gate-hero.jpg`,
            `${moonGateAssetRoot}/moon-gate-seat-detail.jpg`,
        ],
        listing: {
            title: 'Moon Gate | Woolley Street',
            location: 'Dickson ACT',
            state: 'ACT',
            date: '2023',
            year: '2023',
            sector: 'Civic landscape',
            category: 'Urban sculpture and public realm',
            cover: `${moonGateAssetRoot}/moon-gate-front-alignment.jpg`,
            imageAlt: 'Front alignment through repeated circular moon gate stone openings',
            summary: "A sculptural stone threshold and seating sequence for Dickson's dining precinct.",
        },
        hero: {
            image: `${moonGateAssetRoot}/moon-gate-hero.jpg`,
            alt: 'Polished black stone moon gate framing Woolley Street through a circular opening',
        },
        lead:
            "A polished stone threshold framing movement, reflection, and pause in Dickson's public realm.",
        story: [
            'Moon Gate is the strongest current project record because it links design intent, stone selection, finish behavior, custom fabrication, and public-realm use in one inspectable case study.',
            'Polished Angola Black gives the threshold its civic presence, while flamed New Grey lowers the composition into everyday seating and body-contact surfaces. The material map keeps those roles visible instead of leaving them as gallery interpretation.',
        ],
        details: {
            Client: 'ACT Government',
            Stone: ['Angola Black', 'New Grey'],
            Finish: ['Angola Black: Polished', 'New Grey: Flamed'],
            Quantity: '5 bespoke stone elements',
            'Carbon Offset': 'Yes',
            'Landscape Architect': 'AECOM',
            Contractor: 'Complex Co.',
            Date: '2023',
            Address: 'Woolley Street, Dickson, ACT 2602',
        },
        materialMap: {
            image: `${moonGateAssetRoot}/moon-gate-hero.jpg`,
            imageAlt: 'Front view through the Moon Gate stone opening toward Woolley Street',
            title: 'Stone and finish placement',
            intro:
                'Tap the project photograph to see where each stone and finish appears in the built work.',
            hotspots: [
                {
                    id: 'angola-black-marker',
                    x: 61,
                    y: 32,
                    title: 'Polished civic marker',
                    description:
                        'Dark reflective stone gives the threshold its landmark quality and picks up trees, lanterns, paving, and movement.',
                    stoneGroupId: 'angola-black',
                    finishKey: 'polished',
                    application: 'Moon gate body and reflective side faces',
                    note:
                        'Polished Angola Black gives the threshold its dark civic presence and reflects canopy, lanterns, paving, and passing movement.',
                    image: `${moonGateAssetRoot}/moon-gate-context-lanterns.jpg`,
                    imageAlt: 'Polished black moon gate stone reflecting trees beneath red street lanterns',
                },
                {
                    id: 'new-grey-seating',
                    x: 57,
                    y: 80,
                    title: 'Flamed seating elements',
                    description:
                        'Light grey tactile stone lowers the project to everyday use, grip, and informal seating.',
                    stoneGroupId: 'new-grey',
                    finishKey: 'flamed',
                    application: 'Cylindrical seating pods and low public-realm elements',
                    note:
                        'Flamed New Grey lowers the register of the composition at body-contact points, adding tactile grip and a quieter seating rhythm.',
                    image: `${moonGateAssetRoot}/moon-gate-seating-close.jpg`,
                    imageAlt: 'Close view of flamed New Grey cylindrical seating elements',
                },
            ],
        },
        mediaBlocks: [
            {
                id: 'moon-gate-threshold',
                type: 'normal_image',
                src: `${moonGateAssetRoot}/moon-gate-landscape-threshold.jpg`,
                alt: 'Moon gate stone elements set among trees and seating in Woolley Street',
                label: 'Context',
                caption: 'The moon gate reads through the tree canopy as a civic marker within the upgraded street.',
            },
            {
                id: 'moon-gate-material-map',
                type: 'hotspot_image',
                image: `${moonGateAssetRoot}/moon-gate-hero.jpg`,
                imageAlt: 'Front view through the Moon Gate stone opening toward Woolley Street',
                title: 'Stone and finish placement',
                intro:
                    'Tap the project photograph to see where each stone and finish appears in the built work.',
                caption: 'Hotspots identify confirmed stone, finish, and application rather than generic visual notes.',
                hotspots: [
                    {
                        id: 'angola-black-marker',
                        x: 61,
                        y: 32,
                        title: 'Polished civic marker',
                        description:
                            'Dark reflective stone gives the threshold its landmark quality and picks up trees, lanterns, paving, and movement.',
                        stoneGroupId: 'angola-black',
                        finishKey: 'polished',
                        application: 'Moon gate body and reflective side faces',
                        note:
                            'Polished Angola Black gives the threshold its dark civic presence and reflects canopy, lanterns, paving, and passing movement.',
                        image: `${moonGateAssetRoot}/moon-gate-context-lanterns.jpg`,
                        imageAlt: 'Polished black moon gate stone reflecting trees beneath red street lanterns',
                    },
                    {
                        id: 'new-grey-seating',
                        x: 57,
                        y: 80,
                        title: 'Flamed seating elements',
                        description:
                            'Light grey tactile stone lowers the project to everyday use, grip, and informal seating.',
                        stoneGroupId: 'new-grey',
                        finishKey: 'flamed',
                        application: 'Cylindrical seating pods and low public-realm elements',
                        note:
                            'Flamed New Grey lowers the register of the composition at body-contact points, adding tactile grip and a quieter seating rhythm.',
                        image: `${moonGateAssetRoot}/moon-gate-seating-close.jpg`,
                        imageAlt: 'Close view of flamed New Grey cylindrical seating elements',
                    },
                ],
            },
            {
                id: 'moon-gate-front-alignment',
                type: 'normal_image',
                src: `${moonGateAssetRoot}/moon-gate-front-alignment.jpg`,
                alt: 'Front alignment through repeated circular moon gate openings',
                label: 'Alignment',
                caption: 'Repeated circular openings create framed views and a slower pedestrian sequence.',
            },
            {
                id: 'moon-gate-seat-detail',
                type: 'normal_image',
                src: `${moonGateAssetRoot}/moon-gate-seat-detail.jpg`,
                alt: 'Close view of grey stone seat battens on a black polished stone base',
                label: 'Detail',
                caption: 'The seating interface makes the sculptural marker usable at everyday scale.',
            },
        ],
        materials: [
            {
                stoneGroupId: 'angola-black',
                finishKey: 'polished',
                application: 'Moon gate marker forms',
                note:
                    'Reflective black stone used to create visual depth, strong civic identity, and a clear threshold in the streetscape.',
                image: `${moonGateAssetRoot}/moon-gate-context-lanterns.jpg`,
                imageAlt: 'Polished Angola Black moon gate stone beneath red street lanterns',
            },
            {
                stoneGroupId: 'new-grey',
                finishKey: 'flamed',
                application: 'Seating pods and low elements',
                note:
                    'Light grey tactile stone used for everyday contact points, informal seating, and quieter public-realm rhythm.',
                image: `${moonGateAssetRoot}/moon-gate-seating-field.jpg`,
                imageAlt: 'Flamed New Grey seating pods arranged around planting and paving',
            },
        ],
        gallery: [
            {
                src: `${moonGateAssetRoot}/moon-gate-landscape-threshold.jpg`,
                alt: 'Moon gate stone elements set among trees and seating in Woolley Street',
                label: 'Context',
                caption: 'The moon gate reads through the tree canopy as a civic marker within the upgraded street.',
            },
            {
                src: `${moonGateAssetRoot}/moon-gate-front-alignment.jpg`,
                alt: 'Front alignment through repeated circular moon gate openings',
                label: 'Alignment',
                caption: 'Repeated circular openings create framed views and a slower pedestrian sequence.',
            },
            {
                src: `${moonGateAssetRoot}/moon-gate-seating-close.jpg`,
                alt: 'Close view of New Grey stone seating elements',
                label: 'Tactility',
                caption: 'Flamed New Grey brings a lower-sheen seating surface into the material palette.',
            },
            {
                src: `${moonGateAssetRoot}/moon-gate-seat-detail.jpg`,
                alt: 'Close view of grey stone seat battens on a black polished stone base',
                label: 'Detail',
                caption: 'The seating interface makes the sculptural marker usable at everyday scale.',
            },
        ],
        cta: {
            title: 'Designing a stone threshold, civic marker, or custom seating element?',
            body:
                'Use Moon Gate as a starting point for discussing stone tone, finish behavior, custom element scope, and carbon offset supply in an early-stage public realm project.',
            primaryLabel: 'Discuss a similar project',
            primaryTo: '/contact',
            secondaryLabel: 'Browse stone options',
            secondaryTo: '/stone-library',
        },
    },
];

export const projectListingMeta = projects.map((project) => ({
    slug: project.slug,
    title: project.listing.title,
    location: project.listing.location,
    date: project.listing.date,
    cover: project.listing.cover,
    sector: project.listing.sector,
    state: project.listing.state,
    year: project.listing.year,
    category: project.listing.category,
    summary: project.listing.summary,
}));
