const ScoreManager = {
  score: 0,
  lives: 3,
  level: 1,

  reset() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
  },

  addScore(amount) {
    this.score += amount;
    if (this.score < 0) this.score = 0;
  },

  loseLife() {
    this.lives -= 1;
  },

  isGameOver() {
    return this.lives <= 0;
  },

  nextLevel() {
    this.level += 1;
  },
};

export default ScoreManager;