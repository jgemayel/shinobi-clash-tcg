import { Rarity, AIDifficulty } from '@/types/enums';
import { GameCard, CardSet } from '@/types/card';
import { CARDS_PER_PACK } from './constants';
import { rollShiny } from './shinyUtils';

const DEFAULT_PULL_RATES: Record<Rarity, number> = {
  [Rarity.Common]: 0.60,
  [Rarity.Uncommon]: 0.25,
  [Rarity.Rare]: 0.10,
  [Rarity.UltraRare]: 0.035,
  [Rarity.Legendary]: 0.01,
  [Rarity.Secret]: 0.004,
  [Rarity.Crown]: 0.001,
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

  // Slots 1-3: weighted toward common/uncommon
  const earlySlotRates = {
    ...rates,
    [Rarity.Common]: rates[Rarity.Common] * 1.5,
    [Rarity.Uncommon]: rates[Rarity.Uncommon] * 1.2,
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

  // Slots 4-5: higher rare chance
  const lateSlotRates = {
    ...rates,
    [Rarity.Common]: rates[Rarity.Common] * 0.5,
    [Rarity.Rare]: (rates[Rarity.Rare] ?? 0) * 2,
    [Rarity.UltraRare]: (rates[Rarity.UltraRare] ?? 0) * 1.5,
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
      const uncommons = getCardsByRarity(cardSet.cards, Rarity.Uncommon);
      pack.push(finish(pickRandomCard(uncommons.length > 0 ? uncommons : cardSet.cards)));
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
    [Rarity.Common]: (base[Rarity.Common] ?? 0) * Math.max(0.25, 1 - boost * 0.3),
    [Rarity.Uncommon]: (base[Rarity.Uncommon] ?? 0) * (1 + boost * 0.2),
    [Rarity.Rare]: (base[Rarity.Rare] ?? 0) * (1 + boost * 0.6),
    [Rarity.UltraRare]: (base[Rarity.UltraRare] ?? 0) * (1 + boost * 1.3),
    [Rarity.Legendary]: (base[Rarity.Legendary] ?? 0) * (1 + boost * 2.2),
    [Rarity.Secret]: (base[Rarity.Secret] ?? 0) * (1 + boost * 2.8),
    [Rarity.Crown]: (base[Rarity.Crown] ?? 0) * (1 + boost * 3.5),
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
    [Rarity.Uncommon]: 'Uncommon',
    [Rarity.Rare]: 'Rare',
    [Rarity.UltraRare]: 'Ultra Rare',
    [Rarity.Legendary]: 'Legendary',
    [Rarity.Secret]: 'Secret',
    [Rarity.Crown]: 'Crown',
  };
  return labels[rarity];
}

export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    [Rarity.Common]: '#9ca3af',
    [Rarity.Uncommon]: '#60a5fa',
    [Rarity.Rare]: '#a78bfa',
    [Rarity.UltraRare]: '#f59e0b',
    [Rarity.Legendary]: '#ef4444',
    [Rarity.Secret]: '#ec4899',
    [Rarity.Crown]: '#fbbf24',
  };
  return colors[rarity];
}

export function getRarityDiamonds(rarity: Rarity): string {
  const diamonds: Record<Rarity, string> = {
    [Rarity.Common]: '\u25C6',
    [Rarity.Uncommon]: '\u25C6\u25C6',
    [Rarity.Rare]: '\u25C6\u25C6\u25C6',
    [Rarity.UltraRare]: '\u2605',
    [Rarity.Legendary]: '\u2605\u2605',
    [Rarity.Secret]: '\u2605\u2605\u2605',
    [Rarity.Crown]: '\u{1F451}',
  };
  return diamonds[rarity];
}
