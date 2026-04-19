'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { GameCard, NinjaCard, ChakraCost } from '@/types/card';
import { CardType, ChakraType } from '@/types/enums';
import { getTypeColor, getTypeName } from '@/lib/typeChart';
import { getRarityColor, getRarityLabel, getRarityDiamonds } from '@/lib/rarityUtils';
import { isNinja } from '@/lib/cardUtils';
import { soundManager } from '@/lib/sounds';
import { getDexLabel, getCardSet } from '@/data/cardLoader';
import CardArt from './CardArt';

interface CardDetailProps {
  card: GameCard;
  onClose: () => void;
  count?: number;
}

function getCardHue(name: string): number {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

function renderChakraDots(cost: ChakraCost) {
  const dots: { color: string; key: string }[] = [];
  const types: [string, string][] = [
    ['fire', '#ef4444'], ['water', '#3b82f6'], ['lightning', '#eab308'],
    ['earth', '#a16207'], ['wind', '#22c55e'], ['colorless', '#9ca3af'],
  ];
  for (const [type, color] of types) {
    const count = (cost as Record<string, number | undefined>)[type] ?? 0;
    for (let i = 0; i < count; i++) {
      dots.push({ color, key: `${type}-${i}` });
    }
  }
  return dots;
}

export default function CardDetail({ card, onClose, count }: CardDetailProps) {
  const ninja = isNinja(card) ? (card as NinjaCard) : null;
  const typeColor = ninja ? getTypeColor(ninja.chakraType) : '#6b7280';
  const hue = getCardHue(card.name);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 15;
    const rotateY = (x - 0.5) * 15;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    }
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.y) > 100) onClose();
        }}
        className="glass-panel-strong max-w-md w-full p-6 relative"
        style={{
          border: `1px solid ${typeColor}44`,
          transition: 'transform 0.1s ease-out',
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Dex label + set name */}
        <p className="text-[10px] font-mono text-gray-500 mb-1 tracking-widest uppercase">
          {getDexLabel(card)} · {getCardSet(card.set)?.setName ?? card.set}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {ninja && (
              <span
                className="w-4 h-4 rounded-full border border-white/30"
                style={{ backgroundColor: typeColor }}
              />
            )}
            <h2 className="text-xl font-bold font-heading">{card.name}</h2>
          </div>
          {ninja && (
            <span
              className="text-xl font-bold px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: `${typeColor}22` }}
            >
              {ninja.hp} HP
            </span>
          )}
        </div>

        {/* Subtitle */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          {ninja && (
            <>
              <span>{ninja.stage === 0 ? 'Basic' : `Stage ${ninja.stage}`}</span>
              {ninja.subtitle && <span>- {ninja.subtitle}</span>}
              <span>|</span>
              <span style={{ color: typeColor }}>{getTypeName(ninja.chakraType)}</span>
            </>
          )}
          {!ninja && (
            <span className="uppercase text-xs tracking-wider opacity-70">
              {card.type === CardType.JutsuScroll ? 'Jutsu Scroll' :
               card.type === CardType.Tool ? 'Tool Card' : 'Sensei Card'}
            </span>
          )}
        </div>

        {/* Art area */}
        <div
          className="rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
          style={{ height: '180px' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 60%, hsl(${hue}, 50%, 25%) 0%, hsl(${hue}, 40%, 8%) 70%)`,
            }}
          />
          <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
            <CardArt
              cardName={card.name}
              cardType={card.type}
              chakraType={ninja?.chakraType}
              stage={ninja?.stage}
            />
          </div>
        </div>

        {/* Attacks */}
        {ninja && (
          <div className="space-y-3 mb-4">
            {ninja.attacks.map((atk, i) => (
              <div key={i} className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {renderChakraDots(atk.cost).map((dot) => (
                        <span
                          key={dot.key}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: dot.color }}
                        />
                      ))}
                    </div>
                    <span className="font-bold font-heading">{atk.name}</span>
                  </div>
                  <span className="text-lg font-bold font-heading" style={{ color: typeColor }}>
                    {atk.damage}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{atk.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ability */}
        {ninja?.ability && (
          <div className="bg-yellow-500/[0.08] border border-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-yellow-500 uppercase font-bold">Ability</span>
              <span className="font-bold text-yellow-200 font-heading">{ninja.ability.name}</span>
            </div>
            <p className="text-xs text-gray-400">{ninja.ability.description}</p>
          </div>
        )}

        {/* Non-ninja description */}
        {!ninja && 'description' in card && (
          <div className="bg-white/[0.04] rounded-lg p-3 mb-4 border border-white/[0.06]">
            <p className="text-sm text-gray-300">{(card as { description: string }).description}</p>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-gray-500">
            {ninja && (
              <>
                <span>Weak: <span style={{ color: getTypeColor(ninja.weakness) }}>{getTypeName(ninja.weakness).split(' ')[0]}</span></span>
                <span>Retreat: {ninja.retreatCost}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: getRarityColor(card.rarity) }}>
              {getRarityDiamonds(card.rarity)} {getRarityLabel(card.rarity)}
            </span>
          </div>
        </div>

        {/* Flavor text */}
        {ninja?.flavorText && (
          <p className="mt-3 text-xs text-gray-500 italic border-t border-white/5 pt-3">
            &ldquo;{ninja.flavorText}&rdquo;
          </p>
        )}

        {/* Owned count */}
        {count !== undefined && (
          <div className="mt-3 text-center text-sm text-gray-400">
            Owned: <span className="text-naruto-orange font-bold">{count}</span>
          </div>
        )}

        {/* EX badge — EX ninjas are worth 2 points when KO'd */}
        {ninja?.isEx && (
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full font-heading">
              EX · Worth 2 Points on KO
            </span>
          </div>
        )}
        {/* Legendary is now a flavor tag — no longer awards bonus points */}
        {ninja?.isLegendary && !ninja?.isEx && (
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full font-heading">
              LEGENDARY
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
