import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Factory,
  FileText,
  Hammer,
  Layers3,
  MapPinned,
  PenTool,
  Ruler,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TurnstileField from '../components/TurnstileField';
import { siteCtas } from '../data/siteChrome';
import { turnstileSiteKey } from '../lib/turnstileConfig';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

type CapabilityModule = {
  id: string;
  index: string;
  title: string;
  summary: string;
  proof: string;
  disciplines: string[];
  applications: string[];
  image: string;
  alt: string;
  Icon: LucideIcon;
};

type ProjectProof = {
  title: string;
  sector: string;
  outcome: string;
  stone: string;
  location: string;
  date: string;
  image?: string;
};

const capabilityModules: CapabilityModule[] = [
  {
    id: 'bespoke-street-furniture',
    index: '01',
    title: 'Bespoke street furniture and public art',
    summary:
      'Custom stone seats, boulders, bollards, planters, sculptures, water features and engraved inlays.',
    proof:
      'Complex 3D geometry is the specialty: the pieces that need design fluency, CNC resolution and a delivery method before anyone starts cutting stone.',
    disciplines: ['3D geometry', 'custom seats', 'public art', 'engraved inlays'],
    applications: ['Civic seats', 'Campus landscapes', 'Public art', 'Water features'],
    image: '/media/launch/homepage/project-artisan-park.jpg',
    alt: 'Bespoke Urblo stone furniture and sculptural public realm elements',
    Icon: PenTool,
  },
  {
    id: 'premium-paving-cladding',
    index: '02',
    title: 'Premium paving and architectural cladding',
    summary:
      'Large-format paving and wall cladding supplied alongside 3D stone elements so the material logic stays continuous across the whole project footprint.',
    proof:
      'Granite, bluestone, sandstone and select international stones can be specified to the brief rather than treated as interchangeable commodity slabs.',
    disciplines: ['large-format paving', 'wall cladding', 'material continuity', 'finish strategy'],
    applications: ['Plazas', 'Promenades', 'Thresholds', 'Feature walls'],
    image: '/media/launch/capabilities/west-side-place-aerial.jpg',
    alt: 'Aerial view of a public realm stone project with curved landscape seating',
    Icon: Layers3,
  },
  {
    id: 'advanced-stone-machining',
    index: '03',
    title: 'Advanced stone machining',
    summary:
      'State-of-the-art CNC capability paired with hand finishing for consistent exposed faces, tight tolerances and civil-scale repetition.',
    proof:
      'Sawn, honed, flamed, polished and bespoke finishes are developed around the architectural intent and checked against how the piece will be handled on site.',
    disciplines: ['CNC machining', 'millimetre tolerance', 'finish samples', 'factory pre-assembly'],
    applications: ['Curved blocks', 'Sculptural seats', 'Bespoke finishes', 'Repeated modules'],
    image: '/media/launch/capabilities/factory-preassembly.jpg',
    alt: 'Urblo stone seating pre-assembled in the factory',
    Icon: Factory,
  },
  {
    id: 'multi-material-assemblies',
    index: '04',
    title: 'Multi-material assemblies',
    summary:
      'Stone-led packages that integrate composite timber tops, metal frames, armrests and concealed structural steel under one coordinated supply line.',
    proof:
      'Every interface, tolerance and finish is resolved together, so project teams are not left coordinating separate stone, timber, steel and install scopes late in the program.',
    disciplines: ['timber interfaces', 'metal frames', 'armrests', 'concealed steel'],
    applications: ['Seat systems', 'Urban furniture', 'Integrated plinths', 'Assembly packages'],
    image: '/media/launch/capabilities/multi-material-quality-review.jpg',
    alt: 'Urblo quality review of a curved stone assembly during factory pre-assembly',
    Icon: Hammer,
  },
  {
    id: 'design-technical-service',
    index: '05',
    title: 'Design and technical service',
    summary:
      'Concept-to-construction support, shop drawings, engineering input and installation guides for time-poor studios and tier-one delivery teams.',
    proof:
      'The service starts upstream: concept reviews, buildability workshops, prototyping, value management and installation methodology before site friction becomes expensive.',
    disciplines: ['ECI input', 'shop drawings', 'engineering input', 'installation guides'],
    applications: ['Design reviews', 'Tender support', 'Site methodology', 'Maintenance guides'],
    image: '/media/launch/homepage/collab-shop-drawing.jpg',
    alt: 'Urblo technical drawing and stone detailing review',
    Icon: FileText,
  },
];

const approachPrinciples = [
  {
    title: 'Design first, always',
    copy:
      'Materials, geometries, finishes and details are reverse-engineered to protect the design intent, not dilute it.',
  },
  {
    title: 'Partner, not vendor',
    copy:
      'Urblo sits beside design and construction teams from sketch through site, acting like part of the studio rather than a quote at the end of an email.',
  },
  {
    title: 'Crafted, not precious',
    copy:
      'CNC precision and hand finishing work together so millimetre tolerances can still move at civil scale and civil program.',
  },
];

const lifecycleSteps = [
  {
    title: 'Early contractor involvement',
    copy:
      'Budgeting, bespoke prototyping, design service and carbon-neutral options for projects working to Green Star and ESG targets.',
  },
  {
    title: 'Tendering',
    copy:
      'Value management and comparative material strategy, including concrete versus stone, to help bids compete on lifecycle value.',
  },
  {
    title: 'Construction and handover',
    copy:
      'Factory pre-assembly, specialised handling support, installation methodology and maintenance guidance carried through practical completion.',
  },
];

const reachItems = [
  {
    title: 'Victoria',
    label: 'Supply and install',
    copy:
      'Certified installation teams support an end-to-end service model from prototype to handover in Urblo\'s home market.',
  },
  {
    title: 'Interstate',
    label: 'Strategic premium supply',
    copy:
      'High-precision supply is paired with project-specific drawings, sequencing and installation methodology for preferred local contractors.',
  },
  {
    title: 'Remote technical service',
    label: 'Australia-wide support',
    copy:
      'Online detailing sessions, express sample delivery and leadership site visits support tier-one works beyond Victoria.',
  },
];

const reachLocations = [
  'Melbourne CBD',
  'South Melbourne',
  'Footscray',
  'Northcote',
  'Alphington',
  'Glen Waverley',
  'Kew',
  'Doreen',
  'Canberra ACT',
  'Queensland underway',
];

const advantageItems = [
  {
    title: 'We speak design and construction',
    copy:
      'Architectural fluency sits beside manufacturing depth, so details, DDA considerations and program risk can be discussed in the same room.',
  },
  {
    title: 'We solve, not just supply',
    copy:
      'When Urblo flags an issue, the goal is to bring the resolved alternative back engineered, costed and ready to draw.',
  },
  {
    title: 'We scale to the rhythm of the project',
    copy:
      'Urblo can work as an external detailing hub for time-poor studios or as a primary supplier on tier-one civil builds.',
  },
  {
    title: 'We are design-owned',
    copy:
      'Finish, tolerance and craft decisions are made by people whose first instinct is design, not procurement alone.',
  },
];

const featuredProjects: ProjectProof[] = [
  {
    title: 'West Side Place',
    sector: 'High-rise plaza and public realm',
    outcome: 'Over 500 linear metres of custom-fabricated landscape seating and sculptural blocks.',
    stone: 'Blueocean bluestone, New Grey granite, Grace Green granite',
    location: '250 Spencer St, Melbourne VIC',
    date: 'Completed Dec 2023',
    image: '/media/launch/capabilities/west-side-place-aerial.jpg',
  },
  {
    title: 'Moon Gate | Woolley Street',
    sector: 'Urban sculpture and public realm',
    outcome: 'Five custom-fabricated large-scale sculptural stone elements.',
    stone: 'New Grey granite and Angola Black granite',
    location: 'Woolley Street, Dickson ACT',
    date: 'Completed Dec 2023',
    image: '/media/launch/capabilities/moon-gate-framed-view.jpg',
  },
  {
    title: 'Artisan Park, Yarra Bend',
    sector: 'Urban community park',
    outcome: '115 linear metres of architectural block seating and landscape plinths.',
    stone: 'New Grey granite',
    location: '55 Parkview Rd, Alphington VIC',
    date: 'Completed Apr 2024',
    image: '/media/launch/projects/artisan-park-yarrabend/cover.png',
  },
  {
    title: 'Xavier College',
    sector: 'Education and heritage landscape',
    outcome: '12 linear metres of bespoke masonry for landscape integration.',
    stone: 'Ivory Sand Sparrow Peck Finish sandstone',
    location: '135 Barkers Rd, Kew VIC',
    date: 'Completed Apr 2024',
    image: '/media/launch/projects/xavier-college/cover.jpg',
  },
];

const projectLedger: ProjectProof[] = [
  ...featuredProjects,
  {
    title: 'The Glen',
    sector: 'Premium retail and lifestyle precinct',
    outcome: 'Public realm paving and stone landscape works for a retail precinct.',
    stone: 'Blueocean bluestone',
    location: '235 Springvale Rd, Glen Waverley VIC',
    date: 'Completed Oct 2023',
  },
  {
    title: 'Aitken College',
    sector: 'Educational campus landscape',
    outcome: 'Custom-fabricated seating walls and landscape edging.',
    stone: 'New Grey granite',
    location: '1010 Mickleham Rd, Greenvale VIC',
    date: 'Completed Dec 2023',
  },
  {
    title: 'Greenline',
    sector: 'Waterfront revitalisation and urban promenade',
    outcome: 'Sculptural seating features and transition elements for the 450-metre promenade.',
    stone: 'Blueocean bluestone and Sesame White granite',
    location: 'North Bank of the Yarra River, Melbourne',
    date: 'Completed Dec 2025',
  },
  {
    title: 'Greening the Pipeline',
    sector: 'Linear park and sustainable urban infrastructure',
    outcome: 'Custom-fabricated seating blocks and landscape transition elements.',
    stone: 'New Grey granite',
    location: 'Truganina VIC',
    date: 'Completed Feb 2024',
  },
  {
    title: 'Caulfield Grammar School',
    sector: 'Educational campus and institutional landscape',
    outcome: 'Custom-carved natural stone blocks integrating timber inlay elements.',
    stone: 'Golden Crust granite',
    location: '217 Glen Eira Rd, St Kilda East VIC',
    date: 'Completed Apr 2026',
  },
  {
    title: 'Santa Maria College',
    sector: 'Educational campus and institutional landscape',
    outcome: 'Integrated green-spine landscape with flamed granite seating forms.',
    stone: 'New Grey granite',
    location: '50 Separation St, Northcote VIC',
    date: 'Completed Oct 2024',
  },
  {
    title: 'Marymede Catholic College',
    sector: 'Educational campus and institutional landscape',
    outcome: 'Solid granite amphitheatre works.',
    stone: 'New Grey granite',
    location: '139 Eminence Blvd, Doreen VIC',
    date: 'Completed May 2025',
  },
  {
    title: 'Bundha Sport Centre',
    sector: 'Sports and recreation precinct',
    outcome: 'Custom-fabricated landscape edging and public realm paving.',
    stone: 'Steel Blue bluestone',
    location: 'Fitzroy North VIC',
    date: 'Completed Jun 2024',
  },
];

const inputClassName =
  'w-full rounded-[4px] border border-white/18 bg-white px-4 py-3 text-[15px] font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-[var(--urblo-lime)] focus:ring-2 focus:ring-[var(--urblo-lime)]';

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function CapabilityDownloadForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const isTurnstileEnabled = Boolean(turnstileSiteKey);
  const normalizedEmail = email.trim().toLowerCase();

  function updateEmail(value: string) {
    setEmail(value);
    setStatus('idle');
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEmail(normalizedEmail)) {
      setStatus('error');
      setMessage('Enter a valid email address before downloading the statement.');
      return;
    }

    if (isTurnstileEnabled && !turnstileToken) {
      setStatus('error');
      setMessage(turnstileError || 'Complete the verification check before downloading.');
      return;
    }

    setStatus('submitting');
    setMessage(null);

    try {
      const sourceRoute = `${window.location.pathname}${window.location.search}`;
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Capability statement download',
          email: normalizedEmail,
          projectType: 'Capability statement download',
          message: 'Capability statement download requested from the Capabilities page.',
          sourceRoute,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.ok) {
        throw new Error(
          body?.error?.message ||
            'The download request could not be stored. Please contact Urblo directly.',
        );
      }

      setStatus('success');
      setMessage('Email captured. Download the 2026 Urblo Capability Statement below.');
      setTurnstileToken('');
      setTurnstileResetSignal((current) => current + 1);
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'The download request could not be stored. Please contact Urblo directly.',
      );
      setTurnstileToken('');
      setTurnstileResetSignal((current) => current + 1);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="capability-download-email" className="urblo-meta mb-2 block text-white/62">
          Work email
        </label>
        <input
          id="capability-download-email"
          type="email"
          value={email}
          onChange={(event) => updateEmail(event.target.value)}
          className={inputClassName}
          autoComplete="email"
          placeholder="name@studio.com"
          required
          aria-describedby={message ? 'capability-download-message' : undefined}
        />
      </div>

      <TurnstileField
        resetSignal={turnstileResetSignal}
        siteKey={turnstileSiteKey}
        onError={setTurnstileError}
        onToken={setTurnstileToken}
      />

      {message ? (
        <p
          id="capability-download-message"
          role={status === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-[4px] border px-4 py-3 text-[14px] font-semibold leading-6',
            status === 'success'
              ? 'border-[var(--urblo-lime)]/60 bg-[rgba(0,255,25,0.12)] text-white'
              : 'border-white/16 bg-white/10 text-white',
          ].join(' ')}
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[4px] bg-[var(--urblo-lime)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Capturing...' : 'Email me the download'}
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>

        {status === 'success' ? (
          <a
            href={siteCtas.capabilityStatementDownload.href}
            download={siteCtas.capabilityStatementDownload.filename}
            className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[4px] border border-white/25 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[var(--urblo-lime)] hover:bg-white/10"
          >
            Download PDF
            <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <p className="text-[13px] leading-6 text-white/50">
        The request is stored as a capability-statement lead for Urblo. Direct email remains
        available if the live form endpoint is not configured.
      </p>
    </form>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  inverse?: boolean;
}) {
  return (
    <Reveal className="max-w-[48rem]">
      <p className={inverse ? 'urblo-eyebrow text-white/62' : 'urblo-eyebrow'}>{eyebrow}</p>
      <h2
        className={[
          'mt-4 text-[36px] font-light leading-[1.14] md:text-[58px]',
          inverse ? 'text-white' : 'text-black',
        ].join(' ')}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={[
            'mt-6 text-[18px] leading-8 md:text-[20px]',
            inverse ? 'text-white/70' : 'text-[var(--urblo-text)]',
          ].join(' ')}
        >
          {copy}
        </p>
      ) : null}
    </Reveal>
  );
}

export default function CapabilitiesPage() {
  return (
    <div className="bg-white">
      <section className="relative min-h-[88svh] overflow-hidden bg-black pt-[112px] text-white md:pt-[124px]">
        <img
          src="/media/launch/capabilities/west-side-place-aerial.jpg"
          alt="Urblo public realm stone project seen from above"
          className="absolute inset-0 h-full w-full object-cover opacity-72"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="urblo-edge-container relative flex min-h-[calc(88svh-112px)] items-end pb-8 md:min-h-[calc(88svh-124px)] md:pb-10">
          <div className="w-full">
            <Reveal className="max-w-[64rem]">
              <p className="urblo-eyebrow text-white/64">May 2026 / Melbourne / Australia-wide</p>
              <h1 className="mt-5 text-[44px] font-light leading-[1.02] text-white md:text-[78px] lg:text-[104px]">
                Urblo Capability Statement 2026
              </h1>
              <p className="mt-6 max-w-[43rem] text-[18px] leading-8 text-white/78 md:text-[21px]">
                Design-led stone solutions for streetscapes and civic landscapes, built for teams
                that need complex hardscape intent translated into resolved site outcomes.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#all-capabilities"
                  className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[4px] bg-[var(--urblo-lime)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white"
                >
                  Explore capabilities
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#capability-statement"
                  className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[4px] border border-white/25 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[var(--urblo-lime)] hover:bg-white/10"
                >
                  {siteCtas.capabilityStatementDownload.label}
                  <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>

            <Reveal
              delay={0.08}
              className="mt-12 grid border-y border-white/14 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                ['Founded', '2024'],
                ['Stone depth', '20+ years'],
                ['Supplier network', 'MCC'],
                ['Service model', 'Australia-wide'],
              ].map(([label, value]) => (
                <div key={label} className="border-white/14 py-4 sm:border-r sm:px-4 first:pl-0 last:border-r-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/44">
                    {label}
                  </p>
                  <p className="mt-2 text-[22px] font-semibold text-white">{value}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section id="all-capabilities" className="py-16 md:py-24">
        <div className="urblo-page-container">
          <div className="grid gap-10 lg:grid-cols-[0.36fr_1fr] lg:items-start">
            <Reveal className="lg:sticky lg:top-24">
              <p className="urblo-eyebrow">All capabilities</p>
              <h2 className="mt-4 text-[34px] font-light leading-[1.14] text-black md:text-[48px]">
                A capability map for complex stone work.
              </h2>
              <p className="mt-5 text-[17px] leading-8 text-[var(--urblo-text)]">
                Five operating scopes cover how Urblo translates design intent into specified,
                fabricated and buildable stone outcomes.
              </p>
              <nav aria-label="Capability modules" className="mt-8 grid gap-2">
                {capabilityModules.map((module) => (
                  <a
                    key={module.id}
                    href={`#${module.id}`}
                    className="group flex items-center justify-between border-b border-black/12 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-black/62 transition hover:text-black"
                  >
                    <span>
                      {module.index} / {module.title}
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 opacity-35 transition group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </nav>
            </Reveal>

            <div className="border-t border-black/12">
              {capabilityModules.map((module, index) => (
                <Reveal
                  key={module.id}
                  delay={index * 0.03}
                  className="border-b border-black/12 py-10"
                >
                  <article
                    id={module.id}
                    className="grid scroll-mt-28 gap-8 xl:grid-cols-[0.9fr_1.1fr]"
                  >
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-black/42">
                          {module.index}
                        </span>
                        <module.Icon
                          className="h-6 w-6 text-black"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </div>
                      <h3 className="mt-5 max-w-[34rem] text-[30px] font-semibold leading-[1.08] text-black md:text-[44px]">
                        {module.title}
                      </h3>
                      <p className="mt-5 text-[18px] leading-8 text-[var(--urblo-text)]">
                        {module.summary}
                      </p>
                      <p className="mt-5 text-[16px] leading-7 text-black/68">{module.proof}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-[0.92fr_1.08fr] md:items-stretch">
                      <div className="overflow-hidden rounded-[4px] bg-black">
                        <img
                          src={module.image}
                          alt={module.alt}
                          className="aspect-[4/3] h-full w-full object-cover opacity-95 transition duration-700 hover:scale-[1.03]"
                        />
                      </div>
                      <div className="grid content-between gap-8">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-black/45">
                            What Urblo resolves
                          </p>
                          <ul className="mt-4 grid gap-3">
                            {module.disciplines.map((detail) => (
                              <li
                                key={detail}
                                className="flex items-center gap-3 text-[14px] font-semibold leading-6 text-black"
                              >
                                <CheckCircle2
                                  className="h-4 w-4 text-[var(--urblo-lime)]"
                                  strokeWidth={1.8}
                                  aria-hidden="true"
                                />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-black/45">
                            Typical applications
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {module.applications.map((application) => (
                              <span
                                key={application}
                                className="rounded-[4px] border border-black/12 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-black/65"
                              >
                                {application}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-16 text-white md:py-24">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <Reveal className="overflow-hidden rounded-[4px]">
            <img
              src="/media/launch/capabilities/factory-preassembly.jpg"
              alt="Urblo factory pre-assembly of shaped natural stone seating"
              className="aspect-[5/3] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="urblo-eyebrow text-white/62">Our approach</p>
            <h2 className="mt-4 text-[36px] font-light leading-[1.12] text-white md:text-[60px]">
              We do not supply stone. We resolve it.
            </h2>
            <p className="mt-6 text-[18px] leading-8 text-white/70">
              Urblo works upstream of the typical supplier conversation: concept reviews,
              buildability workshops, prototyping, value management, shop drawings and installation
              methodology.
            </p>
            <div className="mt-10 space-y-6">
              {approachPrinciples.map((item, index) => (
                <div key={item.title} className="grid gap-4 border-t border-white/14 pt-5 sm:grid-cols-[4rem_1fr]">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--urblo-lime)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-[20px] font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-7 text-white/64">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="urblo-page-container">
          <SectionHeading
            eyebrow="Lifecycle support"
            title="From the first sketch to the tenth-year visit."
            copy="Urblo is most useful when risk can still be surfaced, costed and resolved before the project reaches site."
          />

          <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal className="border-t border-black/12">
              {lifecycleSteps.map((step, index) => (
                <div key={step.title} className="grid gap-5 border-b border-black/12 py-7 sm:grid-cols-[5rem_1fr]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/16 text-[13px] font-semibold text-black">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-[24px] font-semibold leading-tight text-black">{step.title}</h3>
                    <p className="mt-3 text-[16px] leading-7 text-[var(--urblo-text)]">{step.copy}</p>
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal delay={0.08} className="bg-[rgba(239,239,239,0.28)] p-6 md:p-8">
              <div className="flex items-center gap-3">
                <MapPinned className="h-6 w-6 text-black" strokeWidth={1.5} aria-hidden="true" />
                <p className="urblo-eyebrow">National reach</p>
              </div>
              <h3 className="mt-5 text-[34px] font-light leading-[1.16] text-black md:text-[46px]">
                Melbourne-based. Working Australia-wide.
              </h3>
              <p className="mt-5 text-[17px] leading-8 text-[var(--urblo-text)]">
                Active markets span Victoria, New South Wales and the ACT, with Queensland underway
                and technical interstate work already delivered in Canberra.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {reachItems.map((item) => (
                  <div key={item.title} className="border-t border-black/12 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/44">
                      {item.label}
                    </p>
                    <h4 className="mt-3 text-[19px] font-semibold text-black">{item.title}</h4>
                    <p className="mt-3 text-[14px] leading-6 text-black/64">{item.copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {reachLocations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center gap-2 rounded-[4px] bg-white px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-black/62"
                  >
                    <CircleDot className="h-3 w-3 text-[var(--urblo-lime)]" aria-hidden="true" />
                    {location}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-16 md:py-24">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <Reveal>
            <p className="urblo-eyebrow">The Urblo advantage</p>
            <h2 className="mt-4 text-[36px] font-light leading-[1.14] text-black md:text-[58px]">
              Design-fluent at the studio table. Technically rigorous behind the factory door.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {advantageItems.map((item) => (
                <div key={item.title} className="border-t border-black/12 pt-5">
                  <ShieldCheck
                    className="h-5 w-5 text-[var(--urblo-lime)]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-[20px] font-semibold leading-tight text-black">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-[var(--urblo-text)]">{item.copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08} className="overflow-hidden rounded-[4px]">
            <img
              src="/media/launch/capabilities/site-install-review.jpg"
              alt="Urblo site review during stone installation"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section id="selected-proof" className="bg-black py-16 text-white md:py-24">
        <div className="urblo-page-container">
          <SectionHeading
            eyebrow="Selected project proof"
            title="Civic, commercial and institutional work with the facts left visible."
            copy="Each project record keeps the useful decision facts visible: sector, location, stone selection and delivered outcome."
            inverse
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.title} delay={index * 0.05} className="group">
                <article className="h-full border border-white/14 bg-white/[0.04]">
                  <div className="overflow-hidden bg-white/5">
                    <img
                      src={project.image}
                      alt={`${project.title} Urblo stone project`}
                      className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--urblo-lime)]">
                      {project.sector}
                    </p>
                    <h3 className="mt-4 text-[24px] font-semibold leading-tight text-white">
                      {project.title}
                    </h3>
                    <p className="mt-4 text-[14px] leading-6 text-white/66">{project.outcome}</p>
                    <dl className="mt-5 grid gap-3 border-t border-white/12 pt-4 text-[13px] leading-6">
                      <div>
                        <dt className="font-semibold uppercase tracking-[0.12em] text-white/36">Stone</dt>
                        <dd className="text-white/76">{project.stone}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold uppercase tracking-[0.12em] text-white/36">Location</dt>
                        <dd className="text-white/76">{project.location}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 overflow-hidden border border-white/14">
            <div className="grid border-b border-white/14 bg-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 md:grid-cols-[1.15fr_1fr_1.2fr_0.7fr]">
              <span>Project</span>
              <span className="hidden md:block">Type</span>
              <span className="hidden md:block">Stone featured</span>
              <span className="hidden md:block">Date</span>
            </div>
            <div>
              {projectLedger.map((project) => (
                <article
                  key={`${project.title}-${project.date}`}
                  className="grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 md:grid-cols-[1.15fr_1fr_1.2fr_0.7fr] md:items-start"
                >
                  <div>
                    <h3 className="text-[17px] font-semibold leading-tight text-white">{project.title}</h3>
                    <p className="mt-1 text-[13px] leading-6 text-white/50">{project.location}</p>
                  </div>
                  <p className="text-[14px] leading-6 text-white/66">{project.sector}</p>
                  <p className="text-[14px] leading-6 text-white/66">{project.stone}</p>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/46">
                    {project.date}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="capability-statement" className="bg-black py-16 text-white md:py-24">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Reveal>
            <p className="urblo-eyebrow text-white/62">PDF download</p>
            <h2 className="mt-4 text-[38px] font-light leading-[1.12] text-white md:text-[64px]">
              Download the full 2026 Capability Statement.
            </h2>
            <p className="mt-6 max-w-[38rem] text-[18px] leading-8 text-white/72">
              Enter your email to record the request with Urblo, then download Natalie Ma's full
              capability statement as a PDF.
            </p>
            <CapabilityDownloadForm />
          </Reveal>
          <Reveal delay={0.08} className="border border-white/14 bg-white/[0.04] p-5">
            <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr] md:items-center">
              <div className="overflow-hidden bg-white">
                <img
                  src="/media/launch/capabilities/west-side-place-aerial.jpg"
                  alt="Capability statement preview showing Urblo public realm stone work"
                  className="aspect-[4/5] h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--urblo-lime)]">
                  Statement contents
                </p>
                <ul className="mt-5 grid gap-4">
                  {[
                    'Capability and product range',
                    'National reach and service model',
                    'Lifecycle support',
                    'Founder profile',
                    'Selected project facts',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[15px] font-semibold text-white">
                      <Ruler className="h-4 w-4 text-white/45" strokeWidth={1.8} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14">
        <div className="urblo-page-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="urblo-eyebrow">Next step</p>
            <h2 className="mt-3 max-w-[48rem] text-[30px] font-light leading-tight text-black md:text-[42px]">
              Bring Urblo in before the stone decision becomes a site problem.
            </h2>
          </div>
          <Link to={siteCtas.contact.to} className="urblo-button-inverse self-start">
            {siteCtas.contact.label}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
