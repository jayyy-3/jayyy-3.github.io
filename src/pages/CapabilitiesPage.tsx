import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Boxes, CheckCircle2, FileText, PenTool, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

interface CapabilityItem {
  title: string;
  copy: string;
  details: string[];
  Icon: IconComponent;
}

const capabilities: CapabilityItem[] = [
  {
    title: 'Design translation',
    copy:
      'We turn early intent, precedent images, and site constraints into a stone direction that can be tested before it reaches site.',
    details: ['finish direction', 'module logic', 'visual constraints'],
    Icon: PenTool,
  },
  {
    title: 'Specification support',
    copy:
      'We help project teams document stone choices, finish behavior, installation assumptions, and approval pathways with less ambiguity.',
    details: ['samples', 'schedules', 'technical notes'],
    Icon: FileText,
  },
  {
    title: 'Sourcing and fabrication',
    copy:
      'We coordinate material selection, block planning, shop drawings, and off-site preparation so complex details stay controlled.',
    details: ['quarry selection', 'shop drawings', 'pre-assembly'],
    Icon: Boxes,
  },
  {
    title: 'Delivery coordination',
    copy:
      'We plan sequencing, packing, logistics, and site handover around how the stone will actually be lifted, placed, and maintained.',
    details: ['logistics', 'site sequencing', 'handover support'],
    Icon: Truck,
  },
];

const processSteps = ['Brief', 'Prototype', 'Specify', 'Deliver'];

export default function CapabilitiesPage() {
  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Capabilities</p>
          <h1 className="urblo-page-title">Our Capabilities</h1>
          <p className="urblo-page-copy">
            A practical capability framework for turning design intent into stone systems that are
            specified, sourced, and delivered with control.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="urblo-page-container grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-[33rem]"
          >
            <p className="urblo-eyebrow">How we work</p>
            <h2 className="mt-4 font-display text-[34px] font-semibold leading-[1.2] text-black md:text-[48px]">
              From sketch to specification to install.
            </h2>
            <p className="mt-6 text-[18px] leading-8 text-[var(--urblo-text)] md:text-[20px]">
              Urblo sits between design ambition and construction reality: clarifying material
              options, coordinating detail, and keeping the final delivery aligned with the original
              intent.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {processSteps.map((step, index) => (
                <span
                  key={step}
                  className="inline-flex items-center gap-3 rounded-full border border-black/[0.14] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-black"
                >
                  <span className="text-[var(--urblo-lime)]">{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2">
            {capabilities.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.06, ease: 'easeOut' }}
                className="group border border-black/[0.12] bg-white p-6 transition duration-200 hover:border-black/35"
              >
                <div className="flex items-start justify-between gap-5">
                  <item.Icon className="h-7 w-7 text-black" strokeWidth={1.5} />
                  <span className="h-2 w-2 rounded-full bg-[var(--urblo-lime)] opacity-0 transition duration-200 group-hover:opacity-100" />
                </div>
                <h3 className="mt-8 text-[22px] font-semibold leading-tight text-black">{item.title}</h3>
                <p className="mt-4 min-h-[7rem] text-[16px] leading-7 text-[var(--urblo-text)]">
                  {item.copy}
                </p>
                <ul className="mt-6 space-y-3 border-t border-black/10 pt-5">
                  {item.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-3 text-[13px] uppercase tracking-[0.12em] text-black/68">
                      <CheckCircle2 className="h-4 w-4 text-[var(--urblo-lime)]" strokeWidth={1.8} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-20 text-white">
        <div className="urblo-page-container grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="urblo-eyebrow text-white/70">Project support</p>
            <h2 className="mt-4 max-w-[48rem] font-display text-[36px] font-semibold leading-[1.12] md:text-[58px]">
              Bring Urblo in before the stone decision becomes a site problem.
            </h2>
          </div>
          <div className="max-w-[34rem] lg:ml-auto">
            <p className="text-[18px] leading-8 text-white/78">
              Early input helps narrow finish options, confirm buildable details, and expose delivery
              risks while the design is still flexible.
            </p>
            <Link
              to="/contact"
              className="group mt-8 inline-flex min-h-[48px] items-center gap-4 rounded-full border border-white/25 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition duration-200 hover:border-[var(--urblo-lime)] hover:bg-[rgba(0,255,25,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--urblo-lime)]"
            >
              Discuss a project
              <ArrowUpRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
