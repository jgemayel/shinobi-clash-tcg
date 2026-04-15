import { StateCreator } from 'zustand';
import { SavedDeck } from '@/types/player';

export interface DeckSlice {
  decks: SavedDeck[];
  activeDeckId: string | null;
  saveDeck: (deck: SavedDeck) => void;
  deleteDeck: (deckId: string) => void;
  setActiveDeck: (deckId: string) => void;
  getActiveDeck: () => SavedDeck | null;
}

export const createDeckSlice: StateCreator<DeckSlice> = (set, get) => ({
  decks: [],
  activeDeckId: null,

  saveDeck: (deck: SavedDeck) =>
    set((state) => {
      const existing = state.decks.findIndex((d) => d.id === deck.id);
      const updated = [...state.decks];
      if (existing >= 0) {
        updated[existing] = { ...deck, updatedAt: Date.now() };
      } else {
        updated.push(deck);
      }
      return { decks: updated };
    }),

  deleteDeck: (deckId: string) =>
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== deckId),
      activeDeckId: state.activeDeckId === deckId ? null : state.activeDeckId,
    })),

  setActiveDeck: (deckId: string) => set({ activeDeckId: deckId }),

  getActiveDeck: () => {
    const { decks, activeDeckId } = get();
    return decks.find((d) => d.id === activeDeckId) ?? null;
  },
});
