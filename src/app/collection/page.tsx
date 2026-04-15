'use client';

import { useState, useMemo } from 'react';
import MainNav from '@/components/layout/MainNav';
import CardGrid from '@/components/cards/CardGrid';
import CardFilter from '@/components/cards/CardFilter';
import CardDetail from '@/components/cards/CardDetail';
import { useGameStore } from '@/store';
import { getAllCards } from '@/data/cardLoader';
import { filterCards, sortCards } from '@/lib/cardUtils';
import { CardType, ChakraType, Rarity } from '@/types/enums';
import { GameCard } from '@/types/card';

export default function CollectionPage() {
  const ownedCards = useGameStore((s) => s.ownedCards);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CardType | undefined>();
  const [chakraFilter, setChakraFilter] = useState<ChakraType | undefined>();
  const [rarityFilter, setRarityFilter] = useState<Rarity | undefined>();
  const [showOwned, setShowOwned] = useState(false);

  const allCards = useMemo(() => getAllCards(), []);

  const displayCards = useMemo(() => {
    let cards = filterCards(allCards, {
      type: typeFilter,
      chakraType: chakraFilter,
      rarity: rarityFilter,
      search: search || undefined,
    });

    if (showOwned) {
      cards = cards.filter((c) => (ownedCards[c.id] ?? 0) > 0);
    }

    return sortCards(cards, 'rarity');
  }, [allCards, typeFilter, chakraFilter, rarityFilter, search, showOwned, ownedCards]);

  const totalOwned = Object.values(ownedCards).reduce((sum, n) => sum + n, 0);
  const uniqueOwned = Object.keys(ownedCards).filter((k) => ownedCards[k] > 0).length;

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Collection</h1>
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

        <CardFilter
          onTypeChange={setTypeFilter}
          onChakraChange={setChakraFilter}
          onRarityChange={setRarityFilter}
          onSearchChange={setSearch}
          activeType={typeFilter}
          activeChakra={chakraFilter}
          activeRarity={rarityFilter}
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

      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          count={ownedCards[selectedCard.id] ?? 0}
        />
      )}
    </div>
  );
}
