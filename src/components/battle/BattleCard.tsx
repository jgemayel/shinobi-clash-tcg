'use client';

import { motion } from 'motion/react';
import { BattleCardInstance } from '@/types/battle';
import { NinjaCard } from '@/types/card';
import { StatusEffect, ChakraType } from '@/types/enums';
import { isNinja } from '@/lib/cardUtils';
import { getTypeColor } from '@/lib/typeChart';
import CardArt from '../cards/CardArt';

interface BattleCardProps {
  instance: BattleCardInstance;
  isOpponent?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  highlight?: boolean;
  compact?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  [StatusEffect.Burn]: '#ef4444',
  [StatusEffect.Poison]: '#a855f7',
  [StatusEffect.Paralyze]: '#eab308',
  [StatusEffect.Confusion]: '#3b82f6',
  [StatusEffect.Seal]: '#6b7280',
};

function getCardHue(name: string): number {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

export default function BattleCard({ instance, isOpponent, isActive, onClick, highlight, compact }: BattleCardProps) {
  const ninja = isNinja(instance.card) ? (instance.card as NinjaCard) : null;
  const typeColor = ninja ? getTypeColor(ninja.chakraType) : '#6b7280';
  const hpPercent = instance.maxHp > 0 ? (instance.currentHp / instance.maxHp) * 100 : 0;
  const hpColor = hpPercent > 50 ? '#4ade80' : hpPercent > 25 ? '#eab308' : '#ef4444';
  const hue = getCardHue(instance.card.name);

  const cardWidth = compact ? 'w-[60px]' : isActive ? 'w-[100px]' : 'w-[78px]';
  const cardHeight = compact ? 'h-[82px]' : isActive ? 'h-[132px]' : 'h-[105px]';

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={`${cardWidth} ${cardHeight} relative rounded-lg overflow-hidden cursor-pointer select-none ${
        highlight ? 'ring-2 ring-naruto-orange ring-offset-1 ring-offset-transparent' : ''
      }`}
      style={{
        background: `linear-gradient(180deg, ${typeColor}15 0%, #0d0d1f 40%, #0a0a18 100%)`,
        border: `1.5px solid ${typeColor}55`,
      }}
      layout
    >
      {/* Art area */}
      <div
        className="mx-1 mt-1 rounded flex items-center justify-center relative overflow-hidden"
        style={{ height: compact ? '30px' : isActive ? '48px' : '38px' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 60%, hsl(${hue}, 50%, 25%) 0%, hsl(${hue}, 40%, 10%) 70%)`,
          }}
        />
        <div className="relative z-10 w-full h-full">
          <CardArt
            cardName={instance.card.name}
            cardType={instance.card.type}
            chakraType={ninja?.chakraType}
            stage={ninja?.stage}
            artPath={instance.card.artPath}
          />
        </div>
      </div>

      {/* Name */}
      <div className="px-1 mt-0.5">
        <p className="text-[8px] font-bold font-heading truncate text-center">{instance.card.name}</p>
      </div>

      {/* HP bar */}
      <div className="px-1 mt-0.5">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: hpColor }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-[7px] text-center text-gray-400 mt-0.5">{instance.currentHp}/{instance.maxHp}</p>
      </div>

      {/* Status effects */}
      {instance.statusEffects.length > 0 && (
        <div className="flex gap-0.5 justify-center mt-0.5">
          {instance.statusEffects.map((s, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[s.effect] ?? '#6b7280' }}
              title={s.effect}
            />
          ))}
        </div>
      )}

      {/* Attached chakra — adaptive power-up, no specific type */}
      {instance.attachedChakra.length > 0 && (
        <div className="flex gap-0.5 justify-center mt-0.5 px-1 flex-wrap">
          {instance.attachedChakra.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'radial-gradient(circle, #fde68a 0%, #f59e0b 70%)',
                boxShadow: '0 0 4px rgba(251, 191, 36, 0.7)',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
