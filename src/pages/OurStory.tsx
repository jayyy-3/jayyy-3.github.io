import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/autoplay';

export default function OurStory() {
    const counterVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.15, duration: 0.6 }
        })
    };

    const team = [
        {
            name: "Bob Lu",
            role: "Co‑Founder",
            img: "https://urblo.com.au/wp-content/uploads/2024/12/Bob-Lu.jpg",
            bio:
                "Bob has notched up more than 15 years in the natural‑stone industry—quarry, manufacture, logistics & installation. He’s passionate about turning dream plans into dream landscapes."
        },
        {
            name: "Natalie",
            role: "Co‑Founder",
            img: "https://urblo.com.au/wp-content/uploads/2025/01/Natalie-Ma-1-1.jpg",
            bio:
                "I founded Urblo with SAI Stone to bridge the gap between designers and suppliers. I believe natural materials transform cities by connecting people and place."
        },
        {
            name: "Hunter",
            role: "Operations Manager",
            img: "https://urblo.com.au/wp-content/uploads/2025/01/Hunter-Li-scaled-1.jpg",
            bio:
                "Originally set on architecture, Hunter became an environmental engineer specialising in carbon accounting. He uses data to drive positive change in the built environment."
        },
        {
            name: "Cameron",
            role: "Sales Manager",
            img: "https://urblo.com.au/wp-content/uploads/2025/01/Cameron-scaled-1-1.jpg",
            bio:
                "With 17 years of stone‑sourcing expertise, Cameron helps clients across Australia find the perfect material for every project."
        }
    ];
    team.push(...team);

    return (
        <div className="space-y-10">
            {/* Intro */}
            <motion.section
                className="max-w-6xl mx-auto px-6 py-18 md:py-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex flex-col md:flex-row justify-between gap-10 items-start">
                    {/* 左侧标题 */}
                    <h3 className="text-2xl md:text-3xl font-large md:w-1/3">
                        At Urblo, we believe in the transformative power of stone to shape urban environments.
                    </h3>

                    {/* 右侧正文，右对齐 */}
                    <div className="text-lg leading-relaxed md:w-2/3 space-y-4">
                        <p>
                            Urblo was conceived as a response to the growing demand
                            for greener alternatives to concrete seats. From this point,
                            Urblo is rooted in the fusion of contemporary design and timeless durability,
                            seamlessly integrating stone blocks into modern cityscapes.
                        </p>
                        <p>
                            We create products that enhance urban spaces while respecting the People
                            and Environment.
                            Join us in our mission to redefine urban landscapes with the strength
                            and beauty of stone.
                        </p>
                    </div>
                </div>
            </motion.section>            {/* Milestones */}
            <section className="bg-slate-900 text-white py-20">
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 px-6 text-center">
                    {[
                        { end: 30, suffix: "+", label: "Projects" },
                        { end: 430, suffix: "+", label: "Clients" },
                        { end: 18, suffix: "+", label: "Landscape architects helped" }
                    ].map((item, i) => (
                        <motion.div key={item.label} custom={i} variants={counterVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                            <CountUp end={item.end} duration={2} className="text-5xl font-bold" />
                            <span className="text-5xl font-bold ml-1">{item.suffix}</span>
                            <div className="mt-2 text-xl uppercase tracking-wide">{item.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Carbon offset banner */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(https://urblo.com.au/wp-content/uploads/2024/12/carbon-neutral-banner.jpg)" }}
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <h2 className="relative z-10 text-white text-3xl md:text-5xl font-semibold text-center px-6 drop-shadow-lg">
                    A FULL LIFE‑CYCLE <br className="hidden md:block" /> CARBON‑OFFSET APPROACH
                </h2>
            </section>

            {/* Workflow */}
            <motion.section
                className="max-w-5xl mx-auto px-6 space-y-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-semibold text-center">
                    A Streamlined Construction Workflow
                </h2>
                <p className="text-lg leading-relaxed text-center">
                    Compared with traditional in‑situ concrete work, Urblo’s precast, modular blocks
                    eliminate boxing, curing and finishing. It’s literally a “grab‑and‑drop” install.
                </p>
            </motion.section>

            {/* Team Carousel */}
            <section className="mx-auto px-[360px] bg-black pt-6">
                <div className="text-left mb-8 px-6 mx-auto max-w-xl">
                    <h2 className="text-3xl font-semibold text-white">Meet our team</h2>
                    <h3 className="text-xl text-slate-400 mt-2">Our team members</h3>
                </div>
                <Swiper
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                    autoplay={{ delay: 5000, disableOnInteraction: true }}
                    loop
                >
                    {team.map(member => (
                        <SwiperSlide key={member.name} className="group">
                            <div className="relative overflow-hidden shadow-lg">
                                <img src={member.img} alt={member.name}
                                     className="aspect-[2/3] object-cover" />
                                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-white text-sm p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {member.bio}
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <div className="font-medium text-lg text-white">{member.name}</div>
                                <div className="text-slate-500">{member.role}</div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <hr className="w-full border-t border-slate-700 mt-6" />
            </section>
        </div>
    );
}
