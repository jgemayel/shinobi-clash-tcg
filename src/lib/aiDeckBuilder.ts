import { getAllCards } from '@/data/cardLoader';
import { GameCard, NinjaCard } from '@/types/card';
import { CardType, Rarity, ChakraType } from '@/types/enums';
import { MAX_DECK_SIZE, MAX_CARD_COPIES, MAX_SENSEI_COPIES } from '@/lib/constants';
import { isNinja } from '@/lib/cardUtils';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RARITY_RANK: Record<string, number> = {
  [Rarity.Common]: 1,
  [Rarity.Rare]: 2,
  [Rarity.Legendary]: 3,
};

function rarityRank(r: string): number {
  return RARITY_RANK[r] ?? 0;
}

function maxCopies(card: GameCard): number {
  return card.type === CardType.Sensei ? MAX_SENSEI_COPIES : MAX_CARD_COPIES;
}

interface FamilyTree {
  name: string;
  stages: NinjaCard[];
  power: number;
  hasBasic: boolean;
}

/**
 * Group ninjas by character name (evolution lines share a name). Scores each
 * family by total HP + primary-attack damage + legendary bonus so we can pick
 * the strongest playable lines first.
 */
function groupFamilies(ninjas: NinjaCard[]): FamilyTree[] {
  const map = new Map<string, NinjaCard[]>();
  for (const n of ninjas) {
    if (!map.has(n.name)) map.set(n.name, []);
    map.get(n.name)!.push(n);
  }
  const families: FamilyTree[] = [];
  for (const [name, cards] of map) {
    const stages = [...cards].sort((a, b) => a.stage - b.stage);
    const hasBasic = stages.some((s) => s.stage === 0);
    const power = stages.reduce(
      // Power score — EX is a bigger swing than legendary since it scores
      // double points on KO. Legendary is still a nice-to-have marker.
      (sum, s) => sum + s.hp + (s.attacks[0]?.damage ?? 0) + (s.isEx ? 180 : 0) + (s.isLegendary ? 80 : 0) + rarityRank(s.rarity) * 20,
      0
    );
    families.push({ name, stages, hasBasic, power });
  }
  return families;
}

interface DeckBuildResult {
  ids: string[];
  primaryChakras: ChakraType[];
}

/**
 * Smart deck builder — takes an "available pool" and constructs a 20-card
 * deck following TCGP-style principles: multiple evolution lines, a small
 * basket of support/tools/jutsu, 1 Sensei, and at least 1 legendary finisher
 * when available.
 */
function buildDeckFromPool(pool: GameCard[], owned?: Record<string, number>): DeckBuildResult {
  const getOwned = (id: string) => (owned ? (owned[id] ?? 0) : Infinity);
  const deckIds: string[] = [];
  const counts: Record<string, number> = {};

  const tryAdd = (card: GameCard): boolean => {
    if (deckIds.length >= MAX_DECK_SIZE) return false;
    const current = counts[card.id] ?? 0;
    if (current >= maxCopies(card)) return false;
    if (current >= getOwned(card.id)) return false;
    deckIds.push(card.id);
    counts[card.id] = current + 1;
    return true;
  };

  const ninjas = pool.filter(isNinja) as NinjaCard[];
  const families = groupFamilies(ninjas).filter((f) => f.hasBasic);
  families.sort((a, b) => b.power - a.power);

  const chakraTally: Record<string, number> = {};

  // Phase 1: include top 4 evolution families with smart copy counts
  const NINJA_BUDGET = 13;
  const chosenFamilies = families.slice(0, 4);
  for (const family of chosenFamilies) {
    if (deckIds.length >= NINJA_BUDGET) break;
    for (const stage of family.stages) {
      if (deckIds.length >= NINJA_BUDGET) break;
      // Pokemon TCGP heuristic: more basics than evolutions
      const targetCopies =
        stage.stage === 0 ? 2
        : stage.stage === 1 ? (family.stages.length > 2 ? 1 : 2)
        : 1;
      for (let i = 0; i < targetCopies; i++) {
        if (tryAdd(stage)) {
          chakraTally[stage.chakraType] = (chakraTally[stage.chakraType] ?? 0) + 1;
        } else {
          break;
        }
      }
    }
  }

  // Fill to ninja budget with remaining strong basics we haven't added
  const basicPool = shuffle(
    ninjas
      .filter((n) => n.stage === 0 && (counts[n.id] ?? 0) === 0)
      .sort((a, b) => b.hp + (b.attacks[0]?.damage ?? 0) - (a.hp + (a.attacks[0]?.damage ?? 0)))
  );
  for (const b of basicPool) {
    if (deckIds.length >= NINJA_BUDGET) break;
    if (tryAdd(b)) {
      chakraTally[b.chakraType] = (chakraTally[b.chakraType] ?? 0) + 1;
    }
  }

  const primaryChakras = Object.entries(chakraTally)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t as ChakraType);

  // Phase 2: Jutsu scrolls — prefer higher-rarity first
  const JUTSU_BUDGET = 4;
  let jutsuCount = 0;
  const jutsu = pool
    .filter((c) => c.type === CardType.JutsuScroll)
    .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity));
  for (const j of jutsu) {
    if (jutsuCount >= JUTSU_BUDGET) break;
    if (tryAdd(j)) jutsuCount++;
  }

  // Phase 3: Tools — prefer higher rarity
  const TOOL_BUDGET = 2;
  let toolCount = 0;
  const tools = pool
    .filter((c) => c.type === CardType.Tool)
    .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity));
  for (const t of tools) {
    if (toolCount >= TOOL_BUDGET) break;
    if (tryAdd(t)) toolCount++;
  }

  // Phase 4: 1 Sensei (best we have)
  const senseis = pool
    .filter((c) => c.type === CardType.Sensei)
    .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity));
  if (senseis.length && deckIds.length < MAX_DECK_SIZE) {
    tryAdd(senseis[0]);
  }

  // Phase 5: Fill remaining with the next-best available anything
  const remainder = [...pool].sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity));
  for (const card of remainder) {
    if (deckIds.length >= MAX_DECK_SIZE) break;
    tryAdd(card);
  }

  return { ids: deckIds, primaryChakras };
}

/**
 * AI opponent deck — all cards are fair game.
 */
export function buildAIDeck(): GameCard[] {
  const result = buildDeckFromPool(getAllCards());
  const allMap = new Map(getAllCards().map((c) => [c.id, c] as const));
  return result.ids.map((id) => allMap.get(id)!).filter(Boolean);
}

/**
 * Smart player deck — only from owned cards.
 * Returns card IDs. May be < MAX_DECK_SIZE if player doesn't own enough cards.
 */
export function buildPlayerDeck(ownedCards: Record<string, number>): string[] {
  const allCards = getAllCards();
  const available = allCards.filter((c) => (ownedCards[c.id] ?? 0) > 0);
  if (available.length === 0) return [];
  return buildDeckFromPool(available, ownedCards).ids;
}
