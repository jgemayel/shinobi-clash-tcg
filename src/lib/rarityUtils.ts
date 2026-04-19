import { Rarity, AIDifficulty } from '@/types/enums';
import { GameCard, CardSet } from '@/types/card';
import { CARDS_PER_PACK } from './constants';
import { rollShiny } from './shinyUtils';

const DEFAULT_PULL_RATES: Record<Rarity, number> = {
  [Rarity.Common]: 0.62,
  [Rarity.Rare]: 0.29,
  [Rarity.Legendary]: 0.09,
};

function weightedRandomRarity(pullRates: Record<string, number>): Rarity {
  const rand = Math.random();
  let cumulative = 0;

  const entries = Object.entries(pullRates).sort((a, b) => a[1] - b[1]);
  for (const [rarity, rate] of entries) {
    cumulative += rate;
    if (rand <= cumulative) {
      return rarity as Rarity;
    }
  }

  return Rarity.Common;
}

function getCardsByRarity(cards: GameCard[], rarity: Rarity): GameCard[] {
  return cards.filter((c) => c.rarity === rarity);
}

function pickRandomCard(cards: GameCard[]): GameCard {
  return cards[Math.floor(Math.random() * cards.length)];
}

export function generatePack(cardSet: CardSet): GameCard[] {
  const rates = cardSet.pullRates ?? DEFAULT_PULL_RATES;
  const pack: GameCard[] = [];
  const finish = (card: GameCard) => rollShiny(card);

  // Slots 1-3: weighted toward commons
  const earlySlotRates = {
    ...rates,
    [Rarity.Common]: rates[Rarity.Common] * 1.5,
  };
  const earlyTotal = Object.values(earlySlotRates).reduce((a, b) => a + b, 0);
  const normalizedEarly = Object.fromEntries(
    Object.entries(earlySlotRates).map(([k, v]) => [k, v / earlyTotal])
  );

  for (let i = 0; i < 3; i++) {
    const rarity = weightedRandomRarity(normalizedEarly);
    const candidates = getCardsByRarity(cardSet.cards, rarity);
    if (candidates.length > 0) {
      pack.push(finish(pickRandomCard(candidates)));
    } else {
      const commons = getCardsByRarity(cardSet.cards, Rarity.Common);
      pack.push(finish(pickRandomCard(commons.length > 0 ? commons : cardSet.cards)));
    }
  }

  // Slots 4-5: higher rare / legendary chance
  const lateSlotRates = {
    ...rates,
    [Rarity.Common]: rates[Rarity.Common] * 0.4,
    [Rarity.Rare]: rates[Rarity.Rare] * 2,
    [Rarity.Legendary]: rates[Rarity.Legendary] * 3,
  };
  const lateTotal = Object.values(lateSlotRates).reduce((a, b) => a + b, 0);
  const normalizedLate = Object.fromEntries(
    Object.entries(lateSlotRates).map(([k, v]) => [k, v / lateTotal])
  );

  for (let i = 3; i < CARDS_PER_PACK; i++) {
    const rarity = weightedRandomRarity(normalizedLate);
    const candidates = getCardsByRarity(cardSet.cards, rarity);
    if (candidates.length > 0) {
      pack.push(finish(pickRandomCard(candidates)));
    } else {
      const commons = getCardsByRarity(cardSet.cards, Rarity.Common);
      pack.push(finish(pickRandomCard(commons.length > 0 ? commons : cardSet.cards)));
    }
  }

  return pack;
}

export function rollBattleReward(cardSet: CardSet, difficulty: AIDifficulty): GameCard {
  const base = cardSet.pullRates ?? DEFAULT_PULL_RATES;
  const boostByDifficulty: Record<AIDifficulty, number> = {
    [AIDifficulty.Academy]: 0,
    [AIDifficulty.Genin]: 0.4,
    [AIDifficulty.Chunin]: 0.9,
    [AIDifficulty.Jonin]: 1.6,
    [AIDifficulty.Kage]: 2.5,
  };
  const boost = boostByDifficulty[difficulty] ?? 0;
  const weights: Record<string, number> = {
    [Rarity.Common]: base[Rarity.Common] * Math.max(0.25, 1 - boost * 0.3),
    [Rarity.Rare]: base[Rarity.Rare] * (1 + boost * 0.8),
    [Rarity.Legendary]: base[Rarity.Legendary] * (1 + boost * 2.2),
  };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total])
  );
  const rarity = weightedRandomRarity(normalized);
  const candidates = getCardsByRarity(cardSet.cards, rarity);
  if (candidates.length > 0) return rollShiny(pickRandomCard(candidates));
  const commons = getCardsByRarity(cardSet.cards, Rarity.Common);
  return rollShiny(pickRandomCard(commons.length > 0 ? commons : cardSet.cards));
}

export function getRarityLabel(rarity: Rarity): string {
  const labels: Record<Rarity, string> = {
    [Rarity.Common]: 'Common',
    [Rarity.Rare]: 'Rare',
    [Rarity.Legendary]: 'Legendary',
  };
  return labels[rarity];
}

export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    [Rarity.Common]: '#9ca3af',
    [Rarity.Rare]: '#a78bfa',
    [Rarity.Legendary]: '#f59e0b',
  };
  return colors[rarity];
}

export function getRarityDiamonds(rarity: Rarity): string {
  const diamonds: Record<Rarity, string> = {
    [Rarity.Common]: '\u25C6',
    [Rarity.Rare]: '\u25C6\u25C6',
    [Rarity.Legendary]: '\u2605\u2605\u2605',
  };
  return diamonds[rarity];
}
