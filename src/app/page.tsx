'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import MainNav from '@/components/layout/MainNav';
import GlassPanel from '@/components/shared/GlassPanel';
import PageTransition from '@/components/shared/PageTransition';
import { useGameStore } from '@/store';
import { getAvatarById } from '@/lib/avatars';
import { getActiveProfileId, updateProfileSummary } from '@/lib/profileStorage';

function AnimatedStat({ value, color }: { value: number; color: string }) {
  return (
    <motion.p
      className="text-2xl font-bold font-heading"
      style={{ color }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
    >
      {value}
    </motion.p>
  );
}

interface Particle {
  left: string;
  animationDelay: string;
  animationDuration: string;
  opacity: number;
  width: string;
  height: string;
  key: number;
}

function HintDot() {
  return (
    <span
      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-naruto-orange"
      style={{ animation: 'pulse-glow 2s ease-in-out infinite', boxShadow: '0 0 8px rgba(249,115,22,0.6)' }}
    />
  );
}

export default function HomePage() {
  const router = useRouter();
  const profile = useGameStore((s) => s.profile);
  const availablePacks = useGameStore((s) => s.availablePacks);
  const ownedCards = useGameStore((s) => s.ownedCards);
  const decks = useGameStore((s) => s.decks);
  const hasSeenWelcome = useGameStore((s) => s.hasSeenWelcome);

  const [particles, setParticles] = useState<Particle[]>([]);
  const avatar = getAvatarById(profile.avatarId);

  useEffect(() => {
    const activeId = getActiveProfileId();
    if (!activeId) {
      router.replace('/profiles');
      return;
    }
    if (!hasSeenWelcome) {
      router.replace('/welcome');
      return;
    }
    updateProfileSummary(activeId, { level: profile.level, lastPlayed: Date.now() });
  }, [hasSeenWelcome, profile.level, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Generated client-side only to avoid SSR hydration mismatch on random values.
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${5 + Math.random() * 4}s`,
        opacity: 0.2 + Math.random() * 0.4,
        width: `${1 + Math.random() * 2}px`,
        height: `${1 + Math.random() * 2}px`,
        key: i,
      }))
    );
  }, []);

  const totalOwnedCards = Object.keys(ownedCards).filter((k) => ownedCards[k] > 0).length;
  const hasCards = totalOwnedCards > 0;
  const hasDecks = decks.length > 0;
  const hasWins = profile.totalWins > 0;

  // Contextual hints
  const showPackHint = !hasCards && availablePacks > 0;
  const showDeckHint = hasCards && !hasDecks;
  const showBattleHint = hasDecks && !hasWins;

  return (
    <div className="flex-1 pb-20 bg-home min-h-screen relative overflow-hidden">
      <MainNav />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.key}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
            opacity: p.opacity,
            width: p.width,
            height: p.height,
          }}
        />
      ))}

      <PageTransition>
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-naruto-orange/10 to-transparent" />
          <div className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center relative">
            <motion.div
              className="flex items-center justify-center gap-3 mb-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0"
                style={{ borderColor: avatar.accentColor, boxShadow: `0 0 18px ${avatar.accentColor}66` }}
              >
                <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold font-heading text-white leading-tight">{profile.name}</p>
                <p className="text-xs text-gray-500">Level {profile.level} · {profile.xp}/{profile.xpToNextLevel} XP</p>
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold font-heading mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span className="text-naruto-orange">Shinobi</span>{' '}
              <span className="text-white">Clash</span>
            </motion.h1>
            <p className="text-gray-400 text-sm tracking-wide">Collect. Build. Battle.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-2xl mx-auto px-4 space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/battle" className="relative block">
              {showBattleHint && <HintDot />}
              <GlassPanel className="p-5 hover:border-naruto-orange/40 transition-colors group" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.06))' } as React.CSSProperties}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white font-heading group-hover:text-naruto-orange transition-colors">Battle</h2>
                    <p className="text-sm text-gray-400">Challenge AI opponents and earn XP</p>
                  </div>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-naruto-orange/60">
                    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" /><path d="M13 7l4-4 4 4-4 4" /><path d="M7 13l-4 4 4 4 4-4" />
                  </svg>
                </div>
              </GlassPanel>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link href="/packs" className="relative block">
              {showPackHint && <HintDot />}
              <GlassPanel className="p-5 hover:border-blue-500/40 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white font-heading group-hover:text-blue-400 transition-colors">Open Packs</h2>
                    <p className="text-sm text-gray-400">
                      {availablePacks} pack{availablePacks !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/60">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
              </GlassPanel>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/collection">
                <GlassPanel className="p-4 hover:border-white/20 transition-colors">
                  <h3 className="font-bold text-white mb-1 font-heading">Collection</h3>
                  <p className="text-xs text-gray-500">{totalOwnedCards} cards collected</p>
                </GlassPanel>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Link href="/deck-builder" className="relative block">
                {showDeckHint && <HintDot />}
                <GlassPanel className="p-4 hover:border-white/20 transition-colors">
                  <h3 className="font-bold text-white mb-1 font-heading">Deck Builder</h3>
                  <p className="text-xs text-gray-500">{decks.length} deck{decks.length !== 1 ? 's' : ''} built</p>
                </GlassPanel>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassPanel className="p-4">
              <h3 className="font-bold text-white mb-3 font-heading">Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <AnimatedStat value={profile.totalWins} color="#4ade80" />
                  <p className="text-xs text-gray-500">Wins</p>
                </div>
                <div>
                  <AnimatedStat value={profile.totalLosses} color="#f87171" />
                  <p className="text-xs text-gray-500">Losses</p>
                </div>
                <div>
                  <AnimatedStat value={profile.totalDraws} color="#9ca3af" />
                  <p className="text-xs text-gray-500">Draws</p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
