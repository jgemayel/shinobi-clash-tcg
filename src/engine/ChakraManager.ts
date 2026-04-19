import { ChakraType } from '@/types/enums';
import { GameCard } from '@/types/card';
import { BattleCardInstance } from '@/types/battle';

// Simplified chakra: a single "colorless" power-up that adapts to any cost.
// Ninjas can have different elements, but the chakra energy itself is
// type-agnostic so deck building stays flexible.
export function generateChakraOptions(_deck: GameCard[]): ChakraType[] {
  return [ChakraType.Colorless];
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
