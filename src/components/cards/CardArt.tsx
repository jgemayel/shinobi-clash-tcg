'use client';

import { useState, useEffect } from 'react';
import { asset } from '@/lib/basePath';

interface CardArtProps {
  cardName: string;
  cardType: string;
  chakraType?: string;
  stage?: number;
  artPath?: string;
}

const S = '#f5d0a9'; // standard skin
const SP = '#f0dcc8'; // pale skin

function Face({ skin = S }: { skin?: string }) {
  return (
    <>
      <ellipse cx="50" cy="52" rx="18" ry="21" fill={skin} />
      <ellipse cx="32" cy="52" rx="3" ry="5" fill={skin} />
      <ellipse cx="68" cy="52" rx="3" ry="5" fill={skin} />
    </>
  );
}

function Eyes({ color = '#333', byakugan, sharingan }: { color?: string; byakugan?: boolean; sharingan?: boolean }) {
  if (byakugan) return (
    <>
      <ellipse cx="42" cy="50" rx="4" ry="3.5" fill="white" stroke="#c4b5fd" strokeWidth="0.5" />
      <circle cx="42" cy="50" r="2" fill="#ddd6fe" />
      <ellipse cx="58" cy="50" rx="4" ry="3.5" fill="white" stroke="#c4b5fd" strokeWidth="0.5" />
      <circle cx="58" cy="50" r="2" fill="#ddd6fe" />
    </>
  );
  if (sharingan) return (
    <>
      <ellipse cx="42" cy="50" rx="4" ry="3.5" fill="white" />
      <circle cx="42" cy="50" r="2.8" fill="#dc2626" />
      <circle cx="42" cy="50" r="1" fill="#111" />
      <circle cx="41" cy="48.5" r="0.6" fill="#111" />
      <circle cx="43.2" cy="49" r="0.6" fill="#111" />
      <ellipse cx="58" cy="50" rx="4" ry="3.5" fill="white" />
      <circle cx="58" cy="50" r="2.8" fill="#dc2626" />
      <circle cx="58" cy="50" r="1" fill="#111" />
      <circle cx="57" cy="48.5" r="0.6" fill="#111" />
      <circle cx="59.2" cy="49" r="0.6" fill="#111" />
    </>
  );
  return (
    <>
      <ellipse cx="42" cy="50" rx="4" ry="3.5" fill="white" />
      <circle cx="42.5" cy="50" r="2.5" fill={color} />
      <circle cx="42.8" cy="49.8" r="1.2" fill="#111" />
      <circle cx="43.4" cy="49.2" r="0.4" fill="white" />
      <ellipse cx="58" cy="50" rx="4" ry="3.5" fill="white" />
      <circle cx="57.5" cy="50" r="2.5" fill={color} />
      <circle cx="57.2" cy="49.8" r="1.2" fill="#111" />
      <circle cx="56.6" cy="49.2" r="0.4" fill="white" />
    </>
  );
}

function Mouth() {
  return <path d="M46,59 Q50,62 54,59" fill="none" stroke="#c4956a" strokeWidth="1" />;
}

function Headband({ y = 35, color = '#3b82f6' }: { y?: number; color?: string }) {
  return (
    <>
      <rect x="30" y={y} width="40" height="5" rx="2" fill={color} />
      <rect x="44" y={y - 1} width="12" height="7" rx="1" fill="#9ca3af" />
      <path d={`M45,${y + 2} L49,${y} L55,${y + 2} L51,${y + 4} Z`} fill="#d1d5db" />
    </>
  );
}

function Whiskers() {
  return (
    <>
      <line x1="26" y1="53" x2="36" y2="54" stroke="#c4956a" strokeWidth="0.8" />
      <line x1="26" y1="56" x2="36" y2="56" stroke="#c4956a" strokeWidth="0.8" />
      <line x1="26" y1="59" x2="36" y2="58" stroke="#c4956a" strokeWidth="0.8" />
      <line x1="64" y1="54" x2="74" y2="53" stroke="#c4956a" strokeWidth="0.8" />
      <line x1="64" y1="56" x2="74" y2="56" stroke="#c4956a" strokeWidth="0.8" />
      <line x1="64" y1="58" x2="74" y2="59" stroke="#c4956a" strokeWidth="0.8" />
    </>
  );
}

function Outfit({ color }: { color: string }) {
  return <path d="M26,72 Q50,68 74,72 L80,100 L20,100 Z" fill={color} />;
}

function Neck({ skin = S }: { skin?: string }) {
  return <rect x="44" y="70" width="12" height="10" rx="3" fill={skin} />;
}

// ========= NINJA CHARACTERS =========

function Naruto({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color="#f97316" />
      {/* Spiky golden hair */}
      <polygon points="50,12 44,34 56,34" fill="#fbbf24" />
      <polygon points="38,16 30,36 44,36" fill="#fbbf24" />
      <polygon points="62,16 70,36 56,36" fill="#fbbf24" />
      <polygon points="28,22 22,40 36,38" fill="#f59e0b" />
      <polygon points="72,22 78,40 64,38" fill="#f59e0b" />
      <polygon points="34,14 26,30 40,32" fill="#fbbf24" />
      <polygon points="66,14 74,30 60,32" fill="#fbbf24" />
      <ellipse cx="50" cy="38" rx="20" ry="8" fill="#fbbf24" />
      <Neck />
      <Face />
      <Headband color="#3b82f6" />
      <Whiskers />
      <Eyes color="#3b82f6" />
      <Mouth />
      {stage >= 2 && (
        <>
          <ellipse cx="38" cy="48" rx="8" ry="5" fill="#f97316" opacity="0.3" />
          <ellipse cx="62" cy="48" rx="8" ry="5" fill="#f97316" opacity="0.3" />
        </>
      )}
      {/* Collar */}
      <path d="M38,72 L50,68 L62,72" fill="none" stroke="#1d4ed8" strokeWidth="2" />
    </>
  );
}

function Sasuke({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color="#1e293b" />
      {/* Dark spiky hair */}
      <polygon points="50,14 42,35 58,35" fill="#1e293b" />
      <polygon points="60,10 72,32 56,34" fill="#1e293b" />
      <polygon points="68,14 80,28 64,32" fill="#0f172a" />
      <polygon points="40,18 28,34 44,36" fill="#1e293b" />
      <polygon points="32,20 22,34 38,35" fill="#0f172a" />
      <ellipse cx="50" cy="36" rx="20" ry="8" fill="#1e293b" />
      <Neck />
      <Face />
      <Headband color="#3b82f6" />
      <Eyes color="#1e293b" sharingan={stage >= 2} />
      <Mouth />
      {/* High collar */}
      <path d="M32,72 L32,62 Q50,58 68,62 L68,72" fill="none" stroke="#334155" strokeWidth="2" />
    </>
  );
}

function Sakura({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color="#ec4899" />
      {/* Pink short hair */}
      <ellipse cx="50" cy="40" rx="24" ry="20" fill="#f472b6" />
      <ellipse cx="36" cy="48" rx="8" ry="14" fill="#f472b6" />
      <ellipse cx="64" cy="48" rx="8" ry="14" fill="#f472b6" />
      <Neck />
      <Face />
      <Headband y={30} color="#dc2626" />
      <Eyes color="#22c55e" />
      <Mouth />
      {stage >= 2 && (
        <polygon points="50,34 47,38 50,42 53,38" fill="#8b5cf6" />
      )}
    </>
  );
}

function Kakashi({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color="#1e293b" />
      {/* Silver tall spiky hair */}
      <polygon points="42,5 36,32 48,32" fill="#cbd5e1" />
      <polygon points="50,8 44,30 56,30" fill="#e2e8f0" />
      <polygon points="38,10 28,28 44,30" fill="#cbd5e1" />
      <polygon points="56,12 66,28 50,30" fill="#e2e8f0" />
      <polygon points="32,15 20,32 38,32" fill="#94a3b8" />
      <ellipse cx="50" cy="35" rx="20" ry="8" fill="#cbd5e1" />
      <Neck skin="#475569" />
      <Face />
      {/* Mask */}
      <rect x="32" y="54" width="36" height="20" rx="8" fill="#475569" />
      {/* Tilted headband over left eye */}
      <rect x="28" y="37" width="44" height="5" rx="2" fill="#3b82f6" transform="rotate(-8, 50, 39)" />
      <rect x="44" y="36" width="12" height="7" rx="1" fill="#9ca3af" transform="rotate(-8, 50, 39)" />
      {/* Only right eye visible */}
      <ellipse cx="58" cy="48" rx="4" ry="3.5" fill="white" />
      <circle cx="57.5" cy="48" r="2.5" fill="#1e293b" />
      <circle cx="57.2" cy="47.8" r="1.2" fill="#111" />
      {stage >= 2 && (
        <>
          <ellipse cx="42" cy="48" rx="4" ry="3.5" fill="white" />
          <circle cx="42" cy="48" r="2.8" fill="#dc2626" />
          <circle cx="42" cy="48" r="1" fill="#111" />
        </>
      )}
    </>
  );
}

function RockLee({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color="#16a34a" />
      {/* Bowl cut */}
      <ellipse cx="50" cy="38" rx="24" ry="16" fill="#1a1a2e" />
      <rect x="26" y="38" width="48" height="8" rx="4" fill="#1a1a2e" />
      <Neck />
      <Face />
      {/* THICK eyebrows - signature */}
      <ellipse cx="42" cy="44" rx="6" ry="2.5" fill="#1a1a2e" />
      <ellipse cx="58" cy="44" rx="6" ry="2.5" fill="#1a1a2e" />
      <Eyes color="#1a1a2e" />
      <Mouth />
      {stage >= 1 && (
        <ellipse cx="50" cy="50" rx="30" ry="35" fill="#dc2626" opacity="0.15" />
      )}
    </>
  );
}

function Neji() {
  return (
    <>
      <Outfit color="#f5f5f4" />
      {/* Long brown hair */}
      <ellipse cx="50" cy="40" rx="24" ry="18" fill="#78350f" />
      <ellipse cx="36" cy="55" rx="10" ry="20" fill="#78350f" />
      <ellipse cx="64" cy="55" rx="10" ry="20" fill="#78350f" />
      <ellipse cx="50" cy="80" rx="14" ry="10" fill="#92400e" />
      <Neck />
      <Face />
      <Headband />
      <Eyes byakugan />
      <Mouth />
    </>
  );
}

function Tenten() {
  return (
    <>
      <Outfit color="#ec4899" />
      {/* Brown hair with two buns */}
      <ellipse cx="50" cy="42" rx="22" ry="14" fill="#92400e" />
      <circle cx="34" cy="28" r="10" fill="#78350f" />
      <circle cx="66" cy="28" r="10" fill="#78350f" />
      <circle cx="34" cy="28" r="7" fill="#92400e" />
      <circle cx="66" cy="28" r="7" fill="#92400e" />
      <Neck />
      <Face />
      <Headband />
      <Eyes color="#78350f" />
      <Mouth />
    </>
  );
}

function Shikamaru({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color={stage >= 1 ? '#4b5563' : '#6b7280'} />
      {/* Pineapple ponytail */}
      <ellipse cx="50" cy="40" rx="22" ry="14" fill="#3f3f46" />
      <polygon points="42,20 38,8 50,5 62,8 58,20" fill="#3f3f46" />
      <polygon points="44,10 42,2 50,0 58,2 56,10" fill="#27272a" />
      <Neck />
      <Face />
      <Headband />
      {/* Lazy/droopy eyes */}
      <line x1="38" y1="49" x2="46" y2="50" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="50" x2="62" y2="49" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="42" cy="50" r="1.5" fill="#333" />
      <circle cx="58" cy="50" r="1.5" fill="#333" />
      <Mouth />
    </>
  );
}

function Ino() {
  return (
    <>
      <Outfit color="#7c3aed" />
      {/* Long blonde ponytail to the side */}
      <ellipse cx="50" cy="40" rx="22" ry="16" fill="#fde047" />
      <ellipse cx="68" cy="55" rx="10" ry="22" fill="#fbbf24" />
      <ellipse cx="72" cy="70" rx="8" ry="14" fill="#fbbf24" />
      {/* Bangs covering right eye */}
      <path d="M32,36 Q40,28 55,36 L55,48 Q40,44 32,48 Z" fill="#fde047" />
      <Neck />
      <Face />
      <Eyes color="#60a5fa" />
      <Mouth />
    </>
  );
}

function Choji() {
  return (
    <>
      <Outfit color="#dc2626" />
      {/* Wider round face + brown spiky hair */}
      <ellipse cx="50" cy="40" rx="22" ry="14" fill="#78350f" />
      <polygon points="40,28 36,20 46,30" fill="#78350f" />
      <polygon points="60,28 64,20 54,30" fill="#78350f" />
      <polygon points="50,26 48,18 52,18" fill="#92400e" />
      <Neck />
      <ellipse cx="50" cy="54" rx="22" ry="24" fill={S} />
      <ellipse cx="32" cy="54" rx="3" ry="5" fill={S} />
      <ellipse cx="68" cy="54" rx="3" ry="5" fill={S} />
      <Headband />
      {/* Swirl marks */}
      <circle cx="36" cy="58" r="4" fill="none" stroke="#f87171" strokeWidth="1.5" />
      <path d="M36,58 Q38,56 36,54" fill="none" stroke="#f87171" strokeWidth="1" />
      <circle cx="64" cy="58" r="4" fill="none" stroke="#f87171" strokeWidth="1.5" />
      <path d="M64,58 Q66,56 64,54" fill="none" stroke="#f87171" strokeWidth="1" />
      <Eyes color="#333" />
      <Mouth />
      {/* Scarf */}
      <path d="M34,72 Q50,68 66,72 Q50,76 34,72" fill="#fafaf9" />
    </>
  );
}

function Hinata() {
  return (
    <>
      <Outfit color="#c7d2fe" />
      {/* Dark blue/indigo short hair */}
      <ellipse cx="50" cy="40" rx="24" ry="18" fill="#312e81" />
      <ellipse cx="36" cy="50" rx="10" ry="16" fill="#312e81" />
      <ellipse cx="64" cy="50" rx="10" ry="16" fill="#312e81" />
      {/* Front fringe */}
      <path d="M32,38 Q42,32 50,38 Q58,32 68,38" fill="#3730a3" />
      <Neck />
      <Face />
      <Eyes byakugan />
      <Mouth />
      {/* Blush */}
      <ellipse cx="38" cy="56" rx="4" ry="2" fill="#fca5a5" opacity="0.5" />
      <ellipse cx="62" cy="56" rx="4" ry="2" fill="#fca5a5" opacity="0.5" />
    </>
  );
}

function Kiba() {
  return (
    <>
      <Outfit color="#6b7280" />
      {/* Wild spiky brown hair */}
      <polygon points="50,12 44,32 56,32" fill="#78350f" />
      <polygon points="36,16 26,34 42,34" fill="#78350f" />
      <polygon points="64,16 74,34 58,34" fill="#78350f" />
      <polygon points="28,24 18,38 36,36" fill="#92400e" />
      <polygon points="72,24 82,38 64,36" fill="#92400e" />
      <ellipse cx="50" cy="36" rx="20" ry="8" fill="#78350f" />
      <Neck />
      <Face />
      <Headband />
      <Eyes color="#1e293b" />
      <Mouth />
      {/* Red fang marks */}
      <polygon points="36,48 34,58 38,58" fill="#dc2626" />
      <polygon points="64,48 62,58 66,58" fill="#dc2626" />
    </>
  );
}

function Shino() {
  return (
    <>
      {/* High collar outfit */}
      <path d="M26,72 L26,48 Q50,42 74,48 L74,72 Q50,68 26,72" fill="#4b5563" />
      <Outfit color="#374151" />
      {/* Dark spiky hair */}
      <ellipse cx="50" cy="36" rx="22" ry="14" fill="#1e293b" />
      <polygon points="40,26 36,16 48,28" fill="#1e293b" />
      <polygon points="60,26 64,16 52,28" fill="#1e293b" />
      <Neck />
      <Face />
      {/* Round dark glasses - signature */}
      <circle cx="42" cy="50" r="7" fill="#1e293b" stroke="#4b5563" strokeWidth="1" />
      <circle cx="58" cy="50" r="7" fill="#1e293b" stroke="#4b5563" strokeWidth="1" />
      <line x1="49" y1="50" x2="51" y2="50" stroke="#4b5563" strokeWidth="1" />
    </>
  );
}

function Minato({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color={stage >= 1 ? '#fafaf9' : '#3b82f6'} />
      {stage >= 1 && (
        <path d="M20,90 L20,100 L80,100 L80,90" fill="#dc2626" />
      )}
      {/* Spiky golden hair (like Naruto, more refined) */}
      <polygon points="50,10 44,32 56,32" fill="#fbbf24" />
      <polygon points="40,14 30,34 46,34" fill="#fbbf24" />
      <polygon points="60,14 70,34 54,34" fill="#fbbf24" />
      <polygon points="32,20 22,36 40,36" fill="#f59e0b" />
      <polygon points="68,20 78,36 60,36" fill="#f59e0b" />
      <polygon points="26,28 18,40 34,38" fill="#fbbf24" />
      <polygon points="74,28 82,40 66,38" fill="#fbbf24" />
      <ellipse cx="50" cy="36" rx="22" ry="8" fill="#fbbf24" />
      <Neck />
      <Face />
      <Headband />
      <Eyes color="#3b82f6" />
      <Mouth />
    </>
  );
}

function Hashirama() {
  return (
    <>
      <Outfit color="#991b1b" />
      {/* Very long dark brown hair */}
      <ellipse cx="50" cy="40" rx="26" ry="20" fill="#3f2305" />
      <ellipse cx="30" cy="58" rx="12" ry="24" fill="#3f2305" />
      <ellipse cx="70" cy="58" rx="12" ry="24" fill="#3f2305" />
      <ellipse cx="38" cy="82" rx="10" ry="12" fill="#3f2305" />
      <ellipse cx="62" cy="82" rx="10" ry="12" fill="#3f2305" />
      <Neck />
      <Face />
      <Eyes color="#78350f" />
      <Mouth />
      {/* Red armor hint */}
      <rect x="38" y="72" width="24" height="6" rx="2" fill="#b91c1c" />
    </>
  );
}

function Tobirama() {
  return (
    <>
      <Outfit color="#1e40af" />
      {/* White/silver short spiky hair */}
      <ellipse cx="50" cy="36" rx="22" ry="14" fill="#e2e8f0" />
      <polygon points="42,24 38,14 50,26" fill="#e2e8f0" />
      <polygon points="58,24 62,14 50,26" fill="#cbd5e1" />
      <polygon points="34,28 28,18 42,30" fill="#cbd5e1" />
      <Neck />
      <Face />
      {/* Red face marks */}
      <line x1="28" y1="48" x2="38" y2="50" stroke="#dc2626" strokeWidth="2" />
      <line x1="28" y1="54" x2="36" y2="54" stroke="#dc2626" strokeWidth="2" />
      <line x1="62" y1="50" x2="72" y2="48" stroke="#dc2626" strokeWidth="2" />
      <line x1="64" y1="54" x2="72" y2="54" stroke="#dc2626" strokeWidth="2" />
      <Eyes color="#dc2626" />
      <Mouth />
      <rect x="30" y="34" width="40" height="4" rx="2" fill="#1e40af" />
    </>
  );
}

function Hiruzen() {
  return (
    <>
      <Outfit color="#78350f" />
      {/* Hokage hat/helmet */}
      <polygon points="20,30 50,14 80,30 75,38 25,38" fill="#fafaf9" />
      <rect x="25" y="36" width="50" height="6" rx="2" fill="#dc2626" />
      {/* Gray hair peeking */}
      <ellipse cx="50" cy="40" rx="18" ry="8" fill="#9ca3af" />
      <Neck skin="#d4a574" />
      <Face skin="#d4a574" />
      {/* Goatee */}
      <path d="M46,62 Q50,68 54,62" fill="#9ca3af" />
      <Eyes color="#78350f" />
      <path d="M46,58 Q50,60 54,58" fill="none" stroke="#a16207" strokeWidth="0.8" />
    </>
  );
}

function Gaara({ stage = 0 }: { stage?: number }) {
  return (
    <>
      <Outfit color="#78350f" />
      {/* Short messy red hair */}
      <ellipse cx="50" cy="36" rx="24" ry="16" fill="#dc2626" />
      <polygon points="36,28 30,18 44,30" fill="#dc2626" />
      <polygon points="56,26 62,14 52,28" fill="#b91c1c" />
      <polygon points="64,28 72,20 58,30" fill="#dc2626" />
      <polygon points="42,24 38,12 48,26" fill="#b91c1c" />
      <Neck skin={SP} />
      <Face skin={SP} />
      {/* Dark circles around eyes */}
      <ellipse cx="42" cy="50" rx="7" ry="5" fill="#1e293b" opacity="0.4" />
      <ellipse cx="58" cy="50" rx="7" ry="5" fill="#1e293b" opacity="0.4" />
      <Eyes color="#60a5fa" />
      <Mouth />
      {/* Love kanji on forehead */}
      <text x="37" y="40" fill="#dc2626" fontSize="10" fontWeight="bold">愛</text>
      {stage >= 1 && (
        <polygon points="46,8 50,2 54,8 52,8 50,4 48,8" fill="#fbbf24" />
      )}
      {/* Gourd hint */}
      <ellipse cx="74" cy="65" rx="6" ry="10" fill="#a16207" opacity="0.6" />
    </>
  );
}

function Orochimaru() {
  return (
    <>
      <Outfit color="#4c1d95" />
      {/* Long straight black hair */}
      <ellipse cx="50" cy="40" rx="24" ry="18" fill="#1a1a2e" />
      <ellipse cx="32" cy="55" rx="10" ry="24" fill="#1a1a2e" />
      <ellipse cx="68" cy="55" rx="10" ry="24" fill="#1a1a2e" />
      <ellipse cx="36" cy="80" rx="8" ry="10" fill="#0f0f23" />
      <ellipse cx="64" cy="80" rx="8" ry="10" fill="#0f0f23" />
      <Neck skin={SP} />
      <Face skin={SP} />
      {/* Snake eyes */}
      <ellipse cx="42" cy="50" rx="4" ry="3.5" fill="#fde047" />
      <ellipse cx="42" cy="50" rx="1" ry="3" fill="#111" />
      <ellipse cx="58" cy="50" rx="4" ry="3.5" fill="#fde047" />
      <ellipse cx="58" cy="50" rx="1" ry="3" fill="#111" />
      {/* Purple marks around eyes */}
      <path d="M36,46 Q34,50 36,54" fill="none" stroke="#7c3aed" strokeWidth="2" />
      <path d="M64,46 Q66,50 64,54" fill="none" stroke="#7c3aed" strokeWidth="2" />
      <path d="M44,60 Q50,64 56,60" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
    </>
  );
}

function Kabuto() {
  return (
    <>
      <Outfit color="#7c3aed" />
      {/* Gray/silver medium hair in ponytail */}
      <ellipse cx="50" cy="38" rx="22" ry="14" fill="#9ca3af" />
      <ellipse cx="60" cy="60" rx="8" ry="14" fill="#9ca3af" />
      <Neck />
      <Face />
      {/* Round glasses */}
      <circle cx="42" cy="50" r="6" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx="58" cy="50" r="6" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
      <line x1="48" y1="50" x2="52" y2="50" stroke="#e2e8f0" strokeWidth="1" />
      <circle cx="42" cy="50" r="5" fill="rgba(200,220,255,0.2)" />
      <circle cx="58" cy="50" r="5" fill="rgba(200,220,255,0.2)" />
      <Eyes color="#333" />
      <Mouth />
    </>
  );
}

function Zabuza() {
  return (
    <>
      <Outfit color="#374151" />
      {/* Short dark spiky hair */}
      <ellipse cx="50" cy="36" rx="22" ry="12" fill="#1e293b" />
      <polygon points="40,28 36,18 48,30" fill="#1e293b" />
      <polygon points="60,28 64,18 52,30" fill="#1e293b" />
      <Neck />
      <Face />
      {/* Bandage mask on lower face */}
      <rect x="30" y="54" width="40" height="18" rx="4" fill="#e5e7eb" />
      <line x1="30" y1="58" x2="70" y2="58" stroke="#d1d5db" strokeWidth="0.5" />
      <line x1="30" y1="62" x2="70" y2="62" stroke="#d1d5db" strokeWidth="0.5" />
      <line x1="30" y1="66" x2="70" y2="66" stroke="#d1d5db" strokeWidth="0.5" />
      {/* Headband on side */}
      <rect x="28" y="35" width="44" height="5" rx="2" fill="#6b7280" />
      <Eyes color="#333" />
      {/* Large sword silhouette */}
      <rect x="76" y="10" width="6" height="80" rx="2" fill="#64748b" opacity="0.5" />
    </>
  );
}

function Haku() {
  return (
    <>
      <Outfit color="#bae6fd" />
      {/* Long elegant black hair */}
      <ellipse cx="50" cy="40" rx="24" ry="18" fill="#1e293b" />
      <ellipse cx="34" cy="55" rx="10" ry="22" fill="#1e293b" />
      <ellipse cx="66" cy="55" rx="10" ry="22" fill="#1e293b" />
      <ellipse cx="40" cy="78" rx="8" ry="10" fill="#0f172a" />
      <ellipse cx="60" cy="78" rx="8" ry="10" fill="#0f172a" />
      <Neck skin={SP} />
      <Face skin={SP} />
      <Eyes color="#78350f" />
      <Mouth />
      {/* Delicate brow */}
      <path d="M38,44 Q42,42 46,44" fill="none" stroke="#78350f" strokeWidth="0.6" />
      <path d="M54,44 Q58,42 62,44" fill="none" stroke="#78350f" strokeWidth="0.6" />
    </>
  );
}

function Kimimaro() {
  return (
    <>
      <Outfit color="#4b5563" />
      {/* White/silver flowing hair */}
      <ellipse cx="50" cy="38" rx="24" ry="16" fill="#e2e8f0" />
      <ellipse cx="34" cy="52" rx="10" ry="18" fill="#e2e8f0" />
      <ellipse cx="66" cy="52" rx="10" ry="18" fill="#e2e8f0" />
      <Neck skin={SP} />
      <Face skin={SP} />
      {/* Two red dots on forehead */}
      <circle cx="44" cy="38" r="2" fill="#dc2626" />
      <circle cx="56" cy="38" r="2" fill="#dc2626" />
      <Eyes color="#22c55e" />
      <Mouth />
    </>
  );
}

function Iruka() {
  return (
    <>
      <Outfit color="#1e40af" />
      {/* Brown hair in ponytail */}
      <ellipse cx="50" cy="38" rx="22" ry="14" fill="#78350f" />
      <ellipse cx="54" cy="22" rx="8" ry="10" fill="#78350f" />
      <Neck />
      <Face />
      <Headband />
      <Eyes color="#78350f" />
      <Mouth />
      {/* Scar across nose */}
      <line x1="40" y1="54" x2="60" y2="54" stroke="#c4956a" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function Konohamaru() {
  return (
    <>
      <Outfit color="#3b82f6" />
      {/* Short spiky brown hair */}
      <ellipse cx="50" cy="38" rx="20" ry="12" fill="#78350f" />
      <polygon points="42,28 38,16 50,30" fill="#78350f" />
      <polygon points="58,28 62,16 50,30" fill="#78350f" />
      <polygon points="50,26 48,14 52,14" fill="#92400e" />
      <Neck />
      <Face />
      <Eyes color="#333" />
      <Mouth />
      {/* Blue scarf */}
      <path d="M34,70 Q50,66 66,70 Q54,78 46,78 Q34,76 34,70" fill="#3b82f6" />
      {/* Goggles on forehead */}
      <circle cx="42" cy="36" r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="58" cy="36" r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="47" y1="36" x2="53" y2="36" stroke="#f59e0b" strokeWidth="1" />
    </>
  );
}

function Jiraiya() {
  return (
    <>
      <Outfit color="#4b5563" />
      {/* Long white dramatic spiky mane */}
      <polygon points="50,4 42,28 58,28" fill="#f5f5f4" />
      <polygon points="36,8 22,30 42,30" fill="#f5f5f4" />
      <polygon points="64,8 78,30 58,30" fill="#f5f5f4" />
      <polygon points="26,16 12,36 34,34" fill="#e7e5e4" />
      <polygon points="74,16 88,36 66,34" fill="#e7e5e4" />
      <ellipse cx="50" cy="34" rx="24" ry="10" fill="#f5f5f4" />
      <ellipse cx="26" cy="50" rx="12" ry="22" fill="#e7e5e4" />
      <ellipse cx="74" cy="50" rx="12" ry="22" fill="#e7e5e4" />
      <Neck />
      <Face />
      {/* Red lines from eyes */}
      <line x1="36" y1="48" x2="32" y2="62" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="64" y1="48" x2="68" y2="62" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
      <Headband y={34} color="#dc2626" />
      <Eyes color="#333" />
      <Mouth />
    </>
  );
}

function Tsunade() {
  return (
    <>
      <Outfit color="#4b5563" />
      {/* Blonde twin pigtails */}
      <ellipse cx="50" cy="38" rx="22" ry="14" fill="#fbbf24" />
      <ellipse cx="28" cy="50" rx="8" ry="12" fill="#fbbf24" />
      <ellipse cx="72" cy="50" rx="8" ry="12" fill="#fbbf24" />
      <ellipse cx="22" cy="70" rx="6" ry="14" fill="#f59e0b" />
      <ellipse cx="78" cy="70" rx="6" ry="14" fill="#f59e0b" />
      <Neck />
      <Face />
      {/* Diamond mark on forehead */}
      <polygon points="50,34 47,38 50,42 53,38" fill="#8b5cf6" />
      <Eyes color="#a16207" />
      <Mouth />
    </>
  );
}

function MightGuy() {
  return (
    <>
      <Outfit color="#16a34a" />
      {/* Bowl cut (like Lee but bigger) */}
      <ellipse cx="50" cy="36" rx="26" ry="18" fill="#1a1a2e" />
      <rect x="24" y="36" width="52" height="10" rx="5" fill="#1a1a2e" />
      <Neck />
      <Face />
      {/* Thick eyebrows (less than Lee) */}
      <ellipse cx="42" cy="44" rx="5" ry="2" fill="#1a1a2e" />
      <ellipse cx="58" cy="44" rx="5" ry="2" fill="#1a1a2e" />
      <Eyes color="#1a1a2e" />
      {/* Big smile / teeth gleam */}
      <path d="M40,58 Q50,66 60,58" fill="white" stroke="#c4956a" strokeWidth="1" />
      <line x1="50" y1="58" x2="50" y2="64" stroke="#e5e7eb" strokeWidth="0.5" />
      {/* Thumbs up star sparkle */}
      <polygon points="78,40 80,36 82,40 86,40 83,43 84,47 80,44 76,47 77,43 74,40" fill="#fbbf24" opacity="0.7" />
    </>
  );
}

function Kurenai() {
  return (
    <>
      <Outfit color="#881337" />
      {/* Long wavy black hair with red tint */}
      <ellipse cx="50" cy="38" rx="24" ry="16" fill="#1e1e1e" />
      <ellipse cx="32" cy="55" rx="12" ry="22" fill="#1e1e1e" />
      <ellipse cx="68" cy="55" rx="12" ry="22" fill="#1e1e1e" />
      <Neck />
      <Face />
      <Eyes color="#dc2626" />
      <Mouth />
      {/* Bandage wrap style */}
      <line x1="30" y1="72" x2="70" y2="72" stroke="#e5e7eb" strokeWidth="1" />
    </>
  );
}

function Asuma() {
  return (
    <>
      <Outfit color="#1e293b" />
      {/* Short dark hair */}
      <ellipse cx="50" cy="36" rx="22" ry="12" fill="#1e293b" />
      <Neck />
      <Face />
      <Headband />
      <Eyes color="#78350f" />
      {/* Beard */}
      <path d="M38,60 Q50,68 62,60" fill="#4a3728" />
      <Mouth />
      {/* Cigarette */}
      <line x1="56" y1="60" x2="72" y2="56" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
      <circle cx="73" cy="55" r="2" fill="#f97316" opacity="0.6" />
    </>
  );
}

// ========= JUTSU/TOOL ICONS =========

function JutsuIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('fire') || n.includes('fireball')) return <FlameIcon />;
  if (n.includes('water') || n.includes('dragon')) return <WaveIcon />;
  if (n.includes('lightning') || n.includes('thunder')) return <BoltIcon />;
  if (n.includes('earth') || n.includes('wall')) return <RockIcon />;
  if (n.includes('wind') || n.includes('air')) return <WindIcon />;
  if (n.includes('shadow clone')) return <CloneIcon />;
  if (n.includes('heal') || n.includes('medical')) return <HealIcon />;
  if (n.includes('summon')) return <SummonIcon />;
  if (n.includes('sand')) return <SandIcon />;
  if (n.includes('poison')) return <PoisonIcon />;
  if (n.includes('seal') || n.includes('trigram')) return <SealIcon />;
  if (n.includes('genjutsu') || n.includes('mirror')) return <EyeIcon />;
  if (n.includes('smoke') || n.includes('mist') || n.includes('hidden')) return <MistIcon />;
  if (n.includes('training') || n.includes('formation') || n.includes('will')) return <LeafIcon />;
  if (n.includes('bomb') || n.includes('paper bomb')) return <BombIcon />;
  if (n.includes('substitut')) return <LogIcon />;
  if (n.includes('transformat')) return <TransformIcon />;
  if (n.includes('chakra') && n.includes('disrupt')) return <DisruptIcon />;
  if (n.includes('chakra')) return <ChakraIcon />;
  if (n.includes('intelligence')) return <ScrollOpenIcon />;
  if (n.includes('curse')) return <CurseIcon />;
  return <ScrollIcon />;
}

function ToolIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('kunai')) return <KunaiIcon />;
  if (n.includes('shuriken')) return <ShurikenIcon />;
  if (n.includes('explosive') || n.includes('paper bomb')) return <BombIcon />;
  if (n.includes('wire')) return <WireIcon />;
  if (n.includes('pill') || n.includes('ration')) return <PillIcon />;
  if (n.includes('scroll')) return <ScrollIcon />;
  if (n.includes('blade')) return <BladeIcon />;
  if (n.includes('weight') || n.includes('gear')) return <WeightIcon />;
  if (n.includes('headband')) return <HeadbandIcon />;
  return <KunaiIcon />;
}

// Mini icon components
function FlameIcon() {
  return (
    <>
      <path d="M50,20 Q60,35 55,50 Q52,55 50,60 Q48,55 45,50 Q40,35 50,20" fill="#f97316" />
      <path d="M50,30 Q56,40 53,50 Q51,55 50,58 Q49,55 47,50 Q44,40 50,30" fill="#fbbf24" />
      <ellipse cx="50" cy="55" rx="8" ry="12" fill="#fbbf24" opacity="0.3" />
    </>
  );
}

function WaveIcon() {
  return (
    <>
      <path d="M20,50 Q30,35 40,50 Q50,65 60,50 Q70,35 80,50" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
      <path d="M25,60 Q35,48 45,60 Q55,72 65,60 Q75,48 80,60" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
      <path d="M30,40 Q38,30 46,40 Q54,50 62,40 Q70,30 75,40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function BoltIcon() {
  return <polygon points="55,15 40,48 52,48 45,80 70,42 56,42 65,15" fill="#eab308" />;
}

function RockIcon() {
  return (
    <>
      <polygon points="30,70 40,35 55,30 70,40 75,65 60,75 35,72" fill="#78350f" />
      <polygon points="35,68 42,40 52,36 65,42 68,62 58,70" fill="#92400e" />
      <polygon points="40,64 48,45 55,42 60,48 62,58 54,65" fill="#a16207" />
    </>
  );
}

function WindIcon() {
  return (
    <>
      <path d="M25,40 Q40,30 55,40 Q65,45 60,55" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <path d="M30,50 Q45,42 58,50 Q66,54 62,62" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35,58 Q48,52 56,58" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function CloneIcon() {
  return (
    <>
      <circle cx="40" cy="45" r="12" fill="#94a3b8" opacity="0.5" />
      <circle cx="60" cy="45" r="12" fill="#94a3b8" opacity="0.5" />
      <circle cx="50" cy="55" r="12" fill="#94a3b8" opacity="0.7" />
      <circle cx="50" cy="42" r="4" fill="#475569" />
      <rect x="46" y="50" width="8" height="14" rx="3" fill="#475569" />
    </>
  );
}

function HealIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="20" fill="#22c55e" opacity="0.2" />
      <rect x="46" y="34" width="8" height="32" rx="2" fill="#22c55e" />
      <rect x="34" y="46" width="32" height="8" rx="2" fill="#22c55e" />
    </>
  );
}

function SummonIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="22" fill="none" stroke="#a855f7" strokeWidth="2" />
      <circle cx="50" cy="50" r="16" fill="none" stroke="#a855f7" strokeWidth="1" />
      <polygon points="50,30 54,44 68,44 56,52 60,66 50,56 40,66 44,52 32,44 46,44" fill="#a855f7" opacity="0.4" />
    </>
  );
}

function SandIcon() {
  return (
    <>
      <ellipse cx="50" cy="60" rx="25" ry="15" fill="#a16207" />
      <ellipse cx="50" cy="58" rx="22" ry="12" fill="#ca8a04" />
      <circle cx="40" cy="45" r="3" fill="#a16207" opacity="0.6" />
      <circle cx="55" cy="40" r="2" fill="#a16207" opacity="0.5" />
      <circle cx="62" cy="48" r="2.5" fill="#a16207" opacity="0.4" />
    </>
  );
}

function PoisonIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="18" fill="#7c3aed" opacity="0.3" />
      <circle cx="50" cy="50" r="10" fill="#7c3aed" opacity="0.4" />
      <text x="42" y="56" fill="#a855f7" fontSize="18" fontWeight="bold">☠</text>
    </>
  );
}

function SealIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#eab308" strokeWidth="2" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#eab308" strokeWidth="1.5" />
      <line x1="50" y1="30" x2="50" y2="70" stroke="#eab308" strokeWidth="1" />
      <line x1="30" y1="50" x2="70" y2="50" stroke="#eab308" strokeWidth="1" />
      <line x1="36" y1="36" x2="64" y2="64" stroke="#eab308" strokeWidth="0.8" />
      <line x1="64" y1="36" x2="36" y2="64" stroke="#eab308" strokeWidth="0.8" />
    </>
  );
}

function EyeIcon() {
  return (
    <>
      <path d="M20,50 Q50,25 80,50 Q50,75 20,50" fill="none" stroke="#dc2626" strokeWidth="2" />
      <circle cx="50" cy="50" r="10" fill="#dc2626" opacity="0.3" />
      <circle cx="50" cy="50" r="6" fill="#dc2626" />
      <circle cx="50" cy="50" r="3" fill="#111" />
    </>
  );
}

function MistIcon() {
  return (
    <>
      <ellipse cx="50" cy="40" rx="28" ry="8" fill="#94a3b8" opacity="0.4" />
      <ellipse cx="45" cy="50" rx="25" ry="7" fill="#94a3b8" opacity="0.3" />
      <ellipse cx="55" cy="60" rx="24" ry="6" fill="#94a3b8" opacity="0.25" />
    </>
  );
}

function LeafIcon() {
  return (
    <>
      <path d="M50,25 Q70,35 65,55 Q60,70 50,75 Q40,70 35,55 Q30,35 50,25" fill="#22c55e" />
      <path d="M50,25 Q50,50 50,75" fill="none" stroke="#16a34a" strokeWidth="1.5" />
      <path d="M50,40 Q58,38 62,45" fill="none" stroke="#16a34a" strokeWidth="1" />
      <path d="M50,50 Q42,48 38,53" fill="none" stroke="#16a34a" strokeWidth="1" />
    </>
  );
}

function BombIcon() {
  return (
    <>
      <rect x="34" y="38" width="32" height="24" rx="3" fill="#e5e7eb" />
      <rect x="36" y="40" width="28" height="20" rx="2" fill="#fafaf9" />
      <text x="42" y="56" fill="#dc2626" fontSize="14" fontWeight="bold">爆</text>
      <path d="M58,38 Q62,30 66,32" fill="none" stroke="#f97316" strokeWidth="1.5" />
      <circle cx="67" cy="31" r="3" fill="#f97316" opacity="0.6" />
    </>
  );
}

function LogIcon() {
  return (
    <>
      <rect x="35" y="30" width="14" height="50" rx="6" fill="#92400e" />
      <rect x="51" y="30" width="14" height="50" rx="6" fill="#78350f" />
      <ellipse cx="42" cy="30" rx="7" ry="3" fill="#a16207" />
      <ellipse cx="58" cy="30" rx="7" ry="3" fill="#92400e" />
      <circle cx="40" cy="45" r="2" fill="#6b4a2e" />
      <circle cx="56" cy="55" r="1.5" fill="#6b4a2e" />
    </>
  );
}

function TransformIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="18" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 2" />
      <circle cx="42" cy="46" r="3" fill="#e2e8f0" />
      <circle cx="58" cy="46" r="3" fill="#e2e8f0" />
      <circle cx="42" cy="46" r="1.5" fill="#333" />
      <circle cx="58" cy="46" r="1.5" fill="#333" />
      <path d="M44,56 Q50,60 56,56" fill="none" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M30,50 Q26,38 34,32" fill="none" stroke="#c084fc" strokeWidth="2" />
      <polygon points="34,32 30,28 38,30" fill="#c084fc" />
    </>
  );
}

function DisruptIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="18" fill="#3b82f6" opacity="0.2" />
      <path d="M35,50 L42,42 L50,50 L58,42 L65,50" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <line x1="35" y1="45" x2="65" y2="55" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="55" x2="65" y2="45" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function ChakraIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="16" fill="#3b82f6" opacity="0.2" />
      <circle cx="50" cy="50" r="10" fill="#3b82f6" opacity="0.3" />
      <circle cx="50" cy="50" r="5" fill="#60a5fa" />
      <path d="M50,30 Q55,40 50,50 Q45,60 50,70" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
      <path d="M30,50 Q40,45 50,50 Q60,55 70,50" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
    </>
  );
}

function ScrollOpenIcon() {
  return (
    <>
      <rect x="32" y="35" width="36" height="30" rx="2" fill="#fef3c7" />
      <rect x="28" y="33" width="8" height="34" rx="4" fill="#a16207" />
      <rect x="64" y="33" width="8" height="34" rx="4" fill="#a16207" />
      <line x1="40" y1="42" x2="60" y2="42" stroke="#92400e" strokeWidth="1" />
      <line x1="40" y1="48" x2="58" y2="48" stroke="#92400e" strokeWidth="1" />
      <line x1="40" y1="54" x2="56" y2="54" stroke="#92400e" strokeWidth="1" />
    </>
  );
}

function CurseIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="18" fill="none" stroke="#7c3aed" strokeWidth="2" />
      <path d="M50,32 L56,46 L68,46 L58,54 L62,68 L50,60 L38,68 L42,54 L32,46 L44,46 Z" fill="#7c3aed" opacity="0.4" />
      <line x1="42" y1="42" x2="58" y2="58" stroke="#dc2626" strokeWidth="2" />
      <line x1="58" y1="42" x2="42" y2="58" stroke="#dc2626" strokeWidth="2" />
    </>
  );
}

function ScrollIcon() {
  return (
    <>
      <rect x="36" y="28" width="28" height="44" rx="3" fill="#fef3c7" />
      <rect x="34" y="26" width="8" height="48" rx="4" fill="#a16207" />
      <rect x="58" y="26" width="8" height="48" rx="4" fill="#a16207" />
    </>
  );
}

function KunaiIcon() {
  return (
    <>
      <polygon points="50,18 44,55 50,50 56,55" fill="#9ca3af" />
      <polygon points="50,18 46,30 54,30" fill="#e2e8f0" />
      <rect x="47" y="55" width="6" height="4" rx="1" fill="#a16207" />
      <rect x="46" y="59" width="8" height="16" rx="1" fill="#78350f" />
      <circle cx="50" cy="62" r="4" fill="none" stroke="#78350f" strokeWidth="2" />
    </>
  );
}

function ShurikenIcon() {
  return (
    <>
      <polygon points="50,22 56,44 78,50 56,56 50,78 44,56 22,50 44,44" fill="#9ca3af" />
      <polygon points="50,28 54,44 72,50 54,56 50,72 46,56 28,50 46,44" fill="#d1d5db" />
      <circle cx="50" cy="50" r="5" fill="#6b7280" />
      <circle cx="50" cy="50" r="2" fill="#1e293b" />
    </>
  );
}

function WireIcon() {
  return (
    <>
      <path d="M30,35 Q40,30 50,40 Q60,50 70,45 Q80,40 75,55 Q70,70 60,60 Q50,50 40,55 Q30,60 35,45" fill="none" stroke="#9ca3af" strokeWidth="2" />
    </>
  );
}

function PillIcon() {
  return (
    <>
      <circle cx="50" cy="50" r="16" fill="#22c55e" />
      <circle cx="50" cy="50" r="12" fill="#4ade80" />
      <ellipse cx="46" cy="46" rx="4" ry="3" fill="#86efac" opacity="0.6" />
    </>
  );
}

function BladeIcon() {
  return (
    <>
      <rect x="48" y="15" width="4" height="50" rx="1" fill="#e2e8f0" />
      <polygon points="46,15 50,8 54,15" fill="#cbd5e1" />
      <rect x="42" y="65" width="16" height="4" rx="1" fill="#a16207" />
      <rect x="46" y="69" width="8" height="14" rx="2" fill="#78350f" />
      <line x1="50" y1="20" x2="50" y2="60" stroke="white" strokeWidth="0.5" opacity="0.4" />
    </>
  );
}

function WeightIcon() {
  return (
    <>
      <rect x="35" y="45" width="30" height="20" rx="3" fill="#4b5563" />
      <rect x="40" y="48" width="20" height="14" rx="2" fill="#6b7280" />
      <rect x="30" y="48" width="8" height="14" rx="4" fill="#374151" />
      <rect x="62" y="48" width="8" height="14" rx="4" fill="#374151" />
      <line x1="38" y1="55" x2="62" y2="55" stroke="#9ca3af" strokeWidth="1" />
    </>
  );
}

function HeadbandIcon() {
  return (
    <>
      <path d="M20,45 Q50,35 80,45 Q80,55 50,50 Q20,55 20,45" fill="#3b82f6" />
      <rect x="40" y="40" width="20" height="14" rx="2" fill="#9ca3af" />
      <path d="M42,46 L46,42 L54,46 L50,50 Z" fill="#d1d5db" />
    </>
  );
}

// ========= CHARACTER IMAGE LOOKUP =========

// Maps character key + stage to local image path.
// Stage-3+ cards fall back to the highest available stage (the most evolved
// visible form) rather than the basic, so e.g. Naruto Six Paths (stage 3)
// shows the Sage Mode image rather than the Academy image.
const NINJA_IMAGES: Record<string, Record<number, string>> = {
  naruto:    { 0: '/assets/cards/ninja/naruto-stage0.webp', 1: '/assets/cards/ninja/naruto-stage1.webp', 2: '/assets/cards/ninja/naruto-stage2.webp', 3: '/assets/cards/ninja/naruto-stage2.webp' },
  sasuke:    { 0: '/assets/cards/ninja/sasuke-stage0.webp', 1: '/assets/cards/ninja/sasuke-stage1.webp', 2: '/assets/cards/ninja/sasuke-stage2.webp', 3: '/assets/cards/ninja/sasuke-stage2.webp' },
  sakura:    { 0: '/assets/cards/ninja/sakura-stage0.webp', 1: '/assets/cards/ninja/sakura-stage1.webp', 2: '/assets/cards/ninja/sakura-stage2.webp' },
  kakashi:   { 0: '/assets/cards/ninja/kakashi-stage0.webp', 1: '/assets/cards/ninja/kakashi-stage1.webp', 2: '/assets/cards/ninja/kakashi-stage2.webp', 3: '/assets/cards/ninja/kakashi-stage2.webp' },
  lee:       { 0: '/assets/cards/ninja/rock-lee-stage0.webp', 1: '/assets/cards/ninja/rock-lee-stage1.webp', 2: '/assets/cards/ninja/rock-lee-stage1.webp' },
  neji:      { 0: '/assets/cards/ninja/neji.webp' },
  tenten:    { 0: '/assets/cards/ninja/tenten.webp' },
  shikamaru: { 0: '/assets/cards/ninja/shikamaru-stage0.webp', 1: '/assets/cards/ninja/shikamaru-stage1.webp' },
  ino:       { 0: '/assets/cards/ninja/ino.webp' },
  choji:     { 0: '/assets/cards/ninja/choji.webp' },
  hinata:    { 0: '/assets/cards/ninja/hinata.webp' },
  kiba:      { 0: '/assets/cards/ninja/kiba.webp' },
  shino:     { 0: '/assets/cards/ninja/shino.webp' },
  minato:    { 0: '/assets/cards/ninja/minato.webp', 1: '/assets/cards/ninja/minato.webp' },
  hashirama: { 0: '/assets/cards/ninja/hashirama.webp' },
  tobirama:  { 0: '/assets/cards/ninja/tobirama.webp' },
  hiruzen:   { 0: '/assets/cards/ninja/hiruzen.webp' },
  gaara:     { 0: '/assets/cards/ninja/gaara-stage0.webp', 1: '/assets/cards/ninja/gaara-stage1.webp', 2: '/assets/cards/ninja/gaara-stage1.webp' },
  orochimaru:{ 0: '/assets/cards/ninja/orochimaru.webp' },
  kabuto:    { 0: '/assets/cards/ninja/kabuto.webp' },
  zabuza:    { 0: '/assets/cards/ninja/zabuza.webp' },
  haku:      { 0: '/assets/cards/ninja/haku.webp' },
  kimimaro:  { 0: '/assets/cards/ninja/kimimaro.webp' },
  iruka:     { 0: '/assets/cards/ninja/iruka.webp' },
  konohamaru:{ 0: '/assets/cards/ninja/konohamaru.webp' },
  jiraiya:   { 0: '/assets/cards/ninja/jiraiya.webp' },
  tsunade:   { 0: '/assets/cards/ninja/tsunade.webp' },
  guy:       { 0: '/assets/cards/ninja/might-guy.webp' },
  kurenai:   { 0: '/assets/cards/ninja/kurenai.webp' },
  asuma:     { 0: '/assets/cards/ninja/asuma.webp' },
};

const SENSEI_IMAGES: Record<string, string> = {
  iruka:   '/assets/cards/sensei/iruka.webp',
  kakashi: '/assets/cards/sensei/kakashi.webp',
  guy:     '/assets/cards/sensei/might-guy.webp',
  kurenai: '/assets/cards/sensei/kurenai.webp',
  asuma:   '/assets/cards/sensei/asuma.webp',
};

function getCharacterKey(name: string): string {
  const n = name.toLowerCase();
  if (n.startsWith('naruto')) return 'naruto';
  if (n.startsWith('sasuke')) return 'sasuke';
  if (n.startsWith('sakura')) return 'sakura';
  if (n.startsWith('kakashi')) return 'kakashi';
  if (n.startsWith('rock lee')) return 'lee';
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
  if (n.startsWith('orochimaru')) return 'orochimaru';
  if (n.startsWith('kabuto')) return 'kabuto';
  if (n.startsWith('zabuza')) return 'zabuza';
  if (n === 'haku') return 'haku';
  if (n.startsWith('kimimaro')) return 'kimimaro';
  if (n.startsWith('iruka')) return 'iruka';
  if (n.startsWith('konohamaru')) return 'konohamaru';
  if (n.startsWith('jiraiya')) return 'jiraiya';
  if (n.startsWith('tsunade')) return 'tsunade';
  if (n.startsWith('might guy')) return 'guy';
  if (n.startsWith('kurenai')) return 'kurenai';
  if (n.startsWith('asuma')) return 'asuma';
  return '';
}

function getCharacterImage(key: string, cardType: string, stage: number): string | null {
  const raw = (() => {
    if (cardType === 'sensei') {
      return SENSEI_IMAGES[key] ?? null;
    }
    const stages = NINJA_IMAGES[key];
    if (!stages) return null;
    if (stages[stage]) return stages[stage];
    // Fall back to the HIGHEST available stage (most evolved form), not stage 0
    const availableStages = Object.keys(stages).map(Number).sort((a, b) => b - a);
    for (const s of availableStages) {
      if (s <= stage && stages[s]) return stages[s];
    }
    return stages[availableStages[0]] ?? null;
  })();
  return raw ? asset(raw) : null;
}


// ========= MAIN COMPONENT =========

export default function CardArt({ cardName, cardType, chakraType, stage = 0, artPath }: CardArtProps) {
  // Cascade: artPath → name+stage lookup → silhouette. Each tier upgrades on
  // <img> onError so we don't show broken thumbnails.
  const [tier, setTier] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset cascade when the underlying card changes.
    setTier(0);
  }, [cardName, artPath, stage]);

  if (cardType === 'ninja' || cardType === 'sensei') {
    const artPathSrc = artPath ? asset(`/assets/${artPath}`) : null;
    const charKey = getCharacterKey(cardName);
    const namedSrc = getCharacterImage(charKey, cardType, stage);

    if (tier === 0 && artPathSrc) {
      return (
        <img
          src={artPathSrc}
          alt={cardName}
          className="w-full h-full object-contain object-center drop-shadow-lg"
          loading="lazy"
          draggable={false}
          onError={() => setTier(1)}
        />
      );
    }
    if (tier <= 1 && namedSrc && namedSrc !== artPathSrc) {
      return (
        <img
          src={namedSrc}
          alt={cardName}
          className="w-full h-full object-contain object-center drop-shadow-lg"
          loading="lazy"
          draggable={false}
          onError={() => setTier(2)}
        />
      );
    }
  }

  // Jutsu scrolls use SVG icons
  if (cardType === 'jutsu-scroll') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <JutsuIcon name={cardName} />
      </svg>
    );
  }

  // Tools use SVG icons
  if (cardType === 'tool') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <ToolIcon name={cardName} />
      </svg>
    );
  }

  // Ninja/sensei fallback when we have neither photo nor hand-drawn SVG:
  // generic chakra-tinted silhouette so the card still has a face.
  if (cardType === 'ninja' || cardType === 'sensei') {
    const tint =
      chakraType === 'fire' ? '#ef4444'
      : chakraType === 'water' ? '#3b82f6'
      : chakraType === 'lightning' ? '#eab308'
      : chakraType === 'earth' ? '#a16207'
      : chakraType === 'wind' ? '#22c55e'
      : '#9ca3af';
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`silh-${tint}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={tint} stopOpacity="0.35" />
            <stop offset="100%" stopColor={tint} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#silh-${tint})`} />
        {/* Hood silhouette */}
        <path d="M50,18 C68,18 76,32 76,48 L76,72 Q76,82 66,84 L34,84 Q24,82 24,72 L24,48 C24,32 32,18 50,18 Z" fill="#1a1a2e" />
        <path d="M38,40 Q42,36 48,38 L48,48 Q42,50 38,48 Z M52,38 Q58,36 62,40 L62,48 Q58,50 52,48 Z" fill={tint} opacity="0.9" />
        {/* Headband stripe */}
        <rect x="26" y="30" width="48" height="6" fill={tint} opacity="0.8" />
        <rect x="42" y="29" width="16" height="8" fill="#cbd5e1" />
        {/* Konoha swirl icon on band */}
        <path d="M50,32 a2,2 0 1,1 -0.1,0" fill="none" stroke="#1a1a2e" strokeWidth="1.2" />
        {/* Chin strap hint */}
        <path d="M40,74 L60,74" stroke="#0f172a" strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }

  // Final fallback
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <ScrollIcon />
    </svg>
  );
}
