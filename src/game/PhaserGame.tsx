'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as Phaser from 'phaser';
import { createGameConfig } from './config';
import { eventBus } from './EventBus';

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface PhaserGameProps {
  currentActiveScene?: (scene: Phaser.Scene) => void;
}

const PhaserGame = forwardRef<IRefPhaserGame, PhaserGameProps>(
  function PhaserGame({ currentActiveScene }, ref) {
    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      get game() {
        return gameRef.current;
      },
      get scene() {
        return gameRef.current?.scene.getScenes(true)[0] ?? null;
      },
    }));

    useEffect(() => {
      if (gameRef.current || !containerRef.current) return;

      const config = createGameConfig('phaser-container');
      gameRef.current = new Phaser.Game(config);

      const onSceneReady = (...args: unknown[]) => {
        currentActiveScene?.(args[0] as Phaser.Scene);
      };

      eventBus.on('current-scene-ready', onSceneReady);

      return () => {
        eventBus.off('current-scene-ready', onSceneReady);
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, [currentActiveScene]);

    return <div id="phaser-container" ref={containerRef} className="w-full h-full" />;
  }
);

export default PhaserGame;
