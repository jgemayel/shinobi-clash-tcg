import { ChakraType } from '@/types/enums';

// Fire > Wind > Lightning > Earth > Water > Fire
const weaknessMap: Record<string, ChakraType> = {
  [ChakraType.Fire]: ChakraType.Water,
  [ChakraType.Water]: ChakraType.Earth,
  [ChakraType.Lightning]: ChakraType.Wind,
  [ChakraType.Earth]: ChakraType.Lightning,
  [ChakraType.Wind]: ChakraType.Fire,
};

const strengthMap: Record<string, ChakraType> = {
  [ChakraType.Fire]: ChakraType.Wind,
  [ChakraType.Water]: ChakraType.Fire,
  [ChakraType.Lightning]: ChakraType.Earth,
  [ChakraType.Earth]: ChakraType.Water,
  [ChakraType.Wind]: ChakraType.Lightning,
};

export function getWeakness(type: ChakraType): ChakraType | null {
  return weaknessMap[type] ?? null;
}

export function getStrength(type: ChakraType): ChakraType | null {
  return strengthMap[type] ?? null;
}

export function isWeakTo(defenderType: ChakraType, attackerType: ChakraType): boolean {
  return weaknessMap[defenderType] === attackerType;
}

export function isStrongAgainst(attackerType: ChakraType, defenderType: ChakraType): boolean {
  return strengthMap[attackerType] === defenderType;
}

export function getTypeColor(type: ChakraType): string {
  const colors: Record<string, string> = {
    [ChakraType.Fire]: '#ef4444',
    [ChakraType.Water]: '#3b82f6',
    [ChakraType.Lightning]: '#eab308',
    [ChakraType.Earth]: '#a16207',
    [ChakraType.Wind]: '#22c55e',
    [ChakraType.Colorless]: '#9ca3af',
  };
  return colors[type] ?? '#9ca3af';
}

export function getTypeName(type: ChakraType): string {
  const names: Record<string, string> = {
    [ChakraType.Fire]: 'Fire (Katon)',
    [ChakraType.Water]: 'Water (Suiton)',
    [ChakraType.Lightning]: 'Lightning (Raiton)',
    [ChakraType.Earth]: 'Earth (Doton)',
    [ChakraType.Wind]: 'Wind (Futon)',
    [ChakraType.Colorless]: 'Colorless',
  };
  return names[type] ?? type;
}

export function getTypeEmoji(type: ChakraType): string {
  const emojis: Record<string, string> = {
    [ChakraType.Fire]: 'F',
    [ChakraType.Water]: 'W',
    [ChakraType.Lightning]: 'L',
    [ChakraType.Earth]: 'E',
    [ChakraType.Wind]: 'N',
    [ChakraType.Colorless]: 'C',
  };
  return emojis[type] ?? 'C';
}
