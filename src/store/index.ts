'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CollectionSlice, createCollectionSlice } from './slices/collectionSlice';
import { DeckSlice, createDeckSlice } from './slices/deckSlice';
import { PlayerSlice, createPlayerSlice } from './slices/playerSlice';
import { PackSlice, createPackSlice } from './slices/packSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';

export type GameStore = CollectionSlice & DeckSlice & PlayerSlice & PackSlice & SettingsSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createCollectionSlice(...a),
      ...createDeckSlice(...a),
      ...createPlayerSlice(...a),
      ...createPackSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: 'naruto-tcg-save',
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
      }),
    }
  )
);
