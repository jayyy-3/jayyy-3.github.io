import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoveHorizontal, Play } from 'lucide-react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  homepageData,
  type HomepageLogo,
  type HomepageMetric,
  type HomepageProject,
} from '../../data/homepage';
import type { ProjectData } from '../../data/projectData';
import { siteCtas } from '../../data/siteChrome';
import ProjectService from '../../service/ProjectService';
import AnimatedNumber from '../AnimatedNumber';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';

const mobileInlineVideoAttributes = {
  'webkit-playsinline': 'true',
  'x5-playsinline': 'true',
  'x5-video-player-type': 'h5-page',
  'x5-video-player-fullscreen': 'false',
  'x5-video-orientation': 'portrait',
} as const;

type WeixinJSBridgeLike = {
  invoke?: (
    method: string,
    params: Record<string, never>,
    callback: () => void,
  ) => void;
};

function getWeixinJSBridge() {
  return (window as Window & { WeixinJSBridge?: WeixinJSBridgeLike }).WeixinJSBridge;
}

function useNearViewport<T extends Element>(rootMargin = '800px') {
  const ref = useRef<T | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, shouldLoad]);

  return [ref, shouldLoad] as const;
}

const lazyImageProps = {
  loading: 'lazy',
  decoding: 'async',
} as const;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 14" fill="none" className="h-3.5 w-6" aria-hidden="true">
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

function ProductCarouselArrowIcon({ direction }: { direction: 'prev' | 'next' }) {
  if (direction === 'prev') {
    return (
      <svg viewBox="0 0 1000 1000" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M263 546L421 708C446 733 446 771 421 796 396 821 358 821 333 796L63 517C38 492 38 454 63 429L329 167C354 137 392 142 417 167 442 192 442 229 417 254L246 421 896 417C929 417 958 446 958 479 958 512 929 542 896 542L263 546Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 1000 1000" fill="currentColor" className="h-7 w-7" aria-hidden="true">
      <path d="M738 546L579 708C554 733 554 771 579 796S642 821 667 796L938 517C963 492 963 454 938 429L671 167C646 142 608 142 583 167 558 192 558 229 583 254L754 421 104 417C71 417 42 446 42 479 42 512 71 542 104 542L738 546Z" />
    </svg>
  );
}

const heroStatements = ['DESIGN', 'SOURCE', 'DELIVER'] as const;

function HeroStatementLine({
  word,
  index,
  reduceMotion,
}: {
  word: (typeof heroStatements)[number];
  index: number;
  reduceMotion: boolean;
}) {
  const lineOffset = index === 1 ? 'pl-[0.42em] sm:pl-[0.54em] lg:pl-[0.66em]' : '';
  const characters = Array.from(word === 'DELIVER' ? `${word}.` : word);
  const lineDelay = reduceMotion ? 0.08 + index * 0.34 : 0.22 + index * 0.82;
  const characterDelay = reduceMotion ? 0.035 : 0.06;

  return (
    <span className={`block whitespace-nowrap py-[0.035em] ${lineOffset}`}>
      {characters.map((character, characterIndex) => {
        const isFinalDot = character === '.';

        return (
          <motion.span
            key={`${word}-${character}-${characterIndex}`}
            aria-hidden="true"
            className={`inline-block ${isFinalDot ? 'text-[var(--urblo-lime)]' : ''}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: '0.16em' }}
            animate={{ opacity: 1, y: '0em' }}
            transition={{
              duration: reduceMotion ? 0.22 : 0.42,
              delay: lineDelay + characterIndex * characterDelay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {character}
          </motion.span>
        );
      })}
    </span>
  );
}

function HeroSection() {
  const reduceMotion = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoPlaybackActiveRef = useRef(false);
  const [videoNeedsGesture, setVideoNeedsGesture] = useState(false);

  const primeMobileVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x5-playsinline', 'true');
    video.setAttribute('x5-video-player-type', 'h5-page');
    video.setAttribute('x5-video-player-fullscreen', 'false');
    video.setAttribute('x5-video-orientation', 'portrait');
  }, []);

  const attemptVideoPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoPlaybackActiveRef.current) return;

    primeMobileVideo();
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        if (videoPlaybackActiveRef.current) {
          setVideoNeedsGesture(true);
        }
      });
    }
  }, [primeMobileVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    videoPlaybackActiveRef.current = true;

    const requestWeChatBridgePlayback = () => {
      const bridge = getWeixinJSBridge();
      if (typeof bridge?.invoke !== 'function') return false;

      try {
        bridge.invoke('getNetworkType', {}, attemptVideoPlay);
        return true;
      } catch {
        attemptVideoPlay();
        return false;
      }
    };

    const playWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        attemptVideoPlay();
      }
    };

    const handleWeixinJSBridgeReady = () => {
      if (!requestWeChatBridgePlayback()) {
        attemptVideoPlay();
      }
    };

    const handlePlaying = () => setVideoNeedsGesture(false);
    const handlePause = () => {
      if (document.visibilityState === 'visible' && video.currentTime > 0 && !video.ended) {
        setVideoNeedsGesture(true);
      }
    };

    const handleVideoError = () => setVideoNeedsGesture(true);

    primeMobileVideo();
    attemptVideoPlay();
    requestWeChatBridgePlayback();

    const retryTimers = [250, 900, 1800].map((delay) =>
      window.setTimeout(attemptVideoPlay, delay),
    );

    video.addEventListener('loadeddata', attemptVideoPlay, { once: true });
    video.addEventListener('loadedmetadata', attemptVideoPlay, { once: true });
    video.addEventListener('canplay', attemptVideoPlay, { once: true });
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleVideoError);
    window.addEventListener('pointerdown', attemptVideoPlay, { capture: true, passive: true });
    window.addEventListener('touchstart', attemptVideoPlay, { capture: true, passive: true });
    window.addEventListener('pageshow', attemptVideoPlay);
    document.addEventListener('visibilitychange', playWhenVisible);
    document.addEventListener('WeixinJSBridgeReady', handleWeixinJSBridgeReady);

    return () => {
      videoPlaybackActiveRef.current = false;
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      video.removeEventListener('loadeddata', attemptVideoPlay);
      video.removeEventListener('loadedmetadata', attemptVideoPlay);
      video.removeEventListener('canplay', attemptVideoPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleVideoError);
      window.removeEventListener('pointerdown', attemptVideoPlay, { capture: true });
      window.removeEventListener('touchstart', attemptVideoPlay, { capture: true });
      window.removeEventListener('pageshow', attemptVideoPlay);
      document.removeEventListener('visibilitychange', playWhenVisible);
      document.removeEventListener('WeixinJSBridgeReady', handleWeixinJSBridgeReady);
    };
  }, [attemptVideoPlay, primeMobileVideo]);

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-black bg-cover bg-center text-white"
      style={{ backgroundImage: `url('${homepageData.hero.posterUrl}')` }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={homepageData.hero.posterUrl}
        aria-label="Urblo stone streetscape project video"
        {...mobileInlineVideoAttributes}
      >
        <source src={homepageData.hero.mobileVideoUrl} type="video/mp4" media="(max-width: 767px)" />
        <source src={homepageData.hero.videoUrl} type="video/mp4" media="(min-width: 768px)" />
      </video>
      <div className="absolute inset-0 bg-black/40" />

      {videoNeedsGesture ? (
        <Button
          variant="ghost"
          surface="dark"
          size="sm"
          onClick={attemptVideoPlay}
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-ink/50 shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-sm"
          aria-label="Play homepage background video"
        >
          <Play aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
          Play video
        </Button>
      ) : null}

      <div className="urblo-page-container relative flex min-h-[100svh] items-end pb-[22px] pt-32 md:pb-[30px] lg:pb-[38px]">
        <h1
          className="urblo-hero-title text-inverse"
          aria-label="DESIGN SOURCE DELIVER."
        >
          {heroStatements.map((statement, index) => (
            <HeroStatementLine
              key={statement}
              word={statement}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </h1>
      </div>
    </section>
  );
}

function PartnerBannerSection() {
  const highlight = 'Design-led';
  const bannerText = homepageData.partnerBanner.text;
  const bodyText = bannerText.startsWith(highlight) ? bannerText.slice(highlight.length) : ` ${bannerText}`;
  const [sectionRef, loadImage] = useNearViewport<HTMLElement>('400px');

  return (
    <section ref={sectionRef} className="relative min-h-[258px] overflow-hidden bg-black text-white">
      {loadImage ? (
        <img
          src={homepageData.partnerBanner.image}
          alt=""
          {...lazyImageProps}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/60" />
      <div className="urblo-page-container relative flex min-h-[258px] items-center py-8">
        <Reveal className="max-w-[70rem] xl:max-w-[76rem] text-title font-semibold uppercase leading-[1.35] text-inverse md:text-title-lg md:leading-[1.35] xl:text-display xl:leading-[1.35]">
          <span className="text-[var(--urblo-lime)]">{highlight}</span>
          {bodyText}
        </Reveal>
      </div>
    </section>
  );
}

function ProductShowcaseSection() {
  const [focusedProduct, setFocusedProduct] = useState<string | null>(null);
  const [backgroundRef, loadBackground] = useNearViewport<HTMLDivElement>('700px');

  return (
    <section className="bg-white py-section">
      <div className="urblo-page-container">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <SectionHeading
              level="section"
              title={
                <>
                  Explore our latest{' '}
                  <br />
                  products
                </>
              }
            />
          </Reveal>
          <Reveal
            delay={0.1}
            className="rounded bg-ink/[0.06] px-8 py-9 text-lead font-semibold text-ink"
          >
            {homepageData.productShowcase.intro}
          </Reveal>
        </div>

      </div>

      <Reveal delay={0.15} className="mt-10">
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <div
            ref={backgroundRef}
            className="homepage-product-display relative overflow-hidden rounded-[4px] bg-cover bg-center bg-no-repeat"
            style={
              loadBackground
                ? { backgroundImage: `url('${homepageData.productShowcase.backgroundImage}')` }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/25" />

            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              slidesPerView={1}
              loop
              speed={500}
              autoplay={{ delay: 1000, pauseOnMouseEnter: true }}
              navigation={{
                prevEl: '.homepage-product-prev',
                nextEl: '.homepage-product-next',
              }}
              pagination={{
                el: '.homepage-product-pagination',
                clickable: true,
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="relative h-[620px]"
            >
              {homepageData.productShowcase.categories.map((category) => {
                const focused = focusedProduct === category.index;

                return (
                  <SwiperSlide key={category.index} className="!h-[620px]">
                    <div
                      className="urblo-focus-inset relative h-full"
                      tabIndex={0}
                      onMouseEnter={() => setFocusedProduct(category.index)}
                      onMouseLeave={() => setFocusedProduct(null)}
                      onFocus={() => setFocusedProduct(category.index)}
                      onBlur={() => setFocusedProduct(null)}
                    >
                      <div className="absolute inset-y-0 right-0 z-[1] w-px bg-white/85" />

                      <div className="relative h-full">
                        <div
                          className={`absolute bottom-0 z-[2] w-full px-8 pt-8 text-white transition-all duration-200 ease-in-out ${
                            focused ? 'translate-y-0 bg-black' : 'translate-y-[70px] bg-transparent'
                          }`}
                        >
                          <div
                            className="mb-3 text-display font-[800] leading-none text-transparent transition-all duration-200"
                            style={{
                              WebkitTextStroke: focused
                                ? '2px var(--urblo-lime)'
                                : '2px rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            {category.index}
                          </div>
                          <div className="text-title font-semibold leading-[1.1] text-inverse">
                            {category.title}
                          </div>
                          <div
                            className={`h-[132px] text-copy font-semibold leading-[1.5] text-inverse transition-all duration-200 ease-in-out ${
                              focused ? 'pb-8 pt-4' : 'pb-8 pt-[62px]'
                            }`}
                          >
                            {category.body}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <div className="homepage-product-pagination absolute bottom-6 left-1/2 z-[3] -translate-x-1/2" />

            <button
              type="button"
              className="homepage-product-prev homepage-product-nav absolute left-4 top-1/2 z-[3] -translate-y-1/2 text-white transition-opacity md:left-6"
              aria-label="Previous slide"
            >
              <ProductCarouselArrowIcon direction="prev" />
            </button>
            <button
              type="button"
              className="homepage-product-next homepage-product-nav absolute right-4 top-1/2 z-[3] -translate-y-1/2 text-white transition-opacity md:right-6"
              aria-label="Next slide"
            >
              <ProductCarouselArrowIcon direction="next" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function MetricCard({ metric }: { metric: HomepageMetric }) {
  return (
    <div className="border-b border-ink/80 pb-5">
      <AnimatedNumber
        value={metric.value}
        className="block text-display font-semibold leading-none text-ink md:text-hero md:leading-none"
      />
      <p className="mt-4 text-copy leading-[1.9] text-body">
        {metric.label}
      </p>
    </div>
  );
}

function MetricsSection() {
  return (
    <section className="bg-white py-section">
      <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Reveal className="max-w-[43rem]">
          <SectionHeading level="section" title={homepageData.metricsIntro.headline} />
          <p className="mt-6 max-w-[36rem] text-lead font-light text-body md:text-title-sm md:leading-10">
            {homepageData.metricsIntro.body}
          </p>
          <Button variant="ghost" to={siteCtas.capabilities.to} className="group mt-11 gap-4">
            <span>Our {siteCtas.capabilities.label}</span>
            <span
              className="inline-flex items-center justify-center transition duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <ArrowIcon />
            </span>
          </Button>
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

function toHomepageProject(project: ProjectData): HomepageProject {
  const railImage = project.listing.cover || project.hero?.image || project.images[0] || '';
  const featureImage = project.hero?.image || project.images[1] || railImage;

  return {
    slug: project.slug,
    title: project.listing.title || project.name,
    location: project.listing.location,
    category: project.listing.category,
    year: project.listing.year,
    summary: project.listing.summary || project.lead || project.story?.[0] || '',
    image: railImage,
    imageAlt: project.listing.imageAlt || project.name,
    featureImage,
    featureImageAlt: project.hero?.alt || project.listing.imageAlt || project.name,
  };
}

function LatestProjectsSection() {
  const fallbackProjects = homepageData.latestProjects.projects;
  const [sectionRef, loadProjectMedia] = useNearViewport<HTMLElement>('700px');
  const [projects, setProjects] = useState<HomepageProject[]>(fallbackProjects);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const activeProject = projects[activeProjectIndex] ?? projects[0];
  const activeFeatureImage = activeProject.featureImage ?? activeProject.image;
  const activeFeatureImageAlt = activeProject.featureImageAlt ?? activeProject.imageAlt;
  const railRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDown: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  });
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [railState, setRailState] = useState({ canScrollPrev: false, canScrollNext: false });
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!loadProjectMedia) return undefined;

    let active = true;
    ProjectService.getAll()
      .then((publishedProjects) => {
        if (!active || !publishedProjects.length) return;
        setProjects(publishedProjects.map(toHomepageProject));
        setActiveProjectIndex(0);
        window.requestAnimationFrame(() => {
          if (railRef.current) railRef.current.scrollLeft = 0;
        });
      })
      .catch(() => {
        // Keep the controlled homepage project set when public CMS content is unavailable.
      });

    return () => {
      active = false;
    };
  }, [loadProjectMedia]);

  const updateRailState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
    const canScrollPrev = rail.scrollLeft > 2;
    const canScrollNext = rail.scrollLeft < maxScrollLeft - 2;

    setRailState((current) =>
      current.canScrollPrev === canScrollPrev && current.canScrollNext === canScrollNext
        ? current
        : { canScrollPrev, canScrollNext },
    );
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    updateRailState();
    rail.addEventListener('scroll', updateRailState, { passive: true });
    window.addEventListener('resize', updateRailState);

    return () => {
      rail.removeEventListener('scroll', updateRailState);
      window.removeEventListener('resize', updateRailState);
    };
  }, [updateRailState, loadProjectMedia]);

  const scrollProjectIntoView = useCallback(
    (index: number, behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth') => {
      const rail = railRef.current;
      const projectThumb = rail?.querySelector<HTMLElement>(`[data-project-thumb-index="${index}"]`);
      if (!rail || !projectThumb) return;

      projectThumb.scrollIntoView({
        block: 'nearest',
        inline: 'start',
        behavior,
      });

      window.setTimeout(updateRailState, reduceMotion ? 0 : 260);
    },
    [reduceMotion, updateRailState],
  );

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }

    if (dragStateRef.current.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    dragStateRef.current.isDown = false;
    setIsDragging(false);
    updateRailState();
  };

  const selectProject = (index: number, shouldScroll = false) => {
    setActiveProjectIndex(index);
    if (shouldScroll) {
      scrollProjectIntoView(index);
    }
  };

  const moveProject = (direction: -1 | 1) => {
    const nextProjectIndex = Math.min(Math.max(activeProjectIndex + direction, 0), projects.length - 1);
    if (nextProjectIndex === activeProjectIndex) return;
    selectProject(nextProjectIndex, true);
  };

  return (
    <section
      ref={sectionRef}
      data-section="latest-projects"
      className="h-[100svh] overflow-hidden bg-[#f6f6f2] py-4 text-ink md:py-6 lg:py-8"
    >
      <div className="urblo-page-container h-full">
        <div
          data-project-active-region="homepage-latest-projects"
          className="homepage-project-layout grid h-full min-h-0 gap-3 md:gap-4 xl:gap-6"
        >
          <Reveal className="homepage-project-copy min-h-0">
            <div
              data-project-active-copy="homepage-latest-projects"
              className="flex h-full min-h-0 flex-col overflow-hidden border-t border-ink/18 pt-3 md:pt-4 lg:pt-5"
            >
              <div className="shrink-0">
                <div className="h-[5px] w-16 bg-lime" />
                <SectionHeading
                  level="display"
                  title={homepageData.latestProjects.title}
                  className="mt-3 lg:mt-4"
                  titleClassName="homepage-project-title max-w-[18ch] leading-[1.02] md:leading-[1.02] lg:leading-[1.02]"
                />
                <p className="homepage-project-intro mt-3 max-w-[42rem] text-small font-light text-body md:mt-4 md:text-copy md:leading-7">
                  {homepageData.latestProjects.intro}
                </p>
              </div>

              <div className="homepage-project-active-panel mt-auto min-h-0 pt-3 md:pt-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeProject.slug}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: reduceMotion ? 0.18 : 0.3, ease: 'easeOut' }}
                    className="grid gap-2 md:gap-3"
                  >
                    <p className="text-meta font-semibold uppercase tracking-eyebrow text-muted">
                      {String(activeProjectIndex + 1).padStart(2, '0')} /{' '}
                      {String(projects.length).padStart(2, '0')}
                    </p>
                    <h3 className="line-clamp-2 max-w-[34rem] text-title-sm font-semibold leading-[1.08] text-ink xl:text-title xl:leading-[1.08]">
                      {activeProject.title}
                    </h3>

                    <p className="homepage-project-active-summary line-clamp-2 max-w-[34rem] overflow-hidden text-small leading-5 text-body md:line-clamp-3 md:leading-6 xl:leading-7">
                      {activeProject.summary}
                    </p>

                    <div className="homepage-project-active-actions">
                      <dl className="homepage-project-active-facts hidden grid-cols-2 gap-x-4 gap-y-2 border-y border-line py-3 text-meta uppercase tracking-caps text-muted sm:grid sm:grid-cols-3">
                        <div>
                          <dt>Location</dt>
                          <dd className="mt-1 line-clamp-1 text-meta font-semibold normal-case tracking-normal text-ink md:text-small">
                            {activeProject.location}
                          </dd>
                        </div>
                        <div className="hidden sm:block">
                          <dt>Scope</dt>
                          <dd className="mt-1 line-clamp-1 text-meta font-semibold normal-case tracking-normal text-ink md:text-small">
                            {activeProject.category}
                          </dd>
                        </div>
                        <div>
                          <dt>Year</dt>
                          <dd className="mt-1 text-meta font-semibold tracking-normal text-ink md:text-small">
                            {activeProject.year}
                          </dd>
                        </div>
                      </dl>
                      <Button
                        variant="ghost"
                        size="sm"
                        to={`/projects/${activeProject.slug}`}
                        className="homepage-project-active-link urblo-focus-inset group mt-3 md:mt-4"
                      >
                        <span>View project</span>
                        <span
                          className="inline-flex items-center justify-center transition duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          <ArrowIcon />
                        </span>
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>

          <Reveal className="homepage-project-feature min-h-0">
            <div
              data-project-active-image="homepage-latest-projects"
              className="relative h-full min-h-0 overflow-hidden bg-black"
            >
              <AnimatePresence mode="wait" initial={false}>
                {loadProjectMedia ? (
                  <motion.img
                    key={activeFeatureImage}
                    src={activeFeatureImage}
                    alt={activeFeatureImageAlt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.025 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                    transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: 'easeOut' }}
                  />
                ) : null}
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/38 to-transparent" />
            </div>
          </Reveal>

          <Reveal
            delay={0.08}
            className={`homepage-project-rail min-h-0 ${
              railState.canScrollNext ? 'homepage-project-rail--can-next' : ''
            } ${railState.canScrollPrev ? 'homepage-project-rail--can-prev' : ''}`}
          >
            <div className="homepage-project-rail-controls pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-2 pt-2 md:px-3 md:pt-3">
              <div className="flex items-center gap-2 text-black/42">
                <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
                <div
                  className="homepage-project-rail-progress h-px w-16 overflow-hidden bg-black/18 sm:w-20"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full bg-black transition-transform duration-300"
                    style={{
                      width: `${100 / projects.length}%`,
                      transform: `translateX(${activeProjectIndex * 100}%)`,
                    }}
                  />
                </div>
              </div>
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/18 bg-white/82 text-black shadow-sm backdrop-blur-sm transition duration-200 hover:border-black/34 hover:bg-white disabled:pointer-events-none disabled:opacity-35"
                  aria-label="Previous project"
                  disabled={activeProjectIndex === 0}
                  onClick={() => moveProject(-1)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/18 bg-white/82 text-black shadow-sm backdrop-blur-sm transition duration-200 hover:border-black/34 hover:bg-white disabled:pointer-events-none disabled:opacity-35"
                  aria-label="Next project"
                  disabled={activeProjectIndex === projects.length - 1}
                  onClick={() => moveProject(1)}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div
              ref={railRef}
              data-project-rail="homepage-latest-projects"
              style={{ overflowAnchor: 'none' }}
              className={`homepage-project-rail-track flex h-full snap-x snap-mandatory gap-3 overflow-x-auto pr-1 select-none md:gap-4 xl:gap-6 ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onPointerDown={(event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return;

                const rail = railRef.current;
                if (!rail) return;

                dragStateRef.current = {
                  isDown: true,
                  moved: false,
                  startX: event.clientX,
                  scrollLeft: rail.scrollLeft,
                };
                rail.setPointerCapture(event.pointerId);
                setIsDragging(true);
              }}
              onPointerMove={(event) => {
                const rail = railRef.current;
                const dragState = dragStateRef.current;
                if (!rail || !dragState.isDown) return;

                const delta = event.clientX - dragState.startX;
                if (Math.abs(delta) > 8) {
                  dragState.moved = true;
                }
                rail.scrollLeft = dragState.scrollLeft - delta * 1.08;
              }}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onLostPointerCapture={() => {
                dragStateRef.current.isDown = false;
                setIsDragging(false);
              }}
            >
              {projects.map((project, index) => {
                const isActive = activeProject.slug === project.slug;

                return (
                  <button
                    key={project.slug}
                    type="button"
                    data-project-thumb={project.slug}
                    data-project-thumb-index={index}
                    aria-pressed={isActive}
                    aria-label={`Show ${project.title}`}
                    className="urblo-focus-inset group h-full w-[42%] flex-none snap-start text-left sm:w-[calc(50%_-_8px)] md:w-[calc(25%_-_12px)] xl:w-[calc(25%_-_18px)]"
                    onMouseEnter={() => {
                      if (!dragStateRef.current.isDown && !suppressClickRef.current) selectProject(index);
                    }}
                    onFocus={() => selectProject(index, true)}
                    onClick={() => {
                      if (suppressClickRef.current) return;
                      selectProject(index, true);
                    }}
                  >
                    <span className="homepage-project-thumb-media relative block h-full overflow-hidden bg-black/10">
                      {loadProjectMedia ? (
                        <img
                          src={project.image}
                          alt=""
                          draggable={false}
                          {...lazyImageProps}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035] group-focus-visible:scale-[1.035]"
                        />
                      ) : null}
                      <span
                        className={`absolute inset-x-0 top-0 h-[5px] transition duration-200 ${
                          isActive ? 'bg-[var(--urblo-lime)]' : 'bg-transparent'
                        }`}
                      />
                      <span
                        className={`absolute inset-0 transition duration-200 ${
                          isActive ? 'bg-black/10' : 'bg-black/24 group-hover:bg-black/12'
                        }`}
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 via-black/38 to-transparent px-3 pb-3 pt-12 text-white md:px-4 md:pb-4">
                        <span
                          className={`block text-meta font-semibold uppercase tracking-eyebrow transition duration-200 ${
                            isActive ? 'text-lime' : 'text-inverse-body'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="mt-2 block line-clamp-2 text-copy font-semibold leading-[1.05] text-inverse lg:text-lead lg:leading-[1.05]">
                          {project.title}
                        </span>
                        <span className="mt-1 block truncate text-meta leading-5 text-inverse-body">
                          {project.location} / {project.year}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Manifesto display lines: 44 → 64 → 104 → 140 (type scale title-lg, display, hero, hero-lg).
const manifestoLineClassName =
  'text-title-lg font-bold uppercase leading-none sm:text-display sm:leading-none md:text-hero md:leading-none xl:text-hero-lg xl:leading-none';

function ManifestoSection() {
  const [backgroundRef, loadBackground] = useNearViewport<HTMLDivElement>('700px');

  return (
    <section className="overflow-hidden bg-white pb-0 pt-20 text-white">
      <Reveal>
        <div
          ref={backgroundRef}
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={
            loadBackground
              ? { backgroundImage: `url('${homepageData.manifesto.backgroundImage}')` }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/75" />

          <div className="relative z-[1] w-full">
            {/* One heading for assistive technology; the typographic lines below are presentation. */}
            <h2 className="sr-only">{homepageData.manifesto.lines.join(' ')}</h2>
            <p aria-hidden="true" className={`flex items-center justify-center px-4 py-6 text-center ${manifestoLineClassName}`}>
              {homepageData.manifesto.lines[0]}
            </p>
            <div className="h-px w-full bg-[#565555]" />

            <div className="flex w-full flex-col items-center justify-center gap-0 sm:flex-row sm:gap-[30px]">
              <p aria-hidden="true" className={`flex min-h-[85px] items-center justify-center px-4 py-4 text-center sm:min-h-[100px] md:px-6 md:py-6 ${manifestoLineClassName}`}>
                {homepageData.manifesto.lines[1]}
              </p>
              <div className="mb-8 h-[80px] w-[140px] overflow-hidden rounded-[100px] sm:mb-0 sm:h-[150px] sm:w-[300px]">
                <img
                  src={homepageData.manifesto.image}
                  alt=""
                  {...lazyImageProps}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="h-px w-full bg-[#565555]" />

            <div className="flex w-full flex-col items-center justify-center gap-0 px-4 py-4 sm:flex-row sm:gap-5 sm:px-0 sm:py-0 md:gap-[60px]">
              <p className="mb-8 mt-6 w-full max-w-[300px] text-center text-small font-light leading-[1.2] text-inverse/90 sm:mb-0 sm:mt-0 sm:text-right sm:text-lead sm:leading-[1.8]">
                {homepageData.manifesto.supportingText}
              </p>
              <p aria-hidden="true" className={`flex min-h-[85px] items-center justify-center px-4 py-4 text-center sm:min-h-[100px] md:px-6 md:py-6 ${manifestoLineClassName}`}>
                {homepageData.manifesto.lines[2]}
              </p>
            </div>

            <div className="h-px w-full bg-[#565555]" />

            <p
              aria-hidden="true"
              className={`flex min-h-[85px] items-center justify-center px-4 py-4 text-center text-transparent sm:min-h-[100px] md:px-6 md:py-6 ${manifestoLineClassName}`}
              style={{ WebkitTextStroke: '2px var(--urblo-lime)' }}
            >
              {homepageData.manifesto.lines[3]}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function LogoCarouselItem({ logo, decorative = false }: { logo: HomepageLogo; decorative?: boolean }) {
  return (
    <div className="flex h-[110px] w-[240px] shrink-0 items-center justify-center px-8 md:w-[320px] lg:w-[360px] xl:w-[489.5px]">
      <img
        src={logo.image}
        alt={decorative ? '' : logo.alt}
        className="max-h-[52px] w-auto max-w-full object-contain"
        {...lazyImageProps}
      />
    </div>
  );
}

function LogoCarouselSection() {
  const logos = homepageData.logoCarousel;

  return (
    <section aria-label="Project partners" className="overflow-hidden bg-white py-16 md:py-20">
      <div className="logo-carousel-viewport urblo-focus-inset overflow-hidden">
        <div className="animate-marquee flex w-max items-center">
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              aria-hidden={groupIndex === 1 ? true : undefined}
              className="flex shrink-0 items-center"
            >
              {logos.map((logo) => (
                <LogoCarouselItem
                  key={`${groupIndex}-${logo.alt}`}
                  logo={logo}
                  decorative={groupIndex === 1}
                />
              ))}
            </div>
          ))}
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
        <iframe
          className="aspect-video w-full"
          src={`https://www.youtube-nocookie.com/embed/${homepageData.videoCta.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title="Urblo project video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function VideoCTASection() {
  const [open, setOpen] = useState(false);
  const [sectionRef, loadBackground] = useNearViewport<HTMLElement>('700px');

  return (
    <>
      <section ref={sectionRef} className="relative min-h-[617px] overflow-hidden bg-black text-white">
        {loadBackground ? (
          <img
            src={homepageData.videoCta.backgroundImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto flex min-h-[617px] max-w-[1440px] items-center justify-center px-6 py-16">
          <Reveal className="text-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group inline-flex h-[193px] w-[193px] items-center justify-center rounded-full border-4 border-white/50 text-center text-title-sm uppercase tracking-caps text-[#B8BB9C] transition-colors hover:border-lime hover:text-lime"
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
      <MetricsSection />
      <PartnerBannerSection />
      <LatestProjectsSection />
      <ProductShowcaseSection />
      <ManifestoSection />
      <LogoCarouselSection />
      <VideoCTASection />
    </>
  );
}
