'use client';

import { useState, useMemo, useCallback } from 'react';
import MainNav from '@/components/layout/MainNav';
import CardDisplay from '@/components/cards/CardDisplay';
import CardFilter from '@/components/cards/CardFilter';
import CardDetail from '@/components/cards/CardDetail';
import { useGameStore } from '@/store';
import { getAllCards, getCardById } from '@/data/cardLoader';
import { filterCards, sortCards, isNinja } from '@/lib/cardUtils';
import { CardType, ChakraType, Rarity } from '@/types/enums';
import { GameCard, NinjaCard } from '@/types/card';
import { SavedDeck } from '@/types/player';
import { MAX_DECK_SIZE, MAX_CARD_COPIES, MAX_SENSEI_COPIES } from '@/lib/constants';

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

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Deck Builder</h1>
          <button
            onClick={handleNewDeck}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:bg-white/10"
          >
            + New Deck
          </button>
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
                      <div className="absolute top-1 right-1 bg-naruto-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
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
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 pb-1 mb-3 text-lg font-bold focus:outline-none focus:border-naruto-orange"
                />

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
                    {deckCards.length}/{MAX_DECK_SIZE} cards
                  </span>
                  {!hasNinja && deckCards.length > 0 && (
                    <span className="text-xs text-red-400">Needs ninja cards</span>
                  )}
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {deckCardObjects.map((card, i) => (
                    <div
                      key={`${card.id}-${i}`}
                      className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1.5 text-xs"
                    >
                      <span className="truncate">{card.name}</span>
                      <button
                        onClick={() => removeCard(i)}
                        className="text-red-400 hover:text-red-300 ml-2 shrink-0"
                      >
                        x
                      </button>
                    </div>
                  ))}
                  {deckCards.length === 0 && (
                    <p className="text-gray-600 text-xs text-center py-8">
                      Click cards to add them to your deck
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                      isValid
                        ? 'bg-naruto-orange text-white hover:brightness-110'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Save Deck
                  </button>
                </div>
              </div>

              {/* Saved Decks */}
              {decks.length > 0 && (
                <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-2">Saved Decks</h3>
                  <div className="space-y-2">
                    {decks.map((deck) => (
                      <div
                        key={deck.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                          activeDeckId === deck.id ? 'bg-naruto-orange/10 border border-naruto-orange/30' : 'bg-white/5'
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
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              activeDeckId === deck.id ? 'bg-naruto-orange text-white' : 'bg-white/10 text-gray-400'
                            }`}
                          >
                            {activeDeckId === deck.id ? 'Active' : 'Set Active'}
                          </button>
                          <button
                            onClick={() => deleteDeck(deck.id)}
                            className="text-red-400 hover:text-red-300 px-1"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {detailCard && (
        <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
      )}
    </div>
  );
}
