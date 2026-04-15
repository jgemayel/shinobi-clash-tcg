'use client';

import { useState, useCallback, useEffect } from 'react';
import MainNav from '@/components/layout/MainNav';
import CardDisplay from '@/components/cards/CardDisplay';
import CardDetail from '@/components/cards/CardDetail';
import { useGameStore } from '@/store';
import { getCardSet, getAllCardSets } from '@/data/cardLoader';
import { generatePack } from '@/lib/rarityUtils';
import { getRarityColor, getRarityLabel } from '@/lib/rarityUtils';
import { GameCard } from '@/types/card';
import { XP_PER_PACK } from '@/lib/constants';

export default function PacksPage() {
  const availablePacks = useGameStore((s) => s.availablePacks);
  const openPack = useGameStore((s) => s.openPack);
  const addCards = useGameStore((s) => s.addCards);
  const addXp = useGameStore((s) => s.addXp);
  const rechargePacks = useGameStore((s) => s.rechargePacks);
  const profile = useGameStore((s) => s.profile);

  const [selectedSetId, setSelectedSetId] = useState('hidden-leaf-origins');
  const [revealedCards, setRevealedCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [isOpening, setIsOpening] = useState(false);
  const [detailCard, setDetailCard] = useState<GameCard | null>(null);

  const sets = getAllCardSets().filter((s) => s.unlockLevel <= profile.level);

  useEffect(() => {
    rechargePacks();
  }, [rechargePacks]);

  const handleOpenPack = useCallback(() => {
    const cardSet = getCardSet(selectedSetId);
    if (!cardSet || !openPack()) return;

    const cards = generatePack(cardSet);
    setRevealedCards(cards);
    setFlippedCards(new Set());
    setIsOpening(true);
    addCards(cards.map((c) => c.id));
    addXp(XP_PER_PACK);
  }, [selectedSetId, openPack, addCards, addXp]);

  const handleFlipCard = (index: number) => {
    setFlippedCards((prev) => new Set([...prev, index]));
  };

  const handleDone = () => {
    setIsOpening(false);
    setRevealedCards([]);
    setFlippedCards(new Set());
  };

  const allFlipped = flippedCards.size === revealedCards.length && revealedCards.length > 0;

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Packs</h1>
          <div className="bg-white/5 rounded-full px-4 py-1.5 text-sm">
            <span className="text-gray-400">Available: </span>
            <span className="text-naruto-orange font-bold">{availablePacks}</span>
          </div>
        </div>

        {!isOpening ? (
          <>
            {/* Pack Selection */}
            <div className="space-y-3 mb-6">
              {sets.map((set) => (
                <button
                  key={set.setId}
                  onClick={() => setSelectedSetId(set.setId)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedSetId === set.setId
                      ? 'border-naruto-orange/60 bg-naruto-orange/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{set.setName}</h3>
                      <p className="text-xs text-gray-500">{set.cards.length} cards</p>
                    </div>
                    {selectedSetId === set.setId && (
                      <span className="text-naruto-orange text-sm">Selected</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Open Pack Button */}
            <button
              onClick={handleOpenPack}
              disabled={availablePacks <= 0}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                availablePacks > 0
                  ? 'bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white pack-glow hover:brightness-110'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {availablePacks > 0 ? 'Open Pack!' : 'No Packs Available'}
            </button>
          </>
        ) : (
          <>
            {/* Card Reveal */}
            <p className="text-center text-gray-400 text-sm mb-4">
              Tap each card to reveal!
            </p>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {revealedCards.map((card, i) => (
                <div key={i} className="flex flex-col items-center">
                  {flippedCards.has(i) ? (
                    <div onClick={() => setDetailCard(card)} className="cursor-pointer">
                      <CardDisplay card={card} size="sm" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFlipCard(i)}
                      className="w-[100px] h-[140px] rounded-lg bg-gradient-to-br from-naruto-orange to-naruto-orange-dark border-2 border-naruto-orange/60 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <span className="text-2xl font-bold text-white/80">?</span>
                    </button>
                  )}
                  {flippedCards.has(i) && (
                    <span
                      className="text-[10px] mt-1 font-bold"
                      style={{ color: getRarityColor(card.rarity) }}
                    >
                      {getRarityLabel(card.rarity)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {allFlipped && (
              <button
                onClick={handleDone}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/15 transition-colors"
              >
                Done
              </button>
            )}
          </>
        )}
      </div>

      {detailCard && (
        <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
      )}
    </div>
  );
}
