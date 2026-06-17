import ScoreManager from '../utils/ScoreManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    ScoreManager.reset();

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Fondo
    this.add.rectangle(cx, cy, 800, 600, 0x2d5a1b);

    // Decoración — nubes de tormenta
    this.add.text(100, 60, '⛈', { fontSize: '48px' });
    this.add.text(620, 40, '⛈', { fontSize: '64px' });
    this.add.text(350, 30, '🌩', { fontSize: '40px' });

    // Título
    this.add.text(cx, cy - 180, '🐑 PASTOR CAÓTICO 🐑', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#1a3a0a',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtítulo concepto
    this.add.text(cx, cy - 120, '"Morder está mal...\npero es la única forma de salvarlas"', {
      fontSize: '16px',
      color: '#d4f5a0',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      align: 'center',
    }).setOrigin(0.5);

    // Instrucciones
    this.add.text(cx, cy - 30, '🐾 Movimiento: WASD o Flechas', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 10, '🐑 Empujá las ovejas al corral mordiéndolas', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 50, '⚡ Evitá que los rayos las fulminen', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Botón jugar
    const btn = this.add.rectangle(cx, cy + 140, 200, 50, 0x4a9e1f)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xaaffaa);

    const btnText = this.add.text(cx, cy + 140, '▶  JUGAR', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);

    btn.on('pointerover', () => btn.setFillStyle(0x6abf2f));
    btn.on('pointerout', () => btn.setFillStyle(0x4a9e1f));
    btn.on('pointerdown', () => this.scene.start('Level1Scene'));

    // Parpadeo botón
    this.tweens.add({
      targets: [btn, btnText],
      scaleX: 1.05, scaleY: 1.05,
      duration: 600, yoyo: true,
      repeat: -1, ease: 'Sine.easeInOut',
    });

    // Créditos
    this.add.text(cx, 575, 'Agustín Minetti — 2026', {
      fontSize: '12px',
      color: '#88aa66',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
  }
}