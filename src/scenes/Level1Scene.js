import ScoreManager from '../utils/ScoreManager.js';

const SHEEP_COUNT = 5;
const SHEEP_NEEDED = 4;
const TIME_LIMIT = 60;
const LIGHTNING_INTERVAL = 8000;

export default class Level1Scene extends Phaser.Scene {
  constructor() { super('Level1Scene'); }

  preload() {
    this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
    this.load.image('terreno', 'assets/tilemaps/tilemap.png');
  }

  create() {
    this.sheepSaved = 0;
    this.gameActive = true;

    this.createMap();
    this.createCorralZone();
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

  createMap() {
    const map = this.make.tilemap({ key: 'level1' });
    const tileset = map.addTilesetImage('terreno', 'terreno');
    map.createLayer('suelo', tileset, 0, 0);
    map.createLayer('decoracion', tileset, 0, 0);
    this.mapWidth = map.widthInPixels;   // 800
    this.mapHeight = map.heightInPixels; // 592
  }

  createCorralZone() {
    // Zona invisible del corral — ajustá estos valores según dónde dibujaste el corral en Tiled
    // Están en coordenadas del mapa (sin escala)
    this.corralX1 = 610;
    this.corralY1 = 65;
    this.corralX2 = 720;
    this.corralY2 = 190;

    // Indicador visual
    const label = this.add.text(
      (this.corralX1 + this.corralX2) / 2,
      this.corralY1 - 12,
      '🏠 CORRAL', {
        fontSize: '10px', color: '#ffffff',
        fontFamily: 'Arial', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }
    ).setOrigin(0.5).setDepth(5);
  }

  createPlayer() {
    this.player = this.add.text(80, 200, '🐕', { fontSize: '20px' })
      .setOrigin(0.5).setDepth(5);
    this.playerSpeed = 130;
  }

  createSheep() {
    this.sheepGroup = [];
    const positions = [
      { x: 150, y: 150 }, { x: 250, y: 280 },
      { x: 120, y: 320 }, { x: 220, y: 120 },
      { x: 320, y: 220 },
    ];
    for (let i = 0; i < SHEEP_COUNT; i++) {
      const sheep = {
        sprite: this.add.text(positions[i].x, positions[i].y, '🐑', {
          fontSize: '18px',
        }).setOrigin(0.5).setDepth(4),
        x: positions[i].x,
        y: positions[i].y,
        vx: Phaser.Math.Between(-40, 40),
        vy: Phaser.Math.Between(-40, 40),
        saved: false,
      };
      this.sheepGroup.push(sheep);
    }
  }

  createHUD() {
    this.hudScore = this.add.text(6, 6, '', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setDepth(10).setScrollFactor(0);

    this.hudLives = this.add.text(6, 28, '', {
      fontSize: '16px', color: '#ff4444', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setDepth(10).setScrollFactor(0);

    this.hudSheep = this.add.text(6, 50, '', {
      fontSize: '16px', color: '#ffff00', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setDepth(10).setScrollFactor(0);

    this.hudTime = this.add.text(400, 6, '', {
      fontSize: '16px', color: '#00ffff', fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(10).setScrollFactor(0);

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
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial',
      fontStyle: 'bold', align: 'center',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);
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
    this.player.x = Phaser.Math.Clamp(nx, 10, this.mapWidth - 10);
    this.player.y = Phaser.Math.Clamp(ny, 10, this.mapHeight - 10);
    this.player.setPosition(this.player.x, this.player.y);
    if (dx < 0) this.player.setFlipX(true);
    if (dx > 0) this.player.setFlipX(false);
  }

  moveSheep(dt) {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      const dx = sheep.x - this.player.x;
      const dy = sheep.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 60 && dist > 0) {
        sheep.vx = Phaser.Math.Linear(sheep.vx, (dx / dist) * 55, 0.1);
        sheep.vy = Phaser.Math.Linear(sheep.vy, (dy / dist) * 55, 0.1);
      }
      sheep.x += sheep.vx * dt;
      sheep.y += sheep.vy * dt;
      if (sheep.x < 10)              { sheep.x = 10;             sheep.vx *= -1; }
      if (sheep.x > this.mapWidth-10) { sheep.x = this.mapWidth-10; sheep.vx *= -1; }
      if (sheep.y < 10)              { sheep.y = 10;             sheep.vy *= -1; }
      if (sheep.y > this.mapHeight-10){ sheep.y = this.mapHeight-10; sheep.vy *= -1; }
      sheep.sprite.setPosition(sheep.x, sheep.y);
    }
  }

  checkSheepCollision() {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      const dx = sheep.x - this.player.x;
      const dy = sheep.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        const pushDist = dist || 1;
        sheep.vx = (dx / pushDist) * 90;
        sheep.vy = (dy / pushDist) * 90;
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
    return x > this.corralX1 && x < this.corralX2 &&
           y > this.corralY1 && y < this.corralY2;
  }

  spawnLightningWarning() {
    if (!this.gameActive) return;
    const targets = this.sheepGroup.filter(s => !s.saved);
    if (targets.length === 0) return;
    const target = Phaser.Utils.Array.GetRandom(targets);
    const strikeX = target.x;
    const strikeY = target.y;
    target.sprite.setTint(0xff4444);

    const warning = this.add.circle(strikeX, strikeY, 25, 0xff0000, 0.4).setDepth(3);
    const warningText = this.add.text(strikeX, strikeY - 30, '⚡', {
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(3);

    this.tweens.add({
      targets: [warning, warningText],
      alpha: 0.1, duration: 300,
      yoyo: true, repeat: 4,
      onComplete: () => this.strikeLightningAt(strikeX, strikeY, warning, warningText),
    });
  }

  strikeLightningAt(strikeX, strikeY, warning, warningText) {
    warning.destroy();
    warningText.destroy();
    const flash = this.add.rectangle(
      this.mapWidth / 2, this.mapHeight / 2,
      this.mapWidth, this.mapHeight, 0xffff00, 0.3
    ).setDepth(15);
    this.time.delayedCall(100, () => flash.destroy());
    this.add.text(strikeX, strikeY, '⚡', { fontSize: '28px' }).setOrigin(0.5).setDepth(10);

    for (const sheep of this.sheepGroup) {
      if (!sheep.saved) sheep.sprite.clearTint();
    }

    const distPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, strikeX, strikeY);
    if (distPlayer < 30) {
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
      if (distSheep < 28) {
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
    const banner = this.add.text(400, 300, '¡Nivel 1 completado!\n🐑 ¡Las ovejas están a salvo!', {
      fontSize: '22px', color: '#00ff88', fontFamily: 'Arial',
      fontStyle: 'bold', align: 'center',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);
    this.time.delayedCall(2000, () => this.scene.start('Level2Scene'));
  }

  showFloatingText(x, y, text, color) {
    const txt = this.add.text(x, y - 12, text, {
      fontSize: '12px', color, fontFamily: 'Arial',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15);
    this.tweens.add({
      targets: txt, y: y - 45, alpha: 0,
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