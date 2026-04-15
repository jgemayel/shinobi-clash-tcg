import { GameCard } from '@/types/card';
import { CardType } from '@/types/enums';
import { MAX_DECK_SIZE, MAX_CARD_COPIES, MAX_SENSEI_COPIES } from '@/lib/constants';

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateDeck(cards: GameCard[]): DeckValidationResult {
  const errors: string[] = [];

  // Check deck size
  if (cards.length !== MAX_DECK_SIZE) {
    errors.push(`Deck must have exactly ${MAX_DECK_SIZE} cards (has ${cards.length})`);
  }

  // Check for at least one ninja
  const hasNinja = cards.some((c) => c.type === CardType.Ninja);
  if (!hasNinja) {
    errors.push('Deck must contain at least one Ninja card');
  }

  // Check copy limits
  const idCounts: Record<string, number> = {};
  for (const card of cards) {
    idCounts[card.id] = (idCounts[card.id] ?? 0) + 1;
  }

  for (const [id, count] of Object.entries(idCounts)) {
    const card = cards.find((c) => c.id === id)!;
    const maxCopies = card.type === CardType.Sensei ? MAX_SENSEI_COPIES : MAX_CARD_COPIES;
    if (count > maxCopies) {
      errors.push(`Too many copies of ${card.name} (${count}/${maxCopies})`);
    }
  }

  // Check sensei limit
  const senseiCount = cards.filter((c) => c.type === CardType.Sensei).length;
  if (senseiCount > 1) {
    errors.push('Deck can only contain 1 Sensei card');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
