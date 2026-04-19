import { AIDifficulty } from '@/types/enums';
import { BattleState, BattleAction } from '@/types/battle';
import { NinjaCard } from '@/types/card';
import { getLegalActions, getActivePlayerState, getInactivePlayerState } from '@/engine/BattleEngine';
import { calculateDamage } from '@/engine/DamageCalculator';
import { isNinja } from '@/lib/cardUtils';

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
      return bestStrategy(state, legalActions);
    default:
      return randomStrategy(legalActions);
  }
}

// Exported for auto-battle: always picks the strongest available move.
export function chooseBestAction(state: BattleState): BattleAction {
  const legalActions = getLegalActions(state);
  if (legalActions.length === 0) return { type: 'end-turn' };
  return bestStrategy(state, legalActions);
}

function randomStrategy(actions: BattleAction[]): BattleAction {
  return actions[Math.floor(Math.random() * actions.length)];
}

function basicStrategy(state: BattleState, actions: BattleAction[]): BattleAction {
  // Setup phase takes precedence — pick an active if we don't have one,
  // otherwise populate the bench before ending setup.
  const selectActive = actions.find((a) => a.type === 'select-active');
  if (selectActive) return selectActive;

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

  const endSetup = actions.find((a) => a.type === 'end-setup');
  if (endSetup) return endSetup;

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
      case 'end-setup':
        score = 5; // Choose only if no other setup actions exist
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

/**
 * bestStrategy — phase-aware planner used by Jonin/Kage AI and the Auto
 * button. Instead of one-shot scoring, it walks a strict priority ladder
 * that matches how a real TCG turn should be played:
 *
 *   setup → select best active → place up to 3 bench → end setup
 *   draw  → draw
 *   chakra → attach to active (or strongest bench)
 *   main  → 1. lethal attack if available
 *           2. evolve active → evolve bench
 *           3. fill empty bench to protect from bench-out
 *           4. attach tool to active
 *           5. use sensei (card advantage)
 *           6. play beneficial jutsu
 *           7. fill remaining bench, tool remaining ninjas
 *           8. strongest attack (ends turn)
 *           9. retreat if very low HP
 *          10. end turn
 *
 * Because attacking ends the turn, all non-attack buffs run FIRST. Attack is
 * saved for last unless it KOs the opponent, in which case we fire early.
 */
function bestStrategy(state: BattleState, actions: BattleAction[]): BattleAction {
  const active = getActivePlayerState(state);
  const inactive = getInactivePlayerState(state);

  // --- Setup: pick an active ninja (prefer highest HP + damage)
  const selectActives = actions.filter((a) => a.type === 'select-active');
  if (selectActives.length > 0) {
    let best = selectActives[0];
    let bestScore = -Infinity;
    for (const a of selectActives) {
      if (a.type !== 'select-active') continue;
      const card = active.hand.find((c) => c.id === a.cardId);
      if (!card || !isNinja(card)) continue;
      const ninja = card as NinjaCard;
      const score = ninja.hp + (ninja.attacks[0]?.damage ?? 0) * 2 + (ninja.isEx ? 120 : 0) + (ninja.isLegendary ? 40 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = a;
      }
    }
    return best;
  }

  // --- DrawPhase: draw is the only action
  const draw = actions.find((a) => a.type === 'draw');
  if (draw) return draw;

  // --- ChakraPhase: attach to active first; else the healthiest bench
  const chakraActions = actions.filter((a) => a.type === 'attach-chakra');
  if (chakraActions.length > 0) {
    const onActive = chakraActions.find(
      (a) => a.type === 'attach-chakra' && a.targetInstanceId === active.active?.instanceId
    );
    if (onActive) return onActive;
    let best = chakraActions[0];
    let bestHp = -1;
    for (const a of chakraActions) {
      if (a.type !== 'attach-chakra') continue;
      const t = active.bench.find((b) => b?.instanceId === a.targetInstanceId);
      if (t && t.currentHp > bestHp) {
        bestHp = t.currentHp;
        best = a;
      }
    }
    return best;
  }

  // --- Main / Setup-bench priority ladder

  // 1. Finisher — attack that KOs the opponent active
  const attacks = actions.filter((a) => a.type === 'attack');
  if (active.active && inactive.active && attacks.length > 0) {
    let lethal: BattleAction | null = null;
    let lethalDmg = -1;
    for (const a of attacks) {
      if (a.type !== 'attack') continue;
      const dmg = calculateDamage(active.active, inactive.active, a.attackIndex);
      if (dmg.finalDamage >= inactive.active.currentHp && dmg.finalDamage > lethalDmg) {
        lethalDmg = dmg.finalDamage;
        lethal = a;
      }
    }
    if (lethal) return lethal;
  }

  // 2. Evolve — active first (immediate power spike), then any bench
  const evolves = actions.filter((a) => a.type === 'evolve');
  if (evolves.length > 0) {
    const onActive = evolves.find(
      (a) => a.type === 'evolve' && a.targetInstanceId === active.active?.instanceId
    );
    if (onActive) return onActive;
    return evolves[0];
  }

  // 3. Fill bench up to 2 ninjas — bench-out is a loss condition
  const playNinjas = actions.filter((a) => a.type === 'play-ninja');
  const benchOccupied = active.bench.filter(Boolean).length;
  if (playNinjas.length > 0 && benchOccupied < 2) return playNinjas[0];

  // 4. Equip tool on active (damage buffs)
  const tools = actions.filter((a) => a.type === 'play-tool');
  const toolOnActive = tools.find(
    (a) => a.type === 'play-tool' && a.targetInstanceId === active.active?.instanceId
  );
  if (toolOnActive) return toolOnActive;

  // 5. Sensei — usually draws cards, cheap value
  const sensei = actions.find((a) => a.type === 'use-sensei');
  if (sensei) return sensei;

  // 6. Beneficial jutsu scrolls
  const jutsu = actions.find((a) => a.type === 'play-jutsu-scroll');
  if (jutsu) return jutsu;

  // 7. Keep filling bench if we have space and basics in hand
  if (playNinjas.length > 0) return playNinjas[0];

  // 8. Tool remaining bench ninjas
  if (tools.length > 0) return tools[0];

  // 9. Strongest attack (ends turn)
  if (active.active && inactive.active && attacks.length > 0) {
    let best: BattleAction = attacks[0];
    let bestDmg = -1;
    for (const a of attacks) {
      if (a.type !== 'attack') continue;
      const dmg = calculateDamage(active.active, inactive.active, a.attackIndex);
      if (dmg.finalDamage > bestDmg) {
        bestDmg = dmg.finalDamage;
        best = a;
      }
    }
    if (bestDmg > 0) return best;
  }

  // 10. Retreat if the active is about to die and we have a replacement
  if (active.active && active.active.currentHp <= active.active.maxHp * 0.25) {
    const retreat = actions.find((a) => a.type === 'retreat');
    if (retreat) return retreat;
  }

  // 11. Close out: end setup or end turn
  const endSetup = actions.find((a) => a.type === 'end-setup');
  if (endSetup) return endSetup;
  return actions.find((a) => a.type === 'end-turn') ?? actions[0];
}
