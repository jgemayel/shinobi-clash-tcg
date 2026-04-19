import { StateCreator } from 'zustand';

export interface SettingsSlice {
  sfxVolume: number;
  musicVolume: number;
  animationSpeed: 'normal' | 'fast';
  testMode: boolean;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setAnimationSpeed: (speed: 'normal' | 'fast') => void;
  setTestMode: (enabled: boolean) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  sfxVolume: 0.7,
  musicVolume: 0.5,
  animationSpeed: 'normal',
  testMode: true,

  setSfxVolume: (volume: number) => set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),
  setMusicVolume: (volume: number) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setTestMode: (enabled: boolean) => set({ testMode: enabled }),
});
