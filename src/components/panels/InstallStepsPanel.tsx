import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    {
        id: 'step_0',
        label: 'First step',
        title: 'Off-site pre-Assembly',
        img: 'https://urblo.com.au/wp-content/uploads/2024/12/step1-scaled.jpg',
    },
    {
        id: 'step_1',
        label: 'Second step',
        title: 'Delivery to site',
        img: 'https://urblo.com.au/wp-content/uploads/2024/12/step2.jpg',
    },
    {
        id: 'step_2',
        label: 'Third step',
        title: 'Sling & Place',
        img: 'https://urblo.com.au/wp-content/uploads/2024/12/step3-scaled.jpg',
    },
];

export default function InstallStepsPanel() {
    const [current, setCurrent] = useState(0);

    return (
        <div className="grid gap-10 md:grid-cols-2">
            {/* image stack */}
            <div className="relative overflow-hidden rounded-lg shadow-lg">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={STEPS[current].id}
                        src={STEPS[current].img}
                        alt={STEPS[current].title}
                        initial={{ opacity: 0.0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="h-full w-full object-cover"
                    />
                </AnimatePresence>
            </div>

            {/* step list */}
            <div className="flex flex-col justify-center">
                <p className="mb-6 font-medium text-neutral-500">
                    Typical lead time: <strong>2-3 weeks</strong>
                </p>

                {STEPS.map((s, idx) => (
                    <button
                        key={s.id}
                        onMouseEnter={() => setCurrent(idx)}
                        className={`
              group flex items-start gap-4 py-4 text-left transition-colors
              ${current === idx ? 'text-black' : 'text-neutral-500'}
            `}
                    >
            <span
                className={`
                text-2xl font-bold
                ${current === idx ? 'text-green-600' : ''}
              `}
            >
              {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
            </span>

                        <div>
                            <div className="text-xs uppercase tracking-wide">{s.label}</div>
                            <div className="text-lg font-semibold">{s.title}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
