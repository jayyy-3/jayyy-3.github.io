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
  body?: string;
  ctaLabel?: string;
  to?: string;
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
  { label: 'Instagram', href: 'https://www.instagram.com/urb.lo?igsh=MThyZ3g1NnoyMXc0cg%3D%3D&utm_source=qr', external: true },
  { label: 'LinkedIn', href: 'https://au.linkedin.com/company/urblo', external: true },
];

export const homepageData = {
  brandStatement: 'devoted to Support Ethical and Significant Projects Every Step of the Way.',
  logoUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/logo.png',
  hero: {
    videoUrl: 'https://urblo.com.au/wp-content/uploads/stream/video.php/urblo.mp4',
    posterUrl: 'https://urblo.com.au/wp-content/uploads/revslider/video-media/urblo_1.jpeg',
    eyebrow:
      'A trusted partner for your next streetscapes & civil landscape project.',
  },
  sustainability: {
    footprintUrl: 'https://urblo.com.au/wp-content/uploads/2025/01/co2-footprint.png',
    intro:
      'At Urblo, we are unwavering in our commitment to long-term sustainability with project-based carbon neutral offers. Urblo was created by SAI Stone to provide a greener alternative to concrete seating.',
    body:
      'We now supply full life-cycle carbon dioxide offsets covering production, ocean freight, local freight, and end-of-life crush-and-reuse as road base. We replace polluting building materials and restore quarries responsibly to build a future where every action contributes positively to the planet.',
    features: [
      {
        title: 'Sustainability',
        description: 'Green, environment-friendly',
      },
      {
        title: 'Streamline Installation',
        description: 'Factory-led precision, faster on site',
      },
      {
        title: 'Cost Saving',
        description: 'Lower risk across the full project cost',
      },
      {
        title: 'Design Collaboration',
        description: 'Documentation and detailing support',
      },
    ],
  },
  partnerBanner: {
    image:
      'https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg',
    text: 'A trusted partner for your next streetscapes & civil landscape project.',
  },
  productShowcase: {
    title: 'Explore our latest products',
    intro:
      'Urblo was conceived as a response to the growing demand for better and greener alternatives to concrete seats / planters.',
    backgroundImage:
      'https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2.jpg',
    categories: [
      { index: '01', title: 'Seat' },
      { index: '02', title: 'Bollard' },
      {
        index: '03',
        title: 'Planter',
        body:
          'Our extensive network of suppliers enables us to source the finest natural stone from around the world.',
        ctaLabel: 'Take a look',
        to: '/products',
      },
      { index: '04', title: 'Sculpture' },
    ] satisfies HomepageProductCategory[],
  },
  metricsIntro:
    'There’s a team always ready to assist you on your next project.',
  metrics: [
    { value: '30', label: 'Indoor / outdoor projects' },
    { value: '430+', label: 'Clients' },
    { value: '80+', label: 'Offseted tons of carbon dioxide' },
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
      image:
        'https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2-1024x657.jpg',
    } satisfies HomepageProject,
    gallery: [
      {
        slug: 'australian-catholic-university',
        title: 'Australian Catholic University',
        excerpt: 'Precision-built bluestone seating with calm civic character.',
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg',
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
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/Antline-scaled-1.jpg',
      },
      {
        index: '02',
        title: 'Zen Grey',
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1-1.jpg',
      },
      {
        index: '03',
        title: 'Ash Grey',
        finish: 'Flamed',
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/Ash-Grey-1.jpg',
      },
      {
        index: '04',
        title: 'Ken Black',
        finish: 'Flamed',
        image:
          'https://urblo.com.au/wp-content/uploads/2024/12/Ken-Black-1.jpg',
      },
    ] satisfies HomepageStoneCard[],
    sampleCta:
      'mailto:info@urblo.com.au?subject=Sample%20Request&body=Hi%20Urblo%2C%20I%20would%20like%20to%20request%20stone%20samples.',
  },
  manifesto: {
    image:
      'https://urblo.com.au/wp-content/uploads/2024/12/Moon-Garden-9-Web-Sized-Matthew-Sherren-Photography.jpg',
    supportingText:
      'At Urblo, we believe in the transformative power of stone to shape urban environments.',
    lines: ['Natural', 'Stone', 'Blocks', 'design'],
  },
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
