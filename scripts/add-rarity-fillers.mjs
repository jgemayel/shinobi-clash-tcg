import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/data/cards';

const additions = {
  'hidden-leaf-origins.json': [{
    id: 'hlo-087', type: 'ninja', name: 'Sasuke Uchiha', subtitle: 'Susanoo Perfect Form',
    stage: 3, evolvesFrom: 'hlo-006', hp: 220, chakraType: 'fire',
    attacks: [
      { name: 'Susanoo Spectral Bow', cost: { fire: 2, lightning: 1 }, damage: 180, effect: null, description: 'A colossal spectral arrow.' },
      { name: 'Yasaka Magatama', cost: { fire: 3, colorless: 2 }, damage: 240, effect: null, description: 'Triple magatama orbs spiral.' }
    ],
    ability: { name: 'Tsukuyomi Gaze', description: 'Once per turn, Paralyze the Defender.', trigger: 'once-per-turn', effect: { type: 'status', status: 'paralyze', target: 'opponent-active' } },
    weakness: 'wind', retreatCost: 4, rarity: 'secret', isLegendary: true,
    flavorText: "My brother's power flows through me.", artPath: 'cards/ninja/sasuke-stage2.webp', set: 'hidden-leaf-origins'
  }],
  'sand-village.json': [
    {
      id: 'sv-061', type: 'ninja', name: 'Gaara', subtitle: 'Sand Shroud Valor',
      stage: 2, evolvesFrom: 'sv-002', hp: 200, chakraType: 'earth',
      attacks: [
        { name: 'Mother Sand Wall', cost: { earth: 2 }, damage: 110, effect: { type: 'heal', amount: 30, target: 'self-bench' }, description: 'Sand shields allies.' },
        { name: 'Sand Avalanche', cost: { earth: 3, colorless: 1 }, damage: 220, effect: null, description: 'A desert tidal wave.' }
      ],
      ability: { name: 'Valor of the Kazekage', description: 'Your Sand Ninjas take 20 less damage.', trigger: 'passive', effect: { type: 'conditional', condition: 'sand-dr', amount: 20 } },
      weakness: 'wind', retreatCost: 3, rarity: 'secret', isLegendary: true,
      flavorText: 'I fight for the village that once shunned me.', artPath: 'cards/ninja/gaara-stage1.webp', set: 'sand-village'
    },
    {
      id: 'sv-062', type: 'ninja', name: 'Shukaku', subtitle: 'Gaara Perfect Bond',
      stage: 2, evolvesFrom: 'sv-002', hp: 280, chakraType: 'earth',
      attacks: [
        { name: 'One-Tail Tailed Beast Ball', cost: { earth: 3, colorless: 1 }, damage: 220, effect: null, description: 'Compressed chakra orb of destruction.' },
        { name: 'Sand Imperial Funeral', cost: { earth: 4, colorless: 2 }, damage: 320, effect: { type: 'bench-damage', target: 'opponent-bench', amount: 60 }, description: 'The desert consumes all.' }
      ],
      ability: { name: 'Perfect Bond', description: "Cannot be KO'd by status effects. Heal 40 HP each turn.", trigger: 'passive', effect: { type: 'heal', amount: 40, target: 'self' } },
      weakness: 'wind', retreatCost: 4, rarity: 'crown', isLegendary: true,
      flavorText: 'Shukaku and I fight as brothers.', artPath: 'cards/ninja/gaara-stage1.webp', set: 'sand-village'
    }
  ],
  'mist-village.json': [
    {
      id: 'mv-061', type: 'ninja', name: 'Mei Terumi', subtitle: 'Lava Queen Radiant',
      stage: 2, evolvesFrom: 'mv-006', hp: 240, chakraType: 'fire',
      attacks: [
        { name: 'Molten Sovereign', cost: { fire: 2, earth: 1 }, damage: 160, effect: { type: 'status', status: 'burn', target: 'opponent-active' }, description: 'Lava forms a crown of flame.' },
        { name: 'Boil Release: Skilled Genesis', cost: { fire: 2, water: 2 }, damage: 230, effect: null, description: 'Steam that melts steel.' }
      ],
      ability: { name: 'Dual Element Mastery', description: 'Fire and Water attacks cost 1 less Chakra.', trigger: 'passive', effect: { type: 'conditional', condition: 'element-discount', amount: 1 } },
      weakness: 'earth', retreatCost: 3, rarity: 'secret', isLegendary: true,
      flavorText: 'The Mist flourishes under my sun.', artPath: 'cards/ninja/mei.webp', set: 'mist-village'
    },
    {
      id: 'mv-062', type: 'ninja', name: 'Yagura', subtitle: 'Three-Tails Perfect Jinchuriki',
      stage: 0, evolvesFrom: null, hp: 290, chakraType: 'water',
      attacks: [
        { name: 'Coral Crush', cost: { water: 2, colorless: 1 }, damage: 170, effect: null, description: 'Coral armor-plated strike.' },
        { name: 'Three-Tails Maelstrom', cost: { water: 3, colorless: 3 }, damage: 310, effect: { type: 'bench-damage', target: 'opponent-bench', amount: 50 }, description: 'A tidal vortex engulfs the field.' }
      ],
      ability: { name: 'Isobu Shell', description: 'Reduce all incoming damage by 30. Heal 30 HP per turn.', trigger: 'passive', effect: { type: 'heal', amount: 30, target: 'self', secondaryEffect: { type: 'conditional', condition: 'damage-reduction', amount: 30 } } },
      weakness: 'lightning', retreatCost: 4, rarity: 'crown', isLegendary: true,
      flavorText: 'The Mizukage and the beast are one.', artPath: 'cards/ninja/yagura.webp', set: 'mist-village'
    }
  ],
  'cloud-village.json': [{
    id: 'cv-066', type: 'ninja', name: 'Samui and Atsui', subtitle: 'Twin Edge of Lightning',
    stage: 0, evolvesFrom: null, hp: 180, chakraType: 'lightning',
    attacks: [
      { name: 'Twin Flash Cut', cost: { lightning: 2 }, damage: 130, effect: null, description: 'Hot-and-cold blades cross in perfect arc.' },
      { name: 'Fire and Ice Duel', cost: { fire: 1, lightning: 2 }, damage: 200, effect: { type: 'status', status: 'burn', target: 'opponent-active' }, description: 'Twin elements engulf the target.' }
    ],
    ability: { name: 'Sibling Synchrony', description: 'If both siblings are in play, attacks deal +40 damage.', trigger: 'passive', effect: { type: 'damage-boost', amount: 40, condition: 'twin-bench' } },
    weakness: 'earth', retreatCost: 2, rarity: 'secret', isLegendary: true,
    flavorText: 'Ice and fire. Sister and brother. Strike as one.', artPath: 'cards/ninja/samui-atsui.webp', set: 'cloud-village'
  }],
  'stone-village.json': [
    {
      id: 'stv-066', type: 'ninja', name: 'Onoki', subtitle: 'Ghost of Iwagakure',
      stage: 2, evolvesFrom: 'stv-002', hp: 240, chakraType: 'earth',
      attacks: [
        { name: 'Dust Disappear', cost: { earth: 2 }, damage: 130, effect: { type: 'conditional', condition: 'untargetable-jutsu' }, description: 'Dust-level phase.' },
        { name: 'Primitive Cosmic Release', cost: { earth: 3, wind: 1, colorless: 1 }, damage: 260, effect: null, description: 'Dust Release at full mastery.' }
      ],
      ability: { name: 'Levitation God', description: 'Retreat cost is 0. Attacks ignore 30 damage reduction.', trigger: 'passive', effect: { type: 'conditional', condition: 'free-retreat-pierce', amount: 30 } },
      weakness: 'wind', retreatCost: 0, rarity: 'secret', isLegendary: true,
      flavorText: 'Old bones still dance in the clouds.', artPath: 'cards/ninja/onoki.webp', set: 'stone-village'
    },
    {
      id: 'stv-067', type: 'ninja', name: 'Onoki', subtitle: 'Dust Release Ascendant',
      stage: 3, evolvesFrom: 'stv-066', hp: 300, chakraType: 'earth',
      attacks: [
        { name: 'Particle Annihilation', cost: { earth: 4 }, damage: 300, effect: null, description: 'Target ceases to exist at atomic level.' },
        { name: 'Ascendant Dust Field', cost: { earth: 3, wind: 2, colorless: 2 }, damage: 340, effect: { type: 'bench-damage', target: 'all-opponents', amount: 80 }, description: 'The battlefield itself disintegrates.' }
      ],
      ability: { name: 'Dust Release God', description: 'All your Earth Ninjas attacks ignore damage reduction.', trigger: 'passive', effect: { type: 'conditional', condition: 'bench-pierce' } },
      weakness: 'wind', retreatCost: 0, rarity: 'crown', isLegendary: true,
      flavorText: 'I became the Kekkei Tota itself.', artPath: 'cards/ninja/onoki.webp', set: 'stone-village'
    }
  ],
  'sound-village.json': [{
    id: 'sndv-066', type: 'ninja', name: 'Orochimaru', subtitle: 'Eight-Headed Spirit',
    stage: 3, evolvesFrom: 'sndv-003', hp: 340, chakraType: 'colorless',
    attacks: [
      { name: 'Ancient Serpent Coil', cost: { colorless: 3 }, damage: 210, effect: { type: 'status', status: 'poison', target: 'opponent-active' }, description: 'Infinite coils crush and envenom.' },
      { name: 'Unbound Eight Heads', cost: { colorless: 5 }, damage: 360, effect: { type: 'bench-damage', target: 'opponent-bench', amount: 60 }, description: 'Each head strikes a different target.' }
    ],
    ability: { name: 'Undying Essence', description: "This Ninja cannot be KO'd by non-Legendary attacks.", trigger: 'passive', effect: { type: 'conditional', condition: 'legendary-ko-only' } },
    weakness: 'wind', retreatCost: 4, rarity: 'secret', isLegendary: true,
    flavorText: 'I am time. I am the serpent eating itself.', artPath: 'cards/ninja/orochimaru.webp', set: 'sound-village'
  }],
  'rain-village.json': [{
    id: 'rv-061', type: 'ninja', name: 'Konan', subtitle: 'Six Hundred Billion Papers',
    stage: 2, evolvesFrom: 'rv-007', hp: 260, chakraType: 'water',
    attacks: [
      { name: 'Paper Sky Sovereign', cost: { water: 2, colorless: 1 }, damage: 150, effect: { type: 'bench-damage', target: 'opponent-bench', amount: 30 }, description: 'Paper-bomb rain from above.' },
      { name: 'Six Hundred Billion Detonation', cost: { water: 3, colorless: 3 }, damage: 320, effect: { type: 'self-damage', amount: 80 }, description: 'Every paper she ever folded explodes.' }
    ],
    ability: { name: 'Origami Flight', description: 'Retreat cost is 0. Take 30% less damage from Fire.', trigger: 'passive', effect: { type: 'conditional', condition: 'fire-resist-flight' } },
    weakness: 'fire', retreatCost: 0, rarity: 'secret', isLegendary: true,
    flavorText: 'For Yahiko. For Nagato. This is my last miracle.', artPath: 'cards/ninja/konan.webp', set: 'rain-village'
  }],
  'akatsuki-dawn.json': [{
    id: 'akd-071', type: 'ninja', name: 'Itachi Uchiha', subtitle: "Crow's Eternal Promise",
    stage: 2, evolvesFrom: 'akd-002', hp: 260, chakraType: 'fire',
    attacks: [
      { name: 'Amaterasu Pillars', cost: { fire: 3 }, damage: 180, effect: { type: 'status', status: 'burn', target: 'opponent-active' }, description: 'Black flames rise as walls.' },
      { name: 'Perfect Susanoo: Yata Totsuka', cost: { fire: 3, colorless: 3 }, damage: 340, effect: { type: 'status', status: 'seal', target: 'opponent-active' }, description: 'Mirror, Sword, and Avatar united.' }
    ],
    ability: { name: 'Izanami Bind', description: 'Once per battle, prevent all damage and Paralyze the attacker.', trigger: 'once-per-battle', effect: { type: 'status', status: 'paralyze', target: 'opponent-active' } },
    weakness: 'water', retreatCost: 3, rarity: 'secret', isLegendary: true,
    flavorText: 'Forgive me, Sasuke. This time — forever.', artPath: 'cards/ninja/itachi.webp', set: 'akatsuki-dawn'
  }]
};

for (const [file, cards] of Object.entries(additions)) {
  const full = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  data.cards.push(...cards);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n');
  console.log(`${file}: +${cards.length} cards`);
}
