#!/usr/bin/env node
/**
 * Walks every card in every pack and verifies `artPath` points to the
 * best representative image we actually have on disk. Where the current
 * path is wrong or points to a nonexistent file, we recompute the best
 * candidate using character-name + subtitle + stage and write the file
 * back (preserving formatting).
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

/**
 * Derives a canonical character key from a card's name + subtitle.
 * The key matches a webp stem in public/assets/cards/ninja/ or /sensei/.
 */
function resolveCharacterKey(name, subtitle) {
  const n = (name || '').toLowerCase();
  const s = (subtitle || '').toLowerCase();
  const ns = `${n} ${s}`;

  // Ten-Tails / Juubi
  if (n.includes('ten-tails') || n === 'juubi' || s.includes('juubi') || s.includes('ten-tails')) return 'juubi';
  if (n.includes('gedo mazo') || s.includes('gedo mazo') || n.includes('demonic statue')) return 'gedo-mazo';

  // Pain paths — most specific first
  if (n.includes('pain') && s.includes('deva')) return 'pain-deva';
  if (n.includes('pain') && s.includes('asura')) return 'pain-asura';
  if (n.includes('pain') && s.includes('human')) return 'pain-human';
  if (n.includes('pain') && s.includes('animal')) return 'pain-animal';
  if (n.includes('pain') && s.includes('preta')) return 'pain-preta';
  if (n.includes('pain') && s.includes('naraka')) return 'pain-naraka';
  if (n.startsWith('pain')) return 'pain-deva';
  if (n.startsWith('nagato')) {
    if (s.includes('war orphan') || s.includes('young')) return 'nagato-young';
    return 'nagato';
  }
  if (n.startsWith('yahiko')) return 'yahiko';
  if (n.startsWith('konan')) {
    if (s.includes('young') || s.includes("rain's angel") || s.includes('rain orphan')) return 'konan-young';
    return 'konan';
  }

  // Akatsuki
  if (n.startsWith('itachi')) return 'itachi';
  if (n.startsWith('obito')) return 'obito';
  if (n.startsWith('kisame')) return 'kisame';
  if (n.startsWith('deidara')) {
    if (s.includes('young') || s.includes('iwa prodigy')) return 'young-deidara';
    return 'deidara';
  }
  if (n.startsWith('sasori')) return 'sasori';
  if (n.startsWith('hidan')) return 'hidan';
  if (n.startsWith('kakuzu')) return 'kakuzu';
  if (n === 'white zetsu' || s.includes('white zetsu') || (n.includes('zetsu') && s.includes('plant'))) return 'white-zetsu';
  if (n === 'black zetsu' || s.includes('black zetsu') || (n.includes('zetsu') && s.includes('kaguya'))) return 'black-zetsu';
  if (n.startsWith('hanzo') || n === 'hanzō') return 'hanzo';

  // Mythic
  if (n.startsWith('madara')) return 'madara';
  if (n.startsWith('kaguya')) return 'kaguya';
  if (n.startsWith('hagoromo')) return 'hagoromo';
  if (n.startsWith('hamura')) return 'hamura';
  if (n.startsWith('young hagoromo')) return 'hagoromo';
  if (n.startsWith('young hamura')) return 'hamura';
  if (n.startsWith('ashura')) return 'ashura';
  if (n.startsWith('indra')) return 'indra';
  if (n.startsWith('ashura and indra') || (s.includes('eternal brothers'))) return 'ashura-indra';
  if (n.startsWith('shin uchiha')) return 'shin-uchiha';

  // Cloud / Raikage
  if ((n === 'a' || n.startsWith('a raikage') || n.startsWith('fourth raikage')) || s.includes('fourth raikage')) return 'a-raikage';
  if (n.startsWith('third raikage') || s.includes('third raikage')) return 'third-raikage';
  if (n.startsWith('blue b') || s.includes('second raikage')) return 'blue-b';
  if (n.startsWith('killer b') || n.startsWith('killer bee')) return 'killer-bee';
  if (n === 'darui' || s.includes('storm release') && n === 'darui') return 'darui';
  if (n === 'darui') return 'darui';
  if (n.startsWith('darui')) return 'darui';
  if (n === 'c' || n === 'cee' || s.includes('medical sensor')) return 'c-sensor';
  if (n === 'samui') return 'samui';
  if (n.startsWith('samui and atsui')) return 'samui';
  if (n === 'atsui') return 'atsui';
  if (n === 'karui') return 'karui';
  if (n === 'omoi') return 'omoi';
  if (n === 'mabui') return 'mabui';
  if (n === 'dodai') return 'dodai';
  if (n === 'toroi') return 'toroi';

  // Jinchuriki
  if (n.startsWith('yugito')) return 'yugito';
  if (n === 'han') return 'han';
  if (n.startsWith('roshi') || n === 'rōshi') return 'roshi';
  if (n.startsWith('utakata')) return 'utakata';
  if (n === 'fu' || n === 'fū') return 'fu';
  if (n.startsWith('mito uzumaki')) return 'mito';
  if (n.startsWith('kushina')) return 'kushina';
  if (n.startsWith('yagura')) return 'yagura';

  // Sand
  if (n.startsWith('temari')) return 'temari';
  if (n.startsWith('kankuro') || n === 'kankurō') return 'kankuro';
  if (n === 'baki') return 'baki';
  if (n === 'chiyo') return 'chiyo';
  if (n === 'ebizo' || n === 'ebizō') return 'ebizo';
  if (n === 'rasa' || s.includes('fourth kazekage')) return 'rasa';
  if (n === 'pakura') return 'pakura';
  if (n === 'yashamaru') return 'yashamaru';
  if (n === 'matsuri') return 'matsuri';
  if (n === 'sari') return 'sari';
  if (n === 'yukata') return 'yukata';
  if (n === 'shira') return 'shira';
  if (s.includes('second kazekage')) return 'second-kazekage';
  if (s.includes('first kazekage')) return 'first-kazekage';
  if (s.includes('third kazekage') || n.startsWith('third kazekage')) return 'third-kazekage';
  if (s.includes('fifth kazekage student') || n.startsWith('fifth kazekage student') || n.startsWith('sand student') || n.startsWith('sand academy')) return '';

  // Mist
  if (n.startsWith('mei')) return 'mei';
  if (n.startsWith('chojuro') || n === 'chōjūrō') return 'chojuro';
  if (n === 'ao') return 'ao';
  if (n.startsWith('raiga')) return 'raiga';
  if (n.startsWith('ameyuri')) return 'ameyuri';
  if (n.startsWith('kushimaru')) return 'kushimaru';
  if (n.startsWith('jinin')) return 'jinin';
  if (n.startsWith('jinpachi')) return 'jinpachi';
  if (n.startsWith('suigetsu')) return 'suigetsu';

  // Stone
  if (n === 'onoki' || n === 'ōnoki') return 'onoki';
  if (n === 'mu' || n === 'mū') return 'mu';
  if (n === 'ishikawa') return 'ishikawa';
  if (n.startsWith('kurotsuchi')) return 'kurotsuchi';
  if (n === 'akatsuchi') return 'akatsuchi';
  if (n === 'kitsuchi') return 'kitsuchi';
  if (n === 'gari') return 'gari';
  if (n.startsWith('young deidara')) return 'young-deidara';

  // Sound
  if (n.startsWith('orochimaru')) return 'orochimaru';
  if (n.startsWith('kabuto')) return 'kabuto';
  if (n.startsWith('kimimaro')) return 'kimimaro';
  if (n.startsWith('sakon') || n.startsWith('sakon and ukon')) return 'sakon-ukon';
  if (n.startsWith('kidomaru') || n === 'kidōmaru') return 'kidomaru';
  if (n === 'jirobo' || n === 'jirōbō') return 'jirobo';
  if (n === 'tayuya') return 'tayuya';
  if (n.startsWith('dosu')) return 'dosu';
  if (n.startsWith('zaku')) return 'zaku';
  if (n.startsWith('kin ')) return 'kin';
  if (n === 'jugo' || n === 'jūgo') return 'jugo';
  if (n.startsWith('karin')) return 'karin';
  if (n.startsWith('yoroi')) return 'yoroi';
  if (n.startsWith('misumi')) return 'misumi';

  // Rain
  if (n.startsWith('sasame')) return 'sasame';
  if (n.startsWith('arashi')) return 'arashi';
  if (n.startsWith('jigumo')) return 'jigumo';
  if (n === 'oboro') return 'oboro';
  if (n === 'kagari') return 'kagari';
  if (n === 'mubi') return 'mubi';
  if (n === 'shigure') return 'shigure';

  // Tailed Beasts
  if (n.startsWith('shukaku')) return 'shukaku';
  if (n.startsWith('matatabi')) return 'matatabi';
  if (n.startsWith('isobu')) return 'isobu';
  if (n.startsWith('son goku') || n === 'son gokū') return 'son-goku';
  if (n.startsWith('kokuo') || n === 'kokuō') return 'kokuo';
  if (n.startsWith('saiken')) return 'saiken';
  if (n.startsWith('chomei') || n === 'chōmei') return 'chomei';
  if (n.startsWith('gyuki') || n === 'gyūki') return 'gyuki';
  if (n.startsWith('kurama')) return 'kurama';

  // Original roster (stage-aware)
  if (n.startsWith('naruto')) return 'naruto';
  if (n.startsWith('sasuke')) return 'sasuke';
  if (n.startsWith('sakura')) return 'sakura';
  if (n.startsWith('kakashi')) return 'kakashi';
  if (n.startsWith('rock lee')) return 'rock-lee';
  if (n.startsWith('neji')) return 'neji';
  if (n === 'tenten') return 'tenten';
  if (n.startsWith('shikamaru')) return 'shikamaru';
  if (n.startsWith('ino')) return 'ino';
  if (n.startsWith('choji')) return 'choji';
  if (n.startsWith('hinata')) return 'hinata';
  if (n.startsWith('kiba')) return 'kiba';
  if (n.startsWith('shino')) return 'shino';
  if (n.startsWith('minato')) return 'minato';
  if (n.startsWith('hashirama')) return 'hashirama';
  if (n.startsWith('tobirama')) return 'tobirama';
  if (n.startsWith('hiruzen')) return 'hiruzen';
  if (n.startsWith('gaara')) return 'gaara';
  if (n.startsWith('zabuza')) return 'zabuza';
  if (n === 'haku') return 'haku';
  if (n.startsWith('iruka')) return 'iruka';
  if (n.startsWith('konohamaru')) return 'konohamaru';
  if (n.startsWith('jiraiya')) return 'jiraiya';
  if (n.startsWith('tsunade')) return 'tsunade';
  if (n.startsWith('might guy')) return 'might-guy';
  if (n.startsWith('kurenai')) return 'kurenai';
  if (n.startsWith('asuma')) return 'asuma';

  return ''; // unknown — will fall back to silhouette
}

const STAGED_CHARACTERS = new Set([
  'naruto', 'sasuke', 'sakura', 'kakashi', 'rock-lee', 'shikamaru', 'gaara',
]);

function bestPhotoFor(key, stage, type) {
  if (!key) return null;
  if (type === 'sensei') {
    return SENSEI_FILES.has(`${key}.webp`) ? `cards/sensei/${key}.webp` : null;
  }
  // Stage-aware lookup for core Team 7 etc.
  if (STAGED_CHARACTERS.has(key)) {
    for (let s = Math.min(stage, 2); s >= 0; s--) {
      const file = `${key}-stage${s}.webp`;
      if (NINJA_FILES.has(file)) return `cards/ninja/${file}`;
    }
    // Try stage-less fallback
    if (NINJA_FILES.has(`${key}.webp`)) return `cards/ninja/${key}.webp`;
    return null;
  }
  // Flat key lookup
  return NINJA_FILES.has(`${key}.webp`) ? `cards/ninja/${key}.webp` : null;
}

function bestArtPath(card) {
  if (card.type !== 'ninja' && card.type !== 'sensei') return null;
  const key = resolveCharacterKey(card.name, card.subtitle ?? '');
  return bestPhotoFor(key, card.stage ?? 0, card.type);
}

function audit() {
  let touched = 0;
  let total = 0;
  const missing = [];
  const files = fs.readdirSync(CARDS_DIR).filter((f) => f.endsWith('.json')).sort();
  for (const file of files) {
    const full = path.join(CARDS_DIR, file);
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    let changed = false;
    for (const card of data.cards) {
      if (card.type !== 'ninja' && card.type !== 'sensei') continue;
      total++;
      const desired = bestArtPath(card);
      if (!desired) {
        missing.push(`${file}:${card.id} ${card.name} (${card.subtitle ?? ''})`);
        continue;
      }
      if (card.artPath !== desired) {
        card.artPath = desired;
        changed = true;
        touched++;
      }
    }
    if (changed) {
      fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n');
      console.log('updated', file);
    }
  }
  console.log(`\ndone — examined ${total} character cards, rewrote ${touched} artPaths.`);
  if (missing.length) {
    console.log(`\n${missing.length} cards still using silhouette fallback (no image available):`);
    missing.slice(0, 20).forEach((m) => console.log('  ' + m));
    if (missing.length > 20) console.log(`  ... and ${missing.length - 20} more`);
  }
}

audit();
