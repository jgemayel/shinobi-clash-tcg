'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MainNav from '@/components/layout/MainNav';
import CardDisplay from '@/components/cards/CardDisplay';
import CardFilter from '@/components/cards/CardFilter';
import CardDetail from '@/components/cards/CardDetail';
import GlassPanel from '@/components/shared/GlassPanel';
import PageTransition from '@/components/shared/PageTransition';
import { useGameStore } from '@/store';
import { getAllCards, getCardById } from '@/data/cardLoader';
import { filterCards, sortCards, isNinja } from '@/lib/cardUtils';
import { CardType, ChakraType, Rarity } from '@/types/enums';
import { GameCard, NinjaCard } from '@/types/card';
import { SavedDeck } from '@/types/player';
import { MAX_DECK_SIZE, MAX_CARD_COPIES, MAX_SENSEI_COPIES } from '@/lib/constants';
import { soundManager } from '@/lib/sounds';
import { buildPlayerDeck } from '@/lib/aiDeckBuilder';

export default function DeckBuilderPage() {
  const ownedCards = useGameStore((s) => s.ownedCards);
  const decks = useGameStore((s) => s.decks);
  const activeDeckId = useGameStore((s) => s.activeDeckId);
  const saveDeck = useGameStore((s) => s.saveDeck);
  const deleteDeck = useGameStore((s) => s.deleteDeck);
  const setActiveDeck = useGameStore((s) => s.setActiveDeck);

  const [deckName, setDeckName] = useState('New Deck');
  const [deckCards, setDeckCards] = useState<string[]>([]);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CardType | undefined>();
  const [chakraFilter, setChakraFilter] = useState<ChakraType | undefined>();
  const [rarityFilter, setRarityFilter] = useState<Rarity | undefined>();
  const [detailCard, setDetailCard] = useState<GameCard | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);

  const allCards = useMemo(() => getAllCards(), []);

  const ownedCardList = useMemo(() => {
    return allCards.filter((c) => (ownedCards[c.id] ?? 0) > 0);
  }, [allCards, ownedCards]);

  const filteredCards = useMemo(() => {
    const cards = filterCards(ownedCardList, {
      type: typeFilter,
      chakraType: chakraFilter,
      rarity: rarityFilter,
      search: search || undefined,
    });
    return sortCards(cards, 'rarity');
  }, [ownedCardList, typeFilter, chakraFilter, rarityFilter, search]);

  const deckCardObjects = useMemo(() => {
    return deckCards.map(getCardById).filter(Boolean) as GameCard[];
  }, [deckCards]);

  const countInDeck = (cardId: string) => deckCards.filter((id) => id === cardId).length;

  const canAddCard = (card: GameCard): boolean => {
    if (deckCards.length >= MAX_DECK_SIZE) return false;
    const currentCount = countInDeck(card.id);
    const maxCopies = card.type === CardType.Sensei ? MAX_SENSEI_COPIES : MAX_CARD_COPIES;
    if (currentCount >= maxCopies) return false;
    if (currentCount >= (ownedCards[card.id] ?? 0)) return false;
    return true;
  };

  const addCard = (card: GameCard) => {
    if (canAddCard(card)) {
      setDeckCards((prev) => [...prev, card.id]);
      soundManager.cardPlace();
    }
  };

  const removeCard = (index: number) => {
    setDeckCards((prev) => prev.filter((_, i) => i !== index));
  };

  const hasNinja = deckCardObjects.some((c) => c.type === CardType.Ninja);
  const isValid = deckCards.length === MAX_DECK_SIZE && hasNinja;

  const handleSave = () => {
    const chakraTypes: [string, string] = ['colorless', 'colorless'];
    const ninjas = deckCardObjects.filter(isNinja) as NinjaCard[];
    const types = [...new Set(ninjas.map((n) => n.chakraType))];
    if (types.length >= 1) chakraTypes[0] = types[0];
    if (types.length >= 2) chakraTypes[1] = types[1];

    const deck: SavedDeck = {
      id: editingDeckId ?? `deck_${Date.now()}`,
      name: deckName,
      cardIds: deckCards,
      chakraTypes,
      createdAt: editingDeckId ? (decks.find((d) => d.id === editingDeckId)?.createdAt ?? Date.now()) : Date.now(),
      updatedAt: Date.now(),
    };
    saveDeck(deck);
    setEditingDeckId(deck.id);
    soundManager.buttonClick();
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 600);
  };

  const handleLoadDeck = (deck: SavedDeck) => {
    setDeckName(deck.name);
    setDeckCards([...deck.cardIds]);
    setEditingDeckId(deck.id);
  };

  const handleNewDeck = () => {
    setDeckName('New Deck');
    setDeckCards([]);
    setEditingDeckId(null);
  };

  const handleQuickBuild = () => {
    const ids = buildPlayerDeck(ownedCards);
    if (ids.length === 0) return;
    setDeckName('Quick Deck');
    setDeckCards(ids);
    setEditingDeckId(null);
    soundManager.buttonClick();
  };

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-heading">Deck Builder</h1>
            <div className="flex gap-2">
              {Object.keys(ownedCards).length > 0 && (
                <button
                  onClick={handleQuickBuild}
                  className="px-3 py-1.5 rounded-lg text-xs bg-naruto-orange/20 text-naruto-orange hover:bg-naruto-orange/30 transition-colors font-heading"
                >
                  Quick Build
                </button>
              )}
              <button
                onClick={handleNewDeck}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
              >
                + New Deck
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Available Cards */}
            <div className="lg:col-span-2">
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

              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {filteredCards.map((card) => {
                  const inDeck = countInDeck(card.id);
                  const addable = canAddCard(card);
                  return (
                    <div key={card.id} className="relative">
                      <div className={!addable && inDeck > 0 ? 'opacity-50' : ''}>
                        <CardDisplay
                          card={card}
                          size="sm"
                          onClick={() => addable ? addCard(card) : setDetailCard(card)}
                        />
                      </div>
                      {inDeck > 0 && (
                        <div className="absolute top-1 right-1 bg-naruto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg">
                          {inDeck}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Current Deck */}
            <div>
              <div className="sticky top-4">
                <GlassPanel strong className="p-4">
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 pb-1 mb-3 text-lg font-bold font-heading focus:outline-none focus:border-naruto-orange transition-colors"
                  />

                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
                      {deckCards.length}/{MAX_DECK_SIZE} cards
                    </span>
                    {!hasNinja && deckCards.length > 0 && (
                      <span className="text-xs text-red-400">Needs ninja cards</span>
                    )}
                  </div>

                  {/* Deck stats */}
                  {deckCards.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {(() => {
                        const typeCounts = deckCardObjects.reduce((acc, c) => {
                          acc[c.type] = (acc[c.type] ?? 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const labels: Record<string, { label: string; color: string }> = {
                          ninja: { label: 'Ninja', color: '#22c55e' },
                          'jutsu-scroll': { label: 'Jutsu', color: '#3b82f6' },
                          tool: { label: 'Tool', color: '#a855f7' },
                          sensei: { label: 'Sensei', color: '#f59e0b' },
                        };
                        return Object.entries(typeCounts).map(([type, count]) => {
                          const info = labels[type] ?? { label: type, color: '#9ca3af' };
                          return (
                            <span
                              key={type}
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: `${info.color}22`, color: info.color }}
                            >
                              {count} {info.label}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  )}

                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    <AnimatePresence>
                      {deckCardObjects.map((card, i) => (
                        <motion.div
                          key={`${card.id}-${i}`}
                          initial={{ opacity: 0, x: -20, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between bg-white/[0.04] rounded-lg px-2 py-1.5 text-xs border border-white/[0.04]"
                        >
                          <span className="truncate">{card.name}</span>
                          <button
                            onClick={() => removeCard(i)}
                            className="text-red-400 hover:text-red-300 ml-2 shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-400/10"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {deckCards.length === 0 && (
                      <p className="text-gray-600 text-xs text-center py-8">
                        Click cards to add them to your deck
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <motion.button
                      onClick={handleSave}
                      disabled={!isValid}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-2 rounded-lg text-sm font-bold font-heading transition-all ${
                        isValid
                          ? saveFlash
                            ? 'bg-green-500 text-white'
                            : 'bg-naruto-orange text-white hover:brightness-110'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {saveFlash ? 'Saved!' : 'Save Deck'}
                    </motion.button>
                  </div>
                </GlassPanel>

                {/* Saved Decks */}
                {decks.length > 0 && (
                  <GlassPanel className="mt-4 p-4">
                    <h3 className="font-bold text-sm mb-2 font-heading">Saved Decks</h3>
                    <div className="space-y-2">
                      {decks.map((deck) => (
                        <div
                          key={deck.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                            activeDeckId === deck.id ? 'bg-naruto-orange/10 border border-naruto-orange/30' : 'bg-white/[0.04]'
                          }`}
                        >
                          <button
                            onClick={() => handleLoadDeck(deck)}
                            className="truncate text-left flex-1"
                          >
                            {deck.name} ({deck.cardIds.length})
                          </button>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => setActiveDeck(deck.id)}
                              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                                activeDeckId === deck.id ? 'bg-naruto-orange text-white' : 'bg-white/10 text-gray-400 hover:bg-white/15'
                              }`}
                            >
                              {activeDeckId === deck.id ? 'Active' : 'Set Active'}
                            </button>
                            <button
                              onClick={() => deleteDeck(deck.id)}
                              className="text-red-400 hover:text-red-300 px-1"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassPanel>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      <AnimatePresence>
        {detailCard && (
          <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
