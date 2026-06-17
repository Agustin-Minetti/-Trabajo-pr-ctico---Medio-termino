import ScoreManager from '../utils/ScoreManager.js';

const SHEEP_COUNT = 7;
const SHEEP_NEEDED = 5;
const TIME_LIMIT = 75;
const LIGHTNING_INTERVAL = 5000;

export default class Level2Scene extends Phaser.Scene {
  constructor() { super('Level2Scene'); }

  create() {
    this.sheepSaved = 0;
    this.gameActive = true;
    this.playerSlowed = false;

    this.createBackground();
    this.createObstacles();
    this.createCorral();
    this.createPlayer();
    this.createSheep();
    this.createCollectibles();
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
    this.add.rectangle(400, 300, 800, 600, 0x5a7a2a);
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(20, 780);
      const y = Phaser.Math.Between(20, 580);
      this.add.text(x, y, '🌿', { fontSize: '14px' }).setAlpha(0.4);
    }
  }

  createObstacles() {
    this.puddles = [];
    const puddlePositions = [
      { x: 250, y: 300 }, { x: 500, y: 200 },
      { x: 400, y: 450 }, { x: 150, y: 350 },
    ];
    for (const pos of puddlePositions) {
      const puddle = this.add.ellipse(pos.x, pos.y, 80, 50, 0x3366cc, 0.7)
        .setStrokeStyle(2, 0x1144aa);
      this.add.text(pos.x, pos.y, '💧', { fontSize: '20px' }).setOrigin(0.5);
      this.puddles.push({ shape: puddle, x: pos.x, y: pos.y });
    }
    this.add.rectangle(400, 8, 800, 16, 0xffff00, 0.6);
    this.add.rectangle(400, 592, 800, 16, 0xffff00, 0.6);
    this.add.text(200, 8, '⚡⚡⚡⚡⚡⚡⚡⚡', { fontSize: '12px', color: '#ffff00' }).setOrigin(0.5, 0.5);
    this.add.text(200, 590, '⚡⚡⚡⚡⚡⚡⚡⚡', { fontSize: '12px', color: '#ffff00' }).setOrigin(0.5, 0.5);
  }

  createCorral() {
    this.corralZone = this.add.rectangle(680, 300, 180, 200, 0x8B4513, 0.3)
      .setStrokeStyle(4, 0x8B4513);
    this.add.text(680, 210, '🏠 CORRAL', {
      fontSize: '16px', color: '#ffffff',
      fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.corralZone, alpha: 0.6,
      duration: 800, yoyo: true, repeat: -1,
    });
  }

  createPlayer() {
    this.player = this.add.text(100, 300, '🐕', { fontSize: '36px' })
      .setOrigin(0.5).setDepth(5);
    this.playerSpeed = 220;
  }

  createSheep() {
    this.sheepGroup = [];
    for (let i = 0; i < SHEEP_COUNT; i++) {
      const sheep = {
        sprite: this.add.text(
          Phaser.Math.Between(50, 550),
          Phaser.Math.Between(50, 550),
          '🐑', { fontSize: '30px' }
        ).setOrigin(0.5).setDepth(4),
        x: Phaser.Math.Between(50, 550),
        y: Phaser.Math.Between(50, 550),
        vx: Phaser.Math.Between(-80, 80),
        vy: Phaser.Math.Between(-80, 80),
        saved: false,
      };
      this.sheepGroup.push(sheep);
    }
  }

  createCollectibles() {
    this.collectibles = [];
    const items = [
      { x: 200, y: 150, emoji: '☂️', points: 20 },
      { x: 350, y: 500, emoji: '☂️', points: 20 },
      { x: 500, y: 350, emoji: '☂️', points: 20 },
      { x: 100, y: 480, emoji: '⛑️', points: 30 },
      { x: 450, y: 130, emoji: '⛑️', points: 30 },
      { x: 300, y: 300, emoji: '☂️', points: 20 },
    ];
    for (const item of items) {
      const sprite = this.add.text(item.x, item.y, item.emoji, {
        fontSize: '28px',
      }).setOrigin(0.5).setDepth(3);
      this.tweens.add({
        targets: sprite, y: item.y - 8,
        duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.collectibles.push({ sprite, x: item.x, y: item.y, points: item.points, collected: false });
    }
  }

  createHUD() {
    this.hudScore = this.add.text(10, 10, '', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);
    this.hudLives = this.add.text(10, 35, '', {
      fontSize: '16px', color: '#ff4444', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);
    this.hudSheep = this.add.text(10, 60, '', {
      fontSize: '16px', color: '#ffff00', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);
    this.hudTime = this.add.text(400, 10, '', {
      fontSize: '16px', color: '#00ffff', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
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
    const banner = this.add.text(400, 300, 'NIVEL 2\n🌧 Granja con Obstáculos 🌧', {
      fontSize: '36px', color: '#ffffff', fontFamily: 'Arial',
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
    this.checkPuddles();
    this.checkFences();
    this.checkCollectibles();
    this.updateHUD();
  }

  movePlayer(dt) {
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy = 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    const speed = this.playerSlowed ? this.playerSpeed * 0.4 : this.playerSpeed;
    const nx = this.player.x + dx * speed * dt;
    const ny = this.player.y + dy * speed * dt;
    this.player.x = Phaser.Math.Clamp(nx, 20, 780);
    this.player.y = Phaser.Math.Clamp(ny, 20, 580);
    if (dx < 0) this.player.setFlipX(true);
    if (dx > 0) this.player.setFlipX(false);
  }

  moveSheep(dt) {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      const dx = sheep.x - this.player.x;
      const dy = sheep.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110 && dist > 0) {
        sheep.vx = Phaser.Math.Linear(sheep.vx, (dx / dist) * 110, 0.12);
        sheep.vy = Phaser.Math.Linear(sheep.vy, (dy / dist) * 110, 0.12);
      }
      sheep.x += sheep.vx * dt;
      sheep.y += sheep.vy * dt;
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
        const pushDist = dist || 1;
        sheep.vx = (dx / pushDist) * 160;
        sheep.vy = (dy / pushDist) * 160;
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

  checkPuddles() {
    let onPuddle = false;
    for (const puddle of this.puddles) {
      const dx = this.player.x - puddle.x;
      const dy = this.player.y - puddle.y;
      if (Math.sqrt(dx * dx + dy * dy) < 45) { onPuddle = true; break; }
    }
    if (onPuddle && !this.playerSlowed) {
      this.playerSlowed = true;
      this.player.setTint(0x3366cc);
      this.showFloatingText(this.player.x, this.player.y, '💧 ¡Charco!', '#3399ff');
      this.time.delayedCall(2000, () => {
        this.playerSlowed = false;
        this.player.clearTint();
      });
    }
  }

  checkFences() {
    if (this.player.y < 25 || this.player.y > 575) {
      ScoreManager.loseLife();
      this.showFloatingText(this.player.x, this.player.y, '⚡ -1 vida', '#ff0000');
      this.cameras.main.shake(300, 0.02);
      this.player.x = 100;
      this.player.y = 300;
      if (ScoreManager.isGameOver()) { this.scene.start('GameOverScene'); }
    }
  }

  checkCollectibles() {
    for (const item of this.collectibles) {
      if (item.collected) continue;
      const dx = this.player.x - item.x;
      const dy = this.player.y - item.y;
      if (Math.sqrt(dx * dx + dy * dy) < 35) {
        item.collected = true;
        item.sprite.destroy();
        ScoreManager.addScore(item.points);
        this.showFloatingText(this.player.x, this.player.y, `+${item.points} ✨`, '#ffff00');
      }
    }
  }

  isInCorral(x, y) {
    return x > 590 && x < 770 && y > 200 && y < 400;
  }

  spawnLightningWarning() {
    if (!this.gameActive) return;
    const targets = this.sheepGroup.filter(s => !s.saved);
    if (targets.length === 0) return;
    const target = Phaser.Utils.Array.GetRandom(targets);

    const strikeX = target.x;
    const strikeY = target.y;
    target.sprite.setTint(0xff4444);

    const warning = this.add.circle(strikeX, strikeY, 40, 0xff0000, 0.4).setDepth(3);
    const warningText = this.add.text(strikeX, strikeY - 50, '⚡', {
      fontSize: '24px',
    }).setOrigin(0.5).setDepth(3);

    this.tweens.add({
      targets: [warning, warningText],
      alpha: 0.1, duration: 250,
      yoyo: true, repeat: 4,
      onComplete: () => this.strikeLightningAt(strikeX, strikeY, warning, warningText),
    });
  }

  strikeLightningAt(strikeX, strikeY, warning, warningText) {
    warning.destroy();
    warningText.destroy();

    const flash = this.add.rectangle(400, 300, 800, 600, 0xffff00, 0.3).setDepth(15);
    this.time.delayedCall(100, () => flash.destroy());
    this.add.text(strikeX, strikeY, '⚡', { fontSize: '48px' }).setOrigin(0.5).setDepth(10);

    for (const sheep of this.sheepGroup) {
      if (!sheep.saved) sheep.sprite.clearTint();
    }

    const distPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, strikeX, strikeY);
    if (distPlayer < 50) {
      ScoreManager.loseLife();
      this.showFloatingText(this.player.x, this.player.y, '⚡ -1 vida', '#ff0000');
      this.cameras.main.shake(300, 0.02);
      if (ScoreManager.isGameOver()) {
        this.time.delayedCall(500, () => this.scene.start('GameOverScene'));
        return;
      }
    }

    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      const distSheep = Phaser.Math.Distance.Between(sheep.x, sheep.y, strikeX, strikeY);
      if (distSheep < 45) {
        sheep.saved = true;
        sheep.sprite.setText('💀');
        ScoreManager.addScore(-50);
        this.showFloatingText(sheep.x, sheep.y, '-50 ☠️', '#ff4444');
      }
    }
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
    const banner = this.add.text(400, 300, '¡Nivel 2 completado!\n🌧 ¡Sobreviviste la granja!', {
      fontSize: '32px', color: '#00ff88', fontFamily: 'Arial',
      fontStyle: 'bold', align: 'center',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20);
    this.time.delayedCall(2000, () => this.scene.start('Level3Scene'));
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