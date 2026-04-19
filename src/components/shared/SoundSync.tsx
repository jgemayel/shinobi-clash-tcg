'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store';
import { soundManager } from '@/lib/sounds';

export default function SoundSync() {
  const sfxVolume = useGameStore((s) => s.sfxVolume);

  useEffect(() => {
    soundManager.setVolume(sfxVolume);
  }, [sfxVolume]);

  return null;
}
