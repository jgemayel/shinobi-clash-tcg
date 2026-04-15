import { CardSet, GameCard } from '@/types/card';
import hiddenLeafOrigins from './cards/hidden-leaf-origins.json';

const cardSets: CardSet[] = [hiddenLeafOrigins as unknown as CardSet];

let allCardsCache: GameCard[] | null = null;
let cardByIdCache: Map<string, GameCard> | null = null;

export function getAllCardSets(): CardSet[] {
  return cardSets;
}

export function getCardSet(setId: string): CardSet | undefined {
  return cardSets.find((s) => s.setId === setId);
}

export function getAllCards(): GameCard[] {
  if (!allCardsCache) {
    allCardsCache = cardSets.flatMap((s) => s.cards);
  }
  return allCardsCache;
}

export function getCardById(cardId: string): GameCard | undefined {
  if (!cardByIdCache) {
    cardByIdCache = new Map();
    for (const card of getAllCards()) {
      cardByIdCache.set(card.id, card);
    }
  }
  return cardByIdCache.get(cardId);
}

export function getCardsByIds(cardIds: string[]): GameCard[] {
  return cardIds.map(getCardById).filter(Boolean) as GameCard[];
}

export function getAvailableCardSets(playerLevel: number): CardSet[] {
  return cardSets.filter((s) => s.unlockLevel <= playerLevel);
}
