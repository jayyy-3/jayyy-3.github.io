export interface HomepageNavLink {
  label: string;
  to?: string;
  href?: string;
  external?: boolean;
}

export interface HomepageMetric {
  value: string;
  label: string;
}

export interface HomepageProject {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
}

export interface HomepageStoneCard {
  index: string;
  title: string;
  finish?: string;
  image: string;
}

export interface HomepageProductCategory {
  index: string;
  title: string;
  body: string;
}

export interface HomepageLogo {
  alt: string;
  image: string;
}

export type HomepageFeaturePanelId =
  | 'sustainability'
  | 'installation'
  | 'cost-saving'
  | 'design-collaboration';

export interface HomepageFeatureTab {
  id: HomepageFeaturePanelId;
  title: string;
}

export interface HomepageInstallationStep {
  id: string;
  index: string;
  label: string;
  title: string;
  image: string;
}

export interface HomepageCostComparisonRow {
  label: string;
  leftPercentage: number;
  rightPercentage: number;
}

export type HomepageCollaborationCardIcon =
  | 'product-development'
  | 'cost-control'
  | 'specification'
  | 'off-site'
  | 'installation';

export interface HomepageCollaborationCard {
  index: string;
  title: string;
  variant: 'dark' | 'light';
  image?: string;
  icon?: HomepageCollaborationCardIcon;
}

export const homepageNavLinks: HomepageNavLink[] = [
  { label: 'Product', to: '/products' },
  { label: 'Project', to: '/projects' },
  { label: 'Our Story', to: '/our-story' },
  {
    label: 'Sample Request',
    href: 'mailto:info@urblo.com.au?subject=Sample%20Request',
    external: true,
  },
  {
    label: 'Contact Us',
    href: 'mailto:info@urblo.com.au?subject=Contact%20Us',
    external: true,
  },
];

export const homepageSocialLinks: HomepageNavLink[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/urb.lo?igsh=MThyZ3g1NnoyMXc0cg%3D%3D&utm_source=qr',
    external: true,
  },
  { label: 'LinkedIn', href: 'https://au.linkedin.com/company/urblo', external: true },
];

export const homepageData = {
  brandStatement: 'devoted to supporting ethical and significant projects every step of the way.',
  logoUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/logo.png',
  hero: {
    videoUrl: 'https://urblo.com.au/wp-content/uploads/stream/video.php/urblo.mp4',
    posterUrl: 'https://urblo.com.au/wp-content/uploads/revslider/video-media/urblo_1.jpeg',
    eyebrow: 'A trusted partner for your next streetscapes & civil landscape project.',
  },
  sustainability: {
    footprintUrl: 'https://urblo.com.au/wp-content/uploads/2025/01/co2-footprint.png',
    tabs: [
      { id: 'sustainability', title: 'Sustainability' },
      { id: 'installation', title: 'Streamline Installation' },
      { id: 'cost-saving', title: 'Cost Saving' },
      { id: 'design-collaboration', title: 'Design Collaboration' },
    ] satisfies HomepageFeatureTab[],
    paragraphs: [
      'Urblo supports long-term sustainability through a **carbon-neutral option for eligible projects**. The offer is designed around life-cycle offset accounting, including production, ocean freight, local freight, and end-of-life crushing or reuse assumptions where they are confirmed for the project.',
      'We work to reduce unnecessary material waste, support responsible quarry restoration, and help project teams compare natural stone systems with conventional alternatives. Our goal is not just to supply stone blocks but to **build a future** where public-realm materials are selected with evidence and care.',
    ],
    installation: {
      duration: 'Typically 2-3 weeks',
      steps: [
        {
          id: 'step_0',
          index: '01',
          label: 'First step',
          title: 'Off-site pre-Assembly',
          image: 'https://urblo.com.au/wp-content/uploads/2024/12/step1-scaled.jpg',
        },
        {
          id: 'step_1',
          index: '02',
          label: 'Second step',
          title: 'Delivery to site',
          image: 'https://urblo.com.au/wp-content/uploads/2024/12/step2.jpg',
        },
        {
          id: 'step_2',
          index: '03',
          label: 'Third step',
          title: 'Sling & Place',
          image: 'https://urblo.com.au/wp-content/uploads/2024/12/step3-scaled.jpg',
        },
      ] satisfies HomepageInstallationStep[],
    },
    costSaving: {
      leftTitle: 'Concrete',
      rightTitle: 'Stone',
      leftImage: 'https://urblo.com.au/wp-content/uploads/2024/12/concrete.jpeg',
      rightImage: 'https://urblo.com.au/wp-content/uploads/2024/12/stone.jpeg',
      note: 'This is a comparison of total cost between insitu concrete and customized stone solution in general circumstances. In regards of special circumstances, please refer to additional documents.',
      rows: [
        { label: 'Preparation cost', leftPercentage: 30, rightPercentage: 25 },
        { label: 'Material cost', leftPercentage: 35, rightPercentage: 60 },
        { label: 'Labour cost', leftPercentage: 70, rightPercentage: 30 },
        { label: 'Problem solving', leftPercentage: 35, rightPercentage: 5 },
        { label: 'Maintenance cost', leftPercentage: 30, rightPercentage: 6 },
        { label: 'Total', leftPercentage: 100, rightPercentage: 55 },
      ] satisfies HomepageCostComparisonRow[],
    },
    designCollaboration: {
      cards: [
        {
          index: '01',
          title: 'Sketch & concept design',
          variant: 'dark',
          image: 'https://urblo.com.au/wp-content/uploads/2024/12/sketch-concept-design.jpeg',
        },
        {
          index: '02',
          title: 'Product development',
          variant: 'light',
          icon: 'product-development',
        },
        {
          index: '03',
          title: 'Engineering design',
          variant: 'dark',
          image: 'https://urblo.com.au/wp-content/uploads/2024/12/engineering-design.jpeg',
        },
        {
          index: '04',
          title: 'Cost control & budgeting',
          variant: 'light',
          icon: 'cost-control',
        },
        {
          index: '05',
          title: 'Specification',
          variant: 'light',
          icon: 'specification',
        },
        {
          index: '06',
          title: 'Shop drawing',
          variant: 'dark',
          image: 'https://urblo.com.au/wp-content/uploads/2024/12/shop-drawing.jpeg',
        },
        {
          index: '07',
          title: 'Off site pre-assembly',
          variant: 'light',
          icon: 'off-site',
        },
        {
          index: '08',
          title: 'Manufacture',
          variant: 'dark',
          image: 'https://urblo.com.au/wp-content/uploads/2024/12/manufacture.jpeg',
        },
        {
          index: '09',
          title: 'Installation',
          variant: 'light',
          icon: 'installation',
        },
      ] satisfies HomepageCollaborationCard[],
    },
  },
  partnerBanner: {
    image: 'https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg',
    text: 'A trusted partner for your next streetscapes & civil landscape project.',
  },
  productShowcase: {
    title: 'Explore our latest products',
    intro:
      'Urblo was conceived as a response to the growing demand for better and greener alternatives to concrete seats / planters.',
    backgroundImage:
      'https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2.jpg',
    categories: [
      {
        index: '01',
        title: 'Seat',
        body: 'Freestanding stone seats ...',
      },
      {
        index: '02',
        title: 'Bollard',
        body: 'Natural stone bollards in any shape...',
      },
      {
        index: '03',
        title: 'Planter',
        body: 'Retaining wall blocks in solid natural stone ...',
      },
      {
        index: '04',
        title: 'Sculpture',
        body: 'Natural stone sculpture in any size ...',
      },
      {
        index: '05',
        title: 'Engraved Stone Inlays',
        body: 'Engraving on any of our stone street furnitures...',
      },
    ] satisfies HomepageProductCategory[],
  },
  metricsIntro: 'There’s a team always ready to assist you on your next project.',
  metrics: [
    { value: '30', label: 'Indoor / outdoor projects' },
    { value: '430+', label: 'Clients' },
    { value: '80+', label: 'Tonnes of CO2e tracked for offsetting' },
    { value: '18', label: 'No of helped landscape architects' },
  ] satisfies HomepageMetric[],
  latestProjects: {
    title: 'Latest Projects',
    intro:
      'Urblo is a stone supplier specialized in streetscapes & civil landscape while respecting the people and environment.',
    featured: {
      slug: 'artisan-park-yarrabend',
      title: 'Artisan Park',
      excerpt:
        'Deakin University student accomodation was organised back in July 2016 with a focus on practical, durable, and design-led streetscape outcomes.',
      image: 'https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2-1024x657.jpg',
    } satisfies HomepageProject,
    gallery: [
      {
        slug: 'australian-catholic-university',
        title: 'Australian Catholic University',
        excerpt: 'Precision-built bluestone seating with calm civic character.',
        image: 'https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg',
      },
      {
        slug: 'moon-gate-woolley-street',
        title: 'Moon Gate',
        excerpt: 'Polished stone sculptural forms for a landmark arrival.',
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/Moon-Garden-4-Web-Sized-Matthew-Sherren-Photography.jpg',
      },
      {
        slug: 'west-side-place',
        title: 'West Side Place',
        excerpt: 'Large-scale stone deployment across a dense urban precinct.',
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.30.57-scaled.jpeg',
      },
      {
        slug: 'xavier-college',
        title: 'Xavier College',
        excerpt: 'Warm sandstone detailing for an educational landscape.',
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-16.00.24-scaled.jpeg',
      },
    ] satisfies HomepageProject[],
  },
  stoneShowcase: {
    title: 'Browse by stone type',
    intro:
      'Urblo offers project-based design collaboration consultation service to professionals like architects and designers no matter which designing stage you are in.',
    cards: [
      {
        index: '01',
        title: 'Antline',
        finish: 'Sawn',
        image: 'https://urblo.com.au/wp-content/uploads/2024/12/Antline-scaled-1.jpg',
      },
      {
        index: '02',
        title: 'Zen Grey',
        image: 'https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1-1.jpg',
      },
      {
        index: '03',
        title: 'Ash Grey',
        finish: 'Flamed',
        image: 'https://urblo.com.au/wp-content/uploads/2024/12/Ash-Grey-1.jpg',
      },
      {
        index: '04',
        title: 'Ken Black',
        finish: 'Flamed',
        image: 'https://urblo.com.au/wp-content/uploads/2024/12/Ken-Black-1.jpg',
      },
    ] satisfies HomepageStoneCard[],
    sampleCta:
      'mailto:info@urblo.com.au?subject=Sample%20Request&body=Hi%20Urblo%2C%20I%20would%20like%20to%20request%20stone%20samples.',
  },
  manifesto: {
    backgroundImage:
      'https://urblo.com.au/wp-content/uploads/2025/01/WhatsApp-Image-2024-12-18-at-13.19.23-scaled-1.png',
    image:
      'https://urblo.com.au/wp-content/uploads/2025/01/stone-block-design-scaled-1.jpg',
    supportingText:
      'At Urblo, we believe in the transformative power of stone to shape urban environments.',
    lines: ['Natural', 'Stone', 'Blocks', 'design'],
  },
  logoCarousel: [
    {
      alt: 'Delta',
      image: 'https://urblo.com.au/wp-content/uploads/2024/12/logo1-1.png',
    },
    {
      alt: 'Aspect Studios',
      image: 'https://urblo.com.au/wp-content/uploads/2024/12/ASPECTStudios_logo-1.png',
    },
    {
      alt: 'Wamara',
      image: 'https://urblo.com.au/wp-content/uploads/2024/12/logo-1.png',
    },
    {
      alt: 'Symal logo',
      image: 'https://urblo.com.au/wp-content/uploads/2024/12/symal-logo.D2MsYZMB_ZxdUqU-1.png',
    },
  ] satisfies HomepageLogo[],
  videoCta: {
    backgroundImage:
      'https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.47.49.jpeg',
    videoUrl: 'https://urblo.com.au/wp-content/uploads/stream/video.php/urblo.mp4',
  },
  footer: {
    address: ['5 Hamilton St,', 'Oakleigh VIC 3166'],
    email: 'info@urblo.com.au',
    phone: '1300 1URBLO',
    copyright: '© Copyright 2024',
  },
} as const;
