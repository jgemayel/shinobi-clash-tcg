#!/usr/bin/env node
/**
 * Applies fixes identified by scripts/audit-all.mjs:
 *   • Rename subtitle on duplicate "same name + subtitle" prints to keep
 *     each card semantically distinct
 *   • Rename identically-named but mechanically-different jutsu/tool cards
 *     so players can recognize variants at a glance
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'src/data/cards');

// id → { patch } shallow-merge into card
const PATCHES = {
  // HLO Zabuza stage-0 was labeled "Demon of the Mist" same as MV's stage-1.
  // Rename HLO's subtitle so the two aren't semantically confused.
  'hlo-033': { subtitle: 'Wave Country Villain' },

  // Rename duplicate-named non-character cards so village-specific variants
  // read distinctly.
  'akd-053': { name: 'Akatsuki Edo Tensei' },
  'tb-014':  { name: 'Bijuu Lariat' },
  'hlo-048': { name: 'Konoha Mist Bunker' },
  'rv-053':  { name: 'Amegakure Rain Scroll' },
  'sv-043':  { name: 'Puppet Chakra Blade' },

  // Tailed Beasts pack jinchuriki variants — differentiate from village prints
  // by leaning into their bijuu-bond theme
  'tb-016': { subtitle: "Matatabi's Chosen" },
  'tb-017': { subtitle: "Son Gokū's Partner" },
  'tb-018': { subtitle: "Kokuō's Vessel" },

  // Kabuto "Sage of Snakes" printed in both Akatsuki and Sound. Differentiate
  // the Akatsuki one as his Akatsuki-era subtitle
  'akd-029': { subtitle: 'Akatsuki Sage Apprentice' },
};

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
let touched = 0;

for (const file of files) {
  const full = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  let changed = false;
  for (const card of data.cards) {
    if (card.id in PATCHES) {
      Object.assign(card, PATCHES[card.id]);
      changed = true;
      touched++;
      console.log(`  ${card.id} → ${JSON.stringify(PATCHES[card.id])}`);
    }
  }
  if (changed) {
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n');
  }
}

console.log(`\napplied ${touched} fixes across ${files.length} pack files.`);
