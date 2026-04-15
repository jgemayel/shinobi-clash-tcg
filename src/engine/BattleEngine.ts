import { BattlePhase, CardType, ChakraType } from '@/types/enums';
import { GameCard, NinjaCard } from '@/types/card';
import {
  BattleState,
  BattleAction,
  BattleEvent,
  BattleResult,
  BattleCardInstance,
  PlayerBattleState,
} from '@/types/battle';
import { calculateDamage } from './DamageCalculator';
import { processBetweenTurnEffects, applyStatusEffect, isParalyzed, isConfused, rollParalysis, rollConfusion } from './StatusEffectProcessor';
import { canEvolve, evolveCard } from './EvolutionValidator';
import { generateChakraOptions, attachChakra, removeChakra } from './ChakraManager';
import { checkWinCondition } from './WinConditionChecker';
import { isNinja, canPayChakraCost, generateInstanceId } from '@/lib/cardUtils';
import { STARTING_HAND_SIZE, MAX_HAND_SIZE, MAX_BENCH_SIZE, REGULAR_KO_POINTS, LEGENDARY_KO_POINTS, CONFUSION_SELF_DAMAGE } from '@/lib/constants';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCardInstance(card: GameCard, turn: number): BattleCardInstance {
  const hp = isNinja(card) ? (card as NinjaCard).hp : 0;
  return {
    instanceId: generateInstanceId(),
    card,
    currentHp: hp,
    maxHp: hp,
    attachedChakra: [],
    attachedTools: [],
    statusEffects: [],
    damageCounters: 0,
    turnPlayed: turn,
    canAttackThisTurn: false,
    hasEvolved: false,
  };
}

function initPlayerState(deck: GameCard[]): PlayerBattleState {
  const shuffled = shuffle(deck);
  const sensei = shuffled.find((c) => c.type === CardType.Sensei) ?? null;
  const remaining = sensei ? shuffled.filter((c) => c.id !== sensei.id) : shuffled;
  const hand = remaining.slice(0, STARTING_HAND_SIZE);
  const drawPile = remaining.slice(STARTING_HAND_SIZE);

  return {
    deck: drawPile,
    hand,
    active: null,
    bench: [null, null, null],
    discardPile: [],
    points: 0,
    senseiCard: sensei,
    senseiUsedThisTurn: false,
    chakraAttachedThisTurn: false,
  };
}

export function createInitialBattleState(
  playerDeck: GameCard[],
  opponentDeck: GameCard[]
): BattleState {
  const player = initPlayerState(playerDeck);
  const opponent = initPlayerState(opponentDeck);

  return {
    turn: 1,
    phase: BattlePhase.Setup,
    activePlayer: 'player',
    player,
    opponent,
    chakraOptions: generateChakraOptions(playerDeck),
    turnLog: [],
    winner: null,
    firstTurn: true,
  };
}

export function getActivePlayerState(state: BattleState): PlayerBattleState {
  return state.activePlayer === 'player' ? state.player : state.opponent;
}

export function getInactivePlayerState(state: BattleState): PlayerBattleState {
  return state.activePlayer === 'player' ? state.opponent : state.player;
}

function updateActivePlayer(state: BattleState, update: Partial<PlayerBattleState>): BattleState {
  if (state.activePlayer === 'player') {
    return { ...state, player: { ...state.player, ...update } };
  }
  return { ...state, opponent: { ...state.opponent, ...update } };
}

function updateInactivePlayer(state: BattleState, update: Partial<PlayerBattleState>): BattleState {
  if (state.activePlayer === 'player') {
    return { ...state, opponent: { ...state.opponent, ...update } };
  }
  return { ...state, player: { ...state.player, ...update } };
}

export function getLegalActions(state: BattleState): BattleAction[] {
  const actions: BattleAction[] = [];
  const active = getActivePlayerState(state);

  switch (state.phase) {
    case BattlePhase.Setup: {
      // Must select active ninja from hand
      const ninjas = active.hand.filter((c) => isNinja(c) && (c as NinjaCard).stage === 0);
      for (const ninja of ninjas) {
        actions.push({ type: 'select-active', instanceId: ninja.id });
      }
      // If no basic ninja, allow any ninja
      if (actions.length === 0) {
        const allNinjas = active.hand.filter((c) => isNinja(c));
        for (const ninja of allNinjas) {
          actions.push({ type: 'select-active', instanceId: ninja.id });
        }
      }
      break;
    }

    case BattlePhase.DrawPhase:
      actions.push({ type: 'draw' });
      break;

    case BattlePhase.ChakraPhase: {
      if (active.active) {
        // Can attach to active or bench
        const targets = [active.active, ...active.bench.filter(Boolean)] as BattleCardInstance[];
        for (const chakra of state.chakraOptions) {
          for (const target of targets) {
            actions.push({ type: 'attach-chakra', chakraType: chakra, targetInstanceId: target.instanceId });
          }
        }
      }
      break;
    }

    case BattlePhase.MainPhase: {
      actions.push({ type: 'end-turn' });

      // Play ninja from hand to bench
      const emptyBenchSlots = active.bench.reduce((acc, slot, i) => {
        if (slot === null) acc.push(i);
        return acc;
      }, [] as number[]);

      for (const card of active.hand) {
        if (isNinja(card) && (card as NinjaCard).stage === 0 && emptyBenchSlots.length > 0) {
          for (const slot of emptyBenchSlots) {
            actions.push({ type: 'play-ninja', cardId: card.id, toBench: slot });
          }
        }
      }

      // Evolve
      if (active.active) {
        for (const card of active.hand) {
          if (canEvolve(card, active.active, state.turn)) {
            actions.push({ type: 'evolve', cardId: card.id, targetInstanceId: active.active.instanceId });
          }
        }
      }
      for (const bench of active.bench) {
        if (!bench) continue;
        for (const card of active.hand) {
          if (canEvolve(card, bench, state.turn)) {
            actions.push({ type: 'evolve', cardId: card.id, targetInstanceId: bench.instanceId });
          }
        }
      }

      // Attack
      if (active.active) {
        const ninja = active.active.card as NinjaCard;
        if (isNinja(active.active.card)) {
          ninja.attacks.forEach((atk, i) => {
            if (canPayChakraCost(atk.cost, active.active!.attachedChakra)) {
              actions.push({ type: 'attack', attackIndex: i });
            }
          });
        }
      }

      // Retreat
      if (active.active) {
        const ninja = active.active.card;
        if (isNinja(ninja)) {
          const retreatCost = (ninja as NinjaCard).retreatCost;
          if (active.active.attachedChakra.length >= retreatCost) {
            for (const bench of active.bench) {
              if (bench) {
                actions.push({ type: 'retreat', newActiveInstanceId: bench.instanceId });
              }
            }
          }
        }
      }

      // Play jutsu scroll
      for (const card of active.hand) {
        if (card.type === CardType.JutsuScroll) {
          actions.push({ type: 'play-jutsu-scroll', cardId: card.id });
        }
      }

      // Play tool
      if (active.active) {
        for (const card of active.hand) {
          if (card.type === CardType.Tool) {
            actions.push({ type: 'play-tool', cardId: card.id, targetInstanceId: active.active.instanceId });
          }
        }
      }

      // Use sensei
      if (active.senseiCard && !active.senseiUsedThisTurn) {
        actions.push({ type: 'use-sensei' });
      }

      break;
    }

    default:
      break;
  }

  return actions;
}

export function processAction(state: BattleState, action: BattleAction): BattleResult {
  const events: BattleEvent[] = [];
  let newState = { ...state };

  switch (action.type) {
    case 'select-active': {
      const active = getActivePlayerState(newState);
      const cardIndex = active.hand.findIndex((c) => c.id === action.instanceId);
      if (cardIndex === -1) break;

      const card = active.hand[cardIndex];
      const instance = createCardInstance(card, newState.turn);
      const newHand = active.hand.filter((_, i) => i !== cardIndex);

      newState = updateActivePlayer(newState, {
        active: instance,
        hand: newHand,
      });

      events.push({
        type: 'ninja-placed',
        data: { instanceId: instance.instanceId, cardId: card.id, position: 'active' },
        timestamp: Date.now(),
      });

      // Auto place basic ninjas on bench from hand
      const updatedActive = getActivePlayerState(newState);
      let benchUpdated = [...updatedActive.bench];
      let handUpdated = [...updatedActive.hand];

      for (let i = 0; i < benchUpdated.length && handUpdated.length > 0; i++) {
        if (benchUpdated[i] === null) {
          const ninjaIdx = handUpdated.findIndex((c) => isNinja(c) && (c as NinjaCard).stage === 0);
          if (ninjaIdx >= 0) {
            const benchCard = handUpdated[ninjaIdx];
            benchUpdated[i] = createCardInstance(benchCard, newState.turn);
            handUpdated = handUpdated.filter((_, idx) => idx !== ninjaIdx);
          }
        }
      }

      newState = updateActivePlayer(newState, { bench: benchUpdated, hand: handUpdated });

      // Check if both players have set up
      if (newState.activePlayer === 'player') {
        newState = { ...newState, activePlayer: 'opponent' };
      } else {
        // Both players set up, start the game
        newState = {
          ...newState,
          phase: BattlePhase.DrawPhase,
          activePlayer: 'player',
          firstTurn: true,
        };
      }
      break;
    }

    case 'draw': {
      const active = getActivePlayerState(newState);
      if (active.deck.length > 0 && active.hand.length < MAX_HAND_SIZE) {
        const drawn = active.deck[0];
        newState = updateActivePlayer(newState, {
          hand: [...active.hand, drawn],
          deck: active.deck.slice(1),
        });
        events.push({
          type: 'card-drawn',
          data: { player: newState.activePlayer },
          timestamp: Date.now(),
        });
      }
      newState = { ...newState, phase: BattlePhase.ChakraPhase };
      break;
    }

    case 'attach-chakra': {
      const active = getActivePlayerState(newState);
      if (active.chakraAttachedThisTurn) break;

      let target: BattleCardInstance | null = null;
      if (active.active?.instanceId === action.targetInstanceId) {
        target = active.active;
      } else {
        target = active.bench.find((b) => b?.instanceId === action.targetInstanceId) ?? null;
      }

      if (!target) break;

      const updated = attachChakra(target, action.chakraType);

      if (active.active?.instanceId === action.targetInstanceId) {
        newState = updateActivePlayer(newState, { active: updated, chakraAttachedThisTurn: true });
      } else {
        const newBench = active.bench.map((b) =>
          b?.instanceId === action.targetInstanceId ? updated : b
        );
        newState = updateActivePlayer(newState, { bench: newBench, chakraAttachedThisTurn: true });
      }

      events.push({
        type: 'chakra-attached',
        data: { targetId: action.targetInstanceId, chakraType: action.chakraType },
        timestamp: Date.now(),
      });

      newState = { ...newState, phase: BattlePhase.MainPhase };
      break;
    }

    case 'play-ninja': {
      const active = getActivePlayerState(newState);
      const cardIndex = active.hand.findIndex((c) => c.id === action.cardId);
      if (cardIndex === -1) break;
      if (active.bench[action.toBench] !== null) break;

      const card = active.hand[cardIndex];
      const instance = createCardInstance(card, newState.turn);
      const newBench = [...active.bench];
      newBench[action.toBench] = instance;

      newState = updateActivePlayer(newState, {
        bench: newBench,
        hand: active.hand.filter((_, i) => i !== cardIndex),
      });

      events.push({
        type: 'ninja-placed',
        data: { instanceId: instance.instanceId, cardId: card.id, position: `bench-${action.toBench}` },
        timestamp: Date.now(),
      });
      break;
    }

    case 'evolve': {
      const active = getActivePlayerState(newState);
      const cardIndex = active.hand.findIndex((c) => c.id === action.cardId);
      if (cardIndex === -1) break;

      const evoCard = active.hand[cardIndex] as NinjaCard;

      if (active.active?.instanceId === action.targetInstanceId) {
        const evolved = evolveCard(active.active, evoCard, newState.turn);
        newState = updateActivePlayer(newState, {
          active: evolved,
          hand: active.hand.filter((_, i) => i !== cardIndex),
        });
      } else {
        const newBench = active.bench.map((b) => {
          if (b?.instanceId === action.targetInstanceId) {
            return evolveCard(b, evoCard, newState.turn);
          }
          return b;
        });
        newState = updateActivePlayer(newState, {
          bench: newBench,
          hand: active.hand.filter((_, i) => i !== cardIndex),
        });
      }

      events.push({
        type: 'evolution',
        data: { targetId: action.targetInstanceId, newCardId: action.cardId },
        timestamp: Date.now(),
      });
      break;
    }

    case 'attack': {
      const active = getActivePlayerState(newState);
      const inactive = getInactivePlayerState(newState);
      if (!active.active || !inactive.active) break;

      const ninja = active.active.card as NinjaCard;
      const attack = ninja.attacks[action.attackIndex];
      if (!attack) break;

      // Check paralysis
      if (isParalyzed(active.active)) {
        const result = rollParalysis();
        if (result === 'paralyzed') {
          events.push({
            type: 'paralyzed',
            data: { instanceId: active.active.instanceId },
            timestamp: Date.now(),
          });
          newState = { ...newState, phase: BattlePhase.BetweenTurns };
          break;
        }
      }

      // Check confusion
      if (isConfused(active.active)) {
        const result = rollConfusion();
        if (result === 'hit-self') {
          const selfDamage = CONFUSION_SELF_DAMAGE;
          const newActive = {
            ...active.active,
            currentHp: Math.max(0, active.active.currentHp - selfDamage),
            damageCounters: active.active.damageCounters + selfDamage,
          };
          newState = updateActivePlayer(newState, { active: newActive });
          events.push({
            type: 'confusion-self-hit',
            data: { instanceId: active.active.instanceId, damage: selfDamage },
            timestamp: Date.now(),
          });

          // Check self KO
          if (newActive.currentHp <= 0) {
            const koResult = handleKO(newState, newState.activePlayer, events);
            newState = koResult.state;
          }

          newState = { ...newState, phase: BattlePhase.BetweenTurns };
          break;
        }
      }

      events.push({
        type: 'attack-declared',
        data: {
          attackerInstanceId: active.active.instanceId,
          attackName: attack.name,
          attackIndex: action.attackIndex,
        },
        timestamp: Date.now(),
      });

      // Calculate and apply damage
      const dmg = calculateDamage(active.active, inactive.active, action.attackIndex);
      let defender = {
        ...inactive.active,
        currentHp: Math.max(0, inactive.active.currentHp - dmg.finalDamage),
        damageCounters: inactive.active.damageCounters + dmg.finalDamage,
      };

      events.push({
        type: 'damage-dealt',
        data: {
          targetId: defender.instanceId,
          amount: dmg.finalDamage,
          isWeakness: dmg.isWeakness,
        },
        timestamp: Date.now(),
      });

      // Apply attack effect
      if (attack.effect?.type === 'status' && attack.effect.status) {
        const statusResult = applyStatusEffect(defender, attack.effect.status);
        defender = statusResult.instance;
        events.push(statusResult.event);
      }

      if (attack.effect?.type === 'bench-damage' && attack.effect.amount) {
        const benchDmg = attack.effect.amount;
        const inactiveState = getInactivePlayerState(newState);
        const newBench = inactiveState.bench.map((b) => {
          if (!b) return null;
          return {
            ...b,
            currentHp: Math.max(0, b.currentHp - benchDmg),
            damageCounters: b.damageCounters + benchDmg,
          };
        });
        newState = updateInactivePlayer(newState, { bench: newBench });
      }

      if (attack.effect?.type === 'heal' && attack.effect.amount) {
        const healAmount = attack.effect.amount;
        const newActive = {
          ...active.active,
          currentHp: Math.min(active.active.maxHp, active.active.currentHp + healAmount),
        };
        newState = updateActivePlayer(newState, { active: newActive });
      }

      newState = updateInactivePlayer(newState, { active: defender });

      // Check KO
      if (defender.currentHp <= 0) {
        const defenderSide = newState.activePlayer === 'player' ? 'opponent' : 'player';
        const koResult = handleKO(newState, defenderSide, events);
        newState = koResult.state;
      }

      // Check win condition
      const win = checkWinCondition(newState);
      if (win) {
        newState = {
          ...newState,
          phase: BattlePhase.GameOver,
          winner: win.winner === 'draw' ? 'draw' : win.winner,
        };
        events.push({
          type: 'game-over',
          data: { winner: win.winner, reason: win.type },
          timestamp: Date.now(),
        });
      } else {
        newState = { ...newState, phase: BattlePhase.BetweenTurns };
      }
      break;
    }

    case 'retreat': {
      const active = getActivePlayerState(newState);
      if (!active.active) break;

      const ninja = active.active.card as NinjaCard;
      const retreatCost = ninja.retreatCost;

      const newActive = removeChakra(active.active, retreatCost);
      const benchIndex = active.bench.findIndex((b) => b?.instanceId === action.newActiveInstanceId);
      if (benchIndex === -1) break;

      const newBenchNinja = active.bench[benchIndex]!;
      const newBench = [...active.bench];
      newBench[benchIndex] = newActive;

      newState = updateActivePlayer(newState, {
        active: newBenchNinja,
        bench: newBench,
      });

      events.push({
        type: 'retreat',
        data: { oldActiveId: active.active.instanceId, newActiveId: action.newActiveInstanceId },
        timestamp: Date.now(),
      });
      break;
    }

    case 'play-jutsu-scroll': {
      const active = getActivePlayerState(newState);
      const cardIndex = active.hand.findIndex((c) => c.id === action.cardId);
      if (cardIndex === -1) break;

      const card = active.hand[cardIndex];
      const effect = 'effect' in card ? card.effect : null;

      if (effect?.type === 'draw' && effect.amount) {
        const drawn = active.deck.slice(0, effect.amount);
        newState = updateActivePlayer(newState, {
          hand: [...active.hand.filter((_, i) => i !== cardIndex), ...drawn],
          deck: active.deck.slice(effect.amount),
          discardPile: [...active.discardPile, card],
        });
      } else if (effect?.type === 'heal' && effect.amount && active.active) {
        const healed = {
          ...active.active,
          currentHp: Math.min(active.active.maxHp, active.active.currentHp + effect.amount),
        };
        newState = updateActivePlayer(newState, {
          active: healed,
          hand: active.hand.filter((_, i) => i !== cardIndex),
          discardPile: [...active.discardPile, card],
        });
      } else if (effect?.type === 'switch' && active.active) {
        // Will need to select a bench target - for now just discard
        newState = updateActivePlayer(newState, {
          hand: active.hand.filter((_, i) => i !== cardIndex),
          discardPile: [...active.discardPile, card],
        });
      } else {
        newState = updateActivePlayer(newState, {
          hand: active.hand.filter((_, i) => i !== cardIndex),
          discardPile: [...active.discardPile, card],
        });
      }

      events.push({
        type: 'jutsu-scroll-played',
        data: { cardId: action.cardId },
        timestamp: Date.now(),
      });
      break;
    }

    case 'play-tool': {
      const active = getActivePlayerState(newState);
      const cardIndex = active.hand.findIndex((c) => c.id === action.cardId);
      if (cardIndex === -1) break;

      const toolCard = active.hand[cardIndex];
      if (toolCard.type !== CardType.Tool) break;

      if (active.active?.instanceId === action.targetInstanceId) {
        newState = updateActivePlayer(newState, {
          active: {
            ...active.active,
            attachedTools: [...active.active.attachedTools, toolCard],
          },
          hand: active.hand.filter((_, i) => i !== cardIndex),
        });
      }

      events.push({
        type: 'tool-played',
        data: { cardId: action.cardId, targetId: action.targetInstanceId },
        timestamp: Date.now(),
      });
      break;
    }

    case 'use-sensei': {
      const active = getActivePlayerState(newState);
      if (!active.senseiCard || active.senseiUsedThisTurn) break;

      const effect = 'effect' in active.senseiCard ? active.senseiCard.effect : null;

      if (effect?.type === 'draw' && effect.amount) {
        const drawn = active.deck.slice(0, effect.amount);
        newState = updateActivePlayer(newState, {
          hand: [...active.hand, ...drawn],
          deck: active.deck.slice(effect.amount),
          senseiUsedThisTurn: true,
        });
      } else {
        newState = updateActivePlayer(newState, { senseiUsedThisTurn: true });
      }

      events.push({
        type: 'sensei-used',
        data: { senseiId: active.senseiCard.id },
        timestamp: Date.now(),
      });
      break;
    }

    case 'end-turn': {
      newState = { ...newState, phase: BattlePhase.BetweenTurns };
      break;
    }
  }

  return { newState, events };
}

function handleKO(
  state: BattleState,
  koSide: 'player' | 'opponent',
  events: BattleEvent[]
): { state: BattleState } {
  const koPlayer = koSide === 'player' ? state.player : state.opponent;
  const scoringSide = koSide === 'player' ? 'opponent' : 'player';

  if (!koPlayer.active) return { state };

  const koCard = koPlayer.active;
  const points = isNinja(koCard.card) && (koCard.card as NinjaCard).isLegendary
    ? LEGENDARY_KO_POINTS
    : REGULAR_KO_POINTS;

  events.push({
    type: 'ko',
    data: { instanceId: koCard.instanceId, points },
    timestamp: Date.now(),
  });

  // Move KO'd card to discard
  const newDiscard = [...koPlayer.discardPile, koCard.card];

  // Promote first bench ninja to active
  let newActive: BattleCardInstance | null = null;
  const newBench = [...koPlayer.bench];
  for (let i = 0; i < newBench.length; i++) {
    if (newBench[i]) {
      newActive = newBench[i];
      newBench[i] = null;
      break;
    }
  }

  const koUpdate: Partial<PlayerBattleState> = {
    active: newActive,
    bench: newBench,
    discardPile: newDiscard,
  };

  // Award points to other side
  const scoringPlayer = scoringSide === 'player' ? state.player : state.opponent;
  const scoreUpdate: Partial<PlayerBattleState> = {
    points: scoringPlayer.points + points,
  };

  let newState: BattleState;
  if (koSide === 'player') {
    newState = {
      ...state,
      player: { ...state.player, ...koUpdate },
      opponent: { ...state.opponent, ...scoreUpdate },
    };
  } else {
    newState = {
      ...state,
      opponent: { ...state.opponent, ...koUpdate },
      player: { ...state.player, ...scoreUpdate },
    };
  }

  events.push({
    type: 'point-awarded',
    data: { player: scoringSide, points, totalPoints: scoringPlayer.points + points },
    timestamp: Date.now(),
  });

  return { state: newState };
}

export function processBetweenTurns(state: BattleState): BattleResult {
  const events: BattleEvent[] = [];
  let newState = { ...state };

  // Process status effects for active player's active ninja
  const active = getActivePlayerState(newState);
  if (active.active) {
    const result = processBetweenTurnEffects(active.active);
    newState = updateActivePlayer(newState, { active: result.instance });
    events.push(...result.events);

    if (result.instance.currentHp <= 0) {
      const koResult = handleKO(newState, newState.activePlayer, events);
      newState = koResult.state;
    }
  }

  // Check win
  const win = checkWinCondition(newState);
  if (win) {
    return {
      newState: {
        ...newState,
        phase: BattlePhase.GameOver,
        winner: win.winner === 'draw' ? 'draw' : win.winner,
      },
      events,
    };
  }

  // Switch active player
  const nextPlayer = newState.activePlayer === 'player' ? 'opponent' : 'player';
  const newTurn = nextPlayer === 'player' ? newState.turn + 1 : newState.turn;

  // Reset per-turn flags
  const nextPlayerState = nextPlayer === 'player' ? newState.player : newState.opponent;
  const resetUpdate: Partial<PlayerBattleState> = {
    senseiUsedThisTurn: false,
    chakraAttachedThisTurn: false,
  };

  if (active.active) {
    resetUpdate.active = { ...active.active, hasEvolved: false, canAttackThisTurn: true };
  }

  newState = {
    ...newState,
    turn: newTurn,
    activePlayer: nextPlayer,
    phase: BattlePhase.DrawPhase,
    firstTurn: false,
    chakraOptions: generateChakraOptions(
      nextPlayer === 'player' ? [...newState.player.deck, ...newState.player.hand] : [...newState.opponent.deck, ...newState.opponent.hand]
    ),
  };

  // Apply reset to new active player
  if (nextPlayer === 'player') {
    newState = { ...newState, player: { ...newState.player, ...resetUpdate } };
  } else {
    newState = { ...newState, opponent: { ...newState.opponent, ...resetUpdate } };
  }

  return { newState, events };
}
