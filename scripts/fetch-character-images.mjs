#!/usr/bin/env node
/**
 * Fetches missing character images from the Naruto fandom wiki.
 * Strategy per character:
 *   1) Try direct File:<title>.png lookup
 *   2) Fall back to the character's page primary image (pageimages API)
 * Resizes to a standard 400x400 webp and drops them in public/assets/cards/.
 * Skips files that already exist so re-runs are idempotent.
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_NINJA = path.join(ROOT, 'public/assets/cards/ninja');
const OUT_SENSEI = path.join(ROOT, 'public/assets/cards/sensei');
const API = 'https://naruto.fandom.com/api.php';
const UA = 'Mozilla/5.0 (compatible; naruto-tcg-educational/1.0)';

// key = local filename stem; titles = page / file titles to try in order
const CHARACTERS = [
  // Akatsuki
  { key: 'itachi', titles: ['Itachi Uchiha'] },
  { key: 'nagato', titles: ['Nagato'] },
  { key: 'nagato-young', titles: ['Nagato'] },
  { key: 'pain-deva', titles: ['Deva Path', 'Yahiko'] },
  { key: 'pain-asura', titles: ['Asura Path'] },
  { key: 'pain-human', titles: ['Human Path'] },
  { key: 'pain-animal', titles: ['Animal Path'] },
  { key: 'pain-preta', titles: ['Preta Path'] },
  { key: 'pain-naraka', titles: ['Naraka Path'] },
  { key: 'obito', titles: ['Obito Uchiha'] },
  { key: 'kisame', titles: ['Kisame Hoshigaki'] },
  { key: 'deidara', titles: ['Deidara'] },
  { key: 'sasori', titles: ['Sasori'] },
  { key: 'konan', titles: ['Konan'] },
  { key: 'konan-young', titles: ['Konan'] },
  { key: 'hidan', titles: ['Hidan'] },
  { key: 'kakuzu', titles: ['Kakuzu'] },
  { key: 'white-zetsu', titles: ['White Zetsu', 'Zetsu'] },
  { key: 'black-zetsu', titles: ['Black Zetsu'] },
  { key: 'yahiko', titles: ['Yahiko'] },
  { key: 'hanzo', titles: ['Hanzō'] },
  // Mythic
  { key: 'madara', titles: ['Madara Uchiha'] },
  { key: 'kaguya', titles: ['Kaguya Ōtsutsuki'] },
  { key: 'hagoromo', titles: ['Hagoromo Ōtsutsuki'] },
  { key: 'hamura', titles: ['Hamura Ōtsutsuki'] },
  { key: 'ashura', titles: ['Asura Ōtsutsuki'] },
  { key: 'indra', titles: ['Indra Ōtsutsuki'] },
  { key: 'shin-uchiha', titles: ['Shin Uchiha'] },
  // Cloud
  { key: 'a-raikage', titles: ['A (Fourth Raikage)'] },
  { key: 'third-raikage', titles: ['A (Third Raikage)'] },
  { key: 'blue-b', titles: ['B (Second Raikage)'] },
  { key: 'killer-bee', titles: ['Killer B'] },
  { key: 'darui', titles: ['Darui'] },
  { key: 'c-sensor', titles: ['C'] },
  { key: 'samui', titles: ['Samui'] },
  { key: 'atsui', titles: ['Atsui'] },
  { key: 'karui', titles: ['Karui'] },
  { key: 'omoi', titles: ['Omoi'] },
  { key: 'mabui', titles: ['Mabui'] },
  { key: 'cee', titles: ['C (medical-nin)'] },
  { key: 'dodai', titles: ['Dodai'] },
  { key: 'toroi', titles: ['Toroi'] },
  { key: 'kumo-anbu', titles: ['Kumogakure Anbu'] },
  // Jinchuriki
  { key: 'yugito', titles: ['Yugito Nii'] },
  { key: 'han', titles: ['Han'] },
  { key: 'roshi', titles: ['Rōshi'] },
  { key: 'utakata', titles: ['Utakata'] },
  { key: 'fu', titles: ['Fū'] },
  { key: 'mito', titles: ['Mito Uzumaki'] },
  { key: 'kushina', titles: ['Kushina Uzumaki'] },
  { key: 'yagura', titles: ['Yagura Karatachi'] },
  // Sand
  { key: 'temari', titles: ['Temari'] },
  { key: 'kankuro', titles: ['Kankurō'] },
  { key: 'baki', titles: ['Baki'] },
  { key: 'chiyo', titles: ['Chiyo'] },
  { key: 'ebizo', titles: ['Ebizō'] },
  { key: 'rasa', titles: ['Rasa'] },
  { key: 'pakura', titles: ['Pakura'] },
  { key: 'yashamaru', titles: ['Yashamaru'] },
  { key: 'matsuri', titles: ['Matsuri'] },
  { key: 'sari', titles: ['Sari'] },
  { key: 'yukata', titles: ['Yukata'] },
  { key: 'shira', titles: ['Shira'] },
  { key: 'second-kazekage', titles: ['Shamon', 'Second Kazekage'] },
  { key: 'first-kazekage', titles: ['Reto', 'First Kazekage'] },
  { key: 'third-kazekage', titles: ['Third Kazekage'] },
  // Mist
  { key: 'mei', titles: ['Mei Terumī'] },
  { key: 'chojuro', titles: ['Chōjūrō'] },
  { key: 'ao', titles: ['Ao'] },
  { key: 'raiga', titles: ['Raiga Kurosuki'] },
  { key: 'ameyuri', titles: ['Ameyuri Ringo'] },
  { key: 'kushimaru', titles: ['Kushimaru Kuriarare'] },
  { key: 'jinin', titles: ['Jinin Akebino'] },
  { key: 'jinpachi', titles: ['Jinpachi Munashi'] },
  { key: 'suigetsu', titles: ['Suigetsu Hōzuki'] },
  // Stone
  { key: 'onoki', titles: ['Ōnoki'] },
  { key: 'mu', titles: ['Mū'] },
  { key: 'ishikawa', titles: ['Ishikawa'] },
  { key: 'kurotsuchi', titles: ['Kurotsuchi'] },
  { key: 'akatsuchi', titles: ['Akatsuchi'] },
  { key: 'kitsuchi', titles: ['Kitsuchi'] },
  { key: 'gari', titles: ['Gari'] },
  { key: 'young-deidara', titles: ['Deidara'] },
  // Sound
  { key: 'sakon-ukon', titles: ['Sakon and Ukon'] },
  { key: 'kidomaru', titles: ['Kidōmaru'] },
  { key: 'jirobo', titles: ['Jirōbō'] },
  { key: 'tayuya', titles: ['Tayuya'] },
  { key: 'dosu', titles: ['Dosu Kinuta'] },
  { key: 'zaku', titles: ['Zaku Abumi'] },
  { key: 'kin', titles: ['Kin Tsuchi'] },
  { key: 'jugo', titles: ['Jūgo'] },
  { key: 'karin', titles: ['Karin Uzumaki'] },
  { key: 'yoroi', titles: ['Yoroi Akadō'] },
  { key: 'misumi', titles: ['Misumi Tsurugi'] },
  // Rain
  { key: 'sasame', titles: ['Sasame Fūma'] },
  { key: 'arashi', titles: ['Arashi Fūma'] },
  { key: 'oboro', titles: ['Oboro'] },
  { key: 'kagari', titles: ['Kagari'] },
  { key: 'mubi', titles: ['Mubi'] },
  { key: 'shigure', titles: ['Shigure'] },
  // Tailed Beasts
  { key: 'shukaku', titles: ['Shukaku'] },
  { key: 'matatabi', titles: ['Matatabi'] },
  { key: 'isobu', titles: ['Isobu'] },
  { key: 'son-goku', titles: ['Son Gokū'] },
  { key: 'kokuo', titles: ['Kokuō'] },
  { key: 'saiken', titles: ['Saiken'] },
  { key: 'chomei', titles: ['Chōmei'] },
  { key: 'gyuki', titles: ['Gyūki'] },
  { key: 'kurama', titles: ['Kurama'] },
  { key: 'juubi', titles: ['Ten-Tails'] },
  { key: 'gedo-mazo', titles: ['Demonic Statue of the Outer Path'] },
  // Newly added Konoha cast
  { key: 'yamato', titles: ['Yamato'] },
  { key: 'sai', titles: ['Sai'] },
  { key: 'shizune', titles: ['Shizune'] },
  { key: 'anko', titles: ['Anko Mitarashi'] },
  { key: 'ibiki', titles: ['Ibiki Morino'] },
  { key: 'genma', titles: ['Genma Shiranui'] },
  { key: 'shisui-stage0', titles: ['Shisui Uchiha'] },
  { key: 'shisui-stage1', titles: ['Shisui Uchiha'] },
  { key: 'danzo', titles: ['Danzō Shimura', 'Danzō'] },
  { key: 'mizuki', titles: ['Mizuki'] },
  // Evolved Hyūga forms
  { key: 'hinata-stage1', titles: ['Hinata Hyūga'] },
  { key: 'neji-stage1', titles: ['Neji Hyūga'] },
];

const SENSEI_CHARACTERS = [
  { key: 'a-raikage', titles: ['A (Fourth Raikage)'] },
  { key: 'darui', titles: ['Darui'] },
  { key: 'killer-bee', titles: ['Killer B'] },
  { key: 'mabui', titles: ['Mabui'] },
  { key: 'third-raikage', titles: ['A (Third Raikage)'] },
  { key: 'c-sensor', titles: ['C'] },
  { key: 'onoki', titles: ['Ōnoki'] },
  { key: 'kurotsuchi', titles: ['Kurotsuchi'] },
  { key: 'mu', titles: ['Mū'] },
  { key: 'kitsuchi', titles: ['Kitsuchi'] },
  { key: 'iwa-elder', titles: ['Yūra'] },
  { key: 'orochimaru', titles: ['Orochimaru'] },
  { key: 'kabuto', titles: ['Kabuto Yakushi'] },
  { key: 'kimimaro', titles: ['Kimimaro'] },
  { key: 'sound-elder', titles: ['Orochimaru'] },
  { key: 'taka-leader', titles: ['Sasuke Uchiha'] },
  { key: 'pain', titles: ['Pain'] },
  { key: 'konan', titles: ['Konan'] },
  { key: 'itachi', titles: ['Itachi Uchiha'] },
  { key: 'kisame', titles: ['Kisame Hoshigaki'] },
  { key: 'sasori', titles: ['Sasori'] },
  { key: 'obito', titles: ['Obito Uchiha'] },
  { key: 'nagato', titles: ['Nagato'] },
  { key: 'yahiko', titles: ['Yahiko'] },
  { key: 'hanzo', titles: ['Hanzō'] },
  { key: 'mei', titles: ['Mei Terumī'] },
  { key: 'zabuza', titles: ['Zabuza Momochi'] },
  { key: 'ao', titles: ['Ao'] },
  { key: 'yagura', titles: ['Yagura Karatachi'] },
  { key: 'chiyo', titles: ['Chiyo'] },
  { key: 'baki', titles: ['Baki'] },
  { key: 'rasa', titles: ['Rasa'] },
  { key: 'hagoromo', titles: ['Hagoromo Ōtsutsuki'] },
  { key: 'kaguya', titles: ['Kaguya Ōtsutsuki'] },
  { key: 'madara', titles: ['Madara Uchiha'] },
  { key: 'hamura', titles: ['Hamura Ōtsutsuki'] },
  { key: 'ashura-indra', titles: ['Asura Ōtsutsuki'] },
];

fs.mkdirSync(OUT_NINJA, { recursive: true });
fs.mkdirSync(OUT_SENSEI, { recursive: true });

function apiUrl(params) {
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${API}?${qs}`;
}

async function apiGet(params) {
  const resp = await fetch(apiUrl(params), { headers: { 'User-Agent': UA } });
  if (!resp.ok) return null;
  try { return await resp.json(); } catch { return null; }
}

async function findImageByFileTitle(title) {
  const data = await apiGet({ action: 'query', titles: `File:${title}.png`, prop: 'imageinfo', iiprop: 'url', format: 'json' });
  if (!data) return null;
  const pages = Object.values(data.query?.pages || {});
  for (const p of pages) {
    if (p.missing !== undefined) continue;
    const info = p.imageinfo?.[0];
    if (info?.url) return info.url.split('/revision')[0];
  }
  return null;
}

async function findImageByPageTitle(title) {
  const data = await apiGet({ action: 'query', titles: title, prop: 'pageimages', piprop: 'original', format: 'json' });
  if (!data) return null;
  const pages = Object.values(data.query?.pages || {});
  for (const p of pages) {
    if (p.original?.source) return p.original.source.split('/revision')[0];
  }
  return null;
}

async function findImage(title) {
  return (await findImageByFileTitle(title)) || (await findImageByPageTitle(title));
}

async function downloadAndResize(url, outPath) {
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const buf = Buffer.from(await resp.arrayBuffer());
  await sharp(buf)
    .resize(400, 400, { fit: 'cover', position: 'top' })
    .webp({ quality: 82 })
    .toFile(outPath);
}

async function fetchOne(entry, outDir) {
  const outPath = path.join(outDir, `${entry.key}.webp`);
  if (fs.existsSync(outPath)) return { status: 'skip' };
  for (const title of entry.titles) {
    try {
      const url = await findImage(title);
      if (url) {
        await downloadAndResize(url, outPath);
        return { status: 'ok', title };
      }
    } catch {
      /* keep trying */
    }
  }
  return { status: 'fail' };
}

async function run() {
  let ok = 0, fail = 0, skip = 0;
  const failures = [];
  for (const entry of CHARACTERS) {
    const r = await fetchOne(entry, OUT_NINJA);
    if (r.status === 'ok') { ok++; console.log('✓ ninja', entry.key, '←', r.title); }
    else if (r.status === 'skip') skip++;
    else { fail++; failures.push('ninja ' + entry.key); }
    await new Promise((r) => setTimeout(r, 150));
  }
  for (const entry of SENSEI_CHARACTERS) {
    const r = await fetchOne(entry, OUT_SENSEI);
    if (r.status === 'ok') { ok++; console.log('✓ sensei', entry.key, '←', r.title); }
    else if (r.status === 'skip') skip++;
    else { fail++; failures.push('sensei ' + entry.key); }
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log(`\ndone — ok=${ok} skip=${skip} fail=${fail}`);
  if (failures.length) console.log('failures:', failures.join(', '));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
