import { ChakraType } from '@/types/enums';
import { NinjaCard, GameCard } from '@/types/card';
import { isNinja } from '@/lib/cardUtils';
import { BattleCardInstance } from '@/types/battle';

export function generateChakraOptions(deck: GameCard[]): [ChakraType, ChakraType] {
  // Determine the 2 most common types in the deck
  const typeCounts: Record<string, number> = {};
  for (const card of deck) {
    if (isNinja(card)) {
      const ninja = card as NinjaCard;
      typeCounts[ninja.chakraType] = (typeCounts[ninja.chakraType] ?? 0) + 1;
    }
  }

  const sorted = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type as ChakraType);

  if (sorted.length >= 2) {
    return [sorted[0], sorted[1]];
  } else if (sorted.length === 1) {
    return [sorted[0], ChakraType.Colorless];
  }
  return [ChakraType.Colorless, ChakraType.Colorless];
}

export function attachChakra(
  target: BattleCardInstance,
  chakraType: ChakraType
): BattleCardInstance {
  return {
    ...target,
    attachedChakra: [...target.attachedChakra, chakraType],
  };
}

export function removeChakra(
  target: BattleCardInstance,
  amount: number
): BattleCardInstance {
  const newChakra = [...target.attachedChakra];
  for (let i = 0; i < amount && newChakra.length > 0; i++) {
    newChakra.pop();
  }
  return { ...target, attachedChakra: newChakra };
}
