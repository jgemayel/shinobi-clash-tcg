import { NinjaCard, GameCard } from '@/types/card';
import { BattleCardInstance } from '@/types/battle';
import { CardType } from '@/types/enums';
import { isNinja } from '@/lib/cardUtils';

export function canEvolve(
  evolutionCard: GameCard,
  target: BattleCardInstance,
  currentTurn: number
): boolean {
  // Must be a ninja card
  if (!isNinja(evolutionCard)) return false;
  const evoNinja = evolutionCard as NinjaCard;

  // Must have evolvesFrom
  if (!evoNinja.evolvesFrom) return false;

  // Target must be a ninja
  if (!isNinja(target.card)) return false;

  // Target card id must match evolvesFrom
  const targetNinja = target.card as NinjaCard;
  if (targetNinja.id !== evoNinja.evolvesFrom) return false;

  // Can't evolve on the same turn the target was played
  if (target.turnPlayed >= currentTurn) return false;

  // Can't evolve a card that already evolved this turn
  if (target.hasEvolved) return false;

  return true;
}

export function evolveCard(
  target: BattleCardInstance,
  evolutionCard: NinjaCard,
  currentTurn: number
): BattleCardInstance {
  return {
    ...target,
    card: evolutionCard,
    maxHp: evolutionCard.hp,
    // HP increases by the difference (retains damage)
    currentHp: Math.min(
      target.currentHp + (evolutionCard.hp - (target.card as NinjaCard).hp),
      evolutionCard.hp
    ),
    // Evolution clears status effects
    statusEffects: [],
    hasEvolved: true,
    canAttackThisTurn: true,
  };
}
