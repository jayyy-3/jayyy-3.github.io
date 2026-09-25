import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds before the reveal starts, for staggering siblings. */
  delay?: number;
};

/**
 * The shared scroll reveal: a short fade and 24px rise, once, when a fifth of the block is in view.
 * Under reduced motion it only fades (DESIGN.md Motion).
 */
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
