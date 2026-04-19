'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAvatarById, DEFAULT_AVATAR_ID } from '@/lib/avatars';
import {
  ProfileSummary,
  readProfileIndex,
  createProfile,
  deleteProfile as deleteProfileStorage,
  setActiveProfile,
  MAX_PROFILES,
} from '@/lib/profileStorage';
import { soundManager } from '@/lib/sounds';

interface Particle {
  left: string;
  delay: string;
  duration: string;
  opacity: number;
  size: string;
  key: number;
}

function formatRelative(ms: number): string {
  const delta = Date.now() - ms;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < hour) return `${Math.max(1, Math.round(delta / minute))}m ago`;
  if (delta < day) return `${Math.round(delta / hour)}h ago`;
  if (delta < 30 * day) return `${Math.round(delta / day)}d ago`;
  return new Date(ms).toLocaleDateString();
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reads from localStorage which is only available post-hydration.
    setProfiles(readProfileIndex().profiles);
    setHydrated(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Client-only randomness avoids SSR hydration mismatch.
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${6 + Math.random() * 5}s`,
        opacity: 0.12 + Math.random() * 0.3,
        size: `${1 + Math.random() * 2}px`,
        key: i,
      }))
    );
  }, []);

  const handlePick = (id: string) => {
    soundManager.buttonClick();
    setActiveProfile(id);
    window.location.assign('/');
  };

  const handleCreate = () => {
    soundManager.buttonClick();
    const created = createProfile('Ninja', DEFAULT_AVATAR_ID);
    if (!created) return;
    // New profile has hasSeenWelcome=false so home will bounce to /welcome.
    window.location.assign('/welcome');
  };

  const handleConfirmDelete = (id: string) => {
    soundManager.buttonClick();
    const next = deleteProfileStorage(id);
    setProfiles(next.profiles);
    setConfirmDelete(null);
    // If nothing active remains, stay here; otherwise fall through.
  };

  const canCreate = profiles.length < MAX_PROFILES;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-naruto-dark">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(249, 115, 22, 0.16), transparent 55%), radial-gradient(ellipse at 20% 100%, rgba(239, 68, 68, 0.08), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(59, 130, 246, 0.08), transparent 60%)',
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

      <div className="flex-1 flex flex-col items-center px-5 pt-10 pb-8 relative z-10 max-w-lg mx-auto w-full">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-3xl font-bold font-heading mb-1">
            <span className="text-naruto-orange">Select</span>{' '}
            <span className="text-white">Profile</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {profiles.length === 0
              ? 'No profiles yet — create your first ninja'
              : `${profiles.length} profile${profiles.length === 1 ? '' : 's'} saved${canCreate ? '' : ' (max)'}`}
          </p>
        </motion.div>

        {!hydrated ? (
          <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
            Loading profiles…
          </div>
        ) : (
          <div className="w-full space-y-3">
            <AnimatePresence>
              {profiles.map((p, i) => {
                const avatar = getAvatarById(p.avatarId);
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, scale: 0.95 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                    className="relative"
                  >
                    <button
                      onClick={() => handlePick(p.id)}
                      className="w-full text-left rounded-xl overflow-hidden group transition-all"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)',
                        border: `1.5px solid ${avatar.accentColor}44`,
                        boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 6px 20px ${avatar.accentColor}22`,
                      }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div
                          className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2"
                          style={{ borderColor: avatar.accentColor, boxShadow: `0 0 20px ${avatar.accentColor}55` }}
                        >
                          <img
                            src={avatar.image}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                            draggable={false}
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xl font-bold font-heading text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            Lv {p.level} · {formatRelative(p.lastPlayed)}
                          </p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 group-hover:text-naruto-orange transition-colors shrink-0">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(p.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500/30 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors"
                      aria-label={`Delete ${p.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      </svg>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <motion.button
              layout
              onClick={handleCreate}
              disabled={!canCreate}
              whileHover={canCreate ? { scale: 1.01 } : undefined}
              whileTap={canCreate ? { scale: 0.99 } : undefined}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
                canCreate
                  ? 'border-naruto-orange/40 bg-naruto-orange/[0.03] hover:bg-naruto-orange/[0.08] text-naruto-orange'
                  : 'border-white/10 text-gray-600 cursor-not-allowed'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="font-heading font-bold">
                {canCreate ? 'Create New Profile' : `Maximum ${MAX_PROFILES} profiles`}
              </span>
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel-strong max-w-sm w-full p-6"
            >
              <h2 className="text-xl font-bold font-heading text-red-300 mb-2">Delete Profile?</h2>
              <p className="text-sm text-gray-400 mb-5">
                This will permanently remove{' '}
                <span className="text-white font-bold">
                  {profiles.find((p) => p.id === confirmDelete)?.name ?? 'this profile'}
                </span>
                , including all cards, decks, and progress. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 text-gray-300 font-heading hover:bg-white/15"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-lg bg-red-500/25 text-red-300 font-heading font-bold hover:bg-red-500/35 border border-red-500/30"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
