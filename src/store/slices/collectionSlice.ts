import { StateCreator } from 'zustand';
import { GameCard } from '@/types/card';

export interface CollectionSlice {
  ownedCards: Record<string, number>;
  addCard: (cardId: string) => void;
  addCards: (cardIds: string[]) => void;
  getCardCount: (cardId: string) => number;
  getTotalCards: () => number;
}

export const createCollectionSlice: StateCreator<CollectionSlice> = (set, get) => ({
  ownedCards: {},

  addCard: (cardId: string) =>
    set((state) => ({
      ownedCards: {
        ...state.ownedCards,
        [cardId]: (state.ownedCards[cardId] ?? 0) + 1,
      },
    })),

  addCards: (cardIds: string[]) =>
    set((state) => {
      const updated = { ...state.ownedCards };
      for (const id of cardIds) {
        updated[id] = (updated[id] ?? 0) + 1;
      }
      return { ownedCards: updated };
    }),

  getCardCount: (cardId: string) => get().ownedCards[cardId] ?? 0,

  getTotalCards: () => Object.values(get().ownedCards).reduce((sum, count) => sum + count, 0),
});
