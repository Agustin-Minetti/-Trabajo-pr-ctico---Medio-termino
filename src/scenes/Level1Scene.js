import ScoreManager from '../utils/ScoreManager.js';

const SHEEP_COUNT = 5;
const SHEEP_NEEDED = 4;
const TIME_LIMIT = 60;
const LIGHTNING_INTERVAL = 8000;

export default class Level1Scene extends Phaser.Scene {
  constructor() { super('Level1Scene'); }

  create() {
    this.sheepSaved = 0;
    this.gameActive = true;
    this.lightningWarnings = [];

    this.createBackground();
    this.createCorral();
    this.createPlayer();
    this.createSheep();
    this.createHUD();
    this.createControls();

    this.lightningTimer = this.time.addEvent({
      delay: LIGHTNING_INTERVAL,
      callback: this.spawnLightningWarning,
      callbackScope: this,
      loop: true,
    });

    this.timeLeft = TIME_LIMIT;
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: this.tickCountdown,
      callbackScope: this,
      loop: true,
    });

    this.showLevelBanner();
  }

  createBackground() {
    this.add.rectangle(400, 300, 800, 600, 0x4a8c2a);
    // Pasto decorativo
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(20, 780);
      const y = Phaser.Math.Between(20, 580);
      this.add.text(x, y, '🌿', { fontSize: '14px' }).setAlpha(0.5);
    }
  }

  createCorral() {
    // Zona del corral (esquina superior derecha)
    this.corralZone = this.add.rectangle(680, 100, 200, 150, 0x8B4513, 0.3)
      .setStrokeStyle(4, 0x8B4513);
    this.add.text(680, 60, '🏠 CORRAL', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Pulso verde en el corral
    this.tweens.add({
      targets: this.corralZone,
      alpha: 0.6, duration: 800,
      yoyo: true, repeat: -1,
    });
  }

  createPlayer() {
    this.player = this.add.text(100, 300, '🐕', { fontSize: '36px' })
      .setOrigin(0.5).setDepth(5);
    this.playerSpeed = 220;
  }

  createSheep() {
    this.sheepGroup = [];
    const positions = [
      { x: 200, y: 200 }, { x: 350, y: 400 },
      { x: 150, y: 450 }, { x: 300, y: 150 },
      { x: 450, y: 300 },
    ];

    for (let i = 0; i < SHEEP_COUNT; i++) {
      const sheep = {
        sprite: this.add.text(positions[i].x, positions[i].y, '🐑', {
          fontSize: '30px',
        }).setOrigin(0.5).setDepth(4),
        x: positions[i].x,
        y: positions[i].y,
        vx: Phaser.Math.Between(-60, 60),
        vy: Phaser.Math.Between(-60, 60),
        saved: false,
        danger: false,
      };
      this.sheepGroup.push(sheep);
    }
  }

  createHUD() {
    this.hudScore = this.add.text(10, 10, '', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);

    this.hudLives = this.add.text(10, 35, '', {
      fontSize: '16px', color: '#ff4444',
      fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);

    this.hudSheep = this.add.text(10, 60, '', {
      fontSize: '16px', color: '#ffff00',
      fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);

    this.hudTime = this.add.text(400, 10, '', {
      fontSize: '16px', color: '#00ffff',
      fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(10);

    this.updateHUD();
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  showLevelBanner() {
    const banner = this.add.text(400, 300, 'NIVEL 1\n⚡ Campo Abierto ⚡', {
      fontSize: '40px', color: '#ffffff', fontFamily: 'Arial',
      fontStyle: 'bold', align: 'center',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(20);

    this.time.delayedCall(2000, () => {
      this.tweens.add({ targets: banner, alpha: 0, duration: 500, onComplete: () => banner.destroy() });
    });
  }

  update(time, delta) {
    if (!this.gameActive) return;
    const dt = delta / 1000;

    this.movePlayer(dt);
    this.moveSheep(dt);
    this.checkSheepCollision();
    this.checkCorral();
    this.updateHUD();
  }

  movePlayer(dt) {
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy = 1;

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    const nx = this.player.x + dx * this.playerSpeed * dt;
    const ny = this.player.y + dy * this.playerSpeed * dt;
    this.player.x = Phaser.Math.Clamp(nx, 20, 780);
    this.player.y = Phaser.Math.Clamp(ny, 20, 580);

    if (dx < 0) this.player.setFlipX(true);
    if (dx > 0) this.player.setFlipX(false);
  }

  moveSheep(dt) {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;

      // Huir del jugador si está cerca
      const dx = sheep.x - this.player.x;
      const dy = sheep.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100 && dist > 0) {
        sheep.vx = Phaser.Math.Linear(sheep.vx, (dx / dist) * 90, 0.1);
        sheep.vy = Phaser.Math.Linear(sheep.vy, (dy / dist) * 90, 0.1);
      }

      sheep.x += sheep.vx * dt;
      sheep.y += sheep.vy * dt;

      // Rebotar en bordes
      if (sheep.x < 20)  { sheep.x = 20;  sheep.vx *= -1; }
      if (sheep.x > 780) { sheep.x = 780; sheep.vx *= -1; }
      if (sheep.y < 20)  { sheep.y = 20;  sheep.vy *= -1; }
      if (sheep.y > 580) { sheep.y = 580; sheep.vy *= -1; }

      sheep.sprite.setPosition(sheep.x, sheep.y);
    }
  }

  checkSheepCollision() {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;

      const dx = sheep.x - this.player.x;
      const dy = sheep.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 35) {
        // Empujar oveja en dirección del jugador
        const px = this.player.x - (this.player.flipX ? -1 : 1) * 5;
        const pushX = sheep.x - px;
        const pushY = sheep.y - this.player.y;
        const pushDist = Math.sqrt(pushX * pushX + pushY * pushY) || 1;
        sheep.vx = (pushX / pushDist) * 150;
        sheep.vy = (pushY / pushDist) * 150;

        // Verificar si la oveja ya está en zona segura
        if (this.isInCorral(sheep.x, sheep.y)) {
          ScoreManager.addScore(-30);
          this.showFloatingText(sheep.x, sheep.y, '-30 😬', '#ff4444');
        } else {
          this.showFloatingText(sheep.x, sheep.y, '😣 ¡Ay!', '#ffffff');
        }
      }
    }
  }

  checkCorral() {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      if (this.isInCorral(sheep.x, sheep.y)) {
        sheep.saved = true;
        sheep.sprite.setText('🐑✅');
        sheep.vx = 0; sheep.vy = 0;
        this.sheepSaved++;
        ScoreManager.addScore(100);
        this.showFloatingText(sheep.x, sheep.y, '+100 🐑', '#00ff88');

        if (this.sheepSaved >= SHEEP_NEEDED) {
          this.time.delayedCall(800, () => this.levelComplete());
        }
      }
    }
  }

  isInCorral(x, y) {
    return x > 580 && x < 780 && y > 25 && y < 175;
  }

  spawnLightningWarning() {
    if (!this.gameActive) return;

    // Elegir oveja aleatoria no guardada
    const targets = this.sheepGroup.filter(s => !s.saved);
    if (targets.length === 0) return;

    const target = Phaser.Utils.Array.GetRandom(targets);
    target.danger = true;
    target.sprite.setTint(0xff4444);

    // Sombra de advertencia
    const warning = this.add.circle(target.x, target.y, 40, 0xff0000, 0.4).setDepth(3);
    const warningText = this.add.text(target.x, target.y - 50, '⚡', {
      fontSize: '24px',
    }).setOrigin(0.5).setDepth(3);

    this.tweens.add({
      targets: [warning, warningText],
      alpha: 0.1, duration: 300,
      yoyo: true, repeat: 4,
      onComplete: () => {
        // Cae el rayo
        this.strikeLightning(target, warning, warningText);
      },
    });
  }

  strikeLightning(sheep, warning, warningText) {
    warning.destroy();
    warningText.destroy();

    const flash = this.add.rectangle(400, 300, 800, 600, 0xffff00, 0.3).setDepth(15);
    this.time.delayedCall(100, () => flash.destroy());

    this.add.text(sheep.x, sheep.y, '⚡', { fontSize: '48px' })
      .setOrigin(0.5).setDepth(10);

    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, sheep.x, sheep.y
    );

    if (dist < 50) {
      // Rayo golpea al jugador
      ScoreManager.loseLife();
      this.showFloatingText(this.player.x, this.player.y, '⚡ -1 vida', '#ff0000');
      this.cameras.main.shake(300, 0.02);
      if (ScoreManager.isGameOver()) {
        this.time.delayedCall(500, () => this.scene.start('GameOverScene'));
        return;
      }
    }

    if (!sheep.saved) {
      // Oveja fulminada
      sheep.saved = true;
      sheep.sprite.setText('💀');
      ScoreManager.addScore(-50);
      this.showFloatingText(sheep.x, sheep.y, '-50 ☠️', '#ff4444');
    }

    sheep.danger = false;
  }

  tickCountdown() {
    if (!this.gameActive) return;
    this.timeLeft--;
    if (this.timeLeft <= 0) {
      this.gameActive = false;
      if (this.sheepSaved >= SHEEP_NEEDED) {
        this.levelComplete();
      } else {
        this.scene.start('GameOverScene');
      }
    }
  }

  levelComplete() {
    if (!this.gameActive) return;
    this.gameActive = false;
    ScoreManager.nextLevel();

    const banner = this.add.text(400, 300, '¡Nivel 1 completado!\n🐑 ¡Las ovejas están a salvo!', {
      fontSize: '32px', color: '#00ff88', fontFamily: 'Arial',
      fontStyle: 'bold', align: 'center',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20);

    this.time.delayedCall(2000, () => this.scene.start('Level2Scene'));
  }

  showFloatingText(x, y, text, color) {
    const txt = this.add.text(x, y - 20, text, {
      fontSize: '18px', color, fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: txt, y: y - 70, alpha: 0,
      duration: 1000, onComplete: () => txt.destroy(),
    });
  }

  updateHUD() {
    this.hudScore.setText(`💰 Puntos: ${ScoreManager.score}`);
    this.hudLives.setText(`❤️ Vidas: ${'♥'.repeat(ScoreManager.lives)}`);
    this.hudSheep.setText(`🐑 Corral: ${this.sheepSaved}/${SHEEP_NEEDED}`);
    this.hudTime.setText(`⏱ ${this.timeLeft}s`);
    if (this.timeLeft <= 10) this.hudTime.setStyle({ color: '#ff4444' });
  }
}