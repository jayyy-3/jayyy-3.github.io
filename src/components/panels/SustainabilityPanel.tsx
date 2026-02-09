/* src/components/panels/SustainabilityPanel.tsx */

import { motion } from 'framer-motion';

const rotateStart = 75;   // deg - adjust if ring/text need initial offset
const ringDuration = 25;  // seconds per full turn

export default function SustainabilityPanel() {
    return (
        <div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
            {/* ---------------- LEFT side (image + ring) ---------------- */}
            <div className="flex items-center justify-center">
                <div className="relative aspect-square w-[240px] sm:w-[280px] md:w-[320px]">
                    <div className="image">
                        <div>
                            <div className="inner relative flex items-center justify-center">
                                {/* footprint icon */}
                                <img
                                    src="https://urblo.com.au/wp-content/uploads/2025/01/co2-footprint.png"
                                    alt="CO₂ footprint"
                                    className="h-[60%] w-[60%] object-contain"
                                />

                                {/* text ring */}
                                <motion.svg
                                    viewBox="0 0 100 100"
                                    width="350"
                                    height="350"
                                    initial={{ rotate: rotateStart }}
                                    animate={{ rotate: rotateStart + 360 }}
                                    transition={{ repeat: Infinity, ease: 'linear', duration: ringDuration }}
                                    className="absolute inset-0 h-full w-full text-black"
                                >
                                    <path
                                        id="circlePath"
                                        d="
                      M 10,50
                      a 40,40 0 1,1 80,0
                      40,40 0 1,1 -80,0
                    "
                                        fill="none"
                                    />
                                    <text fontSize="8" letterSpacing=".15em" fill="currentColor">
                                        <textPath href="#circlePath">
                                            CARBON&nbsp;NEUTRAL&nbsp;COMMITMENT&nbsp;•&nbsp;
                                        </textPath>
                                    </text>
                                </motion.svg>

                                {/* caption under icon */}
                                <div className="absolute inset-x-0 bottom-1 sm:bottom-2 text-center text-[11px] leading-[1.1] md:text-sm">
                                    Urblo offsets&nbsp;
                                    CO<sub>2</sub> footprint,&nbsp;100%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- RIGHT side (description) ---------------- */}
            <div className="flex items-center justify-center px-4 sm:px-6 md:px-8">
                <div className="max-w-md space-y-4 px-6 text-sm leading-relaxed md:px-10 md:text-base">
                    <p>
                        At Urblo, we are unwavering in our commitment to long-term
                        sustainability with project-based{' '}
                        <strong>carbon-neutral offers</strong>. Urblo was created by SAI
                        Stone to provide a greener alternative to concrete seating.
                    </p>
                    <p>
                        We now supply <strong>full life-cycle</strong> CO<sub>2</sub>{' '}
                        offsets – production, ocean freight, local freight and end-of-life
                        reuse as road base. We replace polluting building materials and
                        restore quarries responsibly to <strong>build a future</strong>{' '}
                        where every action contributes positively to the planet.
                    </p>
                </div>
            </div>
        </div>
    );
}
