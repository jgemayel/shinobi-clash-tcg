import { BattleState } from '@/types/battle';
import { WIN_POINTS, MAX_TURNS } from '@/lib/constants';

export type WinResult =
  | { type: 'points'; winner: 'player' | 'opponent' }
  | { type: 'bench-out'; winner: 'player' | 'opponent' }
  | { type: 'deck-out'; winner: 'player' | 'opponent' }
  | { type: 'turn-limit'; winner: 'draw' }
  | null;

export function checkWinCondition(state: BattleState): WinResult {
  // Check points
  if (state.player.points >= WIN_POINTS) {
    return { type: 'points', winner: 'player' };
  }
  if (state.opponent.points >= WIN_POINTS) {
    return { type: 'points', winner: 'opponent' };
  }

  // Check bench-out (no active and no bench)
  if (!state.player.active && state.player.bench.every((b) => b === null)) {
    return { type: 'bench-out', winner: 'opponent' };
  }
  if (!state.opponent.active && state.opponent.bench.every((b) => b === null)) {
    return { type: 'bench-out', winner: 'player' };
  }

  // Pokemon TCGP deck-out rule: if a player's deck AND hand are both empty,
  // they can't draw or play anything → opponent wins.
  if (state.player.deck.length === 0 && state.player.hand.length === 0) {
    return { type: 'deck-out', winner: 'opponent' };
  }
  if (state.opponent.deck.length === 0 && state.opponent.hand.length === 0) {
    return { type: 'deck-out', winner: 'player' };
  }

  // Check turn limit
  if (state.turn >= MAX_TURNS) {
    return { type: 'turn-limit', winner: 'draw' };
  }

  return null;
}
