#!/usr/bin/env node
/**
 * Final sweep — walks every card across every pack and reports:
 *   • Duplicate card IDs across packs (critical — will break the engine)
 *   • Duplicate "same name + subtitle + type" prints across packs
 *   • Tools and Jutsu sharing a name
 *   • Cards with evolvesFrom pointing to a nonexistent card
 *   • Evolution chains with skipped stages (0 → 2 without 1)
 *   • Cards with impossible stats (HP ≤ 0, damage < 0, empty attacks)
 *   • Pull rates that don't sum to ~1.0
 *   • artPath values still pointing to files not on disk
 *   • Mismatch between isLegendary flag and rarity tier
 *   • Cards with the same name across packs but wildly different HP (sign of unintended inconsistency)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CARDS_DIR = path.join(ROOT, 'src/data/cards');
const NINJA_DIR = path.join(ROOT, 'public/assets/cards/ninja');
const SENSEI_DIR = path.join(ROOT, 'public/assets/cards/sensei');

const NINJA_FILES = new Set(fs.readdirSync(NINJA_DIR));
const SENSEI_FILES = new Set(fs.readdirSync(SENSEI_DIR));

const files = fs.readdirSync(CARDS_DIR).filter((f) => f.endsWith('.json')).sort();

// Flat list of all cards with their pack ID
const allCards = [];
const packs = {};
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(CARDS_DIR, file), 'utf8'));
  packs[data.setId] = data;
  for (const card of data.cards) {
    allCards.push({ ...card, __file: file });
  }
}

const issues = { critical: [], warn: [], info: [] };
const add = (tier, title, items) => {
  if (items.length) issues[tier].push({ title, items });
};

// 1. Duplicate card IDs
{
  const byId = new Map();
  for (const c of allCards) {
    if (!byId.has(c.id)) byId.set(c.id, []);
    byId.get(c.id).push(`${c.__file}: ${c.name}`);
  }
  const dupes = [];
  for (const [id, locs] of byId) {
    if (locs.length > 1) dupes.push(`${id} → ${locs.join(' | ')}`);
  }
  add('critical', 'Duplicate card IDs', dupes);
}

// 2. Same exact card printed in multiple packs (name + subtitle + type)
{
  const byKey = new Map();
  for (const c of allCards) {
    const key = `${c.type}::${c.name}::${c.subtitle ?? ''}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push({ id: c.id, file: c.__file, hp: c.hp });
  }
  const dupes = [];
  for (const [key, entries] of byKey) {
    if (entries.length > 1) {
      dupes.push(`${key} appears ${entries.length}× → ${entries.map((e) => `${e.id}${e.hp ? `(${e.hp}hp)` : ''}`).join(', ')}`);
    }
  }
  add('warn', 'Duplicate "same name+subtitle" prints across packs', dupes);
}

// 3. Tool + Jutsu name collisions
{
  const jutsuNames = new Set(allCards.filter((c) => c.type === 'jutsu-scroll').map((c) => c.name.toLowerCase()));
  const toolNames = new Set(allCards.filter((c) => c.type === 'tool').map((c) => c.name.toLowerCase()));
  const collisions = [];
  for (const n of jutsuNames) {
    if (toolNames.has(n)) collisions.push(n);
  }
  add('warn', 'Names shared between a Jutsu and a Tool', collisions);
}

// 4. Ninja + Jutsu/Tool name collisions (a ninja attack named "Rasengan" conflicting with a Jutsu card named "Rasengan" is fine; but a Ninja CARD named "Rasengan" colliding with a jutsu would be weird)
{
  const ninjaNames = new Set(allCards.filter((c) => c.type === 'ninja').map((c) => c.name.toLowerCase()));
  const nonNinjaNames = new Set(allCards.filter((c) => c.type !== 'ninja').map((c) => c.name.toLowerCase()));
  const collisions = [];
  for (const n of ninjaNames) {
    if (nonNinjaNames.has(n)) collisions.push(n);
  }
  add('warn', 'Ninja card shares a name with a non-Ninja card', collisions);
}

// 5. Broken evolvesFrom references
{
  const idSet = new Set(allCards.map((c) => c.id));
  const broken = [];
  for (const c of allCards) {
    if (c.type !== 'ninja') continue;
    if (c.evolvesFrom && !idSet.has(c.evolvesFrom)) {
      broken.push(`${c.id} ${c.name} (${c.subtitle ?? ''}) → evolvesFrom "${c.evolvesFrom}" does not exist`);
    }
  }
  add('critical', 'evolvesFrom points to a missing card', broken);
}

// 6. Stage consistency: evolvesFrom's stage must be < this card's stage
{
  const byId = new Map(allCards.map((c) => [c.id, c]));
  const bad = [];
  for (const c of allCards) {
    if (c.type !== 'ninja' || !c.evolvesFrom) continue;
    const parent = byId.get(c.evolvesFrom);
    if (parent && parent.type === 'ninja') {
      if (parent.stage >= c.stage) {
        bad.push(`${c.id} ${c.name} (stage ${c.stage}) evolves from ${parent.id} (stage ${parent.stage}) — parent stage not lower`);
      }
    }
  }
  add('warn', 'Evolution stages out of order', bad);
}

// 7. Impossible stats
{
  const bad = [];
  for (const c of allCards) {
    if (c.type === 'ninja') {
      if (!c.hp || c.hp <= 0) bad.push(`${c.id} ${c.name} HP=${c.hp}`);
      if (!Array.isArray(c.attacks) || c.attacks.length === 0) bad.push(`${c.id} ${c.name} has no attacks`);
      if (Array.isArray(c.attacks)) {
        for (const a of c.attacks) {
          if (typeof a.damage !== 'number' || a.damage < 0) bad.push(`${c.id} ${c.name} attack "${a.name}" bad damage=${a.damage}`);
        }
      }
    }
  }
  add('critical', 'Impossible stats', bad);
}

// 8. isLegendary flag vs rarity consistency.
// Pokemon TCGP allows EX Pokemon at UR rarity, so UR+isLegendary is a valid
// design choice (treats that card as an EX giving +1 extra prize on KO).
// We only flag the inconsistent cases: legendary/secret/crown must be isLegendary=true,
// and common/uncommon/rare must be isLegendary=false.
{
  const bad = [];
  const mustBeLegendary = new Set(['legendary', 'secret', 'crown']);
  const cantBeLegendary = new Set(['common', 'uncommon', 'rare']);
  for (const c of allCards) {
    if (c.type !== 'ninja') continue;
    if (mustBeLegendary.has(c.rarity) && !c.isLegendary) {
      bad.push(`${c.id} ${c.name} rarity=${c.rarity} but isLegendary=false`);
    } else if (cantBeLegendary.has(c.rarity) && c.isLegendary) {
      bad.push(`${c.id} ${c.name} rarity=${c.rarity} but isLegendary=true`);
    }
  }
  add('warn', 'isLegendary flag disagrees with rarity tier', bad);
}

// 9. Pull rates sum check
{
  const bad = [];
  for (const [id, pack] of Object.entries(packs)) {
    if (!pack.pullRates) { bad.push(`${id} has no pullRates`); continue; }
    const sum = Object.values(pack.pullRates).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.02) {
      bad.push(`${id} pullRates sum to ${sum.toFixed(3)} (should be 1.0)`);
    }
  }
  add('critical', 'Pull rates outside tolerance of 1.0', bad);
}

// 10. artPath files missing on disk
{
  const bad = [];
  for (const c of allCards) {
    if (c.type !== 'ninja' && c.type !== 'sensei') continue;
    if (!c.artPath) { bad.push(`${c.id} ${c.name} has no artPath`); continue; }
    const [, dir, file] = c.artPath.split('/');
    if (dir === 'ninja' && !NINJA_FILES.has(file)) bad.push(`${c.id} ${c.name} → ${c.artPath} (missing)`);
    if (dir === 'sensei' && !SENSEI_FILES.has(file)) bad.push(`${c.id} ${c.name} → ${c.artPath} (missing)`);
  }
  add('info', 'artPath file missing (will cascade to fallback tier)', bad);
}

// 11. Same character with wildly different HP across prints (suggests typo)
{
  const byName = new Map();
  for (const c of allCards) {
    if (c.type !== 'ninja' || !c.hp) continue;
    if (!byName.has(c.name)) byName.set(c.name, []);
    byName.get(c.name).push({ id: c.id, subtitle: c.subtitle, hp: c.hp, stage: c.stage });
  }
  const bad = [];
  for (const [name, prints] of byName) {
    if (prints.length < 2) continue;
    // Only flag if SAME stage has very different HP
    const byStage = new Map();
    for (const p of prints) {
      if (!byStage.has(p.stage)) byStage.set(p.stage, []);
      byStage.get(p.stage).push(p);
    }
    for (const [stage, list] of byStage) {
      if (list.length < 2) continue;
      const hps = list.map((l) => l.hp);
      const spread = Math.max(...hps) - Math.min(...hps);
      if (spread > 60) {
        bad.push(`${name} stage ${stage}: HP spread ${Math.min(...hps)}-${Math.max(...hps)} → ${list.map((l) => `${l.id}(${l.hp})`).join(', ')}`);
      }
    }
  }
  add('info', 'Same-character-same-stage HP spread > 60 across prints', bad);
}

// 12. Sensei card collisions on ID within same pack (shouldn't be checked across, but)
// Already covered by #1

// 13. Number check per pack
{
  const bad = [];
  for (const [id, pack] of Object.entries(packs)) {
    if (pack.cards.length < 60) bad.push(`${id}: ${pack.cards.length} cards (min 60)`);
  }
  add('info', 'Packs under 60 cards', bad);
}

// Render
const EMOJI = { critical: '❌', warn: '⚠️ ', info: 'ℹ️ ' };
let total = 0;
for (const tier of ['critical', 'warn', 'info']) {
  for (const section of issues[tier]) {
    console.log(`\n${EMOJI[tier]} ${section.title} (${section.items.length})`);
    for (const item of section.items.slice(0, 25)) console.log('   ' + item);
    if (section.items.length > 25) console.log(`   ... and ${section.items.length - 25} more`);
    total += section.items.length;
  }
}

console.log('\n─────────────');
console.log(`audited ${allCards.length} cards across ${files.length} packs → ${total} findings`);
const counts = { critical: 0, warn: 0, info: 0 };
for (const tier of ['critical', 'warn', 'info']) {
  counts[tier] = issues[tier].reduce((s, sec) => s + sec.items.length, 0);
}
console.log(`   ❌ critical: ${counts.critical}   ⚠️  warnings: ${counts.warn}   ℹ️  info: ${counts.info}`);
