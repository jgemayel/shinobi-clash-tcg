import * as Phaser from 'phaser';
import { eventBus } from '../EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const { width, height } = this.scale;
    const barWidth = width * 0.6;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    const bgBar = this.add.rectangle(barX + barWidth / 2, barY, barWidth, barHeight, 0x333333);
    bgBar.setOrigin(0.5);

    const fillBar = this.add.rectangle(barX, barY, 0, barHeight - 4, 0xf97316);
    fillBar.setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, barY - 40, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      fillBar.width = (barWidth - 4) * value;
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      bgBar.destroy();
      fillBar.destroy();
    });
  }

  create(): void {
    eventBus.emit('current-scene-ready', this);
  }
}
