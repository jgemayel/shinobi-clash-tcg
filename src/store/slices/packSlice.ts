import { StateCreator } from 'zustand';
import { MAX_STORED_PACKS, PACK_RECHARGE_MS } from '@/lib/constants';

export interface PackSlice {
  availablePacks: number;
  lastPackTime: number;
  hasSeenWelcome: boolean;
  openPack: () => boolean;
  rechargePacks: () => void;
  getTimeToNextPack: () => number;
  setHasSeenWelcome: () => void;
  addPacks: (count: number) => void;
}

// The combined store contains all slices, so we can read `testMode`
// from the settings slice via a cast on `get()`.
function getTestMode(get: () => unknown): boolean {
  const s = get() as { testMode?: boolean };
  return s.testMode ?? true;
}

export const createPackSlice: StateCreator<PackSlice> = (set, get) => ({
  availablePacks: 999,
  lastPackTime: Date.now(),
  hasSeenWelcome: false,

  openPack: () => {
    if (getTestMode(get)) {
      // Unlimited pulls — keep the counter high so the UI reflects plenty.
      set((state) => ({
        availablePacks: Math.max(state.availablePacks, 999),
        lastPackTime: Date.now(),
      }));
      return true;
    }
    const { availablePacks } = get();
    if (availablePacks <= 0) return false;
    set((state) => ({
      availablePacks: state.availablePacks - 1,
      lastPackTime: Date.now(),
    }));
    return true;
  },

  rechargePacks: () => {
    if (getTestMode(get)) {
      set({ availablePacks: 999, lastPackTime: Date.now() });
      return;
    }
    const { lastPackTime, availablePacks } = get();
    if (availablePacks >= MAX_STORED_PACKS) return;

    const now = Date.now();
    const elapsed = now - lastPackTime;
    const packsToAdd = Math.floor(elapsed / PACK_RECHARGE_MS);

    if (packsToAdd > 0) {
      set({
        availablePacks: Math.min(availablePacks + packsToAdd, MAX_STORED_PACKS),
        lastPackTime: now,
      });
    }
  },

  getTimeToNextPack: () => {
    if (getTestMode(get)) return 0;
    const { lastPackTime, availablePacks } = get();
    if (availablePacks >= MAX_STORED_PACKS) return 0;
    const elapsed = Date.now() - lastPackTime;
    return Math.max(0, PACK_RECHARGE_MS - (elapsed % PACK_RECHARGE_MS));
  },

  setHasSeenWelcome: () => set({ hasSeenWelcome: true }),

  addPacks: (count: number) =>
    set((state) => ({ availablePacks: state.availablePacks + count })),
});
