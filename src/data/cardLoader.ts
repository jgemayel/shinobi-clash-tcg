import { CardSet, GameCard } from '@/types/card';
import hiddenLeafOrigins from './cards/hidden-leaf-origins.json';
import sandVillage from './cards/sand-village.json';
import mistVillage from './cards/mist-village.json';
import cloudVillage from './cards/cloud-village.json';
import stoneVillage from './cards/stone-village.json';
import soundVillage from './cards/sound-village.json';
import rainVillage from './cards/rain-village.json';
import akatsukiDawn from './cards/akatsuki-dawn.json';
import tailedBeasts from './cards/tailed-beasts.json';
import otsutsukiLegacy from './cards/otsutsuki-legacy.json';

const cardSets: CardSet[] = [
  hiddenLeafOrigins as unknown as CardSet,
  sandVillage as unknown as CardSet,
  mistVillage as unknown as CardSet,
  cloudVillage as unknown as CardSet,
  stoneVillage as unknown as CardSet,
  soundVillage as unknown as CardSet,
  rainVillage as unknown as CardSet,
  akatsukiDawn as unknown as CardSet,
  tailedBeasts as unknown as CardSet,
  otsutsukiLegacy as unknown as CardSet,
];

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

export function getSetTotal(setId: string): number {
  const set = getCardSet(setId);
  return set?.totalCards ?? set?.cards.length ?? 0;
}

export function getDexLabel(card: GameCard): string {
  const total = getSetTotal(card.set);
  const num = card.setNumber ?? 0;
  if (!num || !total) return '';
  return `${String(num).padStart(3, '0')}/${String(total).padStart(3, '0')}`;
}
