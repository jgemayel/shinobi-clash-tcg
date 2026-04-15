import { StateCreator } from 'zustand';
import { PlayerProfile } from '@/types/player';
import { XP_PER_WIN, XP_PER_LOSS, XP_PER_PACK } from '@/lib/constants';

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

export interface PlayerSlice {
  profile: PlayerProfile;
  addXp: (amount: number) => void;
  recordWin: () => void;
  recordLoss: () => void;
  recordDraw: () => void;
  addAchievement: (achievementId: string) => void;
}

export const createPlayerSlice: StateCreator<PlayerSlice> = (set, get) => ({
  profile: {
    name: 'Ninja',
    level: 1,
    xp: 0,
    xpToNextLevel: xpForLevel(1),
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    achievements: [],
    createdAt: Date.now(),
  },

  addXp: (amount: number) =>
    set((state) => {
      let { xp, level, xpToNextLevel } = state.profile;
      xp += amount;
      while (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level++;
        xpToNextLevel = xpForLevel(level);
      }
      return {
        profile: { ...state.profile, xp, level, xpToNextLevel },
      };
    }),

  recordWin: () => {
    set((state) => ({
      profile: { ...state.profile, totalWins: state.profile.totalWins + 1 },
    }));
    get().addXp(XP_PER_WIN);
  },

  recordLoss: () => {
    set((state) => ({
      profile: { ...state.profile, totalLosses: state.profile.totalLosses + 1 },
    }));
    get().addXp(XP_PER_LOSS);
  },

  recordDraw: () =>
    set((state) => ({
      profile: { ...state.profile, totalDraws: state.profile.totalDraws + 1 },
    })),

  addAchievement: (achievementId: string) =>
    set((state) => {
      if (state.profile.achievements.includes(achievementId)) return state;
      return {
        profile: {
          ...state.profile,
          achievements: [...state.profile.achievements, achievementId],
        },
      };
    }),
});
