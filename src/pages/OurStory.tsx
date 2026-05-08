import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';

export default function OurStory() {
  const counterVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.15, duration: 0.6 },
    }),
  };

  const team = [
    {
      name: 'Bob Lu',
      role: 'Co-Founder',
      img: 'https://urblo.com.au/wp-content/uploads/2024/12/Bob-Lu.jpg',
      bio:
        'Bob has notched up more than 15 years in the natural-stone industry across quarry, manufacture, logistics, and installation.',
    },
    {
      name: 'Natalie',
      role: 'Co-Founder',
      img: 'https://urblo.com.au/wp-content/uploads/2025/01/Natalie-Ma-1-1.jpg',
      bio:
        'Natalie founded Urblo with SAI Stone to bridge the gap between designers and suppliers through natural materials.',
    },
    {
      name: 'Hunter',
      role: 'Operations Manager',
      img: 'https://urblo.com.au/wp-content/uploads/2025/01/Hunter-Li-scaled-1.jpg',
      bio:
        'Hunter brings environmental engineering and carbon accounting expertise into every stage of delivery and planning.',
    },
    {
      name: 'Cameron',
      role: 'Sales Manager',
      img: 'https://urblo.com.au/wp-content/uploads/2025/01/Cameron-scaled-1-1.jpg',
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
              Urblo was conceived as a response to the growing demand for greener alternatives to
              concrete seats. From this point, Urblo is rooted in the fusion of contemporary design
              and timeless durability, seamlessly integrating stone blocks into modern cityscapes.
            </p>
            <p>
              We create products that enhance urban spaces while respecting the People and
              Environment. Join us in our mission to redefine urban landscapes with the strength and
              beauty of stone.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="bg-black py-20 text-white">
        <div className="urblo-page-container grid gap-12 text-center sm:grid-cols-3">
          {[
            { end: 30, suffix: '+', label: 'Projects' },
            { end: 430, suffix: '+', label: 'Clients' },
            { end: 18, suffix: '+', label: 'Landscape architects helped' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              custom={index}
              variants={counterVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <CountUp end={item.end} duration={2} className="text-[64px] font-semibold leading-none" />
              <span className="ml-1 text-[64px] font-semibold leading-none text-[var(--urblo-lime)]">
                {item.suffix}
              </span>
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
          style={{ backgroundImage: 'url(https://urblo.com.au/wp-content/uploads/2024/12/carbon-neutral-banner.jpg)' }}
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
              Meet the team behind Urblo
            </h2>
          </div>

          <Swiper
            modules={[Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop
          >
            {team.map((member) => (
              <SwiperSlide key={member.name} className="group">
                <div className="overflow-hidden rounded-[4px] border border-white/10 bg-white/5">
                  <div className="relative overflow-hidden">
                    <img src={member.img} alt={member.name} className="aspect-[2/3] w-full object-cover" />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 to-black/10 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-sm leading-6 text-white/88">{member.bio}</p>
                    </div>
                  </div>
                  <div className="space-y-1 p-5">
                    <div className="text-[20px] font-semibold text-white">{member.name}</div>
                    <div className="text-[13px] uppercase tracking-[0.12em] text-white/55">{member.role}</div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}
