import { CardType, ChakraType, Rarity } from '@/types/enums';
import { GameCard, NinjaCard, ChakraCost } from '@/types/card';

export function isNinja(card: GameCard): card is NinjaCard {
  return card.type === CardType.Ninja;
}

export function getTotalChakraCost(cost: ChakraCost): number {
  return Object.values(cost).reduce((sum, val) => sum + (val ?? 0), 0);
}

export function canPayChakraCost(
  cost: ChakraCost,
  attachedChakra: ChakraType[]
): boolean {
  // Simplified: chakra is adaptive. Any attached chakra satisfies any cost.
  // Attacks check total attached count versus total cost.
  const total = getTotalChakraCost(cost);
  return attachedChakra.length >= total;
}

export function sortCards(cards: GameCard[], sortBy: 'name' | 'rarity' | 'type' | 'hp'): GameCard[] {
  const rarityOrder: Record<Rarity, number> = {
    [Rarity.Common]: 0,
    [Rarity.Uncommon]: 1,
    [Rarity.Rare]: 2,
    [Rarity.UltraRare]: 3,
    [Rarity.Legendary]: 4,
    [Rarity.Secret]: 5,
    [Rarity.Crown]: 6,
  };

  return [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rarity':
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      case 'type':
        return a.type.localeCompare(b.type);
      case 'hp':
        const hpA = isNinja(a) ? a.hp : 0;
        const hpB = isNinja(b) ? b.hp : 0;
        return hpB - hpA;
      default:
        return 0;
    }
  });
}

export function filterCards(
  cards: GameCard[],
  filters: {
    type?: CardType;
    chakraType?: ChakraType;
    rarity?: Rarity;
    search?: string;
    set?: string;
  }
): GameCard[] {
  return cards.filter((card) => {
    if (filters.type && card.type !== filters.type) return false;
    if (filters.rarity && card.rarity !== filters.rarity) return false;
    if (filters.set && card.set !== filters.set) return false;
    if (filters.chakraType && isNinja(card) && card.chakraType !== filters.chakraType) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const nameMatch = card.name.toLowerCase().includes(q);
      const descMatch = 'description' in card && card.description?.toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });
}

export function generateInstanceId(): string {
  return `inst_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
