import { motion } from 'framer-motion';

const ROWS = [
    { label: 'Preparation cost', concrete: 30, stone: 25 },
    { label: 'Material cost',     concrete: 35, stone: 60 },
    { label: 'Labour cost',       concrete: 70, stone: 30 },
    { label: 'Problem solving',   concrete: 35, stone: 5  },
    { label: 'Maintenance cost',  concrete: 30, stone: 6  },
    { label: 'Total',             concrete: 100, stone: 55 },
] as const;

export default function CostComparePanel() {
    return (
        <div className="flex flex-col items-center gap-10">
            {/* top (mobile) side-by-side images */}
            <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-3">
                <img
                    src="https://urblo.com.au/wp-content/uploads/2024/12/concrete.jpeg"
                    alt="Concrete"
                    className="rounded-lg object-cover lg:row-span-2"
                />
                {/* chart */}
                <div className="lg:col-span-1">
                    {ROWS.map((r) => (
                        <div key={r.label} className="mb-3">
                            <div className="flex items-center gap-3">
                                <span className="w-36 shrink-0 text-sm">{r.label}</span>

                                {/* concrete bar */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${r.concrete}%` }}
                                    transition={{ duration: 1 }}
                                    className="h-2 rounded bg-neutral-400"
                                />

                                {/* stone bar */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${r.stone}%` }}
                                    transition={{ duration: 1, delay: 0.1 }}
                                    className="h-2 rounded bg-green-600"
                                />
                            </div>
                        </div>
                    ))}
                    <p className="mt-4 text-sm leading-relaxed">
                        Indicative comparison of total cost between <strong>in-situ concrete</strong>
                        and a customised stone solution. For special circumstances, see
                        additional docs.
                    </p>
                </div>

                <img
                    src="https://urblo.com.au/wp-content/uploads/2024/12/stone.jpeg"
                    alt="Stone"
                    className="rounded-lg object-cover lg:row-span-2"
                />
            </div>
        </div>
    );
}
