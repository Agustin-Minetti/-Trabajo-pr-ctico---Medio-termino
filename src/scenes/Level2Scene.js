import ScoreManager from '../utils/ScoreManager.js';

const SHEEP_COUNT = 7;
const SHEEP_NEEDED = 5;
const TIME_LIMIT = 75;
const LIGHTNING_INTERVAL = 5000;

export default class Level2Scene extends Phaser.Scene {
  constructor() { super('Level2Scene'); }

  preload() {
    this.load.tilemapTiledJSON('level2', 'assets/tilemaps/level2.json');
    this.load.image('terreno', 'assets/tilemaps/tilemap.png');
    this.load.spritesheet('perro', 'assets/sprites/perro.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('oveja', 'assets/sprites/oveja.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    this.sheepSaved = 0;
    this.gameActive = true;
    this.playerSlowed = false;

    this.createMap();
    this.createAnimations();
    this.createCorralZone();
    this.createObstacles();
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

  createMap() {
    const map = this.make.tilemap({ key: 'level2' });
    const tileset = map.addTilesetImage('terreno', 'terreno');
    map.createLayer('suelo', tileset, 0, 0);
    map.createLayer('decoracion', tileset, 0, 0);
    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
  }

  createAnimations() {
    if (!this.anims.exists('perro-abajo'))
      this.anims.create({ key: 'perro-abajo', frames: this.anims.generateFrameNumbers('perro', { start: 0, end: 2 }), frameRate: 8, repeat: -1 });
    if (!this.anims.exists('perro-lado'))
      this.anims.create({ key: 'perro-lado', frames: this.anims.generateFrameNumbers('perro', { start: 3, end: 5 }), frameRate: 8, repeat: -1 });
    if (!this.anims.exists('perro-arriba'))
      this.anims.create({ key: 'perro-arriba', frames: this.anims.generateFrameNumbers('perro', { start: 6, end: 8 }), frameRate: 8, repeat: -1 });
    if (!this.anims.exists('oveja-caminar'))
      this.anims.create({ key: 'oveja-caminar', frames: this.anims.generateFrameNumbers('oveja', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
    if (!this.anims.exists('oveja-safe'))
      this.anims.create({ key: 'oveja-safe', frames: this.anims.generateFrameNumbers('oveja', { start: 2, end: 2 }), frameRate: 1, repeat: 0 });
    if (!this.anims.exists('oveja-muerta'))
      this.anims.create({ key: 'oveja-muerta', frames: this.anims.generateFrameNumbers('oveja', { start: 3, end: 3 }), frameRate: 1, repeat: 0 });
  }

  createCorralZone() {
    // Centro del mapa — ajustá si el corral quedó en otra posición
    this.corralX1 = 540;
    this.corralY1 = 170;
    this.corralX2 = 690;
    this.corralY2 = 320;
    this.add.text(
      (this.corralX1 + this.corralX2) / 2,
      this.corralY1 - 14,
      '🏠 CORRAL', {
        fontSize: '12px', color: '#ffffff',
        fontFamily: 'Arial', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }
    ).setOrigin(0.5).setDepth(5);
  }

  createObstacles() {
    this.puddles = [];
    const puddlePositions = [
      { x: 150, y: 200 }, { x: 550, y: 150 },
      { x: 250, y: 430 }, { x: 600, y: 400 },
      { x: 100, y: 350 }, { x: 500, y: 480 },
    ];
    for (const pos of puddlePositions) {
      const puddle = this.add.ellipse(pos.x, pos.y, 60, 40, 0x3366cc, 0.7)
        .setStrokeStyle(2, 0x1144aa).setDepth(2);
      this.add.text(pos.x, pos.y, '💧', { fontSize: '16px' })
        .setOrigin(0.5).setDepth(3);
      this.puddles.push({ x: pos.x, y: pos.y });
    }
  }

  createPlayer() {
    this.player = this.add.sprite(80, 300, 'perro')
      .setOrigin(0.5).setDepth(5).setScale(1.5);
    this.player.play('perro-abajo');
    this.playerSpeed = 130;
    this.lastDir = 'abajo';
  }

  createSheep() {
    this.sheepGroup = [];
    for (let i = 0; i < SHEEP_COUNT; i++) {
      const x = Phaser.Math.Between(50, 500);
      const y = Phaser.Math.Between(50, 500);
      const sprite = this.add.sprite(x, y, 'oveja')
        .setOrigin(0.5).setDepth(4).setScale(1.5);
      sprite.play('oveja-caminar');
      this.sheepGroup.push({
        sprite, x, y,
        vx: Phaser.Math.Between(-50, 50),
        vy: Phaser.Math.Between(-50, 50),
        saved: false,
      });
    }
  }

  createCollectibles() {
    this.collectibles = [];
    const items = [
      { x: 150, y: 100, emoji: '☂️', points: 20 },
      { x: 400, y: 80,  emoji: '☂️', points: 20 },
      { x: 600, y: 200, emoji: '☂️', points: 20 },
      { x: 200, y: 500, emoji: '⛑️', points: 30 },
      { x: 550, y: 500, emoji: '⛑️', points: 30 },
    ];
    for (const item of items) {
      const sprite = this.add.text(item.x, item.y, item.emoji, { fontSize: '24px' })
        .setOrigin(0.5).setDepth(3);
      this.tweens.add({
        targets: sprite, y: item.y - 6,
        duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.collectibles.push({ sprite, x: item.x, y: item.y, points: item.points, collected: false });
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
    const banner = this.add.text(400, 300, 'NIVEL 2\n🌧 Granja con Obstáculos 🌧', {
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
    this.checkPuddles();
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

    const moving = dx !== 0 || dy !== 0;
    if (moving) {
      if (dy > 0 && this.lastDir !== 'abajo')  { this.player.play('perro-abajo');  this.lastDir = 'abajo'; }
      else if (dy < 0 && this.lastDir !== 'arriba') { this.player.play('perro-arriba'); this.lastDir = 'arriba'; }
      else if (dx !== 0 && this.lastDir !== 'lado') { this.player.play('perro-lado');   this.lastDir = 'lado'; }
      if (dx < 0) this.player.setFlipX(true);
      if (dx > 0) this.player.setFlipX(false);
    }

    const speed = this.playerSlowed ? this.playerSpeed * 0.4 : this.playerSpeed;
    const nx = this.player.x + dx * speed * dt;
    const ny = this.player.y + dy * speed * dt;
    this.player.x = Phaser.Math.Clamp(nx, 10, this.mapWidth - 10);
    this.player.y = Phaser.Math.Clamp(ny, 10, this.mapHeight - 10);
  }

  moveSheep(dt) {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      const dx = sheep.x - this.player.x;
      const dy = sheep.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 70 && dist > 0) {
        sheep.vx = Phaser.Math.Linear(sheep.vx, (dx / dist) * 70, 0.12);
        sheep.vy = Phaser.Math.Linear(sheep.vy, (dy / dist) * 70, 0.12);
      }
      sheep.x += sheep.vx * dt;
      sheep.y += sheep.vy * dt;
      if (sheep.x < 10)               { sheep.x = 10;               sheep.vx *= -1; }
      if (sheep.x > this.mapWidth-10)  { sheep.x = this.mapWidth-10;  sheep.vx *= -1; }
      if (sheep.y < 10)               { sheep.y = 10;               sheep.vy *= -1; }
      if (sheep.y > this.mapHeight-10) { sheep.y = this.mapHeight-10; sheep.vy *= -1; }
      sheep.sprite.setPosition(sheep.x, sheep.y);
    }
  }

  checkSheepCollision() {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      const dx = sheep.x - this.player.x;
      const dy = sheep.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 24) {
        const pushDist = dist || 1;
        sheep.vx = (dx / pushDist) * 100;
        sheep.vy = (dy / pushDist) * 100;
        if (this.isInCorral(sheep.x, sheep.y)) {
          ScoreManager.addScore(-30);
          this.showFloatingText(sheep.x, sheep.y, '-30 😬', '#ff4444');
        } else {
          this.showFloatingText(sheep.x, sheep.y, '¡Ay!', '#ffffff');
        }
      }
    }
  }

  checkCorral() {
    for (const sheep of this.sheepGroup) {
      if (sheep.saved) continue;
      if (this.isInCorral(sheep.x, sheep.y)) {
        sheep.saved = true;
        sheep.sprite.play('oveja-safe');
        sheep.vx = 0; sheep.vy = 0;
        this.sheepSaved++;
        ScoreManager.addScore(100);
        this.showFloatingText(sheep.x, sheep.y, '+100', '#00ff88');
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
      if (Math.sqrt(dx * dx + dy * dy) < 35) { onPuddle = true; break; }
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

  checkCollectibles() {
    for (const item of this.collectibles) {
      if (item.collected) continue;
      const dx = this.player.x - item.x;
      const dy = this.player.y - item.y;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        item.collected = true;
        item.sprite.destroy();
        ScoreManager.addScore(item.points);
        this.showFloatingText(this.player.x, this.player.y, `+${item.points} ✨`, '#ffff00');
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
    const warningText = this.add.text(strikeX, strikeY - 30, '⚡', { fontSize: '20px' })
      .setOrigin(0.5).setDepth(3);

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
    const flash = this.add.rectangle(
      this.mapWidth / 2, this.mapHeight / 2,
      this.mapWidth, this.mapHeight, 0xffff00, 0.3
    ).setDepth(15);
    this.time.delayedCall(100, () => flash.destroy());
    this.add.text(strikeX, strikeY, '⚡', { fontSize: '32px' }).setOrigin(0.5).setDepth(10);

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
        sheep.sprite.play('oveja-muerta');
        sheep.sprite.clearTint();
        ScoreManager.addScore(-50);
        this.showFloatingText(sheep.x, sheep.y, '-50', '#ff4444');
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
      fontSize: '22px', color: '#00ff88', fontFamily: 'Arial',
      fontStyle: 'bold', align: 'center',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);
    this.time.delayedCall(2000, () => this.scene.start('Level3Scene'));
  }

  showFloatingText(x, y, text, color) {
    const txt = this.add.text(x, y - 12, text, {
      fontSize: '14px', color, fontFamily: 'Arial',
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