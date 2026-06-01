import { motion } from 'framer-motion';

export default function OurStory() {
  const proofVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.15, duration: 0.6 },
    }),
  };

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

  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">About Urblo</p>
          <h1 className="urblo-page-title">Our Story</h1>
        </div>
      </section>

      <motion.section
        className="urblo-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.6 }}
      >
        <div className="urblo-page-container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="urblo-eyebrow">People & Environment</p>
            <h2 className="mt-4 max-w-[34rem] text-[34px] font-semibold leading-[1.45] text-black md:text-[44px]">
              At Urblo, we believe in the transformative power of stone to shape urban environments.
            </h2>
          </div>
          <div className="space-y-5 text-[18px] leading-8 text-[var(--urblo-text)] md:text-[20px]">
            <p>
              Founded in Melbourne in 2024, Urblo is a specialist manufacturer and supplier of
              premium stone solutions, bespoke street furniture, and complex hardscape elements for
              civil and urban projects Australia-wide.
            </p>
            <p>
              The company exists to bridge a long-standing gap between creative ambition and what
              actually gets built. Co-founded with SAI Stone, Urblo pairs design fluency with more
              than two decades of stone-industry depth.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="bg-black py-20 text-white">
        <div className="urblo-page-container grid gap-12 text-center sm:grid-cols-3">
          {[
            { value: '2024', label: 'Founded in Melbourne' },
            { value: 'MCC', label: 'Melbourne City Council appointed supplier network' },
            { value: '20+', label: 'Years of stone expertise through SAI Stone' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              custom={index}
              variants={proofVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="text-[64px] font-semibold leading-none text-white">
                {item.value}
              </div>
              <div className="mt-4 text-[18px] uppercase tracking-[0.12em] text-white/76">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden text-white">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/media/launch/banners/our-story.jpg)' }}
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="urblo-page-container relative text-center">
          <p className="urblo-eyebrow text-white/70">Carbon Commitment</p>
          <h2 className="mt-4 font-display text-[38px] uppercase leading-[1.08] tracking-[0.04em] md:text-[62px]">
            A full life-cycle carbon-offset approach
          </h2>
        </div>
      </section>

      <section className="urblo-section bg-[rgba(239,239,239,0.18)]">
        <div className="urblo-page-container text-center">
          <p className="urblo-eyebrow">Workflow</p>
          <h2 className="mt-4 font-display text-[34px] font-semibold uppercase leading-[1.08] tracking-[0.03em] text-black md:text-[48px]">
            Streamlined Construction
          </h2>
          <p className="mx-auto mt-6 max-w-[50rem] text-[18px] leading-8 text-[var(--urblo-text)] md:text-[20px]">
            Compared with traditional in-situ concrete work, Urblo's precast modular blocks
            eliminate boxing, curing, and finishing. It becomes a faster, cleaner grab-and-place
            installation process.
          </p>
        </div>
      </section>

      <section className="bg-black py-20 text-white">
        <div className="urblo-page-container">
          <div className="mb-10 max-w-[38rem]">
            <p className="urblo-eyebrow text-white/70">Our Team</p>
            <h2 className="mt-4 font-display text-[34px] font-semibold uppercase leading-[1.08] tracking-[0.03em] md:text-[48px]">
              Meet the people behind Urblo
            </h2>
          </div>

          <div className="grid max-w-[920px] gap-6 md:grid-cols-2">
            {team.map((member) => (
              <article key={member.name} className="group">
                <div className="overflow-hidden rounded-[4px] border border-white/10 bg-white/5">
                  <div className="relative overflow-hidden">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-[20px] font-semibold text-white">{member.name}</div>
                    <div className="text-[13px] uppercase tracking-[0.12em] text-white/55">{member.role}</div>
                    <p className="mt-4 text-sm leading-6 text-white/72">{member.bio}</p>
                    {'quote' in member ? (
                      <p className="mt-5 border-l border-[var(--urblo-lime)] pl-4 text-[16px] font-semibold leading-7 text-white">
                        "{member.quote}"
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
