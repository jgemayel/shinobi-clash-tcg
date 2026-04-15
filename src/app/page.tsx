'use client';

import Link from 'next/link';
import MainNav from '@/components/layout/MainNav';
import { useGameStore } from '@/store';

export default function HomePage() {
  const profile = useGameStore((s) => s.profile);
  const availablePacks = useGameStore((s) => s.availablePacks);

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-naruto-orange/10 to-transparent" />
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center relative">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-naruto-orange">Naruto</span>{' '}
            <span className="text-white">Shinobi Cards</span>
          </h1>
          <p className="text-gray-400 text-sm">Collect. Build. Battle.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 text-sm">
            <span className="text-gray-400">Level</span>
            <span className="text-naruto-orange font-bold">{profile.level}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{profile.xp}/{profile.xpToNextLevel} XP</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        <Link
          href="/battle"
          className="block bg-gradient-to-r from-naruto-orange/20 to-naruto-red/20 border border-naruto-orange/30 rounded-xl p-5 hover:border-naruto-orange/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Battle</h2>
              <p className="text-sm text-gray-400">Challenge AI opponents and earn cards</p>
            </div>
            <span className="text-3xl">&#x2694;&#xFE0F;</span>
          </div>
        </Link>

        <Link
          href="/packs"
          className="block bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-5 hover:border-blue-500/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Open Packs</h2>
              <p className="text-sm text-gray-400">
                {availablePacks} pack{availablePacks !== 1 ? 's' : ''} available
              </p>
            </div>
            <span className="text-3xl">&#x1F4E6;</span>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/collection"
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            <h3 className="font-bold text-white mb-1">Collection</h3>
            <p className="text-xs text-gray-500">Browse your cards</p>
          </Link>

          <Link
            href="/deck-builder"
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            <h3 className="font-bold text-white mb-1">Deck Builder</h3>
            <p className="text-xs text-gray-500">Build your deck</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{profile.totalWins}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{profile.totalLosses}</p>
              <p className="text-xs text-gray-500">Losses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{profile.totalDraws}</p>
              <p className="text-xs text-gray-500">Draws</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
