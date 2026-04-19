'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/store';
import { AVATARS, getAvatarById } from '@/lib/avatars';
import { soundManager } from '@/lib/sounds';
import {
  getActiveProfileId,
  createProfile,
  updateProfileSummary,
} from '@/lib/profileStorage';
import { DEFAULT_AVATAR_ID } from '@/lib/avatars';

type Step = 'intro' | 'name' | 'avatar' | 'packs';

const STARTER_PACKS = 10;
const MAX_NAME_LEN = 16;

function KonohaSpiral({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="spiralGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9a33" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="spiralOrange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd27a" />
          <stop offset="50%" stopColor="#ffa024" />
          <stop offset="100%" stopColor="#ff5a00" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#spiralGlow)" />
      <path
        d="M 100,40
           A 60,60 0 1 1 40,100
           A 44,44 0 1 0 100,56
           A 28,28 0 1 1 128,84
           A 12,12 0 1 0 116,96"
        stroke="url(#spiralOrange)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface Particle {
  left: string;
  delay: string;
  duration: string;
  opacity: number;
  size: string;
  key: number;
}

export default function WelcomePage() {
  const router = useRouter();
  const hasSeenWelcome = useGameStore((s) => s.hasSeenWelcome);
  const profile = useGameStore((s) => s.profile);
  const setName = useGameStore((s) => s.setName);
  const setAvatar = useGameStore((s) => s.setAvatar);
  const setHasSeenWelcome = useGameStore((s) => s.setHasSeenWelcome);
  const addPacks = useGameStore((s) => s.addPacks);

  const [step, setStep] = useState<Step>('intro');
  const [nameInput, setNameInput] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Guard: welcome requires an active profile slot. If none, create one and
    // reload so the store rebinds to the new slot.
    if (!getActiveProfileId()) {
      if (createProfile('Ninja', DEFAULT_AVATAR_ID)) {
        window.location.reload();
      } else {
        router.replace('/profiles');
      }
      return;
    }
    if (hasSeenWelcome) router.replace('/');
  }, [hasSeenWelcome, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Generated client-side only to avoid SSR hydration mismatch on random values.
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${6 + Math.random() * 6}s`,
        opacity: 0.15 + Math.random() * 0.35,
        size: `${1 + Math.random() * 2}px`,
        key: i,
      }))
    );
  }, []);

  const chosenAvatar = useMemo(
    () => (selectedAvatarId ? getAvatarById(selectedAvatarId) : null),
    [selectedAvatarId]
  );

  const goTo = (s: Step) => {
    soundManager.buttonClick();
    setStep(s);
  };

  const handleFinish = () => {
    const trimmed = nameInput.trim() || profile.name || 'Ninja';
    const avatarId = selectedAvatarId ?? profile.avatarId ?? DEFAULT_AVATAR_ID;
    setName(trimmed);
    if (selectedAvatarId) setAvatar(selectedAvatarId);
    addPacks(STARTER_PACKS);
    setHasSeenWelcome();
    const activeId = getActiveProfileId();
    if (activeId) {
      updateProfileSummary(activeId, {
        name: trimmed,
        avatarId,
        level: profile.level,
        lastPlayed: Date.now(),
      });
    }
    soundManager.rareReveal();
    router.push('/packs');
  };

  const nameValid = nameInput.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-naruto-dark">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(249, 115, 22, 0.18), transparent 50%), radial-gradient(ellipse at 20% 100%, rgba(239, 68, 68, 0.10), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(59, 130, 246, 0.08), transparent 60%)',
        }}
      />

      {particles.map((p) => (
        <div
          key={p.key}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
            width: p.size,
            height: p.size,
          }}
        />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 relative z-10 max-w-md mx-auto w-full">
        <StepDots current={step} />

        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              className="text-center w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
                className="mx-auto mb-6 flex items-center justify-center"
              >
                <KonohaSpiral />
              </motion.div>
              <motion.h1
                className="text-5xl font-extrabold font-heading mb-2 tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <span className="text-naruto-orange">Shinobi</span>{' '}
                <span className="text-white">Clash</span>
              </motion.h1>
              <motion.p
                className="text-gray-400 text-sm tracking-wide mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Collect ninja cards. Build decks. Become Hokage.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goTo('name')}
                className="w-full max-w-xs mx-auto py-3.5 rounded-xl bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white font-bold font-heading btn-glow text-lg"
              >
                Begin
              </motion.button>
            </motion.div>
          )}

          {step === 'name' && (
            <motion.div
              key="name"
              className="w-full"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold font-heading text-center mb-2">
                Choose your ninja name
              </h2>
              <p className="text-gray-400 text-sm text-center mb-8">
                What shall we call you?
              </p>

              <div className="glass-panel-strong p-5 mb-6">
                <input
                  type="text"
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.slice(0, MAX_NAME_LEN))}
                  onKeyDown={(e) => e.key === 'Enter' && nameValid && goTo('avatar')}
                  placeholder="e.g. Kage"
                  maxLength={MAX_NAME_LEN}
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-naruto-orange outline-none py-2 text-center text-2xl font-heading text-white placeholder-gray-600 transition-colors"
                />
                <p className="text-right text-xs text-gray-500 mt-2 font-mono">
                  {nameInput.length}/{MAX_NAME_LEN}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goTo('intro')}
                  className="px-5 py-3 rounded-xl bg-white/5 text-gray-400 font-heading hover:bg-white/10 transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={nameValid ? { scale: 1.02 } : undefined}
                  whileTap={nameValid ? { scale: 0.97 } : undefined}
                  disabled={!nameValid}
                  onClick={() => goTo('avatar')}
                  className={`flex-1 py-3 rounded-xl font-bold font-heading transition-colors ${
                    nameValid
                      ? 'bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white btn-glow'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'avatar' && (
            <motion.div
              key="avatar"
              className="w-full"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold font-heading text-center mb-2">
                Pick your avatar
              </h2>
              <p className="text-gray-400 text-sm text-center mb-6">
                {chosenAvatar ? chosenAvatar.name : 'Tap a ninja to choose'}
              </p>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {AVATARS.map((avatar) => {
                  const selected = selectedAvatarId === avatar.id;
                  return (
                    <motion.button
                      key={avatar.id}
                      whileTap={{ scale: 0.93 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedAvatarId(avatar.id);
                        soundManager.cardFlip();
                      }}
                      className="relative aspect-square rounded-full overflow-hidden bg-white/[0.04] border-2 transition-all"
                      style={{
                        borderColor: selected ? avatar.accentColor : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: selected
                          ? `0 0 20px ${avatar.accentColor}88, 0 0 0 2px ${avatar.accentColor}55 inset`
                          : 'none',
                      }}
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                        loading="lazy"
                      />
                      {selected && (
                        <motion.div
                          layoutId="avatar-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-naruto-orange flex items-center justify-center border-2 border-naruto-dark"
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6.5L5 9L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goTo('name')}
                  className="px-5 py-3 rounded-xl bg-white/5 text-gray-400 font-heading hover:bg-white/10 transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={selectedAvatarId ? { scale: 1.02 } : undefined}
                  whileTap={selectedAvatarId ? { scale: 0.97 } : undefined}
                  disabled={!selectedAvatarId}
                  onClick={() => goTo('packs')}
                  className={`flex-1 py-3 rounded-xl font-bold font-heading transition-colors ${
                    selectedAvatarId
                      ? 'bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white btn-glow'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'packs' && (
            <motion.div
              key="packs"
              className="w-full text-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                className="relative mx-auto w-32 h-40 mb-6"
              >
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-naruto-orange/60"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c 60%, #991b1b)',
                    boxShadow: '0 12px 40px rgba(249, 115, 22, 0.35)',
                  }}
                >
                  <div className="absolute inset-2 rounded-xl border border-white/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white/70 font-heading">?</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 14 }}
                  className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-naruto-orange text-white font-extrabold font-heading text-2xl flex items-center justify-center border-4 border-naruto-dark"
                  style={{ boxShadow: '0 0 28px rgba(249, 115, 22, 0.7)' }}
                >
                  ×{STARTER_PACKS}
                </motion.div>
              </motion.div>

              {chosenAvatar && (
                <motion.div
                  className="flex items-center justify-center gap-3 mb-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden border-2"
                    style={{ borderColor: chosenAvatar.accentColor }}
                  >
                    <img src={chosenAvatar.image} alt={chosenAvatar.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-lg font-bold font-heading text-white">
                    {nameInput.trim() || 'Ninja'}
                  </span>
                </motion.div>
              )}

              <motion.h2
                className="text-2xl font-bold font-heading mb-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                Welcome to the village!
              </motion.h2>
              <motion.p
                className="text-gray-400 text-sm mb-7 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                You&apos;ve received <span className="text-naruto-orange font-bold">{STARTER_PACKS} starter packs</span> to build your collection.
              </motion.p>

              <motion.div
                className="glass-panel-strong p-4 mb-7 text-left space-y-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                {[
                  { n: 1, title: 'Open Packs', desc: 'Collect ninja from booster packs' },
                  { n: 2, title: 'Build a Deck', desc: 'Assemble 20 cards for battle' },
                  { n: 3, title: 'Battle AI', desc: 'Win matches to earn XP and cards' },
                ].map((item) => (
                  <div key={item.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-naruto-orange/20 text-naruto-orange flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {item.n}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-naruto-orange to-naruto-orange-dark text-white font-bold font-heading btn-glow text-lg"
              >
                Enter the Village
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepDots({ current }: { current: Step }) {
  const order: Step[] = ['intro', 'name', 'avatar', 'packs'];
  const idx = order.indexOf(current);
  return (
    <div className="flex items-center gap-2 mb-10">
      {order.map((s, i) => (
        <div
          key={s}
          className="h-1.5 rounded-full transition-all"
          style={{
            width: i === idx ? '28px' : '8px',
            backgroundColor: i <= idx ? '#f97316' : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  );
}
