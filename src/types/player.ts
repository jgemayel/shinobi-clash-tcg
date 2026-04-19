import { AIDifficulty } from './enums';
import { GameCard } from './card';

export interface PlayerProfile {
  name: string;
  avatarId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  achievements: string[];
  createdAt: number;
}

export interface SavedDeck {
  id: string;
  name: string;
  cardIds: string[];
  chakraTypes: [string, string];
  createdAt: number;
  updatedAt: number;
}

export interface PackState {
  availablePacks: number;
  maxPacks: number;
  lastPackTime: number;
  packRechargeMs: number;
}

export interface CollectionState {
  ownedCards: Record<string, number>;
}

export interface BattleReward {
  xp: number;
  card: GameCard | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
}

export interface AIOpponent {
  name: string;
  difficulty: AIDifficulty;
  deckId: string;
  avatar: string;
}
