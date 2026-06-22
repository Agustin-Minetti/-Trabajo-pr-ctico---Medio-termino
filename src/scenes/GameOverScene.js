import ScoreManager from '../utils/ScoreManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    const cx = 400, cy = 300;

    this.add.rectangle(cx, cy, 800, 600, 0x1a0000);

    // Título
    this.add.text(cx, cy - 180, '💀 GAME OVER 💀', {
      fontSize: '48px', color: '#ff4444', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);

    // Mensaje según nivel
    const nivel = ScoreManager.level;
    const mensaje = nivel === 1
      ? '¡Las ovejas quedaron en la tormenta!'
      : nivel === 2
      ? '¡La granja quedó sin protección!'
      : '¡El lobo ganó esta vez!';

    this.add.text(cx, cy - 100, mensaje, {
      fontSize: '20px', color: '#ffaaaa', fontFamily: 'Arial',
      fontStyle: 'italic', stroke: '#000000', strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5);

    // Puntuación final
    this.add.text(cx, cy - 30, `Puntuación final: ${ScoreManager.score}`, {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, `Llegaste al Nivel ${ScoreManager.level}`, {
      fontSize: '20px', color: '#ffdd00', fontFamily: 'Arial',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Concepto central
    this.add.text(cx, cy + 80,
      '"Morder estaba mal...\npero era la única forma de salvarlas 🐑"', {
      fontSize: '16px', color: '#aaaaaa', fontFamily: 'Arial',
      fontStyle: 'italic', align: 'center',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Botón reintentar
    const btnRetry = this.add.rectangle(cx - 90, cy + 170, 160, 48, 0x004400)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x00ff88);
    this.add.text(cx - 90, cy + 170, '🔄 Reintentar', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);
    btnRetry.on('pointerover', () => btnRetry.setFillStyle(0x006600));
    btnRetry.on('pointerout',  () => btnRetry.setFillStyle(0x004400));
    btnRetry.on('pointerdown', () => {
      ScoreManager.reset();
      this.scene.start('Level1Scene');
    });

    // Botón menú
    const btnMenu = this.add.rectangle(cx + 90, cy + 170, 160, 48, 0x440000)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xff4444);
    this.add.text(cx + 90, cy + 170, '🏠 Menú', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);
    btnMenu.on('pointerover', () => btnMenu.setFillStyle(0x660000));
    btnMenu.on('pointerout',  () => btnMenu.setFillStyle(0x440000));
    btnMenu.on('pointerdown', () => {
      ScoreManager.reset();
      this.scene.start('MenuScene');
    });

    // Teclas rápidas
    this.input.keyboard.once('keydown-R', () => {
      ScoreManager.reset();
      this.scene.start('Level1Scene');
    });
    this.input.keyboard.once('keydown-SPACE', () => {
      ScoreManager.reset();
      this.scene.start('MenuScene');
    });
  }
}