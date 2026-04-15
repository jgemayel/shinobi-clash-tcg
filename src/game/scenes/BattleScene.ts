import * as Phaser from 'phaser';
import { eventBus } from '../EventBus';

export class BattleScene extends Phaser.Scene {
  private boardBg!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background gradient effect
    this.boardBg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Divider line
    this.add.line(0, 0, 0, height / 2, width, height / 2, 0x4a4a6a, 0.5).setOrigin(0);

    // Player side label
    this.add.text(20, height - 30, 'YOUR FIELD', {
      fontSize: '12px',
      color: '#f97316',
      fontFamily: 'Arial',
    });

    // Opponent side label
    this.add.text(20, 10, 'OPPONENT FIELD', {
      fontSize: '12px',
      color: '#ef4444',
      fontFamily: 'Arial',
    });

    // Placeholder card slots - Player side
    this.createSlot(width / 2, height * 0.7, 'Active');
    for (let i = 0; i < 3; i++) {
      this.createSlot(width * 0.25 + i * (width * 0.25), height * 0.88, `Bench ${i + 1}`);
    }

    // Placeholder card slots - Opponent side
    this.createSlot(width / 2, height * 0.3, 'Active');
    for (let i = 0; i < 3; i++) {
      this.createSlot(width * 0.25 + i * (width * 0.25), height * 0.12, `Bench ${i + 1}`);
    }

    // Chakra zones
    this.add.text(width - 120, height * 0.65, 'Chakra Zone', {
      fontSize: '11px',
      color: '#60a5fa',
      fontFamily: 'Arial',
    });
    this.add.rectangle(width - 70, height * 0.7, 80, 40, 0x1e3a5f, 0.8).setStrokeStyle(1, 0x3b82f6);

    eventBus.emit('current-scene-ready', this);
  }

  private createSlot(x: number, y: number, label: string): void {
    const slot = this.add.rectangle(x, y, 80, 112, 0x2a2a4a, 0.6);
    slot.setStrokeStyle(1, 0x4a4a6a);

    this.add.text(x, y, label, {
      fontSize: '10px',
      color: '#6b7280',
      fontFamily: 'Arial',
      align: 'center',
    }).setOrigin(0.5);
  }
}
