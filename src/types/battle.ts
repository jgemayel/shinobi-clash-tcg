import { BattlePhase, ChakraType, StatusEffect } from './enums';
import { GameCard, ToolCard } from './card';

export interface ActiveStatus {
  effect: StatusEffect;
  turnsRemaining: number | null;
  stackCount: number;
}

export interface BattleCardInstance {
  instanceId: string;
  card: GameCard;
  currentHp: number;
  maxHp: number;
  attachedChakra: ChakraType[];
  attachedTools: ToolCard[];
  statusEffects: ActiveStatus[];
  damageCounters: number;
  turnPlayed: number;
  canAttackThisTurn: boolean;
  hasEvolved: boolean;
}

export interface PlayerBattleState {
  deck: GameCard[];
  hand: GameCard[];
  active: BattleCardInstance | null;
  bench: (BattleCardInstance | null)[];
  discardPile: GameCard[];
  points: number;
  senseiCard: GameCard | null;
  senseiUsedThisTurn: boolean;
  chakraAttachedThisTurn: boolean;
}

export interface BattleState {
  turn: number;
  phase: BattlePhase;
  activePlayer: 'player' | 'opponent';
  player: PlayerBattleState;
  opponent: PlayerBattleState;
  chakraOptions: [ChakraType, ChakraType];
  turnLog: BattleEvent[];
  winner: 'player' | 'opponent' | 'draw' | null;
  firstTurn: boolean;
}

export type BattleAction =
  | { type: 'draw' }
  | { type: 'attach-chakra'; chakraType: ChakraType; targetInstanceId: string }
  | { type: 'play-ninja'; cardId: string; toBench: number }
  | { type: 'evolve'; cardId: string; targetInstanceId: string }
  | { type: 'attack'; attackIndex: number }
  | { type: 'retreat'; newActiveInstanceId: string }
  | { type: 'play-jutsu-scroll'; cardId: string; target?: string }
  | { type: 'play-tool'; cardId: string; targetInstanceId: string }
  | { type: 'use-sensei' }
  | { type: 'end-turn' }
  | { type: 'select-active'; instanceId: string };

export interface BattleEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface BattleResult {
  newState: BattleState;
  events: BattleEvent[];
}
