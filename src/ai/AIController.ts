import { AIDifficulty } from '@/types/enums';
import { BattleState, BattleAction } from '@/types/battle';
import { getLegalActions } from '@/engine/BattleEngine';

export function chooseAIAction(
  state: BattleState,
  difficulty: AIDifficulty
): BattleAction {
  const legalActions = getLegalActions(state);
  if (legalActions.length === 0) {
    return { type: 'end-turn' };
  }

  switch (difficulty) {
    case AIDifficulty.Academy:
      return randomStrategy(legalActions);
    case AIDifficulty.Genin:
      return basicStrategy(state, legalActions);
    case AIDifficulty.Chunin:
      return intermediateStrategy(state, legalActions);
    case AIDifficulty.Jonin:
    case AIDifficulty.Kage:
      return intermediateStrategy(state, legalActions); // TODO: lookahead
    default:
      return randomStrategy(legalActions);
  }
}

function randomStrategy(actions: BattleAction[]): BattleAction {
  return actions[Math.floor(Math.random() * actions.length)];
}

function basicStrategy(state: BattleState, actions: BattleAction[]): BattleAction {
  // Priority: evolve > attack > play ninja > play scroll > attach chakra > end turn
  const evolve = actions.find((a) => a.type === 'evolve');
  if (evolve) return evolve;

  const attack = actions.find((a) => a.type === 'attack');
  if (attack) return attack;

  const playNinja = actions.find((a) => a.type === 'play-ninja');
  if (playNinja) return playNinja;

  const jutsu = actions.find((a) => a.type === 'play-jutsu-scroll');
  if (jutsu) return jutsu;

  const sensei = actions.find((a) => a.type === 'use-sensei');
  if (sensei) return sensei;

  const chakra = actions.find((a) => a.type === 'attach-chakra');
  if (chakra) return chakra;

  const draw = actions.find((a) => a.type === 'draw');
  if (draw) return draw;

  const selectActive = actions.find((a) => a.type === 'select-active');
  if (selectActive) return selectActive;

  return actions.find((a) => a.type === 'end-turn') ?? actions[0];
}

function intermediateStrategy(state: BattleState, actions: BattleAction[]): BattleAction {
  // Score each action
  let bestAction = actions[0];
  let bestScore = -Infinity;

  for (const action of actions) {
    let score = 0;

    switch (action.type) {
      case 'attack':
        score = 80 + (action.attackIndex === 1 ? 10 : 0); // Prefer second attack (usually stronger)
        break;
      case 'evolve':
        score = 70;
        break;
      case 'play-ninja':
        score = 50;
        break;
      case 'use-sensei':
        score = 45;
        break;
      case 'play-jutsu-scroll':
        score = 40;
        break;
      case 'play-tool':
        score = 35;
        break;
      case 'retreat':
        score = 20;
        break;
      case 'attach-chakra':
        score = 60; // Important to build up energy
        break;
      case 'draw':
        score = 55;
        break;
      case 'select-active':
        score = 100; // Must do this
        break;
      case 'end-turn':
        score = 0;
        break;
    }

    // Add small random factor
    score += Math.random() * 10;

    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}
