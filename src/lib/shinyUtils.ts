import { GameCard, NinjaCard } from '@/types/card';
import { CardType } from '@/types/enums';

const SHINY_SUFFIX = '-shiny';
const SHINY_HP_BONUS = 10;
const SHINY_DAMAGE_BONUS = 5;

export const SHINY_PULL_RATE = 1 / 120;

export function isShinyCardId(id: string): boolean {
  return id.endsWith(SHINY_SUFFIX);
}

export function baseIdFromShiny(id: string): string {
  return id.endsWith(SHINY_SUFFIX) ? id.slice(0, -SHINY_SUFFIX.length) : id;
}

export function shinyIdFromBase(id: string): string {
  return id.endsWith(SHINY_SUFFIX) ? id : `${id}${SHINY_SUFFIX}`;
}

/**
 * Returns a new card object representing the shiny variant.
 * Shinies have boosted HP/damage on primary attack, distinct ID, and isShiny flag.
 */
export function makeShiny(card: GameCard): GameCard {
  if (card.type !== CardType.Ninja) {
    // Non-ninja shinies keep same stats — only the visual/collector value differs.
    return { ...card, id: shinyIdFromBase(card.id), isShiny: true } as GameCard;
  }
  const ninja = card as NinjaCard;
  const boostedAttacks = ninja.attacks.map((atk, idx) =>
    idx === 0 ? { ...atk, damage: atk.damage + SHINY_DAMAGE_BONUS } : atk
  );
  return {
    ...ninja,
    id: shinyIdFromBase(ninja.id),
    hp: ninja.hp + SHINY_HP_BONUS,
    attacks: boostedAttacks,
    isShiny: true,
  };
}

export function rollShiny<T extends GameCard>(card: T): T {
  if (Math.random() < SHINY_PULL_RATE) {
    return makeShiny(card) as T;
  }
  return card;
}
