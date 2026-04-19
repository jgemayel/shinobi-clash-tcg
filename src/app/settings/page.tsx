'use client';

import { useState } from 'react';
import MainNav from '@/components/layout/MainNav';
import GlassPanel from '@/components/shared/GlassPanel';
import PageTransition from '@/components/shared/PageTransition';
import { useGameStore } from '@/store';
import { soundManager } from '@/lib/sounds';
import { AVATARS, getAvatarById } from '@/lib/avatars';
import {
  getActiveProfileId,
  updateProfileSummary,
  deleteProfile as deleteProfileStorage,
} from '@/lib/profileStorage';

export default function SettingsPage() {
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const animationSpeed = useGameStore((s) => s.animationSpeed);
  const testMode = useGameStore((s) => s.testMode);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const setAnimationSpeed = useGameStore((s) => s.setAnimationSpeed);
  const setTestMode = useGameStore((s) => s.setTestMode);
  const profile = useGameStore((s) => s.profile);
  const setName = useGameStore((s) => s.setName);
  const setAvatar = useGameStore((s) => s.setAvatar);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showReset, setShowReset] = useState(false);
  const currentAvatar = getAvatarById(profile.avatarId);

  const handleNameSave = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length === 0) return;
    setName(trimmed);
    const id = getActiveProfileId();
    if (id) {
      // eslint-disable-next-line react-hooks/purity -- Event handler timestamp.
      updateProfileSummary(id, { name: trimmed, lastPlayed: Date.now() });
    }
  };

  const handleAvatarPick = (avatarId: string) => {
    setAvatar(avatarId);
    soundManager.cardFlip();
    const id = getActiveProfileId();
    if (id) {
      // eslint-disable-next-line react-hooks/purity -- Event handler timestamp.
      updateProfileSummary(id, { avatarId, lastPlayed: Date.now() });
    }
  };

  const handleSwitchProfile = () => {
    soundManager.buttonClick();
    window.location.assign('/profiles');
  };

  const handleDeleteCurrentProfile = () => {
    const id = getActiveProfileId();
    if (!id) return;
    deleteProfileStorage(id);
    window.location.assign('/profiles');
  };

  return (
    <div className="flex-1 pb-20">
      <MainNav />

      <PageTransition>
        <div className="max-w-lg mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold mb-6 font-heading">Settings</h1>

          {/* Profile */}
          <GlassPanel className="p-4 mb-4">
            <h3 className="font-bold text-sm mb-3 font-heading">Profile</h3>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0"
                style={{ borderColor: currentAvatar.accentColor }}
              >
                <img src={currentAvatar.image} alt={currentAvatar.name} className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  maxLength={16}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-naruto-orange/50 transition-colors"
                />
                <button
                  onClick={handleNameSave}
                  className="px-3 py-2 rounded-lg text-xs bg-naruto-orange/20 text-naruto-orange hover:bg-naruto-orange/30 transition-colors font-heading"
                >
                  Save
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">Avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => {
                const selected = a.id === profile.avatarId;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleAvatarPick(a.id)}
                    className="relative aspect-square rounded-full overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: selected ? a.accentColor : 'rgba(255,255,255,0.08)',
                      boxShadow: selected ? `0 0 12px ${a.accentColor}aa` : 'none',
                    }}
                  >
                    <img src={a.image} alt={a.name} className="w-full h-full object-cover" draggable={false} loading="lazy" />
                  </button>
                );
              })}
            </div>
          </GlassPanel>

          {/* Sound */}
          <GlassPanel className="p-4 mb-4">
            <h3 className="font-bold text-sm mb-3 font-heading">Sound</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">SFX Volume</label>
                  <span className="text-xs text-gray-500">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-naruto-orange h-1"
                  />
                  <button
                    onClick={() => soundManager.buttonClick()}
                    className="px-2 py-1 rounded text-[10px] bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    Test
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">Music Volume</label>
                  <span className="text-xs text-gray-500">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full accent-naruto-orange h-1"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Test mode — unlimited packs */}
          <GlassPanel className="p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm font-heading">Test Mode</h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Unlimited pack pulls, no recharge timer.
                </p>
              </div>
              <button
                onClick={() => setTestMode(!testMode)}
                aria-pressed={testMode}
                className="shrink-0"
              >
                <span
                  className="inline-block w-10 h-5 rounded-full relative transition-colors"
                  style={{ background: testMode ? '#f97316' : 'rgba(255,255,255,0.15)' }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                    style={{ left: testMode ? '22px' : '2px' }}
                  />
                </span>
              </button>
            </div>
          </GlassPanel>

          {/* Animation Speed */}
          <GlassPanel className="p-4 mb-4">
            <h3 className="font-bold text-sm mb-3 font-heading">Animation Speed</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setAnimationSpeed('normal')}
                className={`flex-1 py-2 rounded-lg text-xs font-heading transition-colors ${
                  animationSpeed === 'normal'
                    ? 'bg-naruto-orange text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setAnimationSpeed('fast')}
                className={`flex-1 py-2 rounded-lg text-xs font-heading transition-colors ${
                  animationSpeed === 'fast'
                    ? 'bg-naruto-orange text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Fast
              </button>
            </div>
          </GlassPanel>

          {/* Profile switcher */}
          <GlassPanel className="p-4 mb-4">
            <h3 className="font-bold text-sm mb-3 font-heading">Profiles</h3>
            <button
              onClick={handleSwitchProfile}
              className="w-full py-2 rounded-lg text-xs bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-colors font-heading flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
              </svg>
              Switch Profile
            </button>
          </GlassPanel>

          {/* Danger zone */}
          <GlassPanel className="p-4">
            <h3 className="font-bold text-sm mb-3 font-heading text-red-400">Danger Zone</h3>
            {!showReset ? (
              <button
                onClick={() => setShowReset(true)}
                className="w-full py-2 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                Delete This Profile
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-red-300">
                  This will permanently delete <span className="text-white font-bold">{profile.name}</span> — all cards, decks, and progress for this profile. Other profiles are unaffected.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReset(false)}
                    className="flex-1 py-2 rounded-lg text-xs bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCurrentProfile}
                    className="flex-1 py-2 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-bold"
                  >
                    Yes, Delete Profile
                  </button>
                </div>
              </div>
            )}
          </GlassPanel>
        </div>
      </PageTransition>
    </div>
  );
}
