'use client';

import { GameCard, NinjaCard } from '@/types/card';
import { CardType } from '@/types/enums';
import { getTypeColor, getTypeName } from '@/lib/typeChart';
import { getRarityColor, getRarityDiamonds } from '@/lib/rarityUtils';
import { isNinja, getTotalChakraCost } from '@/lib/cardUtils';

interface CardDisplayProps {
  card: GameCard;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  count?: number;
  showCount?: boolean;
}

export default function CardDisplay({ card, size = 'md', onClick, count, showCount }: CardDisplayProps) {
  const sizeClasses = {
    sm: 'w-[100px] h-[140px] text-[8px]',
    md: 'w-[160px] h-[224px] text-xs',
    lg: 'w-[240px] h-[336px] text-sm',
  };

  const ninja = isNinja(card) ? (card as NinjaCard) : null;
  const typeColor = ninja ? getTypeColor(ninja.chakraType) : '#6b7280';
  const rarityColor = getRarityColor(card.rarity);

  return (
    <div
      onClick={onClick}
      className={`${sizeClasses[size]} relative rounded-lg overflow-hidden cursor-pointer card-hover select-none`}
      style={{
        background: `linear-gradient(135deg, ${typeColor}22, #1a1a2e 60%)`,
        border: `2px solid ${typeColor}66`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-1.5">
        <div className="flex items-center gap-1 min-w-0">
          {ninja && (
            <span
              className="shrink-0 w-3 h-3 rounded-full border border-white/30"
              style={{ backgroundColor: typeColor }}
            />
          )}
          <span className="font-bold truncate leading-tight">{card.name}</span>
        </div>
        {ninja && (
          <span className="font-bold text-white shrink-0 ml-1">{ninja.hp}HP</span>
        )}
      </div>

      {/* Subtitle / Stage */}
      {ninja && (
        <div className="px-2 flex items-center gap-1 opacity-70">
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

      {/* Art area */}
      <div
        className="mx-2 mt-1 rounded flex items-center justify-center"
        style={{
          height: size === 'sm' ? '45px' : size === 'md' ? '75px' : '120px',
          background: `linear-gradient(180deg, ${typeColor}33, ${typeColor}11)`,
          border: `1px solid ${typeColor}44`,
        }}
      >
        <span className="text-2xl opacity-50" style={{ fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2.5rem' }}>
          {card.type === CardType.Ninja ? getTypeName(ninja!.chakraType).charAt(0) :
           card.type === CardType.JutsuScroll ? 'S' :
           card.type === CardType.Tool ? 'T' : 'M'}
        </span>
      </div>

      {/* Card type badge */}
      {card.type !== CardType.Ninja && (
        <div className="px-2 mt-1">
          <span
            className="uppercase tracking-wider px-1 rounded"
            style={{
              fontSize: '0.55em',
              background: card.type === CardType.JutsuScroll ? '#3b82f633' :
                          card.type === CardType.Tool ? '#a855f733' : '#f97316aa',
              color: card.type === CardType.JutsuScroll ? '#93c5fd' :
                     card.type === CardType.Tool ? '#c084fc' : '#fed7aa',
            }}
          >
            {card.type === CardType.JutsuScroll ? 'Jutsu Scroll' :
             card.type === CardType.Tool ? 'Tool' : 'Sensei'}
          </span>
        </div>
      )}

      {/* Attacks */}
      {ninja && (
        <div className="px-2 mt-1 space-y-0.5 flex-1">
          {ninja.attacks.map((atk, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 min-w-0">
                <span className="opacity-50" style={{ fontSize: '0.7em' }}>
                  [{getTotalChakraCost(atk.cost)}]
                </span>
                <span className="truncate">{atk.name}</span>
              </div>
              <span className="font-bold shrink-0 ml-1">{atk.damage}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description for non-ninja cards */}
      {!ninja && 'description' in card && (
        <div className="px-2 mt-1 flex-1">
          <p className="opacity-70 line-clamp-3 leading-tight" style={{ fontSize: '0.7em' }}>
            {(card as { description: string }).description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-2 pb-1 flex items-center justify-between">
        {ninja && (
          <div className="flex items-center gap-2 opacity-60" style={{ fontSize: '0.65em' }}>
            <span>Weak: {getTypeName(ninja.weakness).split(' ')[0]}</span>
            <span>Ret: {ninja.retreatCost}</span>
          </div>
        )}
        <span
          className="font-bold ml-auto"
          style={{ color: rarityColor, fontSize: '0.75em' }}
        >
          {getRarityDiamonds(card.rarity)}
        </span>
      </div>

      {/* Count badge */}
      {showCount && count !== undefined && count > 0 && (
        <div className="absolute top-1 right-1 bg-naruto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
          {count}
        </div>
      )}

      {/* Legendary glow */}
      {ninja?.isLegendary && (
        <div className="absolute inset-0 pointer-events-none card-shine rounded-lg" />
      )}
    </div>
  );
}
