import Card from '../components/ui/Card';
import PageIntro from '../components/ui/PageIntro';
import Reveal from '../components/ui/Reveal';
import SectionHeading from '../components/ui/SectionHeading';
import StaticResponsiveImage from '../components/StaticResponsiveImage';

const proofPoints = [
  { value: '2024', label: 'Founded in Melbourne' },
  { value: 'MCC', label: 'Melbourne City Council appointed supplier network' },
  { value: '20+', label: 'Founded by stone experts with 20+ years of experience.' },
];

const team = [
  {
    name: 'Natalie Ma',
    role: 'Co-Founder & Director',
    img: '/media/launch/our-story/natalie-ma-2026.jpg',
    bio:
      'A trained architectural designer with brand and marketing strategy experience, Natalie leads Urblo around one brief: bridge the gap between creative design and built reality.',
    quote:
      'We started Urblo to bridge a gap we kept seeing - between the creative ambition of design and the practical reality of what gets built.',
  },
  {
    name: 'Cameron',
    role: 'Sales Manager',
    img: '/media/launch/our-story/cameron.jpg',
    bio:
      'With deep stone-sourcing experience, Cameron helps clients across Australia match material character to project intent.',
  },
];

export default function OurStory() {
  return (
    <div className="bg-white">
      <PageIntro band breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Our Story' }]} title="Our Story" />

      <section className="urblo-section">
        <Reveal className="urblo-page-container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeading
            eyebrow="People & Environment"
            title="At Urblo, we believe in the transformative power of stone to shape urban environments."
            titleClassName="max-w-[34rem]"
          />
          <div className="space-y-5 text-lead text-body">
            <p>
              Founded in Melbourne in 2024, Urblo is a specialist manufacturer and supplier of
              premium stone solutions, bespoke street furniture, and complex hardscape elements for
              civil and urban projects Australia-wide.
            </p>
            <p>
              The company exists to bridge a long-standing gap between creative ambition and what
              actually gets built. Its founders bring that gap together from both sides: Natalie Ma,
              an architectural designer with a background in branding and marketing, who speaks the
              language architects use; Jun Hu, founder of SAI Stone, twenty years in the industry and
              knows stone inside out; Bob Lu, former CEO of SAI Stone, with over a decade delivering
              stone on major civil and commercial projects; and Cameron Grover, eighteen years in
              the industry and one of the most connected people in Australian stone.
            </p>
            <p>
              Design on one side. Stone on the other. Urblo was built by people who work on both.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="bg-ink py-section-tight text-inverse">
        <div className="urblo-page-container grid gap-x-12 gap-y-10 sm:grid-cols-3">
          {proofPoints.map((item, index) => (
            <Reveal key={item.label} delay={0.06 * index} className="h-full">
              <div className="h-full border-b border-inverse/80 pb-5">
                <p className="text-display font-semibold leading-none text-inverse">{item.value}</p>
                <p className="mt-4 text-copy text-inverse-body">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative flex min-h-[420px] items-end overflow-hidden bg-ink">
        <StaticResponsiveImage
          src="/media/launch/banners/our-story.jpg"
          sizes="100vw"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="urblo-page-container relative w-full py-section-tight">
          <SectionHeading
            level="display"
            surface="dark"
            eyebrow="Carbon commitment"
            title="A full life-cycle carbon-offset approach"
            titleClassName="max-w-[48rem]"
          />
        </div>
      </section>

      <section className="urblo-section bg-surface">
        <Reveal className="urblo-page-container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeading eyebrow="Workflow" title="Streamlined construction" />
          <p className="text-lead text-body">
            Compared with traditional in-situ concrete work, Urblo's precast modular blocks
            eliminate boxing, curing, and finishing. It becomes a faster, cleaner grab-and-place
            installation process.
          </p>
        </Reveal>
      </section>

      <section className="urblo-section bg-ink">
        <div className="urblo-page-container">
          <SectionHeading
            surface="dark"
            eyebrow="Our team"
            title="Meet the people behind Urblo"
            className="mb-10 max-w-[38rem]"
          />

          <div className="grid max-w-[920px] gap-6 md:grid-cols-2">
            {team.map((member) => (
              <Card
                key={member.name}
                as="article"
                surface="dark"
                className="h-full"
                mediaAspect="2/3"
                media={
                  <StaticResponsiveImage
                    src={member.img}
                    sizes="(min-width: 768px) 450px, 100vw"
                    alt={member.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                  />
                }
                meta={member.role}
                title={member.name}
              >
                <p>{member.bio}</p>
                {'quote' in member ? (
                  <p className="mt-5 border-l border-lime pl-4 text-copy font-semibold text-inverse">
                    "{member.quote}"
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
