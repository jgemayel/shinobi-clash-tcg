'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CollectionSlice, createCollectionSlice } from './slices/collectionSlice';
import { DeckSlice, createDeckSlice } from './slices/deckSlice';
import { PlayerSlice, createPlayerSlice } from './slices/playerSlice';
import { PackSlice, createPackSlice } from './slices/packSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';
import { BattleSlice, createBattleSlice } from './slices/battleSlice';
import { getActiveProfileId, getProfileStorageKey } from '@/lib/profileStorage';

export type GameStore = CollectionSlice & DeckSlice & PlayerSlice & PackSlice & SettingsSlice & BattleSlice;

// Determined once at module load. Switching profiles requires a full page reload
// because zustand persist binds its storage key at store creation time.
function computeStorageName(): string {
  if (typeof window === 'undefined') return 'naruto-tcg-ssr';
  const id = getActiveProfileId();
  return id ? getProfileStorageKey(id) : 'naruto-tcg-no-profile';
}

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createCollectionSlice(...a),
      ...createDeckSlice(...a),
      ...createPlayerSlice(...a),
      ...createPackSlice(...a),
      ...createSettingsSlice(...a),
      ...createBattleSlice(...a),
    }),
    {
      name: computeStorageName(),
      partialize: (state) => ({
        ownedCards: state.ownedCards,
        decks: state.decks,
        activeDeckId: state.activeDeckId,
        profile: state.profile,
        availablePacks: state.availablePacks,
        lastPackTime: state.lastPackTime,
        sfxVolume: state.sfxVolume,
        musicVolume: state.musicVolume,
        animationSpeed: state.animationSpeed,
        testMode: state.testMode,
        hasSeenWelcome: state.hasSeenWelcome,
      }),
    }
  )
);
