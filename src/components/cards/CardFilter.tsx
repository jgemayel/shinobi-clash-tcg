'use client';

import { motion } from 'motion/react';
import { CardType, ChakraType, Rarity } from '@/types/enums';
import { getTypeName, getTypeColor } from '@/lib/typeChart';
import { getRarityLabel } from '@/lib/rarityUtils';
import { getAllCardSets } from '@/data/cardLoader';

interface CardFilterProps {
  onTypeChange: (type: CardType | undefined) => void;
  onChakraChange: (chakra: ChakraType | undefined) => void;
  onRarityChange: (rarity: Rarity | undefined) => void;
  onSearchChange: (search: string) => void;
  onSetChange?: (setId: string | undefined) => void;
  activeType?: CardType;
  activeChakra?: ChakraType;
  activeRarity?: Rarity;
  activeSet?: string;
  searchValue: string;
}

export default function CardFilter({
  onTypeChange,
  onChakraChange,
  onRarityChange,
  onSearchChange,
  onSetChange,
  activeType,
  activeChakra,
  activeRarity,
  activeSet,
  searchValue,
}: CardFilterProps) {
  const sets = getAllCardSets();
  const cardTypes = [
    { value: CardType.Ninja, label: 'Ninja' },
    { value: CardType.JutsuScroll, label: 'Jutsu' },
    { value: CardType.Tool, label: 'Tool' },
    { value: CardType.Sensei, label: 'Sensei' },
  ];

  const chakraTypes = [
    ChakraType.Fire,
    ChakraType.Water,
    ChakraType.Lightning,
    ChakraType.Earth,
    ChakraType.Wind,
  ];

  const rarities = [
    Rarity.Common,
    Rarity.Uncommon,
    Rarity.Rare,
    Rarity.UltraRare,
    Rarity.Legendary,
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search cards..."
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-naruto-orange/50 focus:ring-1 focus:ring-naruto-orange/20 transition-all"
      />

      {/* Card Type Filter */}
      <div className="flex gap-1.5 flex-wrap">
        <motion.button
          layout
          onClick={() => onTypeChange(undefined)}
          className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
            !activeType ? 'bg-naruto-orange text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          All
        </motion.button>
        {cardTypes.map(({ value, label }) => (
          <motion.button
            layout
            key={value}
            onClick={() => onTypeChange(activeType === value ? undefined : value)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              activeType === value ? 'bg-naruto-orange text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Chakra Type Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {chakraTypes.map((type) => (
          <motion.button
            layout
            key={type}
            onClick={() => onChakraChange(activeChakra === type ? undefined : type)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
              activeChakra === type ? 'ring-2 ring-white/50' : ''
            }`}
            style={{
              backgroundColor: activeChakra === type ? getTypeColor(type) + '44' : 'rgba(255,255,255,0.05)',
              color: activeChakra === type ? getTypeColor(type) : '#9ca3af',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getTypeColor(type) }}
            />
            {getTypeName(type).split(' ')[0]}
          </motion.button>
        ))}
      </div>

      {/* Rarity Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {rarities.map((rarity) => (
          <motion.button
            layout
            key={rarity}
            onClick={() => onRarityChange(activeRarity === rarity ? undefined : rarity)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              activeRarity === rarity ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {getRarityLabel(rarity)}
          </motion.button>
        ))}
      </div>

      {/* Set Filter */}
      {onSetChange && (
        <div className="flex gap-1.5 flex-wrap">
          <motion.button
            layout
            onClick={() => onSetChange(undefined)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              !activeSet ? 'bg-naruto-orange text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Sets
          </motion.button>
          {sets.map((s) => (
            <motion.button
              layout
              key={s.setId}
              onClick={() => onSetChange(activeSet === s.setId ? undefined : s.setId)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                activeSet === s.setId ? 'bg-naruto-orange text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {s.setName}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
