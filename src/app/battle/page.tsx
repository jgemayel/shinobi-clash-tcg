'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import MainNav from '@/components/layout/MainNav';
import { useGameStore } from '@/store';
import { AIDifficulty } from '@/types/enums';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-naruto-navy rounded-xl flex items-center justify-center">
      <p className="text-gray-500">Loading game engine...</p>
    </div>
  ),
});

const difficulties = [
  { value: AIDifficulty.Academy, label: 'Academy', desc: 'Random moves - easy win' },
  { value: AIDifficulty.Genin, label: 'Genin', desc: 'Basic strategy' },
  { value: AIDifficulty.Chunin, label: 'Chunin', desc: 'Balanced gameplay' },
  { value: AIDifficulty.Jonin, label: 'Jonin', desc: 'Smart decisions' },
  { value: AIDifficulty.Kage, label: 'Kage', desc: 'Master strategist' },
];

export default function BattlePage() {
  const [difficulty, setDifficulty] = useState<AIDifficulty>(AIDifficulty.Genin);
  const [inBattle, setInBattle] = useState(false);
  const activeDeck = useGameStore((s) => s.getActiveDeck());
  const decks = useGameStore((s) => s.decks);

  if (inBattle) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between px-4 py-2 bg-naruto-navy/90 border-b border-white/10">
          <span className="text-sm font-bold">Battle - {difficulty}</span>
          <button
            onClick={() => setInBattle(false)}
            className="px-3 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            Quit
          </button>
        </div>
        <div className="flex-1">
          <PhaserGame />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Battle</h1>

        {/* Deck selection warning */}
        {!activeDeck && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              {decks.length === 0
                ? 'You need to build a deck first! Go to Deck Builder to create one.'
                : 'Select an active deck in the Deck Builder before battling.'}
            </p>
          </div>
        )}

        {activeDeck && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Deck</p>
                <p className="font-bold">{activeDeck.name}</p>
              </div>
              <span className="text-sm text-gray-400">{activeDeck.cardIds.length} cards</span>
            </div>
          </div>
        )}

        {/* Difficulty selection */}
        <h2 className="text-lg font-bold mb-3">Select Difficulty</h2>
        <div className="space-y-2 mb-6">
          {difficulties.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setDifficulty(value)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                difficulty === value
                  ? 'border-naruto-orange/60 bg-naruto-orange/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{label}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                {difficulty === value && (
                  <span className="text-naruto-orange text-sm">Selected</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Start Battle */}
        <button
          onClick={() => setInBattle(true)}
          disabled={!activeDeck}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
            activeDeck
              ? 'bg-gradient-to-r from-red-500 to-naruto-orange text-white hover:brightness-110'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Start Battle!
        </button>
      </div>
    </div>
  );
}
