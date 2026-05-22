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
  logoUrl: '/media/launch/identity/urblo-logo.png',
  hero: {
    videoUrl: '/media/launch/home/urblo-hero.mp4',
    posterUrl: '/media/launch/home/hero-poster.jpg',
    eyebrow: 'A trusted partner for your next streetscapes & civil landscape project.',
  },
  sustainability: {
    footprintUrl: '/media/launch/homepage/co2-footprint.png',
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
          image: '/media/launch/homepage/installation-step-1.jpg',
        },
        {
          id: 'step_1',
          index: '02',
          label: 'Second step',
          title: 'Delivery to site',
          image: '/media/launch/homepage/installation-step-2.jpg',
        },
        {
          id: 'step_2',
          index: '03',
          label: 'Third step',
          title: 'Sling & Place',
          image: '/media/launch/homepage/installation-step-3.jpg',
        },
      ] satisfies HomepageInstallationStep[],
    },
    costSaving: {
      leftTitle: 'Concrete',
      rightTitle: 'Stone',
      leftImage: '/media/launch/homepage/cost-concrete.jpg',
      rightImage: '/media/launch/homepage/cost-stone.jpg',
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
          image: '/media/launch/homepage/collab-sketch-concept-design.jpg',
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
          image: '/media/launch/homepage/collab-engineering-design.jpg',
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
          image: '/media/launch/homepage/collab-shop-drawing.jpg',
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
          image: '/media/launch/homepage/collab-manufacture.jpg',
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
    image: '/media/launch/contact/project-contact.jpg',
    text: 'A trusted partner for your next streetscapes & civil landscape project.',
  },
  productShowcase: {
    title: 'Explore our latest products',
    intro:
      'Urblo was conceived as a response to the growing demand for better, greener alternatives to concrete seating, planters, and civic landscape elements.',
    backgroundImage: '/media/launch/homepage/product-showcase-bg.jpg',
    categories: [
      {
        index: '01',
        title: 'Seat',
        body: 'Freestanding stone seats for durable public realm settings.',
      },
      {
        index: '02',
        title: 'Bollard',
        body: 'Natural stone bollards shaped for civic boundaries and entries.',
      },
      {
        index: '03',
        title: 'Planter',
        body: 'Solid natural stone planters for long-life planting schemes.',
      },
      {
        index: '04',
        title: 'Sculpture',
        body: 'Custom stone sculptural elements for landmark public spaces.',
      },
      {
        index: '05',
        title: 'Engraved Stone Inlays',
        body: 'Engraving across stone street furniture and inlay details.',
      },
    ] satisfies HomepageProductCategory[],
  },
  metricsIntro: 'There’s a team always ready to assist you on your next project.',
  metrics: [
    { value: '30', label: 'Indoor / outdoor projects' },
    { value: '430+', label: 'Clients' },
    { value: '80+', label: 'Tonnes of CO2e tracked for offsetting' },
    { value: '18', label: 'Landscape architects supported' },
  ] satisfies HomepageMetric[],
  latestProjects: {
    title: 'Latest Projects',
    intro:
      'Urblo is a stone supplier specialized in streetscapes & civil landscape while respecting the people and environment.',
    featured: {
      slug: 'artisan-park-yarrabend',
      title: 'Artisan Park',
      excerpt:
        'Deakin University student accommodation was organised back in July 2016 with a focus on practical, durable, and design-led streetscape outcomes.',
      image: '/media/launch/homepage/project-artisan-park.jpg',
    } satisfies HomepageProject,
    gallery: [
      {
        slug: 'australian-catholic-university',
        title: 'Australian Catholic University',
        excerpt: 'Precision-built bluestone seating with calm civic character.',
        image: '/media/launch/contact/project-contact.jpg',
      },
      {
        slug: 'moon-gate-woolley-street',
        title: 'Moon Gate',
        excerpt: 'Polished stone sculptural forms for a landmark arrival.',
        image: '/media/launch/homepage/project-moon-gate.jpg',
      },
      {
        slug: 'west-side-place',
        title: 'West Side Place',
        excerpt: 'Large-scale stone deployment across a dense urban precinct.',
        image: '/media/launch/homepage/project-west-side-place.jpg',
      },
      {
        slug: 'xavier-college',
        title: 'Xavier College',
        excerpt: 'Warm sandstone detailing for an educational landscape.',
        image: '/media/launch/homepage/project-xavier-college.jpg',
      },
    ] satisfies HomepageProject[],
  },
  manifesto: {
    backgroundImage: '/media/launch/homepage/manifesto-bg.png',
    image: '/media/launch/homepage/manifesto-stone-block.jpg',
    supportingText:
      'At Urblo, we believe in the transformative power of stone to shape urban environments.',
    lines: ['Natural', 'Stone', 'Blocks', 'design'],
  },
  logoCarousel: [
    {
      alt: 'Delta',
      image: '/media/launch/homepage/partners/delta.png',
    },
    {
      alt: 'Aspect Studios',
      image: '/media/launch/homepage/partners/aspect-studios.png',
    },
    {
      alt: 'Wamara',
      image: '/media/launch/homepage/partners/wamara.png',
    },
    {
      alt: 'Symal logo',
      image: '/media/launch/homepage/partners/symal.png',
    },
  ] satisfies HomepageLogo[],
  videoCta: {
    backgroundImage: '/media/launch/homepage/video-cta-bg.jpg',
    videoUrl: '/media/launch/home/urblo-hero.mp4',
  },
  footer: {
    address: ['5 Hamilton St,', 'Oakleigh VIC 3166'],
    email: 'info@urblo.com.au',
    phone: '1300 1URBLO',
    copyright: '© Copyright 2024',
  },
} as const;
