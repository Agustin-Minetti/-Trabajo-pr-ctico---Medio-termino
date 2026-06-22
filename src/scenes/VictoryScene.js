export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }
  create() {}
}import ScoreManager from '../utils/ScoreManager.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    const cx = 400, cy = 300;

    this.add.rectangle(cx, cy, 800, 600, 0x0a1a0a);

    // Estrellas de fondo
    for (let i = 0; i < 40; i++) {
      this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
        Phaser.Math.Between(1, 3),
        0xffffff, Phaser.Math.FloatBetween(0.3, 1)
      );
    }

    // Título
    this.add.text(cx, cy - 200, '🏆 ¡VICTORIA! 🏆', {
      fontSize: '52px', color: '#ffdd00', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 8,
      align: 'center',
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(cx, cy - 130, '¡Rex salvó a todo el rebaño!', {
      fontSize: '22px', color: '#00ff88', fontFamily: 'Arial',
      fontStyle: 'italic', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Puntuación
    const scorePanel = this.add.rectangle(cx, cy - 30, 420, 100, 0x003300, 0.8)
      .setStrokeStyle(2, 0x00ff88);
    this.add.text(cx, cy - 55, 'Puntuación Final', {
      fontSize: '18px', color: '#aaffaa', fontFamily: 'Arial',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 15, `${ScoreManager.score} pts`, {
      fontSize: '40px', color: '#ffdd00', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Concepto central
    this.add.text(cx, cy + 70,
      '"Morderlas estaba mal...\npero era la única forma de salvarlas.\nEstá mal, pero no tan mal." 🐑', {
      fontSize: '16px', color: '#ccffcc', fontFamily: 'Arial',
      fontStyle: 'italic', align: 'center',
      stroke: '#000000', strokeThickness: 2,
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Botón jugar de nuevo
    const btnPlay = this.add.rectangle(cx - 90, cy + 180, 160, 48, 0x004400)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x00ff88);
    this.add.text(cx - 90, cy + 180, '🔄 Jugar de nuevo', {
      fontSize: '15px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);
    btnPlay.on('pointerover', () => btnPlay.setFillStyle(0x006600));
    btnPlay.on('pointerout',  () => btnPlay.setFillStyle(0x004400));
    btnPlay.on('pointerdown', () => {
      ScoreManager.reset();
      this.scene.start('Level1Scene');
    });

    // Botón menú
    const btnMenu = this.add.rectangle(cx + 90, cy + 180, 160, 48, 0x222244)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x8888ff);
    this.add.text(cx + 90, cy + 180, '🏠 Menú', {
      fontSize: '15px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);
    btnMenu.on('pointerover', () => btnMenu.setFillStyle(0x444466));
    btnMenu.on('pointerout',  () => btnMenu.setFillStyle(0x222244));
    btnMenu.on('pointerdown', () => {
      ScoreManager.reset();
      this.scene.start('MenuScene');
    });

    // Animación trofeo
    const trophy = this.add.text(cx, cy - 200, '🏆', { fontSize: '52px' }).setOrigin(0.5);
    this.tweens.add({
      targets: trophy, y: cy - 210,
      duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
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