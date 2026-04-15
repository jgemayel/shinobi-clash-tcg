import { ChakraType } from '@/types/enums';
import { NinjaCard } from '@/types/card';
import { BattleCardInstance } from '@/types/battle';
import { isWeakTo } from '@/lib/typeChart';
import { isNinja } from '@/lib/cardUtils';
import { WEAKNESS_MULTIPLIER } from '@/lib/constants';

export interface DamageResult {
  baseDamage: number;
  finalDamage: number;
  isWeakness: boolean;
  toolBonus: number;
}

export function calculateDamage(
  attacker: BattleCardInstance,
  defender: BattleCardInstance,
  attackIndex: number
): DamageResult {
  const attackerCard = attacker.card;
  if (!isNinja(attackerCard)) {
    return { baseDamage: 0, finalDamage: 0, isWeakness: false, toolBonus: 0 };
  }

  const ninja = attackerCard as NinjaCard;
  const attack = ninja.attacks[attackIndex];
  if (!attack) {
    return { baseDamage: 0, finalDamage: 0, isWeakness: false, toolBonus: 0 };
  }

  let baseDamage = attack.damage;

  // Tool damage bonus
  let toolBonus = 0;
  for (const tool of attacker.attachedTools) {
    if (tool.effect.type === 'damage-boost' && tool.effect.amount) {
      toolBonus += tool.effect.amount;
    }
  }

  let totalDamage = baseDamage + toolBonus;

  // Weakness check
  let isWeakness = false;
  const defenderCard = defender.card;
  if (isNinja(defenderCard)) {
    const defNinja = defenderCard as NinjaCard;
    if (isWeakTo(defNinja.weakness, ninja.chakraType)) {
      isWeakness = true;
      totalDamage *= WEAKNESS_MULTIPLIER;
    }
  }

  return {
    baseDamage,
    finalDamage: Math.max(0, totalDamage),
    isWeakness,
    toolBonus,
  };
}
