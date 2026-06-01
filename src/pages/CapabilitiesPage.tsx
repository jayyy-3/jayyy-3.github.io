import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Factory,
  FileText,
  Hammer,
  Layers3,
  MapPinned,
  PenTool,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TurnstileField from '../components/TurnstileField';
import { siteCtas } from '../data/siteChrome';
import { turnstileSiteKey } from '../lib/turnstileConfig';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

type CapabilityModule = {
  index: string;
  title: string;
  summary: string;
  details: string[];
  Icon: typeof PenTool;
};

const capabilityModules: CapabilityModule[] = [
  {
    index: '01',
    title: 'Bespoke street furniture',
    summary:
      'Custom stone seats, boulders, bollards, planters, public-art elements, water features and engraved inlays.',
    details: ['complex 3D geometry', 'custom street furniture', 'public realm features'],
    Icon: PenTool,
  },
  {
    index: '02',
    title: 'Premium paving and cladding',
    summary:
      'Large-format paving and architectural cladding supplied with the 3D stone elements so material continuity holds across the project footprint.',
    details: ['granite', 'bluestone', 'sandstone'],
    Icon: Layers3,
  },
  {
    index: '03',
    title: 'Advanced stone machining',
    summary:
      'CNC capability paired with hand finishing, built for consistent exposed faces, tight tolerances and civil-scale repetition.',
    details: ['CNC machining', 'honed and flamed finishes', 'bespoke finish development'],
    Icon: Factory,
  },
  {
    index: '04',
    title: 'Multi-material assemblies',
    summary:
      'Stone-led packages integrating composite timber, metal frames, armrests and concealed structural steel with one accountability line.',
    details: ['timber interfaces', 'metal framing', 'integrated armrests'],
    Icon: Hammer,
  },
  {
    index: '05',
    title: 'Design and technical service',
    summary:
      'Concept-to-construction support, shop drawings, engineering input and installation guides that keep teams focused on design intent.',
    details: ['ECI support', 'shop drawings', 'installation methodology'],
    Icon: FileText,
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
      'Value management and comparative material strategy to help bids compete on lifecycle value without losing the design intent.',
  },
  {
    title: 'Construction',
    copy:
      'Factory pre-assembly, handling support, installation guidance and maintenance notes carried through to handover.',
  },
];

const reachItems = [
  {
    title: 'Victoria',
    label: 'Supply and install',
    copy:
      'In Urblo\'s home market, certified installation teams allow one point of accountability from prototype to handover.',
  },
  {
    title: 'Interstate',
    label: 'Strategic premium supply',
    copy:
      'For projects beyond Victoria, Urblo pairs high-precision supply with project-specific installation methodologies.',
  },
  {
    title: 'Remote technical service',
    label: 'Australia-wide support',
    copy:
      'Online detailing sessions, express sample delivery and leadership site visits support tier-one works across Australia.',
  },
];

const advantageItems = [
  'We speak design and construction.',
  'We solve rather than simply supply.',
  'We scale to the rhythm of each project.',
  'We are design-owned at the point of material, tolerance and craft decisions.',
];

const selectedProjects = [
  {
    title: 'West Side Place',
    type: 'High-rise plaza and public realm',
    fact: 'Over 500 linear metres of custom-fabricated landscape seating and sculptural blocks.',
    image: '/media/launch/capabilities/west-side-place-aerial.jpg',
  },
  {
    title: 'Moon Gate | Woolley Street',
    type: 'Urban sculpture and public realm',
    fact: 'Five large-scale sculptural stone elements fabricated in New Grey and Angola Black granite.',
    image: '/media/launch/capabilities/moon-gate-framed-view.jpg',
  },
  {
    title: 'Artisan Park, Yarra Bend',
    type: 'Urban community park',
    fact: '115 linear metres of architectural block seating and landscape plinths in New Grey granite.',
    image: '/media/launch/projects/artisan-park-yarrabend/cover.png',
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
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
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
          className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full bg-[var(--urblo-lime)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Capturing...' : 'Email me the download'}
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>

        {status === 'success' ? (
          <a
            href={siteCtas.capabilityStatementDownload.href}
            download={siteCtas.capabilityStatementDownload.filename}
            className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full border border-white/25 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[var(--urblo-lime)] hover:bg-white/10"
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

export default function CapabilitiesPage() {
  return (
    <div className="bg-white">
      <section className="relative min-h-[82svh] overflow-hidden bg-black pt-[112px] text-white md:pt-[124px]">
        <img
          src="/media/launch/capabilities/factory-preassembly.jpg"
          alt="Urblo stone seating pre-assembled in the factory"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,25,0.18),transparent_32%)]" />

        <div className="urblo-edge-container relative flex min-h-[calc(82svh-112px)] items-end pb-10 md:min-h-[calc(82svh-124px)] md:pb-12">
          <Reveal className="max-w-[58rem]">
            <p className="urblo-eyebrow text-white/64">Urblo Capability Statement 2026</p>
            <h1 className="mt-5 text-[44px] font-light leading-[1.04] text-white md:text-[72px] lg:text-[86px]">
              Design-led stone solutions for streetscapes & civic landscapes.
            </h1>
            <p className="mt-6 max-w-[42rem] text-[18px] leading-8 text-white/76 md:text-[21px]">
              A specialist stone partner for teams that need design intent translated into
              engineered, inspectable and buildable public-realm outcomes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#capability-statement"
                className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full bg-[var(--urblo-lime)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white"
              >
                {siteCtas.capabilityStatementDownload.label}
                <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                to={siteCtas.contact.to}
                className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full border border-white/25 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[var(--urblo-lime)] hover:bg-white/10"
              >
                {siteCtas.contact.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="urblo-section border-b border-black/10">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <Reveal>
            <p className="urblo-eyebrow">Our philosophy</p>
            <h2 className="mt-4 max-w-[35rem] text-[34px] font-light leading-[1.22] text-black md:text-[50px]">
              We do not supply stone. We resolve it.
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="grid gap-8 md:grid-cols-2">
            <p className="text-[19px] leading-8 text-[var(--urblo-text)]">
              Urblo works upstream of the typical supplier conversation: concept reviews,
              buildability workshops, prototyping, value management, shop drawings and installation
              methodology.
            </p>
            <p className="text-[19px] leading-8 text-[var(--urblo-text)]">
              The work starts where design ambition meets construction reality. Materials,
              geometries, finishes and details are reverse-engineered to protect the intent while
              staying practical for civil delivery.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="urblo-page-container">
          <Reveal className="max-w-[48rem]">
            <p className="urblo-eyebrow">Capabilities & product range</p>
            <h2 className="mt-4 text-[36px] font-light leading-[1.18] text-black md:text-[58px]">
              Stone, considered - and the disciplines around it.
            </h2>
          </Reveal>

          <div className="mt-12 border-t border-black/12">
            {capabilityModules.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.04}
                className="grid gap-6 border-b border-black/12 py-8 md:grid-cols-[0.18fr_0.42fr_1fr] md:items-start"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-black/42">
                    {item.index}
                  </span>
                  <item.Icon className="h-6 w-6 text-black" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="text-[24px] font-semibold leading-tight text-black md:text-[30px]">
                  {item.title}
                </h3>
                <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
                  <p className="text-[17px] leading-8 text-[var(--urblo-text)]">{item.summary}</p>
                  <ul className="grid gap-3">
                    {item.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-black/62"
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-16 text-white md:py-24">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <Reveal className="overflow-hidden rounded-[4px]">
            <img
              src="/media/launch/capabilities/curved-stone-preassembly.jpg"
              alt="Curved Urblo stone seating pre-assembled before delivery"
              className="aspect-[5/3] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="urblo-eyebrow text-white/62">Lifecycle support</p>
            <h2 className="mt-4 text-[34px] font-light leading-[1.16] text-white md:text-[54px]">
              From the first sketch to the tenth-year visit.
            </h2>
            <div className="mt-10 space-y-7">
              {lifecycleSteps.map((step, index) => (
                <div key={step.title} className="grid gap-4 border-t border-white/16 pt-5 sm:grid-cols-[4rem_1fr]">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--urblo-lime)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-[20px] font-semibold text-white">{step.title}</h3>
                    <p className="mt-3 text-[16px] leading-7 text-white/70">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="urblo-section border-b border-black/10">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <p className="urblo-eyebrow">National reach</p>
            <h2 className="mt-4 text-[34px] font-light leading-[1.18] text-black md:text-[52px]">
              Melbourne-based. Working Australia-wide.
            </h2>
            <p className="mt-6 text-[18px] leading-8 text-[var(--urblo-text)]">
              Active markets span Victoria, New South Wales and the ACT, with Queensland underway
              and technical interstate work already delivered in Canberra.
            </p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {reachItems.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.06}
                className="border border-black/12 bg-white p-5"
              >
                <MapPinned className="h-6 w-6 text-black" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-black/55">
                  {item.label}
                </p>
                <h3 className="mt-3 text-[24px] font-semibold leading-tight text-black">{item.title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-[var(--urblo-text)]">{item.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <p className="urblo-eyebrow">The Urblo advantage</p>
            <h2 className="mt-4 text-[36px] font-light leading-[1.16] text-black md:text-[58px]">
              Design-fluent at the front of the studio. Technically rigorous behind the factory
              door.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {advantageItems.map((item) => (
                <div key={item} className="flex items-start gap-3 border-t border-black/12 pt-4">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 flex-none text-[var(--urblo-lime)]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <p className="text-[17px] font-semibold leading-7 text-black">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08} className="overflow-hidden rounded-[4px]">
            <img
              src="/media/launch/capabilities/site-install-review.jpg"
              alt="Urblo site review during stone installation"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[rgba(239,239,239,0.26)] py-16 md:py-24">
        <div className="urblo-page-container">
          <Reveal className="max-w-[46rem]">
            <p className="urblo-eyebrow">Selected proof</p>
            <h2 className="mt-4 text-[36px] font-light leading-[1.18] text-black md:text-[56px]">
              Built examples across civic, commercial and institutional landscapes.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {selectedProjects.map((project, index) => (
              <Reveal
                key={project.title}
                delay={index * 0.06}
                className="group overflow-hidden border border-black/10 bg-white"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={`${project.title} Urblo stone project`}
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute left-4 top-4 bg-black/72 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    {project.type}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[24px] font-semibold leading-tight text-black">{project.title}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-[var(--urblo-text)]">{project.fact}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="capability-statement" className="bg-black py-16 text-white md:py-24">
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Reveal>
            <p className="urblo-eyebrow text-white/62">PDF download</p>
            <h2 className="mt-4 text-[38px] font-light leading-[1.12] text-white md:text-[64px]">
              Download the 2026 Capability Statement.
            </h2>
            <p className="mt-6 max-w-[38rem] text-[18px] leading-8 text-white/72">
              Enter your email to record the request with Urblo, then download Natalie Ma's full
              capability statement as a PDF.
            </p>
            <CapabilityDownloadForm />
          </Reveal>
          <Reveal delay={0.08} className="border border-white/14 bg-white/[0.04] p-5">
            <div className="aspect-[4/5] overflow-hidden bg-white">
              <img
                src="/media/launch/capabilities/factory-preassembly.jpg"
                alt="Capability statement preview showing Urblo pre-assembled stone forms"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-5 grid gap-3 border-t border-white/12 pt-5 sm:grid-cols-3">
              {[
                ['Founded', '2024'],
                ['Base', 'Melbourne'],
                ['Stone depth', '20+ years'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                    {label}
                  </p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14">
        <div className="urblo-page-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="urblo-eyebrow">Next step</p>
            <h2 className="mt-3 text-[30px] font-light leading-tight text-black md:text-[42px]">
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
