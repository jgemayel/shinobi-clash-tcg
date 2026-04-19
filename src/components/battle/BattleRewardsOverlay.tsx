'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCard } from '@/types/card';
import { AIDifficulty } from '@/types/enums';
import CardDisplay from '@/components/cards/CardDisplay';
import CardDetail from '@/components/cards/CardDetail';
import GlassPanel from '@/components/shared/GlassPanel';
import { getRarityColor, getRarityLabel } from '@/lib/rarityUtils';
import { soundManager } from '@/lib/sounds';

export interface BattleRewardSnapshot {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface Props {
  result: 'victory' | 'defeat' | 'draw';
  difficulty: AIDifficulty;
  xpGained: number;
  pre: BattleRewardSnapshot;
  post: BattleRewardSnapshot;
  cardReward: GameCard | null;
  isNewCard: boolean;
  turnCount: number;
  bonusPack?: boolean;
  onRematch: () => void;
  onExit: () => void;
}

const resultMeta: Record<Props['result'], { label: string; color: string; glow: string }> = {
  victory: { label: 'VICTORY', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.55)' },
  defeat:  { label: 'DEFEAT',  color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)'   },
  draw:    { label: 'DRAW',    color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.45)' },
};

function useCountUp(target: number, durationMs = 700, delayMs = 500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    const start = performance.now() + delayMs;
    let raf = 0;
    const tick = (now: number) => {
      if (now < start) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, delayMs]);
  return target <= 0 ? 0 : value;
}

export default function BattleRewardsOverlay({
  result, difficulty, xpGained, pre, post, cardReward, isNewCard, turnCount, bonusPack, onRematch, onExit,
}: Props) {
  const meta = resultMeta[result];
  const leveledUp = post.level > pre.level;
  const preRatio = pre.xpToNextLevel > 0 ? pre.xp / pre.xpToNextLevel : 0;
  const postRatio = post.xpToNextLevel > 0 ? post.xp / post.xpToNextLevel : 0;

  const [barRatio, setBarRatio] = useState(preRatio);
  const [displayLevel, setDisplayLevel] = useState(pre.level);
  const [displayMaxXp, setDisplayMaxXp] = useState(pre.xpToNextLevel);
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const [detail, setDetail] = useState<GameCard | null>(null);
  const xpCount = useCountUp(xpGained, 650, 400);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => {
      if (leveledUp) {
        setBarRatio(1);
        timers.push(setTimeout(() => {
          soundManager.levelUp();
          setLevelUpFlash(true);
          setDisplayLevel(post.level);
          setDisplayMaxXp(post.xpToNextLevel);
          timers.push(setTimeout(() => {
            setBarRatio(0);
            timers.push(setTimeout(() => {
              setBarRatio(postRatio);
              timers.push(setTimeout(() => setLevelUpFlash(false), 700));
            }, 120));
          }, 450));
        }, 750));
      } else {
        setBarRatio(postRatio);
      }
    }, 500));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cardReward) return;
    const delay = leveledUp ? 2400 : 1600;
    const t = setTimeout(() => soundManager.rareReveal(), delay);
    return () => clearTimeout(t);
  }, [cardReward, leveledUp]);

  const ctaDelay = cardReward
    ? (leveledUp ? 3.1 : 2.3)
    : (leveledUp ? 2.0 : 1.3);

  return (
    <motion.div
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <motion.div
        className="w-full max-w-md mx-auto px-4 min-h-full flex flex-col justify-center"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22, delay: 0.05 }}
      >
        <motion.div
          className="text-center mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        >
          <h1
            className="text-5xl font-extrabold font-heading tracking-wider"
            style={{ color: meta.color, textShadow: `0 0 28px ${meta.glow}` }}
          >
            {meta.label}
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-[0.2em]">
            vs {difficulty} · {turnCount} turn{turnCount === 1 ? '' : 's'}
          </p>
        </motion.div>

        <GlassPanel strong className="p-5 mb-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Level</p>
              <motion.p
                key={displayLevel}
                className="text-3xl font-extrabold font-heading"
                initial={{ scale: 1 }}
                animate={leveledUp && displayLevel === post.level ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                {displayLevel}
              </motion.p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider">XP Earned</p>
              <p
                className="text-3xl font-extrabold font-heading text-naruto-orange"
                style={{ textShadow: '0 0 14px rgba(249, 115, 22, 0.45)' }}
              >
                +{xpCount}
              </p>
            </div>
          </div>

          <div className="h-3 rounded-full bg-white/[0.07] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-naruto-orange via-amber-400 to-yellow-300 rounded-full"
              animate={{ width: `${barRatio * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 14px rgba(249, 115, 22, 0.55)' }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-right font-mono">
            {Math.round(barRatio * displayMaxXp)} / {displayMaxXp}
          </p>

          <AnimatePresence>
            {levelUpFlash && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span
                  className="text-3xl font-extrabold font-heading tracking-widest"
                  style={{ color: '#fbbf24', textShadow: '0 0 28px rgba(251, 191, 36, 0.9)' }}
                >
                  LEVEL UP!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>

        {cardReward && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: leveledUp ? 2.2 : 1.4, type: 'spring', stiffness: 220, damping: 20 }}
            className="mb-5"
          >
            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Card Drop</p>
                {isNewCard && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -6, 6, 0] }}
                    transition={{ delay: (leveledUp ? 2.8 : 2.0), type: 'spring', stiffness: 300 }}
                    className="text-[10px] font-black bg-naruto-orange text-black px-2 py-0.5 rounded-full font-heading tracking-wider"
                  >
                    NEW!
                  </motion.span>
                )}
              </div>
              <div className="flex items-center justify-center mb-3">
                <motion.div
                  initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: leveledUp ? 2.4 : 1.6, duration: 0.65, type: 'spring', stiffness: 180, damping: 18 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setDetail(cardReward)}
                  className="cursor-pointer"
                >
                  <CardDisplay card={cardReward} size="md" />
                </motion.div>
              </div>
              <p
                className="text-center text-sm font-bold font-heading"
                style={{ color: getRarityColor(cardReward.rarity) }}
              >
                {getRarityLabel(cardReward.rarity)}
              </p>
            </GlassPanel>
          </motion.div>
        )}

        {bonusPack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: cardReward ? (leveledUp ? 2.9 : 2.1) : (leveledUp ? 1.9 : 1.2), type: 'spring', stiffness: 250, damping: 18 }}
            className="mb-5"
          >
            <div
              className="rounded-xl p-4 flex items-center gap-3 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(249, 115, 22, 0.12))',
                border: '1.5px solid rgba(251, 191, 36, 0.55)',
                boxShadow: '0 0 28px rgba(251, 191, 36, 0.25)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c 60%, #991b1b)',
                  border: '2px solid rgba(251, 191, 36, 0.7)',
                  boxShadow: '0 4px 16px rgba(249, 115, 22, 0.4)',
                }}
              >
                <span className="text-2xl" role="img" aria-hidden>🎁</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black font-heading text-amber-200 leading-tight">
                  Bonus Pack Earned!
                </p>
                <p className="text-[11px] text-amber-100/70 leading-tight mt-0.5">
                  5-win milestone — a new pack is waiting for you.
                </p>
              </div>
              <motion.span
                className="text-lg font-black font-heading text-amber-300"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                +1
              </motion.span>
            </div>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ctaDelay }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onExit}
            className="py-3 rounded-xl bg-white/10 text-white font-bold font-heading hover:bg-white/15 transition-colors"
          >
            Return
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRematch}
            className="py-3 rounded-xl bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white font-bold font-heading btn-glow"
          >
            Rematch
          </motion.button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {detail && <CardDetail card={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
