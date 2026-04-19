'use client';

import { useRef, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { GameCard, NinjaCard, ChakraCost } from '@/types/card';
import { CardType, Rarity, ChakraType } from '@/types/enums';
import { getTypeColor, getTypeName } from '@/lib/typeChart';
import { getRarityColor, getRarityDiamonds } from '@/lib/rarityUtils';
import { isNinja } from '@/lib/cardUtils';
import { getDexLabel } from '@/data/cardLoader';
import CardArt from './CardArt';

interface CardDisplayProps {
  card: GameCard;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  count?: number;
  showCount?: boolean;
}

const LEGENDARY_TIERS = new Set([Rarity.Legendary, Rarity.Crown, Rarity.Secret]);
const PREMIUM_TIERS = new Set([Rarity.UltraRare, Rarity.Legendary, Rarity.Secret, Rarity.Crown]);

// Pokemon-style element palette: bright primary + deep secondary + accent highlight
const ELEMENT_PALETTE: Record<ChakraType, { primary: string; secondary: string; accent: string; rays: string }> = {
  [ChakraType.Fire]:      { primary: '#ef4444', secondary: '#7f1d1d', accent: '#fde047', rays: '#fb923c' },
  [ChakraType.Water]:     { primary: '#3b82f6', secondary: '#1e3a8a', accent: '#93c5fd', rays: '#06b6d4' },
  [ChakraType.Lightning]: { primary: '#eab308', secondary: '#713f12', accent: '#fef08a', rays: '#fbbf24' },
  [ChakraType.Earth]:     { primary: '#a16207', secondary: '#451a03', accent: '#fcd34d', rays: '#b45309' },
  [ChakraType.Wind]:      { primary: '#22c55e', secondary: '#14532d', accent: '#bbf7d0', rays: '#10b981' },
  [ChakraType.Colorless]: { primary: '#9ca3af', secondary: '#374151', accent: '#e5e7eb', rays: '#d1d5db' },
};

function getRarityClass(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.Uncommon: return 'rarity-uncommon';
    case Rarity.Rare: return 'rarity-rare';
    case Rarity.UltraRare: return 'rarity-ultra-rare';
    case Rarity.Legendary: return 'rarity-legendary';
    case Rarity.Secret: return 'rarity-secret';
    case Rarity.Crown: return 'rarity-crown';
    default: return '';
  }
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

export default function CardDisplay({ card, size = 'md', onClick, count, showCount }: CardDisplayProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-[100px] h-[140px] text-[8px]',
    md: 'w-[160px] h-[224px] text-xs',
    lg: 'w-[240px] h-[336px] text-sm',
  };

  const ninja = isNinja(card) ? (card as NinjaCard) : null;
  const typeColor = ninja ? getTypeColor(ninja.chakraType) : '#6b7280';
  const rarityColor = getRarityColor(card.rarity);
  const rarityClass = getRarityClass(card.rarity);
  const isShiny = Boolean(card.isShiny);
  const isLegendaryTier = LEGENDARY_TIERS.has(card.rarity);
  const isPremium = PREMIUM_TIERS.has(card.rarity);
  const palette = ninja ? ELEMENT_PALETTE[ninja.chakraType] : ELEMENT_PALETTE[ChakraType.Colorless];

  // Deterministic ember positions so they don't flicker on re-render
  const embers = useMemo(() => {
    if (!isLegendaryTier || size === 'sm') return [];
    const seed = card.name.length + card.id.length;
    const count = card.rarity === Rarity.Crown ? 10 : 6;
    return Array.from({ length: count }, (_, i) => ({
      left: `${((seed * (i + 1) * 37) % 80) + 10}%`,
      delay: `${(i * 0.3) % 2.4}s`,
      duration: `${2.2 + ((i * 7) % 10) * 0.1}s`,
      size: `${2 + (i % 3)}px`,
    }));
  }, [card.id, card.name, card.rarity, isLegendaryTier, size]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (size === 'sm' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 12;
    const rotateY = (x - 0.5) * 12;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, [size]);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    }
  }, []);

  const nameTextStyle: React.CSSProperties | undefined = isPremium && ninja
    ? {
        background: card.rarity === Rarity.Crown
          ? 'linear-gradient(180deg, #fff7d4 0%, #fde047 40%, #f59e0b 100%)'
          : card.rarity === Rarity.Secret
            ? 'linear-gradient(180deg, #fce7f3 0%, #f9a8d4 40%, #db2777 100%)'
            : card.rarity === Rarity.Legendary
              ? 'linear-gradient(180deg, #fde68a 0%, #fbbf24 40%, #b45309 100%)'
              : `linear-gradient(180deg, #ffffff 0%, ${palette.accent} 50%, ${palette.primary} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
      }
    : undefined;

  const borderColor = isLegendaryTier
    ? (card.rarity === Rarity.Crown ? 'rgba(251, 191, 36, 0.95)'
       : card.rarity === Rarity.Secret ? 'rgba(236, 72, 153, 0.8)'
       : 'rgba(251, 191, 36, 0.8)')
    : isPremium
      ? `${palette.primary}cc`
      : `${typeColor}55`;

  // PREMIUM LAYOUT — full-art, Pokemon-inspired (UR/Legendary/Secret/Crown)
  if (isPremium && ninja && size !== 'sm') {
    return (
      <motion.div
        whileHover={{ scale: 1.04, y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="cursor-pointer select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          ref={cardRef}
          onClick={onClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`${sizeClasses[size]} relative rounded-xl overflow-hidden ${rarityClass} ${isShiny ? 'card-shiny' : ''}`}
          style={{
            border: `2px solid ${borderColor}`,
            transition: 'transform 0.15s ease-out',
            background: palette.secondary,
          }}
        >
          {/* LAYER 1: Radial element burst */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${palette.primary} 0%, ${palette.secondary} 55%, #000 100%)`,
            }}
          />

          {/* LAYER 2: Sunburst rays (conic gradient alternating bright/transparent) */}
          <div
            className="absolute inset-0 opacity-55"
            style={{
              background: `conic-gradient(from 0deg at 50% 45%,
                transparent 0deg, ${palette.rays}99 8deg, transparent 16deg,
                transparent 30deg, ${palette.accent}66 38deg, transparent 46deg,
                transparent 60deg, ${palette.rays}88 68deg, transparent 76deg,
                transparent 90deg, ${palette.accent}66 98deg, transparent 106deg,
                transparent 120deg, ${palette.rays}99 128deg, transparent 136deg,
                transparent 150deg, ${palette.accent}66 158deg, transparent 166deg,
                transparent 180deg, ${palette.rays}88 188deg, transparent 196deg,
                transparent 210deg, ${palette.accent}66 218deg, transparent 226deg,
                transparent 240deg, ${palette.rays}99 248deg, transparent 256deg,
                transparent 270deg, ${palette.accent}66 278deg, transparent 286deg,
                transparent 300deg, ${palette.rays}88 308deg, transparent 316deg,
                transparent 330deg, ${palette.accent}66 338deg, transparent 346deg,
                transparent 360deg
              )`,
              mixBlendMode: 'screen',
              filter: 'blur(1.5px)',
            }}
          />

          {/* LAYER 3: Inner halo */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${palette.accent}55 0%, transparent 40%)`,
              mixBlendMode: 'screen',
            }}
          />

          {/* Chakra embers */}
          {embers.map((e, i) => (
            <span
              key={i}
              className="chakra-ember"
              style={{
                left: e.left,
                bottom: '18%',
                width: e.size,
                height: e.size,
                animationDelay: e.delay,
                animationDuration: e.duration,
              }}
            />
          ))}

          {/* LAYER 4: Character art — fills ~65% of card */}
          <div
            className="absolute left-0 right-0 flex items-end justify-center"
            style={{ top: '14%', bottom: '36%' }}
          >
            <CardArt
              cardName={card.name}
              cardType={card.type}
              chakraType={ninja.chakraType}
              stage={ninja.stage}
              artPath={card.artPath}
            />
          </div>

          {/* Gold/chrome gradient bars at top + bottom for premium frame */}
          <div
            className="absolute top-0 left-0 right-0 h-[14%] pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[38%] pointer-events-none"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
            }}
          />

          {/* TOP BAR: Name + HP */}
          <div className="absolute top-0 left-0 right-0 px-2.5 pt-2 pb-1 flex items-start justify-between relative z-10">
            <div className="flex-1 min-w-0">
              <h1
                className="font-heading font-black leading-none tracking-tight truncate"
                style={{
                  fontSize: size === 'md' ? '0.95em' : '1.3em',
                  ...nameTextStyle,
                }}
              >
                {card.name}
              </h1>
              <p
                className="font-bold uppercase tracking-widest leading-tight mt-0.5"
                style={{
                  fontSize: size === 'md' ? '0.55em' : '0.65em',
                  color: palette.accent,
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {ninja.stage === 0 ? 'Basic' : `Stage ${ninja.stage}`}
                {ninja.subtitle ? ` · ${ninja.subtitle}` : ''}
              </p>
            </div>
            <div
              className="shrink-0 ml-2 px-2 py-0.5 rounded-md font-heading font-black"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                color: palette.accent,
                border: `1px solid ${palette.accent}80`,
                boxShadow: `0 0 10px ${palette.primary}99`,
                fontSize: size === 'md' ? '0.75em' : '0.95em',
              }}
            >
              {ninja.hp}
            </div>
          </div>

          {/* BOTTOM: Ability + Attacks */}
          <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-1.5 pt-1 flex flex-col gap-0.5 relative z-10">
            {ninja.ability && (
              <div
                className="rounded px-1.5 py-0.5 flex items-center gap-1 mb-0.5"
                style={{
                  background: `linear-gradient(90deg, ${palette.primary}44, ${palette.secondary}66)`,
                  border: `1px solid ${palette.accent}55`,
                }}
              >
                <span
                  className="font-heading font-black uppercase tracking-widest shrink-0 px-1 py-px rounded"
                  style={{
                    fontSize: '0.5em',
                    background: palette.accent,
                    color: palette.secondary,
                  }}
                >
                  Ability
                </span>
                <span
                  className="truncate font-bold"
                  style={{ fontSize: '0.72em', color: palette.accent }}
                >
                  {ninja.ability.name}
                </span>
              </div>
            )}
            {ninja.attacks.map((atk, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  borderLeft: `2px solid ${palette.primary}`,
                }}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <div className="flex gap-px shrink-0">
                    {renderChakraDots(atk.cost).slice(0, 5).map((dot) => (
                      <span
                        key={dot.key}
                        className="rounded-full"
                        style={{
                          width: '7px',
                          height: '7px',
                          backgroundColor: dot.color,
                          boxShadow: `0 0 3px ${dot.color}`,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="truncate font-heading font-bold"
                    style={{ color: '#fff', fontSize: '0.75em' }}
                  >
                    {atk.name}
                  </span>
                </div>
                <span
                  className="font-heading font-black shrink-0 ml-1"
                  style={{
                    color: palette.accent,
                    fontSize: '0.95em',
                    textShadow: `0 0 6px ${palette.primary}`,
                  }}
                >
                  {atk.damage}
                </span>
              </div>
            ))}
            {/* Footer row */}
            <div
              className="flex items-center justify-between mt-0.5 pt-0.5 border-t"
              style={{
                borderColor: `${palette.accent}33`,
                fontSize: '0.55em',
              }}
            >
              <span className="opacity-70 font-mono">
                {getDexLabel(card)}
              </span>
              <span className="opacity-70">
                Weak: {getTypeName(ninja.weakness).split(' ')[0]} · Ret: {ninja.retreatCost}
              </span>
              <span style={{ color: rarityColor, fontSize: '1.15em', fontWeight: 900 }}>
                {getRarityDiamonds(card.rarity)}
              </span>
            </div>
          </div>

          {/* Rarity badge (EX/CROWN/SECRET/UR) */}
          <div
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm font-black font-heading tracking-widest z-20"
            style={{
              fontSize: size === 'md' ? '0.55em' : '0.7em',
              background: card.rarity === Rarity.Crown
                ? 'linear-gradient(135deg, #fff7d4, #f59e0b)'
                : card.rarity === Rarity.Secret
                  ? 'linear-gradient(135deg, #fce7f3, #db2777)'
                  : card.rarity === Rarity.Legendary
                    ? 'linear-gradient(135deg, #fde68a, #b45309)'
                    : `linear-gradient(135deg, ${palette.accent}, ${palette.primary})`,
              color: '#1a0f00',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            {card.rarity === Rarity.Crown ? 'CROWN'
              : card.rarity === Rarity.Secret ? 'SECRET'
              : card.rarity === Rarity.Legendary ? 'EX'
              : 'UR'}
          </div>

          {isShiny && (
            <div
              className="absolute z-20"
              style={{ top: '2.4rem', left: '0.375rem', width: '18px', height: '18px' }}
            >
              <svg viewBox="0 0 20 20" width="18" height="18">
                <path
                  d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z"
                  fill="url(#shiny-grad)"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="0.5"
                />
                <defs>
                  <linearGradient id="shiny-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="50%" stopColor="#fbcfe8" />
                    <stop offset="100%" stopColor="#a5b4fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}

          {showCount && count !== undefined && count > 0 && (
            <div className="absolute top-1 right-1 bg-naruto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg z-20">
              {count}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // STANDARD LAYOUT (Common/Uncommon/Rare + small size for premium)
  const hue = card.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const artHeight = size === 'sm' ? '45px' : size === 'md' ? '75px' : '120px';
  const stdBg = `linear-gradient(180deg, ${typeColor}15 0%, #0d0d1f 40%, #0a0a18 100%)`;

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="cursor-pointer select-none"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${sizeClasses[size]} relative rounded-lg overflow-hidden ${rarityClass} ${isShiny ? 'card-shiny' : ''}`}
        style={{
          background: stdBg,
          border: `2px solid ${borderColor}`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${typeColor}15, 0 2px 8px rgba(0,0,0,0.4)` }}
        />

        <div className="flex items-center justify-between px-2 pt-1.5 relative z-10">
          <div className="flex items-center gap-1 min-w-0">
            {ninja && (
              <span
                className="shrink-0 rounded-full border border-white/30"
                style={{
                  backgroundColor: typeColor,
                  width: size === 'sm' ? '8px' : '12px',
                  height: size === 'sm' ? '8px' : '12px',
                }}
              />
            )}
            <span className="font-bold truncate leading-tight font-heading">{card.name}</span>
          </div>
          {ninja && (
            <span
              className="font-bold shrink-0 ml-1 rounded-full px-1.5"
              style={{
                backgroundColor: `${typeColor}33`,
                fontSize: size === 'sm' ? '7px' : undefined,
              }}
            >
              {ninja.hp}
            </span>
          )}
        </div>

        {ninja && size !== 'sm' && (
          <div className="px-2 flex items-center gap-1 opacity-60 relative z-10">
            <span className="uppercase tracking-wider" style={{ fontSize: '0.6em' }}>
              {ninja.stage === 0 ? 'Basic' : `Stage ${ninja.stage}`}
            </span>
            {ninja.subtitle && (
              <>
                <span style={{ fontSize: '0.5em' }}>|</span>
                <span style={{ fontSize: '0.6em' }}>{ninja.subtitle}</span>
              </>
            )}
          </div>
        )}

        <div
          className="mx-2 mt-1 rounded-md flex items-center justify-center relative overflow-hidden"
          style={{ height: artHeight }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 60%, hsl(${hue}, 50%, 25%) 0%, hsl(${hue}, 40%, 10%) 70%)`,
            }}
          />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <CardArt
              cardName={card.name}
              cardType={card.type}
              chakraType={ninja?.chakraType}
              stage={ninja?.stage}
              artPath={card.artPath}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#0a0a18] to-transparent z-20" />
        </div>

        {card.type !== CardType.Ninja && size !== 'sm' && (
          <div className="px-2 mt-1 relative z-10">
            <span
              className="uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
              style={{
                fontSize: '0.55em',
                background: card.type === CardType.JutsuScroll ? '#3b82f622' :
                            card.type === CardType.Tool ? '#a855f722' : '#f9731633',
                color: card.type === CardType.JutsuScroll ? '#93c5fd' :
                       card.type === CardType.Tool ? '#c084fc' : '#fed7aa',
              }}
            >
              {card.type === CardType.JutsuScroll ? 'Jutsu Scroll' :
               card.type === CardType.Tool ? 'Tool' : 'Sensei'}
            </span>
          </div>
        )}

        {ninja?.ability && size !== 'sm' && (
          <div className="px-2 mt-1 relative z-10">
            <div
              className="rounded px-1.5 py-0.5 flex items-center gap-1"
              style={{
                background: 'rgba(147, 197, 253, 0.10)',
                border: '1px solid rgba(147, 197, 253, 0.25)',
              }}
            >
              <span
                className="font-heading font-black uppercase tracking-wider shrink-0"
                style={{ fontSize: '0.5em', color: '#93c5fd' }}
              >
                Ability
              </span>
              <span className="truncate font-bold" style={{ fontSize: '0.7em', color: '#dbeafe' }}>
                {ninja.ability.name}
              </span>
            </div>
          </div>
        )}

        {ninja && (
          <div className="px-2 mt-1 space-y-0.5 relative z-10">
            {ninja.attacks.map((atk, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 min-w-0">
                  <div className="flex gap-px shrink-0">
                    {renderChakraDots(atk.cost).slice(0, size === 'sm' ? 3 : 5).map((dot) => (
                      <span
                        key={dot.key}
                        className="rounded-full"
                        style={{
                          width: size === 'sm' ? '4px' : '6px',
                          height: size === 'sm' ? '4px' : '6px',
                          backgroundColor: dot.color,
                        }}
                      />
                    ))}
                  </div>
                  <span className="truncate ml-0.5">{atk.name}</span>
                </div>
                <span
                  className="font-bold shrink-0 ml-1"
                  style={{ color: typeColor }}
                >
                  {atk.damage}
                </span>
              </div>
            ))}
          </div>
        )}

        {!ninja && 'description' in card && (
          <div className="px-2 mt-1 flex-1 relative z-10">
            <p className="opacity-70 line-clamp-3 leading-tight" style={{ fontSize: '0.7em' }}>
              {(card as { description: string }).description}
            </p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-2 pb-1 flex items-center justify-between z-10">
          {size !== 'sm' && (
            <span className="opacity-60 font-mono" style={{ fontSize: '0.55em' }}>
              {getDexLabel(card)}
            </span>
          )}
          {ninja && size !== 'sm' && (
            <div className="flex items-center gap-2 opacity-60" style={{ fontSize: '0.6em' }}>
              <span>Weak: {getTypeName(ninja.weakness).split(' ')[0]}</span>
              <span>Ret: {ninja.retreatCost}</span>
            </div>
          )}
          <span className="font-bold ml-auto" style={{ color: rarityColor, fontSize: '0.75em' }}>
            {getRarityDiamonds(card.rarity)}
          </span>
        </div>

        {isShiny && size !== 'sm' && (
          <div
            className="absolute z-20"
            style={{ top: '0.375rem', right: '0.375rem', width: '18px', height: '18px' }}
          >
            <svg viewBox="0 0 20 20" width="18" height="18">
              <path
                d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z"
                fill="url(#shiny-grad-std)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.5"
              />
              <defs>
                <linearGradient id="shiny-grad-std" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="50%" stopColor="#fbcfe8" />
                  <stop offset="100%" stopColor="#a5b4fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {showCount && count !== undefined && count > 0 && (
          <div className="absolute top-1 right-1 bg-naruto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg z-20">
            {count}
          </div>
        )}
      </div>
    </motion.div>
  );
}
