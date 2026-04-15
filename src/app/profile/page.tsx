'use client';

import MainNav from '@/components/layout/MainNav';
import { useGameStore } from '@/store';

export default function ProfilePage() {
  const profile = useGameStore((s) => s.profile);
  const ownedCards = useGameStore((s) => s.ownedCards);
  const decks = useGameStore((s) => s.decks);

  const totalCards = Object.values(ownedCards).reduce((sum, n) => sum + n, 0);
  const uniqueCards = Object.keys(ownedCards).filter((k) => ownedCards[k] > 0).length;
  const xpPercent = (profile.xp / profile.xpToNextLevel) * 100;
  const totalBattles = profile.totalWins + profile.totalLosses + profile.totalDraws;
  const winRate = totalBattles > 0 ? ((profile.totalWins / totalBattles) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {/* Level Card */}
        <div className="bg-gradient-to-r from-naruto-orange/20 to-naruto-red/10 border border-naruto-orange/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-naruto-orange">{profile.name}</h2>
            <div className="text-right">
              <p className="text-sm text-gray-400">Level</p>
              <p className="text-3xl font-bold">{profile.level}</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>XP</span>
              <span>{profile.xp} / {profile.xpToNextLevel}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-naruto-orange to-yellow-400 rounded-full transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{profile.totalWins}</p>
            <p className="text-xs text-gray-500">Wins</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{profile.totalLosses}</p>
            <p className="text-xs text-gray-500">Losses</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
            <p className="text-xs text-gray-500">Win Rate</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{totalBattles}</p>
            <p className="text-xs text-gray-500">Total Battles</p>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <h3 className="font-bold mb-3">Collection</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-purple-400">{uniqueCards}</p>
              <p className="text-xs text-gray-500">Unique Cards</p>
            </div>
            <div>
              <p className="text-xl font-bold text-purple-400">{totalCards}</p>
              <p className="text-xs text-gray-500">Total Cards</p>
            </div>
            <div>
              <p className="text-xl font-bold text-purple-400">{decks.length}</p>
              <p className="text-xs text-gray-500">Decks</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="font-bold mb-3">Achievements</h3>
          {profile.achievements.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">
              No achievements yet. Keep playing!
            </p>
          ) : (
            <div className="space-y-2">
              {profile.achievements.map((id) => (
                <div key={id} className="bg-white/5 rounded-lg p-2 text-sm">
                  {id}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
