'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MainNav from '@/components/layout/MainNav';
import GlassPanel from '@/components/shared/GlassPanel';
import PageTransition from '@/components/shared/PageTransition';
import BattleBoard from '@/components/battle/BattleBoard';
import BattleRewardsOverlay, { BattleRewardSnapshot } from '@/components/battle/BattleRewardsOverlay';
import { useGameStore } from '@/store';
import { AIDifficulty, BattlePhase } from '@/types/enums';
import { BattleAction } from '@/types/battle';
import { GameCard } from '@/types/card';
import { getCardsByIds, getCardSet } from '@/data/cardLoader';
import { buildAIDeck } from '@/lib/aiDeckBuilder';
import { rollBattleReward } from '@/lib/rarityUtils';
import { chooseBestAction } from '@/ai/AIController';
import { soundManager } from '@/lib/sounds';
import { XP_PER_WIN, XP_PER_LOSS } from '@/lib/constants';

const WINS_PER_BONUS_PACK = 5;

const difficulties = [
  { value: AIDifficulty.Academy, label: 'Academy', desc: 'Random moves - easy win', color: '#4ade80' },
  { value: AIDifficulty.Genin, label: 'Genin', desc: 'Basic strategy', color: '#60a5fa' },
  { value: AIDifficulty.Chunin, label: 'Chunin', desc: 'Balanced gameplay', color: '#a78bfa' },
  { value: AIDifficulty.Jonin, label: 'Jonin', desc: 'Smart decisions', color: '#f59e0b' },
  { value: AIDifficulty.Kage, label: 'Kage', desc: 'Master strategist', color: '#ef4444' },
];

const xpMultByDifficulty: Record<AIDifficulty, { win: number; loss: number }> = {
  [AIDifficulty.Academy]: { win: 0.5, loss: 0.5 },
  [AIDifficulty.Genin]:   { win: 1.0, loss: 1.0 },
  [AIDifficulty.Chunin]:  { win: 1.5, loss: 1.2 },
  [AIDifficulty.Jonin]:   { win: 2.0, loss: 1.5 },
  [AIDifficulty.Kage]:    { win: 3.0, loss: 2.0 },
};

interface RewardData {
  result: 'victory' | 'defeat' | 'draw';
  pre: BattleRewardSnapshot;
  post: BattleRewardSnapshot;
  turnCount: number;
  xpGained: number;
  cardReward: GameCard | null;
  isNewCard: boolean;
  bonusPack: boolean;
}

export default function BattlePage() {
  const [difficulty, setDifficulty] = useState<AIDifficulty>(AIDifficulty.Genin);
  const [showVS, setShowVS] = useState(false);
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [autoBattle, setAutoBattle] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration flag; one-shot post-mount.
    setHydrated(true);
  }, []);
  const activeDeck = useGameStore((s) => s.getActiveDeck());
  const decks = useGameStore((s) => s.decks);

  const battleState = useGameStore((s) => s.battleState);
  const isAnimating = useGameStore((s) => s.isAnimating);
  const startBattle = useGameStore((s) => s.startBattle);
  const performAction = useGameStore((s) => s.performAction);
  const aiTakeTurn = useGameStore((s) => s.aiTakeTurn);
  const endBattle = useGameStore((s) => s.endBattle);

  const [damagePopups, setDamagePopups] = useState<{ id: number; amount: number; isHeal: boolean; side: 'player' | 'opponent' }[]>([]);
  const popupId = useRef(0);
  const resultRecorded = useRef(false);

  const kickoffBattle = useCallback(() => {
    if (!activeDeck) return;
    const playerCards = getCardsByIds(activeDeck.cardIds);
    const aiDeck = buildAIDeck();

    setShowVS(true);
    soundManager.buttonClick();

    setTimeout(() => {
      setShowVS(false);
      startBattle(playerCards, aiDeck, difficulty);
      resultRecorded.current = false;
    }, 1200);
  }, [activeDeck, difficulty, startBattle]);

  const handleAction = useCallback((action: BattleAction) => {
    soundManager.buttonClick();
    const events = performAction(action);

    for (const event of events) {
      if (event.type === 'damage-dealt' && typeof event.data.amount === 'number') {
        const side = event.data.targetId === battleState?.player.active?.instanceId ? 'player' : 'opponent';
        const id = ++popupId.current;
        setDamagePopups((prev) => [...prev, { id, amount: event.data.amount as number, isHeal: false, side }]);
        soundManager.attackHit();
        setTimeout(() => setDamagePopups((prev) => prev.filter((p) => p.id !== id)), 800);
      }
      if (event.type === 'ko') {
        soundManager.pointScored();
      }
    }
  }, [performAction, battleState]);

  useEffect(() => {
    if (battleState && battleState.activePlayer === 'opponent' && battleState.phase !== BattlePhase.GameOver && !isAnimating) {
      aiTakeTurn();
    }
  }, [battleState?.activePlayer, battleState?.phase, isAnimating, aiTakeTurn]);

  // Auto-battle loop — one long-running loop that lives as long as the toggle
  // is on. It polls the store directly (so it never gets torn down and
  // restarted by per-action state updates) and plays the best legal move
  // whenever it's the player's turn. Toggling off cancels it promptly; game
  // over ends it naturally.
  useEffect(() => {
    if (!autoBattle) return;
    let cancelled = false;

    const run = async () => {
      // Small initial delay so the UI can render the toggle state
      await new Promise((r) => setTimeout(r, 200));

      while (!cancelled) {
        const store = useGameStore.getState();
        const current = store.battleState;
        if (!current) return;
        if (current.phase === BattlePhase.GameOver) return;

        if (current.activePlayer !== 'player') {
          // Wait for the opponent's turn to finish — short poll interval
          // so we pick up the handoff quickly.
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }

        const action = chooseBestAction(current);
        store.performAction(action);

        // Brief pause between actions so the user can see what happened.
        await new Promise((r) => setTimeout(r, 400));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [autoBattle]);

  // Handle game over — snapshot, grant rewards, then show overlay
  useEffect(() => {
    if (battleState?.phase !== BattlePhase.GameOver || resultRecorded.current) return;
    resultRecorded.current = true;

    const store = useGameStore.getState();
    const pre: BattleRewardSnapshot = {
      level: store.profile.level,
      xp: store.profile.xp,
      xpToNextLevel: store.profile.xpToNextLevel,
    };
    const turnCount = battleState.turn;
    const mult = xpMultByDifficulty[difficulty] ?? { win: 1, loss: 1 };

    let xpGained = 0;
    let cardReward: GameCard | null = null;
    let isNewCard = false;
    let result: 'victory' | 'defeat' | 'draw' = 'draw';

    let bonusPack = false;

    if (battleState.winner === 'player') {
      result = 'victory';
      soundManager.victory();
      xpGained = Math.round(XP_PER_WIN * mult.win);
      store.recordWin();
      const bonus = xpGained - XP_PER_WIN;
      if (bonus > 0) useGameStore.getState().addXp(bonus);

      const cardSet = getCardSet('hidden-leaf-origins');
      if (cardSet) {
        cardReward = rollBattleReward(cardSet, difficulty);
        isNewCard = (store.ownedCards[cardReward.id] ?? 0) === 0;
        useGameStore.getState().addCard(cardReward.id);
      }

      // Bonus pack every Nth win
      const newTotalWins = useGameStore.getState().profile.totalWins;
      if (newTotalWins > 0 && newTotalWins % WINS_PER_BONUS_PACK === 0) {
        useGameStore.getState().addPacks(1);
        bonusPack = true;
      }
    } else if (battleState.winner === 'opponent') {
      result = 'defeat';
      soundManager.defeat();
      xpGained = Math.round(XP_PER_LOSS * mult.loss);
      store.recordLoss();
      const bonus = xpGained - XP_PER_LOSS;
      if (bonus > 0) useGameStore.getState().addXp(bonus);
    } else {
      result = 'draw';
      store.recordDraw();
    }

    const postStore = useGameStore.getState();
    const post: BattleRewardSnapshot = {
      level: postStore.profile.level,
      xp: postStore.profile.xp,
      xpToNextLevel: postStore.profile.xpToNextLevel,
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Derived once from GameOver transition; guarded by resultRecorded ref.
    setRewardData({ result, pre, post, turnCount, xpGained, cardReward, isNewCard, bonusPack });
  }, [battleState, difficulty]);

  const handleQuit = useCallback(() => {
    endBattle();
    setRewardData(null);
  }, [endBattle]);

  const handleRematch = useCallback(() => {
    if (!activeDeck) return;
    endBattle();
    setRewardData(null);
    setShowVS(true);
    soundManager.buttonClick();
    const playerCards = getCardsByIds(activeDeck.cardIds);
    const aiDeck = buildAIDeck();
    setTimeout(() => {
      setShowVS(false);
      startBattle(playerCards, aiDeck, difficulty);
      resultRecorded.current = false;
    }, 1200);
  }, [activeDeck, difficulty, endBattle, startBattle]);

  if (showVS) {
    return (
      <div className="flex items-center justify-center h-screen bg-battle">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <p className="text-6xl font-bold font-heading text-naruto-orange" style={{ textShadow: '0 0 40px rgba(249, 115, 22, 0.5)' }}>
            VS
          </p>
          <p className="text-sm text-gray-400 mt-2">{difficulty}</p>
        </motion.div>
      </div>
    );
  }

  if (battleState) {
    const gameOver = battleState.phase === BattlePhase.GameOver;
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between px-3 py-2 bg-naruto-navy/90 border-b border-white/[0.06] backdrop-blur-sm gap-2">
          <span className="text-sm font-bold font-heading shrink-0">
            <span className="text-naruto-orange">{difficulty}</span>
          </span>
          <div className="flex items-center gap-2">
            {!gameOver && (
              <button
                onClick={() => setAutoBattle((v) => !v)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-heading transition-colors"
                style={{
                  background: autoBattle ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${autoBattle ? 'rgba(249, 115, 22, 0.6)' : 'rgba(255,255,255,0.1)'}`,
                  color: autoBattle ? '#fed7aa' : '#9ca3af',
                }}
                aria-pressed={autoBattle}
                aria-label="Toggle auto-battle"
              >
                <span
                  className="inline-block w-7 h-3.5 rounded-full relative transition-colors"
                  style={{ background: autoBattle ? '#f97316' : 'rgba(255,255,255,0.15)' }}
                >
                  <span
                    className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all"
                    style={{ left: autoBattle ? '15px' : '2px' }}
                  />
                </span>
                AUTO
              </button>
            )}
            {!gameOver && (
              <button
                onClick={handleQuit}
                className="px-3 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                Quit
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <BattleBoard
            state={battleState}
            onAction={handleAction}
            isAnimating={isAnimating || autoBattle}
            damagePopups={damagePopups}
          />
        </div>
        <AnimatePresence>
          {rewardData && (
            <BattleRewardsOverlay
              key="rewards"
              result={rewardData.result}
              difficulty={difficulty}
              pre={rewardData.pre}
              post={rewardData.post}
              xpGained={rewardData.xpGained}
              cardReward={rewardData.cardReward}
              isNewCard={rewardData.isNewCard}
              turnCount={rewardData.turnCount}
              bonusPack={rewardData.bonusPack}
              onRematch={handleRematch}
              onExit={handleQuit}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <PageTransition>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold mb-6 font-heading">Battle</h1>

          {/* Gate state-dependent UI behind hydration so SSR HTML matches client. */}
          {hydrated && !activeDeck && (
            <GlassPanel className="p-4 mb-6 border-yellow-500/30">
              <p className="text-yellow-200 text-sm">
                {decks.length === 0
                  ? 'You need to build a deck first! Go to Deck Builder to create one.'
                  : 'Select an active deck in the Deck Builder before battling.'}
              </p>
            </GlassPanel>
          )}

          {hydrated && activeDeck && (
            <GlassPanel className="p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Active Deck</p>
                  <p className="font-bold font-heading">{activeDeck.name}</p>
                </div>
                <span className="text-sm text-gray-400">{activeDeck.cardIds.length} cards</span>
              </div>
            </GlassPanel>
          )}
          {!hydrated && (
            <GlassPanel className="p-4 mb-6">
              <div className="h-6" />
            </GlassPanel>
          )}

          <h2 className="text-lg font-bold mb-3 font-heading">Select Difficulty</h2>
          <div className="space-y-2 mb-6">
            {difficulties.map(({ value, label, desc, color }) => {
              const mult = xpMultByDifficulty[value];
              return (
                <motion.button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left rounded-xl border transition-all ${
                    difficulty === value ? 'border-naruto-orange/60' : 'border-white/[0.06]'
                  }`}
                >
                  <GlassPanel className="p-4 !rounded-xl" strong={difficulty === value}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <div>
                          <h3 className="font-bold font-heading">{label}</h3>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-naruto-orange/80 font-mono">×{mult.win.toFixed(1)} XP</span>
                        {difficulty === value && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-naruto-orange text-sm font-heading"
                          >
                            Selected
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </GlassPanel>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={kickoffBattle}
            disabled={!hydrated || !activeDeck}
            whileHover={hydrated && activeDeck ? { scale: 1.02 } : undefined}
            whileTap={hydrated && activeDeck ? { scale: 0.98 } : undefined}
            className={`w-full py-4 rounded-xl text-lg font-bold font-heading transition-all btn-glow ${
              hydrated && activeDeck
                ? 'bg-gradient-to-r from-red-500 to-naruto-orange text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Battle!
          </motion.button>
        </div>
      </PageTransition>
    </div>
  );
}
