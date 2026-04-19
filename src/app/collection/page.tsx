'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import MainNav from '@/components/layout/MainNav';
import CardGrid from '@/components/cards/CardGrid';
import CardFilter from '@/components/cards/CardFilter';
import CardDetail from '@/components/cards/CardDetail';
import GlassPanel from '@/components/shared/GlassPanel';
import PageTransition from '@/components/shared/PageTransition';
import { useGameStore } from '@/store';
import { getAllCards, getAllCardSets } from '@/data/cardLoader';
import { filterCards } from '@/lib/cardUtils';
import { CardType, ChakraType, Rarity } from '@/types/enums';
import { GameCard } from '@/types/card';

export default function CollectionPage() {
  const ownedCards = useGameStore((s) => s.ownedCards);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CardType | undefined>();
  const [chakraFilter, setChakraFilter] = useState<ChakraType | undefined>();
  const [rarityFilter, setRarityFilter] = useState<Rarity | undefined>();
  const [setFilter, setSetFilter] = useState<string | undefined>();
  const [showOwned, setShowOwned] = useState(false);

  const allCards = useMemo(() => getAllCards(), []);
  const allSets = useMemo(() => getAllCardSets(), []);

  // Sort by set release order, then by dex number within the set — this is
  // the canonical "catalogue" order users expect in a Pokédex-style view.
  const setReleaseOrder: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of allSets) map[s.setId] = s.releaseOrder;
    return map;
  }, [allSets]);

  const displayCards = useMemo(() => {
    let cards = filterCards(allCards, {
      type: typeFilter,
      chakraType: chakraFilter,
      rarity: rarityFilter,
      search: search || undefined,
      set: setFilter,
    });

    if (showOwned) {
      cards = cards.filter((c) => (ownedCards[c.id] ?? 0) > 0);
    }

    return [...cards].sort((a, b) => {
      const sa = setReleaseOrder[a.set] ?? 999;
      const sb = setReleaseOrder[b.set] ?? 999;
      if (sa !== sb) return sa - sb;
      return (a.setNumber ?? 0) - (b.setNumber ?? 0);
    });
  }, [allCards, typeFilter, chakraFilter, rarityFilter, setFilter, search, showOwned, ownedCards, setReleaseOrder]);

  const totalOwned = Object.values(ownedCards).reduce((sum, n) => sum + n, 0);
  const uniqueOwned = Object.keys(ownedCards).filter((k) => ownedCards[k] > 0).length;
  const progressPercent = allCards.length > 0 ? (uniqueOwned / allCards.length) * 100 : 0;

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold font-heading">Collection</h1>
              <p className="text-sm text-gray-500">
                {uniqueOwned}/{allCards.length} unique | {totalOwned} total cards
              </p>
            </div>
            <button
              onClick={() => setShowOwned(!showOwned)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                showOwned ? 'bg-naruto-orange text-white' : 'bg-white/5 text-gray-400'
              }`}
            >
              {showOwned ? 'Owned Only' : 'Show All'}
            </button>
          </div>

          {/* Progress bar */}
          <GlassPanel className="p-3 mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Collection Progress</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-naruto-orange to-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </GlassPanel>

          <CardFilter
            onTypeChange={setTypeFilter}
            onChakraChange={setChakraFilter}
            onRarityChange={setRarityFilter}
            onSearchChange={setSearch}
            onSetChange={setSetFilter}
            activeType={typeFilter}
            activeChakra={chakraFilter}
            activeRarity={rarityFilter}
            activeSet={setFilter}
            searchValue={search}
          />

          <div className="mt-4">
            <CardGrid
              cards={displayCards}
              onCardClick={setSelectedCard}
              cardCounts={ownedCards}
              showCounts
              emptyMessage="No cards match your filters"
            />
          </div>
        </div>
      </PageTransition>

      <AnimatePresence>
        {selectedCard && (
          <CardDetail
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            count={ownedCards[selectedCard.id] ?? 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
