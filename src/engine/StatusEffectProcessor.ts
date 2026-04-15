import { StatusEffect } from '@/types/enums';
import { BattleCardInstance, ActiveStatus, BattleEvent } from '@/types/battle';
import { BURN_DAMAGE, POISON_DAMAGE, CONFUSION_SELF_DAMAGE } from '@/lib/constants';

export function applyStatusEffect(
  target: BattleCardInstance,
  effect: StatusEffect,
  duration: number | null = null
): { instance: BattleCardInstance; event: BattleEvent } {
  const existing = target.statusEffects.find((s) => s.effect === effect);

  let newEffects: ActiveStatus[];

  if (effect === StatusEffect.Poison && existing) {
    // Poison stacks
    newEffects = target.statusEffects.map((s) =>
      s.effect === StatusEffect.Poison
        ? { ...s, stackCount: s.stackCount + 1 }
        : s
    );
  } else if (existing) {
    // Refresh duration
    newEffects = target.statusEffects.map((s) =>
      s.effect === effect
        ? { ...s, turnsRemaining: duration ?? s.turnsRemaining }
        : s
    );
  } else {
    newEffects = [
      ...target.statusEffects,
      {
        effect,
        turnsRemaining: duration ?? getDefaultDuration(effect),
        stackCount: 1,
      },
    ];
  }

  return {
    instance: { ...target, statusEffects: newEffects },
    event: {
      type: 'status-applied',
      data: { targetId: target.instanceId, effect, duration },
      timestamp: Date.now(),
    },
  };
}

function getDefaultDuration(effect: StatusEffect): number | null {
  switch (effect) {
    case StatusEffect.Burn: return 3;
    case StatusEffect.Paralyze: return 1;
    case StatusEffect.Poison: return null; // Until cleared
    case StatusEffect.Confusion: return 2;
    case StatusEffect.Seal: return 2;
    default: return 2;
  }
}

export function processBetweenTurnEffects(
  instance: BattleCardInstance
): { instance: BattleCardInstance; events: BattleEvent[]; damage: number } {
  const events: BattleEvent[] = [];
  let totalDamage = 0;
  let updatedInstance = { ...instance };

  for (const status of updatedInstance.statusEffects) {
    switch (status.effect) {
      case StatusEffect.Burn:
        totalDamage += BURN_DAMAGE;
        events.push({
          type: 'status-tick',
          data: { targetId: instance.instanceId, effect: 'burn', damage: BURN_DAMAGE },
          timestamp: Date.now(),
        });
        break;

      case StatusEffect.Poison:
        const poisonDmg = POISON_DAMAGE * status.stackCount;
        totalDamage += poisonDmg;
        events.push({
          type: 'status-tick',
          data: { targetId: instance.instanceId, effect: 'poison', damage: poisonDmg },
          timestamp: Date.now(),
        });
        break;
    }
  }

  // Apply damage
  updatedInstance = {
    ...updatedInstance,
    currentHp: Math.max(0, updatedInstance.currentHp - totalDamage),
    damageCounters: updatedInstance.damageCounters + totalDamage,
  };

  // Tick down durations
  const newEffects = updatedInstance.statusEffects
    .map((s) => {
      if (s.turnsRemaining === null) return s;
      return { ...s, turnsRemaining: s.turnsRemaining - 1 };
    })
    .filter((s) => s.turnsRemaining === null || s.turnsRemaining > 0);

  updatedInstance = { ...updatedInstance, statusEffects: newEffects };

  return { instance: updatedInstance, events, damage: totalDamage };
}

export function isParalyzed(instance: BattleCardInstance): boolean {
  return instance.statusEffects.some((s) => s.effect === StatusEffect.Paralyze);
}

export function isConfused(instance: BattleCardInstance): boolean {
  return instance.statusEffects.some((s) => s.effect === StatusEffect.Confusion);
}

export function isSealed(instance: BattleCardInstance): boolean {
  return instance.statusEffects.some((s) => s.effect === StatusEffect.Seal);
}

export function rollConfusion(): 'hit-self' | 'attack-normally' {
  return Math.random() < 0.5 ? 'hit-self' : 'attack-normally';
}

export function rollParalysis(): 'paralyzed' | 'can-attack' {
  return Math.random() < 0.5 ? 'paralyzed' : 'can-attack';
}
