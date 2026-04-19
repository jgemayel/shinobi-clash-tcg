'use client';

import { motion } from 'motion/react';

interface DamagePopupProps {
  amount: number;
  isHeal?: boolean;
  x?: string;
  y?: string;
}

export default function DamagePopup({ amount, isHeal, x = '50%', y = '50%' }: DamagePopupProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-30 font-heading font-bold text-2xl"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -60, scale: 1.5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <span className={isHeal ? 'text-green-400' : 'text-red-400'}>
        {isHeal ? '+' : '-'}{amount}
      </span>
    </motion.div>
  );
}
