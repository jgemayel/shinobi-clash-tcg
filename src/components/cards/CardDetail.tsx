'use client';

import { GameCard, NinjaCard } from '@/types/card';
import { CardType } from '@/types/enums';
import { getTypeColor, getTypeName } from '@/lib/typeChart';
import { getRarityColor, getRarityLabel, getRarityDiamonds } from '@/lib/rarityUtils';
import { isNinja, getTotalChakraCost } from '@/lib/cardUtils';

interface CardDetailProps {
  card: GameCard;
  onClose: () => void;
  count?: number;
}

export default function CardDetail({ card, onClose, count }: CardDetailProps) {
  const ninja = isNinja(card) ? (card as NinjaCard) : null;
  const typeColor = ninja ? getTypeColor(ninja.chakraType) : '#6b7280';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="bg-naruto-navy rounded-2xl max-w-md w-full p-6 relative"
        style={{ border: `2px solid ${typeColor}66` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
        >
          x
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {ninja && (
              <span
                className="w-4 h-4 rounded-full border border-white/30"
                style={{ backgroundColor: typeColor }}
              />
            )}
            <h2 className="text-xl font-bold">{card.name}</h2>
          </div>
          {ninja && <span className="text-xl font-bold">{ninja.hp} HP</span>}
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

        {/* Art placeholder */}
        <div
          className="rounded-xl mb-4 flex items-center justify-center"
          style={{
            height: '180px',
            background: `linear-gradient(180deg, ${typeColor}22, ${typeColor}08)`,
            border: `1px solid ${typeColor}33`,
          }}
        >
          <span className="text-5xl opacity-20">{ninja ? getTypeName(ninja.chakraType).charAt(0) : card.type.charAt(0).toUpperCase()}</span>
        </div>

        {/* Attacks */}
        {ninja && (
          <div className="space-y-3 mb-4">
            {ninja.attacks.map((atk, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Cost: {getTotalChakraCost(atk.cost)}
                    </span>
                    <span className="font-bold">{atk.name}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: typeColor }}>
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
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-yellow-500 uppercase font-bold">Ability</span>
              <span className="font-bold text-yellow-200">{ninja.ability.name}</span>
            </div>
            <p className="text-xs text-gray-400">{ninja.ability.description}</p>
          </div>
        )}

        {/* Non-ninja description */}
        {!ninja && 'description' in card && (
          <div className="bg-white/5 rounded-lg p-3 mb-4">
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

        {/* Legendary badge */}
        {ninja?.isLegendary && (
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
              LEGENDARY - Worth 2 Points
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
