import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  homepageData,
  type HomepageMetric,
  type HomepageProject,
  type HomepageStoneCard,
} from '../../data/homepage';

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function ArrowIcon({ light = false }: { light?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 14"
      fill="none"
      className={`h-3.5 w-6 ${light ? 'text-white' : 'text-[var(--urblo-text)]'}`}
    >
      <path
        d="M1 7h20M15 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureIcon({ accent = false }: { accent?: boolean }) {
  const color = accent ? 'var(--urblo-lime)' : 'currentColor';
  return (
    <svg viewBox="0 0 46 46" className="h-12 w-12" aria-hidden="true">
      <circle cx="23" cy="23" r="21.5" fill="none" stroke={color} strokeWidth="1.5" />
      <path
        d="M23 10c-5 5-8 9-8 14a8 8 0 0016 0c0-5-3-9-8-14z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[874px] overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={homepageData.hero.posterUrl}
      >
        <source src={homepageData.hero.videoUrl} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto flex min-h-[874px] max-w-[1440px] items-end px-6 pb-24 pt-32 md:px-10 lg:px-[94px]">
        <Reveal className="max-w-[1000px]">
          <div className="space-y-6">
            <h1 className="max-w-[1000px] text-[52px] uppercase leading-[1.08] tracking-[0.04em] text-white md:text-[72px] xl:text-[90px]">
              <span className="font-normal">Stone </span>
              <span className="font-accent text-[1.02em] italic">Solutions</span>
              <span className="font-normal"> for Street</span>
              <span className="text-[var(--urblo-lime)]">.</span>
            </h1>
            <p className="max-w-[36rem] text-[20px] font-medium leading-8 text-white/92 md:text-[22px]">
              {homepageData.hero.eyebrow}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SustainabilitySection() {
  return (
    <section className="bg-white px-6 py-20 md:px-10 lg:px-[92px] lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <Reveal className="relative overflow-hidden rounded-[4px] bg-[#f4f5ef] px-6 py-10 md:px-10 md:py-14">
            <div
              className="absolute inset-y-0 left-0 w-[34%] bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.14), rgba(0, 0, 0, 0.14)), url('https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2.jpg')",
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-[34%] bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12)), url('https://urblo.com.au/wp-content/uploads/2024/12/Moon-Garden-4-Web-Sized-Matthew-Sherren-Photography.jpg')",
              }}
            />

            <div className="relative mx-auto flex min-h-[540px] max-w-[520px] items-center justify-center">
              <div className="relative aspect-square w-full max-w-[360px]">
                <div className="absolute inset-[10%] rounded-full border border-[var(--urblo-lime)]/35" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <defs>
                      <path
                        id="homepage-circle"
                        d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      />
                    </defs>
                    <text fill="var(--urblo-lime)" fontSize="8.5" letterSpacing="0.36em">
                      <textPath href="#homepage-circle">
                        CARBON NEUTRAL COMMITMENT  CARBON NEUTRAL COMMITMENT
                      </textPath>
                    </text>
                  </svg>
                </motion.div>
                <div className="absolute inset-[22%] flex items-center justify-center rounded-full bg-white/88 shadow-[0_24px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                  <img
                    src={homepageData.sustainability.footprintUrl}
                    alt="Carbon neutral footprint"
                    className="h-[62%] w-[62%] object-contain"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-[18%] mx-auto max-w-[13rem] text-center text-[22px] font-semibold leading-[1.25] text-[var(--urblo-lime)]">
                  Urblo offsets CO<sub>2</sub> footprint, 100%
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="max-w-[552px] space-y-7 text-[20px] font-light leading-8 text-black md:text-[22px]">
            <p>
              {homepageData.sustainability.intro
                .split('carbon neutral')
                .map((part, index, array) => (
                  <span key={`${part}-${index}`}>
                    {part}
                    {index < array.length - 1 ? <strong>carbon neutral</strong> : null}
                  </span>
                ))}
            </p>
            <p>
              {homepageData.sustainability.body
                .split('build a future')
                .map((part, index, array) => (
                  <span key={`${part}-${index}`}>
                    {part}
                    {index < array.length - 1 ? <strong>build a future</strong> : null}
                  </span>
                ))}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 border-t border-black/10 pt-10 md:grid-cols-2 xl:grid-cols-4">
          {homepageData.sustainability.features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={0.08 * index}
              className={index === 0 ? 'text-[var(--urblo-lime)]' : 'text-black'}
            >
              <div className="flex items-start gap-5">
                <FeatureIcon accent={index === 0} />
                <div>
                  <h3 className="text-[27px] font-light leading-[1.1]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[14px] font-light leading-6 opacity-80">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerBannerSection() {
  return (
    <section className="relative min-h-[516px] overflow-hidden bg-black text-white">
      <img
        src={homepageData.partnerBanner.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto flex min-h-[516px] max-w-[1440px] items-center px-6 py-16 md:px-10 lg:px-[92px]">
        <Reveal className="max-w-[70rem] text-[38px] font-semibold uppercase leading-[1.35] text-white md:text-[52px] xl:text-[60px]">
          A <span className="text-[var(--urblo-lime)]">trusted partner</span> for your next
          streetscapes &amp; civil landscape project.
        </Reveal>
      </div>
    </section>
  );
}

function ProductShowcaseSection() {
  return (
    <section className="bg-white px-6 py-20 md:px-10 lg:px-[94px] lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <h2 className="font-display text-[34px] font-semibold uppercase leading-[1.45] text-black md:text-[44px]">
              Explore our latest
              <br />
              products
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="rounded-[4px] bg-black/[0.06] px-8 py-9 text-[20px] font-semibold leading-8 text-black md:text-[22px]">
            {homepageData.productShowcase.intro}
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-10 overflow-hidden rounded-[4px]">
          <div
            className="relative min-h-[640px] bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.42)), url('${homepageData.productShowcase.backgroundImage}')`,
            }}
          >
            <div className="grid min-h-[640px] grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {homepageData.productShowcase.categories.map((category, index) => {
                const active = index === 2;

                return (
                  <div
                    key={category.title}
                    className="relative flex min-h-[180px] flex-col justify-end border-b border-white/30 px-8 py-8 text-white xl:min-h-full xl:border-b-0 xl:border-l xl:border-white/30"
                  >
                    {active ? (
                      <div className="mb-2 max-w-[302px] rounded-[4px] bg-black px-8 py-10 shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
                        <div className="text-[70px] font-semibold leading-none text-white">
                          {category.index}
                        </div>
                        <div className="mt-4 text-[36px] font-semibold leading-[1.1] text-white">
                          {category.title}
                        </div>
                        <p className="mt-4 text-[18px] font-bold leading-[1.5] text-white/92">
                          {category.body}
                        </p>
                        <Link
                          to={category.to ?? '/products'}
                          className="mt-8 inline-flex items-center gap-3 text-[18px] font-semibold text-[var(--urblo-lime)]"
                        >
                          <span>{category.ctaLabel}</span>
                          <ArrowIcon />
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="text-[70px] font-semibold leading-none text-white">
                          {category.index}
                        </div>
                        <div className="mt-4 text-[36px] font-semibold leading-[1.1] text-white">
                          {category.title}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MetricCard({ metric }: { metric: HomepageMetric }) {
  return (
    <div className="border-b border-black/80 pb-5">
      <div className="text-[72px] font-semibold leading-none text-black md:text-[96px]">
        {metric.value}
      </div>
      <p className="mt-4 text-[16px] leading-[1.9] text-[var(--urblo-text)]">
        {metric.label}
      </p>
    </div>
  );
}

function MetricsSection() {
  return (
    <section className="bg-white px-6 py-20 md:px-10 lg:px-[93px]">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal className="max-w-[40rem] text-[36px] font-semibold leading-[1.44] text-black md:text-[44px]">
          There&apos;s a team always ready to assist you on your next project
          <span className="text-[var(--urblo-lime)]">.</span>
        </Reveal>

        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {homepageData.metrics.map((metric, index) => (
            <Reveal key={metric.label} delay={0.06 * index}>
              <MetricCard metric={metric} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  light = false,
}: {
  project: HomepageProject;
  light?: boolean;
}) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={`group relative block overflow-hidden rounded-[4px] ${
        light ? 'min-h-[230px]' : 'min-h-[760px]'
      }`}
    >
      <img
        src={project.image}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className={`absolute inset-0 ${light ? 'bg-black/28' : 'bg-black/38'}`} />
      <div className="relative flex h-full flex-col justify-end px-8 py-8 text-white">
        <h3 className={`uppercase ${light ? 'text-[20px]' : 'text-[36px]'} font-semibold`}>
          {project.title}
        </h3>
        <p className={`mt-3 max-w-[28rem] ${light ? 'text-[14px] leading-6' : 'text-[18px] leading-8'} text-white/85`}>
          {project.excerpt}
        </p>
        {!light ? (
          <div className="mt-8 inline-flex items-center gap-3 text-[18px] font-semibold text-white/85">
            <span>Take a look</span>
            <ArrowIcon light />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function LatestProjectsSection() {
  return (
    <section className="bg-black px-6 py-20 text-white md:px-10 lg:px-[92px] lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <div className="space-y-8">
              <div className="inline-block border-t-[5px] border-[var(--urblo-lime)] pt-4" />
              <h2 className="font-display text-[48px] uppercase leading-[1.02] tracking-[0.03em] md:text-[70px]">
                {homepageData.latestProjects.title}
              </h2>
              <p className="max-w-[34rem] text-[20px] font-semibold leading-8 text-white/88 md:text-[22px]">
                {homepageData.latestProjects.intro}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <ProjectCard project={homepageData.latestProjects.featured} />
          </Reveal>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {homepageData.latestProjects.gallery.map((project, index) => (
            <Reveal key={project.slug} delay={0.06 * index}>
              <ProjectCard project={project} light />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoneCard({ card, compact = false }: { card: HomepageStoneCard; compact?: boolean }) {
  return (
    <div className={`group ${compact ? 'lg:mt-14' : ''}`}>
      <div className="overflow-hidden rounded-[4px]">
        <img
          src={card.image}
          alt={card.title}
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            compact ? 'h-[470px]' : 'h-[510px]'
          }`}
        />
      </div>
      <div className="mt-5 flex items-start gap-5">
        <div className="min-w-[78px] text-[64px] font-semibold leading-none text-black md:min-w-[96px] md:text-[100px]">
          {card.index}
        </div>
        <div className="pt-2">
          <h3 className="text-[26px] font-bold uppercase leading-[1.25] text-black">
            {card.finish ? `${card.title}, ${card.finish}` : card.title}
          </h3>
          <a
            href={homepageData.stoneShowcase.sampleCta}
            className="mt-4 inline-flex items-center gap-3 text-[16px] font-semibold text-[#4F4F4D]"
          >
            <span>See more</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

function StoneShowcaseSection() {
  return (
    <section className="bg-white px-6 py-20 md:px-10 lg:px-[92px] lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[0.74fr_0.96fr_auto] lg:items-start">
          <Reveal>
            <h2 className="font-display text-[34px] font-bold uppercase leading-[1.45] text-black md:text-[36px]">
              Browse by stone type
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="max-w-[36rem] text-[20px] font-semibold leading-8 text-black md:text-[22px]">
            Urblo offers project-based <span className="uppercase">design collaboration</span> consultation service to professionals like architects and designers no matter which designing stage you are in.
          </Reveal>
          <Reveal delay={0.12} className="hidden items-start gap-3 lg:flex">
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-[4px] border border-black/20 text-black"
              aria-label="Previous stones"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-[4px] border border-black/20 text-black"
              aria-label="Next stones"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-20">
          <Reveal>
            <StoneCard card={homepageData.stoneShowcase.cards[0]} />
          </Reveal>
          <Reveal delay={0.06}>
            <StoneCard card={homepageData.stoneShowcase.cards[1]} compact />
          </Reveal>
          <Reveal delay={0.1}>
            <StoneCard card={homepageData.stoneShowcase.cards[2]} />
          </Reveal>
          <Reveal delay={0.14}>
            <div>
              <a
                href={homepageData.stoneShowcase.sampleCta}
                className="mb-10 inline-flex w-full items-center justify-between rounded-[4px] bg-black px-8 py-5 text-[24px] text-white"
              >
                <span>Add sample to cart</span>
                <ArrowIcon light />
              </a>
              <StoneCard card={homepageData.stoneShowcase.cards[3]} compact />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ManifestoSection() {
  return (
    <section className="overflow-hidden bg-black px-6 py-20 text-white md:px-10 lg:px-[92px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="relative overflow-hidden rounded-[4px] border-y border-white/20 py-10 md:py-16">
          <Reveal className="pointer-events-none absolute right-[18%] top-[26%] hidden h-[170px] w-[323px] overflow-hidden rounded-full md:block">
            <img
              src={homepageData.manifesto.image}
              alt=""
              className="h-full w-full object-cover"
            />
          </Reveal>

          <div className="space-y-2 text-center uppercase leading-none tracking-[0.08em] md:space-y-4">
            {homepageData.manifesto.lines.map((line, index) => (
              <Reveal
                key={line}
                delay={0.06 * index}
                className={`text-[60px] font-semibold md:text-[110px] xl:text-[150px] ${
                  index === 3 ? 'text-transparent' : 'text-white'
                }`}
              >
                <span
                  style={
                    index === 3
                      ? { WebkitTextStroke: '1px white' }
                      : undefined
                  }
                >
                  {line}
                </span>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 max-w-[22rem] text-right text-[18px] leading-[1.7] text-white/88 md:ml-[5%]">
            {homepageData.manifesto.supportingText}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function VideoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[10px] bg-black">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
          aria-label="Close video"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <video
          className="aspect-video w-full"
          controls
          autoPlay
          playsInline
          src={homepageData.videoCta.videoUrl}
        />
      </div>
    </div>
  );
}

function VideoCTASection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[617px] overflow-hidden bg-black text-white">
        <img
          src={homepageData.videoCta.backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto flex min-h-[617px] max-w-[1440px] items-center justify-center px-6 py-16">
          <Reveal className="text-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group inline-flex h-[193px] w-[193px] items-center justify-center rounded-full border-4 border-white/50 text-center text-[24px] uppercase tracking-[0.12em] text-[#B8BB9C] transition-colors hover:border-[var(--urblo-lime)] hover:text-[var(--urblo-lime)]"
            >
              Play
            </button>
          </Reveal>
        </div>
      </section>
      <VideoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function HomepageSections() {
  return (
    <>
      <HeroSection />
      <SustainabilitySection />
      <PartnerBannerSection />
      <ProductShowcaseSection />
      <MetricsSection />
      <LatestProjectsSection />
      <StoneShowcaseSection />
      <ManifestoSection />
      <VideoCTASection />
    </>
  );
}
