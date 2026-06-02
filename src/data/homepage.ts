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
  location: string;
  category: string;
  year: string;
  summary: string;
  image: string;
  imageAlt: string;
  featureImage?: string;
  featureImageAlt?: string;
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
    to: '/contact?intent=sample-request',
  },
  {
    label: 'Contact Us',
    to: '/contact',
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
    mobileVideoUrl: '/media/launch/home/urblo-hero-mobile.mp4',
    posterUrl: '/media/launch/home/hero-poster.jpg',
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
    image: '/media/launch/homepage/partner-banner-west-side-place.jpg',
    text: 'Design-led stone solutions for streetscapes & civil landscapes.',
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
  metricsIntro: {
    headline: 'Stone has always shaped cities.',
    body: 'We shape how stone is designed, specified, and delivered.',
  },
  metrics: [
    { value: '50+', label: 'projects delivered' },
    { value: '130+', label: 'tonnes of CO2 offset' },
    { value: '20+', label: 'landscape architects nominated' },
    { value: '3500+', label: 'linear metres stone blocks delivered' },
  ] satisfies HomepageMetric[],
  latestProjects: {
    title: 'The work speaks.',
    intro:
      'From bespoke civic landscapes to high-volume streetscape programmes — every project is a collaboration between design vision and stone craft.',
    projects: [
      {
        slug: 'west-side-place',
        title: 'West Side Place',
        location: 'Melbourne VIC',
        category: 'High-rise plaza and public realm',
        year: '2023',
        summary:
          'Over 500 linear metres of stone elements coordinated across a dense urban precinct, balancing scale, detailing, and installation predictability.',
        image: '/media/launch/homepage/project-west-side-place.jpg',
        imageAlt: 'West Side Place public realm with stone seating and planting edges',
        featureImage: '/media/launch/projects/west-side-place/detail-2.jpg',
        featureImageAlt: 'West Side Place stone elements and planting details',
      },
      {
        slug: 'moon-gate-woolley-street',
        title: 'Moon Gate | Woolley Street',
        location: 'Dickson ACT',
        category: 'Urban sculpture and public realm',
        year: '2023',
        summary:
          'Five custom-fabricated stone elements form a sculptural threshold and seating sequence for a civic dining precinct.',
        image: '/media/launch/homepage/project-moon-gate.jpg',
        imageAlt: 'Moon Gate stone sculpture and seating in a streetscape setting',
        featureImage: '/images/projects/moon-gate/moon-gate-seat-detail.jpg',
        featureImageAlt: 'Close view of Moon Gate stone seating detail',
      },
      {
        slug: 'artisan-park-yarrabend',
        title: 'Artisan Park | YarraBend',
        location: 'Alphington VIC',
        category: 'Urban community park',
        year: '2024',
        summary:
          'Architectural block seating and landscape plinths built for a community park where stone detail, scale, and carbon-offset scope all matter.',
        image: '/media/launch/homepage/project-artisan-park.jpg',
        imageAlt: 'Artisan Park stone blocks integrated with planting and public seating',
        featureImage: '/media/launch/projects/artisan-park-yarrabend/detail-2.png',
        featureImageAlt: 'Artisan Park stone block seating in a civic landscape',
      },
      {
        slug: 'xavier-college',
        title: 'Xavier College',
        location: 'Kew VIC',
        category: 'Education and heritage landscape',
        year: '2023',
        summary:
          'Warm sandstone masonry details for an education setting, supporting landscape integration with a quieter heritage register.',
        image: '/media/launch/homepage/project-xavier-college.jpg',
        imageAlt: 'Sandstone landscape detailing at Xavier College',
        featureImage: '/media/launch/projects/xavier-college/detail-2.jpg',
        featureImageAlt: 'Xavier College sandstone landscape detail',
      },
      {
        slug: 'australian-catholic-university',
        title: 'Australian Catholic University',
        location: 'Fitzroy VIC',
        category: 'Institutional landscape',
        year: '2023',
        summary:
          'Precision-built bluestone seating with a calm civic character, developed for a high-use institutional landscape.',
        image: '/media/launch/contact/project-contact.jpg',
        imageAlt: 'Bluestone seating and paving at Australian Catholic University',
        featureImage: '/media/launch/projects/australian-catholic-university/detail-2.jpg',
        featureImageAlt: 'Australian Catholic University bluestone seating detail',
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
