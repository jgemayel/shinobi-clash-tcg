import { StateCreator } from 'zustand';
import { MAX_STORED_PACKS, PACK_RECHARGE_MS } from '@/lib/constants';

export interface PackSlice {
  availablePacks: number;
  lastPackTime: number;
  openPack: () => boolean;
  rechargePacks: () => void;
  getTimeToNextPack: () => number;
}

export const createPackSlice: StateCreator<PackSlice> = (set, get) => ({
  availablePacks: MAX_STORED_PACKS,
  lastPackTime: Date.now(),

  openPack: () => {
    const { availablePacks } = get();
    if (availablePacks <= 0) return false;
    set((state) => ({
      availablePacks: state.availablePacks - 1,
      lastPackTime: Date.now(),
    }));
    return true;
  },

  rechargePacks: () => {
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
    const { lastPackTime, availablePacks } = get();
    if (availablePacks >= MAX_STORED_PACKS) return 0;
    const elapsed = Date.now() - lastPackTime;
    return Math.max(0, PACK_RECHARGE_MS - (elapsed % PACK_RECHARGE_MS));
  },
});
