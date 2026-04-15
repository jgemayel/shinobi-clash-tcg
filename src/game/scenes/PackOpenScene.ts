import * as Phaser from 'phaser';
import { eventBus } from '../EventBus';

export class PackOpenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PackOpenScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f23);

    // Pack visual
    const pack = this.add.rectangle(width / 2, height / 2, 160, 220, 0xf97316);
    pack.setStrokeStyle(3, 0xfbbf24);
    pack.setInteractive({ useHandCursor: true });

    const packText = this.add.text(width / 2, height / 2 - 20, 'Hidden Leaf\nOrigins', {
      fontSize: '16px',
      color: '#1a1a2e',
      fontFamily: 'Arial',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const tapText = this.add.text(width / 2, height / 2 + 80, 'Tap to Open!', {
      fontSize: '14px',
      color: '#fbbf24',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Pulsing tap text
    this.tweens.add({
      targets: tapText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    pack.on('pointerdown', () => {
      // Pack opening animation
      this.tweens.add({
        targets: [pack, packText, tapText],
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          pack.destroy();
          packText.destroy();
          tapText.destroy();
          this.revealCards();
        },
      });
    });

    eventBus.emit('current-scene-ready', this);
  }

  private revealCards(): void {
    const { width, height } = this.scale;
    const cardWidth = 90;
    const spacing = 20;
    const totalWidth = 5 * cardWidth + 4 * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;

    for (let i = 0; i < 5; i++) {
      const x = startX + i * (cardWidth + spacing);
      const cardBack = this.add.rectangle(x, height / 2, cardWidth, cardWidth * 1.4, 0xf97316);
      cardBack.setStrokeStyle(2, 0xfbbf24);
      cardBack.setScale(0);
      cardBack.setInteractive({ useHandCursor: true });

      // Fan out animation
      this.tweens.add({
        targets: cardBack,
        scaleX: 1,
        scaleY: 1,
        delay: i * 150,
        duration: 300,
        ease: 'Back.easeOut',
      });

      const cardLabel = this.add.text(x, height / 2, '?', {
        fontSize: '24px',
        color: '#1a1a2e',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      cardLabel.setScale(0);

      this.tweens.add({
        targets: cardLabel,
        scaleX: 1,
        scaleY: 1,
        delay: i * 150,
        duration: 300,
        ease: 'Back.easeOut',
      });

      // Click to reveal
      cardBack.on('pointerdown', () => {
        this.tweens.add({
          targets: cardBack,
          scaleX: 0,
          duration: 150,
          onComplete: () => {
            cardBack.setFillStyle(0x2a2a4a);
            cardBack.setStrokeStyle(2, 0x60a5fa);
            cardLabel.setText('Card');
            this.tweens.add({
              targets: cardBack,
              scaleX: 1,
              duration: 150,
            });
          },
        });
        cardBack.disableInteractive();
        eventBus.emit('card-revealed', { index: i });
      });
    }
  }
}
