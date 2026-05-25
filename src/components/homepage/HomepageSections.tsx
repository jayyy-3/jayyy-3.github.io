import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  homepageData,
  type HomepageCollaborationCard,
  type HomepageCostComparisonRow,
  type HomepageFeaturePanelId,
  type HomepageLogo,
  type HomepageMetric,
  type HomepageProject,
} from '../../data/homepage';
import AnimatedNumber from '../AnimatedNumber';

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

function RingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 46" className={className} aria-hidden="true">
      <circle cx="23" cy="23" r="21.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M23 10c-5 5-8 9-8 14a8 8 0 0016 0c0-5-3-9-8-14z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LongArrowDownIcon() {
  return (
    <svg viewBox="0 0 14 62" fill="none" className="h-[62px] w-[14px]" aria-hidden="true">
      <path d="M7 1L7 61" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M1 55.2856L7 61.2856L13 55.2856"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollaborationCardIcon({
  icon,
  className,
}: {
  icon: NonNullable<HomepageCollaborationCard['icon']>;
  className?: string;
}) {
  if (icon === 'product-development') {
    return (
      <svg viewBox="0 0 44 40" fill="none" className={className} aria-hidden="true">
        <path
          d="M42.3115 20.1712C40.8176 18.5753 38.3976 18.2712 36.556 19.4495L28.1461 24.8337C27.7346 24.1701 27.1512 23.6051 26.4088 23.2381L20.5619 20.3485L13.1494 21.8312V20.4218H0.493164V39.8281H13.1494V38.1891L27.8129 38.7404L41.9473 26.6675C43.8696 25.0239 44.043 22.0211 42.3115 20.1712ZM10.6181 37.2968H3.0244V22.9531H10.6181V37.2968ZM40.3027 24.7427C40.2933 24.7507 26.9197 36.1746 26.9197 36.1746L13.1494 35.656V24.4123L20.2125 23L25.2865 25.5074C26.1566 25.9375 26.5316 27.0029 26.1221 27.8829C25.7191 28.7522 24.7056 29.1543 23.8174 28.7959L19.2221 26.9526L18.2795 29.3026C18.2795 29.3026 22.8703 31.1441 22.8748 31.1458C24.9088 31.9617 27.4771 30.9719 28.4176 28.9507C28.6472 28.4572 28.7648 27.9392 28.7981 27.4223L37.9205 21.582C38.7354 21.0604 39.8041 21.1955 40.4625 21.9C41.2283 22.7185 41.1257 24.0397 40.3027 24.7427Z"
          fill="currentColor"
        />
        <path
          d="M15.681 4.4928V17.8906H36.7747V4.4928L41.3643 9.08235L43.154 7.29267L36.0331 0.171875H16.4226L9.30176 7.29267L11.0914 9.08235L15.681 4.4928ZM18.2122 15.3594V2.70312H34.2435V15.3594H18.2122Z"
          fill="currentColor"
        />
        <path d="M26.6494 10.2969H20.7432V12.8281H26.6494V10.2969Z" fill="currentColor" />
      </svg>
    );
  }

  if (icon === 'cost-control') {
    return (
      <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
        <path
          d="M11.875 0.484375C5.59384 0.484375 0.484375 5.59384 0.484375 11.875C0.484375 18.1562 5.59384 23.2656 11.875 23.2656C18.1562 23.2656 23.2656 18.1562 23.2656 11.875C23.2656 5.59384 18.1562 0.484375 11.875 0.484375ZM11.875 20.7344C6.98965 20.7344 3.01562 16.7603 3.01562 11.875C3.01562 6.98965 6.98965 3.01562 11.875 3.01562C16.7603 3.01562 20.7344 6.98965 20.7344 11.875C20.7344 16.7603 16.7603 20.7344 11.875 20.7344Z"
          fill="currentColor"
        />
        <path
          d="M13.1406 5.125H10.6094V7.24993C9.39071 7.63998 8.5 8.77047 8.5 10.1175C8.5 11.7844 9.85626 13.1406 11.5232 13.1406H12.2268C12.4979 13.1406 12.7187 13.3615 12.7187 13.6325C12.7187 13.9044 12.4979 14.1253 12.2268 14.1253H8.5V16.6565H10.6094V18.625H13.1406V16.5C14.3593 16.1099 15.25 14.9795 15.25 13.6325C15.25 11.9656 13.8937 10.6094 12.2268 10.6094H11.5232C11.2521 10.6094 11.0312 10.3885 11.0312 10.1175C11.0312 9.84556 11.2521 9.62473 11.5232 9.62473H15.25V7.09349H13.1406V5.125Z"
          fill="currentColor"
        />
        <path
          d="M20.7344 24.1094V43.5156H43.5156V24.1094H20.7344ZM29.5938 26.6406H34.6562V31.99L32.125 31.0619L29.5938 31.99V26.6406ZM40.9844 40.9844H23.2656V26.6406H27.0625V35.6349L32.125 33.7618L37.1875 35.6349V26.6406H40.9844V40.9844Z"
          fill="currentColor"
        />
        <path
          d="M6.39047 32.125V29.5938L8.11504 30.8874L9.63445 28.8637L5.12484 25.4805L0.615234 28.8637L2.13464 30.8874L3.85922 29.5938V32.125C3.85922 37.4759 8.21228 41.8281 13.5623 41.8281H18.6248V39.2969H13.5623C9.60809 39.2969 6.39047 36.0801 6.39047 32.125Z"
          fill="currentColor"
        />
        <path
          d="M37.6094 15.25V17.7811L35.8848 16.4876L34.3654 18.513L38.875 21.8945L43.3846 18.5129L41.8652 16.4876L40.1406 17.7811V15.25C40.1406 9.89993 35.7876 5.54688 30.4375 5.54688H25.375V8.07812H30.4375C34.3918 8.07812 37.6094 11.2957 37.6094 15.25Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (icon === 'specification') {
    return (
      <svg viewBox="0 0 50 50" fill="none" className={className} aria-hidden="true">
        <path
          d="M43.6765 36.8824V30.0882H26.2059V26.2059H29.6996V24.75C29.6996 23.8249 30.3204 23.3662 30.5868 23.2126C30.8522 23.0591 31.5583 22.7482 32.3621 23.2126L33.6227 23.9405L38.5723 15.3683L37.3117 14.6403C36.5108 14.1778 36.4245 13.4119 36.4245 13.1029C36.4245 12.7939 36.5108 12.0281 37.3117 11.5655L38.5723 10.8376L33.6218 2.26533L32.3611 2.99327C31.5612 3.45582 30.8541 3.14492 30.5868 2.99327C30.3205 2.83973 29.6996 2.38097 29.6996 1.45588V0H19.8004V1.45588C19.8004 2.38097 19.1796 2.83973 18.9132 2.99327C18.6469 3.14492 17.9379 3.45582 17.1379 2.99327L15.8773 2.26533L10.9277 10.8376L12.1883 11.5655C12.9892 12.0281 13.0755 12.7939 13.0755 13.1029C13.0755 13.4119 12.9892 14.1778 12.1883 14.6403L10.9277 15.3683L15.8782 23.9405L17.1388 23.2126C17.9407 22.7501 18.6469 23.0591 18.9132 23.2126C19.1795 23.3662 19.8004 23.8249 19.8004 24.75V26.2059H23.2941V30.0882H5.82353V36.8824H0V49.5H14.5588V36.8824H8.73529V33H23.2941V36.8824H17.4706V49.5H32.0294V36.8824H26.2059V33H40.7647V36.8824H34.9412V49.5H49.5V36.8824H43.6765ZM20.3691 20.6913C19.3388 20.0961 18.1654 19.9198 17.0564 20.1587L14.792 16.2384C15.5559 15.3929 15.9872 14.2915 15.9872 13.1029C15.9872 11.9144 15.5559 10.813 14.792 9.9675L17.0564 6.04723C18.1682 6.28229 19.3388 6.11168 20.3691 5.51455C21.3984 4.92119 22.1368 3.99609 22.4856 2.91176H27.0144C27.3632 3.99609 28.1016 4.91929 29.1309 5.51453C30.1612 6.11168 31.3346 6.28229 32.4436 6.04721L34.708 9.96747C33.9441 10.813 33.5128 11.9144 33.5128 13.1029C33.5128 14.2915 33.9441 15.3929 34.708 16.2384L32.4436 20.1587C31.3309 19.9198 30.1612 20.0961 29.1309 20.6913C28.1016 21.2847 27.3632 22.2098 27.0144 23.2941H22.4856C22.1368 22.2098 21.3984 21.2866 20.3691 20.6913ZM11.6471 46.5882H2.91176V39.7941H5.82353V42.2206H8.73529V39.7941H11.6471V46.5882ZM29.1176 46.5882H20.3824V39.7941H23.2941V42.2206H26.2059V39.7941H29.1176V46.5882ZM46.5882 46.5882H37.8529V39.7941H40.7647V42.2206H43.6765V39.7941H46.5882V46.5882Z"
          fill="currentColor"
        />
        <path
          d="M31.0591 13.103C31.0591 9.62444 28.2288 6.79419 24.7502 6.79419C21.2717 6.79419 18.4414 9.62444 18.4414 13.103C18.4414 16.5816 21.2717 19.4118 24.7502 19.4118C28.2288 19.4118 31.0591 16.5816 31.0591 13.103ZM24.7502 16.5001C22.8773 16.5001 21.3532 14.9759 21.3532 13.103C21.3532 11.2301 22.8773 9.70595 24.7502 9.70595C26.6232 9.70595 28.1473 11.2301 28.1473 13.103C28.1473 14.9759 26.6232 16.5001 24.7502 16.5001Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (icon === 'off-site') {
    return (
      <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
        <path
          d="M15.6719 29.9133V33.3905H18.2031V43.5155H25.7969V33.3905H28.3281V29.9133L22 23.5852L15.6719 29.9133ZM23.2656 30.8593V40.9843H20.7344V30.8593H18.3053L22 27.1646L25.6947 30.8593H23.2656Z"
          fill="currentColor"
        />
        <path
          d="M37.1875 15.1477L30.8594 21.4758V24.953H33.3906V43.5155H40.9844V24.953H43.5156V21.4758L37.1875 15.1477ZM38.4531 22.4218V40.9843H35.9219V22.4218H33.4928L37.1875 18.7271L40.8822 22.4218H38.4531Z"
          fill="currentColor"
        />
        <path
          d="M0.484375 21.4758V24.953H3.01562V43.5155H10.6094V24.953H13.1406V21.4758L6.8125 15.1477L0.484375 21.4758ZM8.07812 22.4218V40.9843H5.54688V22.4218H3.1178L6.8125 18.7271L10.5072 22.4218H8.07812Z"
          fill="currentColor"
        />
        <path
          d="M12.2969 0.484375V16.5156H31.7031V0.484375H12.2969ZM20.3125 3.01562H23.6875V7.23438H20.3125V3.01562ZM29.1719 13.9844H14.8281V3.01562H17.7812V9.76562H26.2188V3.01562H29.1719V13.9844Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <rect x="24" y="20" width="8" height="8" fill="currentColor" />
      <rect x="22" y="6" width="4" height="18" fill="currentColor" />
      <rect x="30" y="32" width="4" height="18" fill="currentColor" />
      <rect x="6" y="22" width="18" height="4" fill="currentColor" />
      <rect x="32" y="30" width="18" height="4" fill="currentColor" />
      <rect x="26" y="2" width="4" height="16" transform="rotate(90 26 2)" fill="currentColor" />
      <rect x="30" y="54" width="4" height="16" transform="rotate(-90 30 54)" fill="currentColor" />
    </svg>
  );
}

function FeatureTabIcon({
  panelId,
  className,
}: {
  panelId: HomepageFeaturePanelId;
  className?: string;
}) {
  if (panelId === 'sustainability') {
    return <RingIcon className={className} />;
  }

  if (panelId === 'installation') {
    return <CollaborationCardIcon icon="off-site" className={className} />;
  }

  if (panelId === 'cost-saving') {
    return <CollaborationCardIcon icon="cost-control" className={className} />;
  }

  return (
    <svg viewBox="0 0 46 46" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="6" width="18" height="18" stroke="currentColor" strokeWidth="1.5" />
      <rect x="22" y="22" width="18" height="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 15h6v1.5h-6zM24 18h11v1.5H24zM11 27h11v1.5H11zM16 30h6v1.5h-6z" fill="currentColor" />
    </svg>
  );
}

function renderRichText(value: string) {
  return value.split(/(\*\*.*?\*\*)/g).map((chunk, index) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={`${chunk}-${index}`} className="font-[750]">
          {chunk.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${chunk}-${index}`}>{chunk}</span>;
  });
}

function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={homepageData.hero.posterUrl}
        aria-label="Urblo stone streetscape project video"
      >
        <source src={homepageData.hero.videoUrl} type="video/mp4" media="(min-width: 768px)" />
      </video>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] items-end px-6 pb-24 pt-32 md:px-10 lg:px-[94px]">
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

function SustainabilityOverviewPanel() {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.48fr_0.52fr] lg:items-center">
      <div className="lg:flex lg:justify-end">
        <div className="w-full max-w-[545px] lg:max-w-[85%]">
          <div className="relative overflow-hidden rounded-[4px]">
            <img
              src={homepageData.sustainability.footprintUrl}
              alt="Carbon neutral footprint"
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.svg
                viewBox="0 0 100 100"
                className="h-[76%] w-[76%] text-[var(--urblo-lime)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
                aria-hidden="true"
              >
                <path
                  id="homepage-carbon-circle"
                  d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"
                  fill="none"
                />
                <text
                  fill="currentColor"
                  fontSize="8.6"
                  fontWeight="800"
                  letterSpacing="0.12em"
                  style={{ textTransform: 'uppercase' }}
                >
                  <textPath href="#homepage-carbon-circle">CARBON NEUTRAL COMMITMENT</textPath>
                </text>
              </motion.svg>
              <div className="absolute w-[180px] max-w-[44%] text-center text-[18px] font-medium leading-[1.5] text-[var(--urblo-lime)] sm:text-[20px]">
                <span>
                  CO<sub>2</sub>e offset
                  <br />
                  pathway
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[552px] space-y-8 text-[20px] font-light leading-8 text-black md:text-[22px]">
        {homepageData.sustainability.paragraphs.map((paragraph) => (
          <p key={paragraph}>{renderRichText(paragraph)}</p>
        ))}
      </div>
    </div>
  );
}

function InstallationPanel({
  activeStepId,
  onStepChange,
}: {
  activeStepId: string;
  onStepChange: (stepId: string) => void;
}) {
  const steps = homepageData.sustainability.installation.steps;
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];

  return (
    <div className="grid gap-12 lg:grid-cols-[0.54fr_0.46fr] lg:items-center">
      <div className="order-2 lg:order-1">
        <div className="relative h-[300px] overflow-hidden rounded-[4px] bg-black/20 sm:h-[400px] lg:h-[500px]">
          {steps.map((step) => (
            <img
              key={step.id}
              src={step.image}
              alt={step.title}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                step.id === activeStep.id ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:pl-20">
        <div className="mb-10 text-[16px] leading-7 text-black/80">
          {homepageData.sustainability.installation.duration}
        </div>

        <div className="space-y-5">
          {steps.map((step, index) => {
            const active = step.id === activeStep.id;

            return (
              <div key={step.id}>
                <button
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  onMouseEnter={() => onStepChange(step.id)}
                  onFocus={() => onStepChange(step.id)}
                  className="flex w-full items-center text-left"
                  aria-pressed={active}
                >
                  <div
                    className={`min-w-[80px] text-[60px] font-[800] leading-[0.8] md:min-w-[92px] md:text-[70px] ${
                      active ? 'text-[var(--urblo-lime)]' : 'text-black'
                    }`}
                  >
                    {step.index}
                  </div>
                  <div className="pl-5 md:pl-8">
                    <div className="mb-2 text-[18px] leading-7 text-[#666]">{step.label}</div>
                    <div className="text-[28px] font-semibold leading-[1.1] text-black md:text-[30px]">
                      {step.title}
                    </div>
                  </div>
                </button>

                {index < steps.length - 1 ? (
                  <div className="pl-[34px] pt-3 text-black/80 md:pl-[40px]">
                    <LongArrowDownIcon />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CostBar({
  row,
  side,
  active,
  delay,
}: {
  row: HomepageCostComparisonRow;
  side: 'left' | 'right';
  active: boolean;
  delay: number;
}) {
  const percentage = side === 'left' ? row.leftPercentage : row.rightPercentage;

  return (
    <div className={`flex w-full ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
      <motion.div
        className={`h-12 ${side === 'left' ? 'bg-[#D9D9D9]' : 'bg-black'}`}
        initial={{ width: 0 }}
        animate={{ width: active ? `${percentage}%` : 0 }}
        transition={{ duration: 0.45, delay, ease: 'easeOut' }}
        style={{ originX: side === 'left' ? 1 : 0 }}
      />
    </div>
  );
}

function CostSavingPanel({ active }: { active: boolean }) {
  const rows = homepageData.sustainability.costSaving.rows;
  const summaryRows = rows.slice(0, -1);
  const totalRow = rows[rows.length - 1];

  return (
    <div>
      <div className="mb-8 grid overflow-hidden rounded-[4px] sm:grid-cols-2 lg:hidden">
        {[
          {
            title: homepageData.sustainability.costSaving.leftTitle,
            image: homepageData.sustainability.costSaving.leftImage,
          },
          {
            title: homepageData.sustainability.costSaving.rightTitle,
            image: homepageData.sustainability.costSaving.rightImage,
          },
        ].map((item) => (
          <div key={item.title} className="relative h-[220px]">
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center text-[34px] font-bold uppercase leading-[1.2] text-white">
              {item.title}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:grid lg:grid-cols-[0.2fr_0.6fr_0.2fr] lg:items-stretch">
        <div className="relative min-h-[342px] overflow-hidden">
          <img
            src={homepageData.sustainability.costSaving.leftImage}
            alt={homepageData.sustainability.costSaving.leftTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/22" />
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center font-display text-[38px] font-bold uppercase leading-[1.15] text-white">
            {homepageData.sustainability.costSaving.leftTitle}
          </div>
        </div>

        <div className="px-6 lg:px-10">
          <div className="grid grid-cols-[2fr_1fr_2fr] gap-x-4 gap-y-6">
            {summaryRows.map((row, index) => (
              <Fragment key={row.label}>
                <CostBar row={row} side="left" active={active} delay={0.06 * index} />
                <div className="flex items-center justify-center text-center text-[16px] font-normal uppercase leading-7 text-black">
                  {row.label}
                </div>
                <CostBar row={row} side="right" active={active} delay={0.06 * index} />
              </Fragment>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-[2fr_1fr_2fr] items-center gap-x-4">
            <motion.div
              className="ml-auto flex h-12 items-center justify-end rounded-l-[10px] bg-[#6d6d6d] px-6 text-right text-[15px] uppercase leading-8 text-white"
              initial={{ width: 0 }}
              animate={{ width: active ? `${totalRow.leftPercentage}%` : 0 }}
              transition={{ duration: 0.45, delay: 0.36, ease: 'easeOut' }}
              style={{ originX: 1 }}
            >
              <span className="whitespace-nowrap">Insitu concrete total cost</span>
            </motion.div>
            <div className="text-center text-[24px] font-bold uppercase leading-8 text-black">TOTAL</div>
            <motion.div
              className="flex h-12 items-center rounded-r-[10px] bg-black px-6 text-[15px] uppercase leading-8 text-white"
              initial={{ width: 0 }}
              animate={{ width: active ? `${totalRow.rightPercentage}%` : 0 }}
              transition={{ duration: 0.45, delay: 0.42, ease: 'easeOut' }}
              style={{ originX: 0 }}
            >
              <span className="whitespace-nowrap">Stone solution total cost</span>
            </motion.div>
          </div>
        </div>

        <div className="relative min-h-[342px] overflow-hidden">
          <img
            src={homepageData.sustainability.costSaving.rightImage}
            alt={homepageData.sustainability.costSaving.rightTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/22" />
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center font-display text-[38px] font-bold uppercase leading-[1.15] text-white">
            {homepageData.sustainability.costSaving.rightTitle}
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1.4fr] gap-x-3 gap-y-4">
          {summaryRows.map((row, index) => (
            <Fragment key={`mobile-${row.label}`}>
              <CostBar row={row} side="left" active={active} delay={0.05 * index} />
              <div className="flex items-center justify-center text-center text-[13px] uppercase leading-5 text-black">
                {row.label}
              </div>
              <CostBar row={row} side="right" active={active} delay={0.05 * index} />
            </Fragment>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-[1.4fr_1fr_1.4fr] items-center gap-x-3">
          <motion.div
            className="ml-auto h-10 rounded-l-[10px] bg-[#6d6d6d]"
            initial={{ width: 0 }}
            animate={{ width: active ? `${totalRow.leftPercentage}%` : 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
            style={{ originX: 1 }}
          />
          <div className="text-center text-[16px] font-bold uppercase leading-6 text-black">Total</div>
          <motion.div
            className="h-10 rounded-r-[10px] bg-black"
            initial={{ width: 0 }}
            animate={{ width: active ? `${totalRow.rightPercentage}%` : 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
            style={{ originX: 0 }}
          />
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-[1044px] text-center text-[18px] font-semibold leading-8 text-black md:text-[20px]">
        {homepageData.sustainability.costSaving.note}
      </p>
    </div>
  );
}

function CollaborationCard({ card }: { card: HomepageCollaborationCard }) {
  const dark = card.variant === 'dark';

  return (
    <div className="h-[220px] overflow-hidden rounded-[6px] sm:h-[250px] xl:h-[280px]">
      <div className={`relative h-full ${dark ? 'bg-black/40 text-white' : 'bg-[#F5F5F5] text-black'}`}>
        {card.image ? (
          <>
            <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : null}

        <div className="absolute bottom-6 left-6 right-6 z-[1]">
          {card.icon ? (
            <CollaborationCardIcon icon={card.icon} className="mb-4 h-11 w-11 text-current" />
          ) : null}
          <div className="mb-4 text-[20px] font-medium">{card.index}</div>
          <div className="text-[20px] font-normal capitalize leading-8">{card.title}</div>
        </div>
      </div>
    </div>
  );
}

function DesignCollaborationPanel() {
  const cards = homepageData.sustainability.designCollaboration.cards;
  const doubledCards = [...cards, ...cards];

  return (
    <>
      <div className="hidden space-y-4 lg:block">
        <div className="overflow-hidden">
          <div className="homepage-collaboration-track-left flex w-max gap-2">
            {doubledCards.map((card, index) => (
              <div key={`top-${card.index}-${index}`} className="w-[280px] shrink-0">
                <CollaborationCard card={card} />
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="homepage-collaboration-track-right flex w-max gap-2">
            {doubledCards.map((card, index) => (
              <div key={`bottom-${card.index}-${index}`} className="w-[280px] shrink-0">
                <CollaborationCard card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:hidden xl:grid-cols-3">
        {cards.map((card) => (
          <CollaborationCard key={card.index} card={card} />
        ))}
      </div>
    </>
  );
}

function SustainabilitySection() {
  const [activePanel, setActivePanel] = useState<HomepageFeaturePanelId>('sustainability');
  const [activeStepId, setActiveStepId] = useState(homepageData.sustainability.installation.steps[0].id);

  return (
    <section className="bg-white px-6 py-20 md:px-10 lg:px-[92px] lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="relative lg:min-h-[680px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="lg:absolute lg:inset-0 lg:flex lg:items-center"
              role="tabpanel"
              id={`panel-${activePanel}`}
              aria-labelledby={`tab-${activePanel}`}
            >
              <div className="w-full">
                {activePanel === 'sustainability' ? <SustainabilityOverviewPanel /> : null}
                {activePanel === 'installation' ? (
                  <InstallationPanel activeStepId={activeStepId} onStepChange={setActiveStepId} />
                ) : null}
                {activePanel === 'cost-saving' ? <CostSavingPanel active /> : null}
                {activePanel === 'design-collaboration' ? <DesignCollaborationPanel /> : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            role="tablist"
            aria-label="Homepage feature panels"
            className="mt-14 grid gap-x-6 gap-y-8 border-t border-black/10 pt-10 md:grid-cols-2 xl:grid-cols-4"
          >
            {homepageData.sustainability.tabs.map((tab) => {
              const active = activePanel === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActivePanel(tab.id)}
                  className={`group flex items-start gap-5 rounded-[4px] text-left transition-colors md:min-h-[110px] ${
                    active ? 'text-[var(--urblo-lime)]' : 'text-black hover:text-[var(--urblo-lime)]'
                  }`}
                >
                  <FeatureTabIcon
                    panelId={tab.id}
                    className={`h-[46px] w-[46px] shrink-0 transition-colors ${
                      active ? 'text-[var(--urblo-lime)]' : 'text-current'
                    }`}
                  />
                  <div className="pt-1 text-[28px] font-light leading-[1.1] md:text-[30px]">
                    {tab.title}
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>
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
  const [focusedProduct, setFocusedProduct] = useState<string | null>(null);

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-[94px]">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <h2 className="font-display text-[34px] font-semibold uppercase leading-[1.45] text-black md:text-[44px]">
              Explore our latest{' '}
              <br />
              products
            </h2>
          </Reveal>
          <Reveal
            delay={0.1}
            className="rounded-[4px] bg-black/[0.06] px-8 py-9 text-[20px] font-semibold leading-8 text-black md:text-[22px]"
          >
            {homepageData.productShowcase.intro}
          </Reveal>
        </div>

      </div>

      <Reveal delay={0.15} className="mt-10">
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <div
            className="homepage-product-display relative overflow-hidden rounded-[4px] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${homepageData.productShowcase.backgroundImage}')`,
            }}
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
                      className="relative h-full"
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
                            className="mb-3 text-[70px] font-[800] leading-none text-transparent transition-all duration-200"
                            style={{
                              WebkitTextStroke: focused
                                ? '2px var(--urblo-lime)'
                                : '2px rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            {category.index}
                          </div>
                          <div className="text-[36px] font-semibold leading-[1.1] text-white">
                            {category.title}
                          </div>
                          <div
                            className={`h-[132px] text-[17px] font-semibold leading-[1.5] text-white transition-all duration-200 ease-in-out ${
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
    <div className="border-b border-black/80 pb-5">
      <AnimatedNumber
        value={metric.value}
        className="block text-[72px] font-semibold leading-none text-black md:text-[96px]"
      />
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
        <p
          className={`mt-3 max-w-[28rem] ${
            light ? 'text-[14px] leading-6' : 'text-[18px] leading-8'
          } text-white/85`}
        >
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

function ManifestoSection() {
  return (
    <section className="overflow-hidden bg-white pb-0 pt-20 text-white">
      <Reveal>
        <div
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${homepageData.manifesto.backgroundImage}')` }}
        >
          <div className="absolute inset-0 bg-black/75" />

          <div className="relative z-[1] w-full">
            <h2 className="flex items-center justify-center px-4 py-6 text-center text-[40px] font-bold uppercase leading-none sm:text-[56px] md:text-[100px] xl:text-[140px]">
              {homepageData.manifesto.lines[0]}
            </h2>
            <div className="h-px w-full bg-[#565555]" />

            <div className="flex w-full flex-col items-center justify-center gap-0 sm:flex-row sm:gap-[30px]">
              <h2 className="flex min-h-[85px] items-center justify-center px-4 py-4 text-center text-[40px] font-bold uppercase leading-none sm:min-h-[100px] md:px-6 md:py-6 md:text-[100px] xl:text-[140px]">
                {homepageData.manifesto.lines[1]}
              </h2>
              <div className="mb-8 h-[80px] w-[140px] overflow-hidden rounded-[100px] sm:mb-0 sm:h-[150px] sm:w-[300px]">
                <img
                  src={homepageData.manifesto.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="h-px w-full bg-[#565555]" />

            <div className="flex w-full flex-col items-center justify-center gap-0 px-4 py-4 sm:flex-row sm:gap-5 sm:px-0 sm:py-0 md:gap-[60px]">
              <p className="mb-8 mt-6 w-full max-w-[300px] text-center text-[14px] font-light leading-[1.2] text-white/88 sm:mb-0 sm:mt-0 sm:text-right sm:text-[18px] sm:leading-[1.8]">
                {homepageData.manifesto.supportingText}
              </p>
              <h2 className="flex min-h-[85px] items-center justify-center px-4 py-4 text-center text-[40px] font-bold uppercase leading-none sm:min-h-[100px] md:px-6 md:py-6 md:text-[100px] xl:text-[140px]">
                {homepageData.manifesto.lines[2]}
              </h2>
            </div>

            <div className="h-px w-full bg-[#565555]" />

            <h2
              className="flex min-h-[85px] items-center justify-center px-4 py-4 text-center text-[40px] font-bold uppercase leading-none text-transparent sm:min-h-[100px] md:px-6 md:py-6 md:text-[100px] xl:text-[140px]"
              style={{ WebkitTextStroke: '2px var(--urblo-lime)' }}
            >
              {homepageData.manifesto.lines[3]}
            </h2>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function LogoCarouselItem({ logo }: { logo: HomepageLogo }) {
  return (
    <div className="flex h-[110px] w-[240px] shrink-0 items-center justify-center px-8 md:w-[320px] lg:w-[360px] xl:w-[489.5px]">
      <img src={logo.image} alt={logo.alt} className="max-h-[52px] w-auto max-w-full object-contain" />
    </div>
  );
}

function LogoCarouselSection() {
  const logos = homepageData.logoCarousel;
  const marqueeLogos = [...logos, ...logos, ...logos];

  return (
    <section className="overflow-hidden bg-white py-16 md:py-20">
      <div className="overflow-hidden">
        <div className="animate-marquee flex w-max items-center">
          {marqueeLogos.map((logo, index) => (
            <LogoCarouselItem key={`${logo.alt}-${index}`} logo={logo} />
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
      <ManifestoSection />
      <LogoCarouselSection />
      <VideoCTASection />
    </>
  );
}
