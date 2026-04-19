'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MainNav from '@/components/layout/MainNav';
import CardDisplay from '@/components/cards/CardDisplay';
import CardDetail from '@/components/cards/CardDetail';
import GlassPanel from '@/components/shared/GlassPanel';
import PageTransition from '@/components/shared/PageTransition';
import { useGameStore } from '@/store';
import { getCardSet, getAllCardSets } from '@/data/cardLoader';
import { generatePack } from '@/lib/rarityUtils';
import { getRarityColor, getRarityLabel } from '@/lib/rarityUtils';
import { GameCard } from '@/types/card';
import { Rarity } from '@/types/enums';
import { XP_PER_PACK, MAX_STORED_PACKS } from '@/lib/constants';
import { soundManager } from '@/lib/sounds';

type PackState = 'select' | 'tearing' | 'reveal' | 'done';

const RARE_RARITIES = [Rarity.Rare, Rarity.UltraRare, Rarity.Legendary, Rarity.Secret, Rarity.Crown];

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function PacksPage() {
  const availablePacks = useGameStore((s) => s.availablePacks);
  const openPack = useGameStore((s) => s.openPack);
  const addCards = useGameStore((s) => s.addCards);
  const addXp = useGameStore((s) => s.addXp);
  const rechargePacks = useGameStore((s) => s.rechargePacks);
  const getTimeToNextPack = useGameStore((s) => s.getTimeToNextPack);
  const ownedCards = useGameStore((s) => s.ownedCards);

  const [selectedSetId, setSelectedSetId] = useState('hidden-leaf-origins');
  const [revealedCards, setRevealedCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [packState, setPackState] = useState<PackState>('select');
  const [detailCard, setDetailCard] = useState<GameCard | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [rechargeTime, setRechargeTime] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const preOpenSnapshot = useRef<Record<string, number>>({});

  const sets = getAllCardSets();

  useEffect(() => {
    rechargePacks();
  }, [rechargePacks]);

  // Pack recharge countdown
  useEffect(() => {
    const update = () => {
      const ms = getTimeToNextPack();
      setRechargeTime(ms > 0 ? formatTime(ms) : '');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [getTimeToNextPack, availablePacks]);

  const handleOpenPack = useCallback(() => {
    const cardSet = getCardSet(selectedSetId);
    if (!cardSet || !openPack()) return;

    // Snapshot owned cards before adding new ones
    preOpenSnapshot.current = { ...ownedCards };

    const cards = generatePack(cardSet);
    setRevealedCards(cards);
    setFlippedCards(new Set());
    setPackState('tearing');
    soundManager.packRip();

    // Add cards immediately, reveal is cosmetic
    addCards(cards.map((c) => c.id));
    addXp(XP_PER_PACK);

    // After tear animation, go to reveal
    setTimeout(() => {
      setPackState('reveal');
    }, 400);
  }, [selectedSetId, openPack, addCards, addXp, ownedCards]);

  const handleFlipCard = (index: number) => {
    if (flippedCards.has(index)) return;
    soundManager.cardFlip();
    setFlippedCards((prev) => new Set([...prev, index]));

    const card = revealedCards[index];
    if (RARE_RARITIES.includes(card.rarity)) {
      soundManager.rareReveal();
      setScreenFlash(true);
      setShake(true);
      setTimeout(() => setScreenFlash(false), 300);
      setTimeout(() => setShake(false), 200);
    }
  };

  const handleRevealAll = () => {
    const newFlipped = new Set<number>();
    revealedCards.forEach((_, i) => newFlipped.add(i));
    setFlippedCards(newFlipped);
    soundManager.cardFlip();
  };

  const handleDone = () => {
    setPackState('select');
    setRevealedCards([]);
    setFlippedCards(new Set());
  };

  const allFlipped = flippedCards.size === revealedCards.length && revealedCards.length > 0;

  // Compute pack summary
  const packSummary = allFlipped ? (() => {
    const snap = preOpenSnapshot.current;
    let newCount = 0;
    let dupeCount = 0;
    const rarityBreakdown: Record<string, number> = {};
    for (const card of revealedCards) {
      if ((snap[card.id] ?? 0) === 0) newCount++;
      else dupeCount++;
      rarityBreakdown[card.rarity] = (rarityBreakdown[card.rarity] ?? 0) + 1;
    }
    return { newCount, dupeCount, rarityBreakdown };
  })() : null;

  return (
    <div className="flex-1 pb-20 bg-packs min-h-screen relative">
      <MainNav />

      {screenFlash && (
        <div className="fixed inset-0 bg-white/70 z-40 pointer-events-none screen-flash" />
      )}

      <PageTransition>
        <div ref={containerRef} className={`max-w-2xl mx-auto px-4 pt-6 ${shake ? 'screen-shake' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold font-heading">Packs</h1>
            <GlassPanel className="px-4 py-1.5 text-sm !rounded-full">
              <span className="text-gray-400">Available: </span>
              <span className="text-naruto-orange font-bold">{availablePacks}</span>
            </GlassPanel>
          </div>

          {/* Recharge countdown */}
          {rechargeTime && availablePacks < MAX_STORED_PACKS && (
            <p className="text-xs text-gray-500 mb-4 text-center">
              Next pack in <span className="text-gray-300 font-mono">{rechargeTime}</span>
            </p>
          )}
          {!rechargeTime && <div className="mb-4" />}

          <AnimatePresence mode="wait">
            {packState === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-3 mb-6">
                  {sets.map((set) => (
                    <motion.button
                      key={set.setId}
                      onClick={() => setSelectedSetId(set.setId)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left rounded-xl border transition-all ${
                        selectedSetId === set.setId
                          ? 'border-naruto-orange/60 pack-glow'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <GlassPanel className="p-4 !rounded-xl" strong={selectedSetId === set.setId}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold font-heading">{set.setName}</h3>
                            <p className="text-xs text-gray-500">{set.cards.length} cards</p>
                          </div>
                          {selectedSetId === set.setId && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-naruto-orange text-sm font-heading"
                            >
                              Selected
                            </motion.span>
                          )}
                        </div>
                      </GlassPanel>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleOpenPack}
                  disabled={availablePacks <= 0}
                  whileHover={availablePacks > 0 ? { scale: 1.02 } : undefined}
                  whileTap={availablePacks > 0 ? { scale: 0.98 } : undefined}
                  className={`w-full py-4 rounded-xl text-lg font-bold font-heading transition-all btn-glow ${
                    availablePacks > 0
                      ? 'bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {availablePacks > 0 ? 'Open Pack!' : 'No Packs Available'}
                </motion.button>
              </motion.div>
            )}

            {packState === 'tearing' && (
              <motion.div
                key="tearing"
                className="flex items-center justify-center py-16"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative w-48 h-64">
                  <motion.div
                    className="absolute inset-0 rounded-l-xl overflow-hidden"
                    style={{
                      width: '50%',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
                    }}
                    animate={{ x: -60, rotate: -8, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeIn' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-r-xl overflow-hidden"
                    style={{
                      left: '50%',
                      width: '50%',
                      background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                      clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
                    }}
                    animate={{ x: 60, rotate: 8, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeIn' }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                  >
                    <div className="w-4 h-4 rounded-full bg-naruto-orange blur-xl" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {(packState === 'reveal' || packState === 'done') && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-center text-gray-400 text-sm mb-4">
                  {allFlipped ? 'All cards revealed!' : 'Tap cards to reveal, or reveal all at once'}
                </p>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {revealedCards.map((card, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.3, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        delay: i * 0.1,
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <div className={`card-3d ${flippedCards.has(i) ? 'card-flipped' : ''}`}>
                        <div className="card-inner" style={{ width: '100px', height: '140px' }}>
                          <div
                            className="card-front cursor-pointer flex items-center justify-center"
                            onClick={() => handleFlipCard(i)}
                            style={{
                              background: 'linear-gradient(135deg, #f97316, #ea580c)',
                              border: '2px solid rgba(249, 115, 22, 0.6)',
                            }}
                          >
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white/60 font-heading">?</span>
                            </div>
                          </div>
                          <div className="card-back">
                            <div onClick={() => flippedCards.has(i) && setDetailCard(card)} className="cursor-pointer">
                              <CardDisplay card={card} size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                      {flippedCards.has(i) && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] mt-1 font-bold"
                          style={{ color: getRarityColor(card.rarity) }}
                        >
                          {getRarityLabel(card.rarity)}
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Reveal All - always visible when not all flipped */}
                {!allFlipped && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleRevealAll}
                    className="w-full py-2 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors mb-3"
                  >
                    Reveal All
                  </motion.button>
                )}

                {/* Pack summary */}
                {allFlipped && packSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassPanel className="p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <motion.span
                          className="text-naruto-orange font-bold font-heading"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          +{XP_PER_PACK} XP
                        </motion.span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-green-400">{packSummary.newCount} new</span>
                          {packSummary.dupeCount > 0 && (
                            <span className="text-gray-500">{packSummary.dupeCount} duplicate{packSummary.dupeCount > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(packSummary.rarityBreakdown).map(([rarity, count]) => (
                          <span
                            key={rarity}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5"
                            style={{ color: getRarityColor(rarity as Rarity) }}
                          >
                            {count}x {getRarityLabel(rarity as Rarity)}
                          </span>
                        ))}
                      </div>
                    </GlassPanel>

                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDone}
                        className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold font-heading hover:bg-white/15 transition-colors"
                      >
                        Done
                      </motion.button>
                      {availablePacks > 0 && (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={handleOpenPack}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white font-bold font-heading btn-glow"
                        >
                          Open Next Pack
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>

      <AnimatePresence>
        {detailCard && (
          <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
