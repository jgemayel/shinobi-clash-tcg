import { StateCreator } from 'zustand';
import { BattleState, BattleAction, BattleEvent } from '@/types/battle';
import { AIDifficulty } from '@/types/enums';
import { GameCard } from '@/types/card';
import { createInitialBattleState, processAction, processBetweenTurns, getLegalActions } from '@/engine/BattleEngine';
import { chooseAIAction } from '@/ai/AIController';
import { BattlePhase } from '@/types/enums';

export interface BattleSlice {
  battleState: BattleState | null;
  isAnimating: boolean;
  battleDifficulty: AIDifficulty;
  battleEvents: BattleEvent[];
  startBattle: (playerDeck: GameCard[], opponentDeck: GameCard[], difficulty: AIDifficulty) => void;
  performAction: (action: BattleAction) => BattleEvent[];
  aiTakeTurn: () => Promise<void>;
  endBattle: () => void;
  setAnimating: (val: boolean) => void;
}

export const createBattleSlice: StateCreator<BattleSlice> = (set, get) => ({
  battleState: null,
  isAnimating: false,
  battleDifficulty: AIDifficulty.Genin,
  battleEvents: [],

  startBattle: (playerDeck, opponentDeck, difficulty) => {
    const state = createInitialBattleState(playerDeck, opponentDeck);
    set({ battleState: state, battleDifficulty: difficulty, isAnimating: false, battleEvents: [] });
  },

  performAction: (action) => {
    const { battleState } = get();
    if (!battleState) return [];

    const result = processAction(battleState, action);
    let newState = result.newState;
    const allEvents = [...result.events];

    // If between turns, process that too
    if (newState.phase === BattlePhase.BetweenTurns) {
      const btResult = processBetweenTurns(newState);
      newState = btResult.newState;
      allEvents.push(...btResult.events);
    }

    set({ battleState: newState, battleEvents: allEvents });
    return allEvents;
  },

  aiTakeTurn: async () => {
    const { battleState, battleDifficulty, performAction } = get();
    if (!battleState || battleState.activePlayer !== 'opponent') return;

    set({ isAnimating: true });

    // AI takes actions in a loop until it ends the turn or game ends
    let safety = 0;
    while (safety < 20) {
      safety++;
      const current = get().battleState;
      if (!current || current.activePlayer !== 'opponent' || current.phase === BattlePhase.GameOver) break;

      await new Promise((r) => setTimeout(r, 350));

      const action = chooseAIAction(current, battleDifficulty);
      performAction(action);

      if (action.type === 'end-turn' || action.type === 'end-setup') break;
    }

    set({ isAnimating: false });
  },

  endBattle: () => {
    set({ battleState: null, isAnimating: false, battleEvents: [] });
  },

  setAnimating: (val) => set({ isAnimating: val }),
});
