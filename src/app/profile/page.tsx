'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import MainNav from '@/components/layout/MainNav';
import GlassPanel from '@/components/shared/GlassPanel';
import PageTransition from '@/components/shared/PageTransition';
import { useGameStore } from '@/store';
import { getAvatarById } from '@/lib/avatars';

function AnimatedNumber({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 600;
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <motion.p
      className="text-2xl font-bold font-heading"
      style={{ color }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 20 }}
    >
      {displayed}
    </motion.p>
  );
}

export default function ProfilePage() {
  const profile = useGameStore((s) => s.profile);
  const ownedCards = useGameStore((s) => s.ownedCards);
  const decks = useGameStore((s) => s.decks);
  const avatar = getAvatarById(profile.avatarId);

  const totalCards = Object.values(ownedCards).reduce((sum, n) => sum + n, 0);
  const uniqueCards = Object.keys(ownedCards).filter((k) => ownedCards[k] > 0).length;
  const xpPercent = (profile.xp / profile.xpToNextLevel) * 100;
  const totalBattles = profile.totalWins + profile.totalLosses + profile.totalDraws;
  const winRate = totalBattles > 0 ? ((profile.totalWins / totalBattles) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-heading">Profile</h1>
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              Settings
            </Link>
          </div>

          {/* Level Card */}
          <GlassPanel strong className="p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-naruto-orange/[0.06] to-naruto-red/[0.03]" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-2">
                <motion.div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 shrink-0"
                  style={{ borderColor: avatar.accentColor, boxShadow: `0 0 22px ${avatar.accentColor}66` }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" draggable={false} />
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-naruto-orange font-heading leading-tight">{profile.name}</h2>
                  <p className="text-xs text-gray-500">{avatar.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Level</p>
                  <motion.p
                    className="text-3xl font-bold font-heading"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {profile.level}
                  </motion.p>
                </div>
              </div>

              {/* XP Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>XP</span>
                  <span>{profile.xp} / {profile.xpToNextLevel}</span>
                </div>
                <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-naruto-orange to-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <GlassPanel className="p-4 text-center">
              <AnimatedNumber value={profile.totalWins} color="#4ade80" delay={100} />
              <p className="text-xs text-gray-500">Wins</p>
            </GlassPanel>
            <GlassPanel className="p-4 text-center">
              <AnimatedNumber value={profile.totalLosses} color="#f87171" delay={200} />
              <p className="text-xs text-gray-500">Losses</p>
            </GlassPanel>
            <GlassPanel className="p-4 text-center">
              <motion.p
                className="text-2xl font-bold font-heading text-blue-400"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
              >
                {winRate}%
              </motion.p>
              <p className="text-xs text-gray-500">Win Rate</p>
            </GlassPanel>
            <GlassPanel className="p-4 text-center">
              <AnimatedNumber value={totalBattles} color="#facc15" delay={400} />
              <p className="text-xs text-gray-500">Total Battles</p>
            </GlassPanel>
          </div>

          {/* Collection Stats */}
          <GlassPanel className="p-4 mb-6">
            <h3 className="font-bold mb-3 font-heading">Collection</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <AnimatedNumber value={uniqueCards} color="#c084fc" delay={500} />
                <p className="text-xs text-gray-500">Unique Cards</p>
              </div>
              <div>
                <AnimatedNumber value={totalCards} color="#c084fc" delay={600} />
                <p className="text-xs text-gray-500">Total Cards</p>
              </div>
              <div>
                <AnimatedNumber value={decks.length} color="#c084fc" delay={700} />
                <p className="text-xs text-gray-500">Decks</p>
              </div>
            </div>
          </GlassPanel>

          {/* Achievements */}
          <GlassPanel className="p-4">
            <h3 className="font-bold mb-3 font-heading">Achievements</h3>
            {profile.achievements.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">
                No achievements yet. Keep playing!
              </p>
            ) : (
              <div className="space-y-2">
                {profile.achievements.map((id) => (
                  <div key={id} className="bg-white/[0.04] rounded-lg p-2 text-sm border border-white/[0.04]">
                    {id}
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </PageTransition>
    </div>
  );
}
