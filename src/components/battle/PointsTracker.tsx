'use client';

import { motion } from 'motion/react';
import { WIN_POINTS } from '@/lib/constants';

interface PointsTrackerProps {
  playerPoints: number;
  opponentPoints: number;
}

function PointDots({ points, label, side }: { points: number; label: string; side: 'left' | 'right' }) {
  return (
    <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: WIN_POINTS }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border ${
              i < points
                ? 'bg-naruto-orange border-naruto-orange'
                : 'bg-transparent border-white/20'
            }`}
            animate={i < points ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={i < points ? { boxShadow: '0 0 8px rgba(249, 115, 22, 0.5)' } : {}}
          />
        ))}
      </div>
    </div>
  );
}

export default function PointsTracker({ playerPoints, opponentPoints }: PointsTrackerProps) {
  return (
    <div className="flex items-center gap-3">
      <PointDots points={playerPoints} label="You" side="left" />
      <span className="text-[9px] text-gray-600">·</span>
      <PointDots points={opponentPoints} label="AI" side="right" />
    </div>
  );
}
