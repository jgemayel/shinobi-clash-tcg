import { CardType, ChakraType, Rarity, StatusEffect } from './enums';

export interface ChakraCost {
  fire?: number;
  water?: number;
  lightning?: number;
  earth?: number;
  wind?: number;
  colorless?: number;
}

export interface AttackEffect {
  type:
    | 'status'
    | 'heal'
    | 'draw'
    | 'discard'
    | 'bench-damage'
    | 'energy-discard'
    | 'switch'
    | 'self-damage'
    | 'damage-boost'
    | 'conditional';
  status?: StatusEffect;
  amount?: number;
  target?: 'opponent-active' | 'opponent-bench' | 'self' | 'self-bench' | 'all-opponents';
  condition?: string;
  secondaryEffect?: AttackEffect;
}

export interface Attack {
  name: string;
  cost: ChakraCost;
  damage: number;
  effect?: AttackEffect;
  description: string;
}

export interface Ability {
  name: string;
  description: string;
  trigger: 'passive' | 'on-play' | 'on-evolve' | 'once-per-turn';
  effect: AttackEffect;
}

export interface NinjaCard {
  id: string;
  type: CardType.Ninja;
  name: string;
  subtitle: string | null;
  stage: 0 | 1 | 2 | 3;
  evolvesFrom: string | null;
  hp: number;
  chakraType: ChakraType;
  attacks: Attack[];
  ability: Ability | null;
  weakness: ChakraType;
  retreatCost: number;
  rarity: Rarity;
  set: string;
  setNumber?: number;
  isLegendary: boolean;
  isShiny?: boolean;
  flavorText: string;
  artPath: string;
}

export interface JutsuScrollCard {
  id: string;
  type: CardType.JutsuScroll;
  name: string;
  description: string;
  effect: AttackEffect;
  rarity: Rarity;
  set: string;
  setNumber?: number;
  isShiny?: boolean;
  artPath: string;
}

export interface ToolCard {
  id: string;
  type: CardType.Tool;
  name: string;
  description: string;
  effect: AttackEffect;
  rarity: Rarity;
  set: string;
  setNumber?: number;
  isShiny?: boolean;
  artPath: string;
}

export interface SenseiCard {
  id: string;
  type: CardType.Sensei;
  name: string;
  subtitle: string;
  description: string;
  effect: AttackEffect;
  rarity: Rarity;
  set: string;
  setNumber?: number;
  isShiny?: boolean;
  artPath: string;
}

export type GameCard = NinjaCard | JutsuScrollCard | ToolCard | SenseiCard;

export interface CardSet {
  setId: string;
  setName: string;
  releaseOrder: number;
  unlockLevel: number;
  packArt: string;
  cards: GameCard[];
  pullRates: Record<Rarity, number>;
  totalCards?: number;
}
