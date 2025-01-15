window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 500;

  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        const keyIndex = this.game.keys.indexOf(e.key);
        const keyInputs = ["ArrowUp", "ArrowDown", "Shift", "a", " "];
        if (!this.game.gameOver) {
          if (keyIndex === -1 && keyInputs.includes(e.key)) {
            if (e.key === " ") {
              // this.game.rapidFire = true;
              this.game.player.shootTop();
            }
            if (e.key === "a") {
              this.game.autoFire = !this.game.autoFire;
            }
            this.game.keys.push(e.key);
          }
        }

        if (e.key === "d") {
          this.game.debug = !this.game.debug;
        }

        if (e.key === "m") {
          this.game.displayTouchControls = !this.game.displayTouchControls;
        }
      });
      window.addEventListener("keyup", (e) => {
        const keyIndex = this.game.keys.indexOf(e.key);
        if (keyIndex > -1) {
          if (e.key === " ") {
            this.game.rapidFire = false;
          }
          this.game.keys.splice(keyIndex, 1);
        }
      });
    }
  }

  class TouchScreenInputHandler {
    constructor(game) {
      this.game = game;
      this.upButton = document.getElementById("upButton");
      this.downButton = document.getElementById("downButton");
      this.fireButton = document.getElementById("fire");
      this.autoFireButton = document.getElementById("autoFire");

      const handleButtonPressed = (button) => {
        if (!this.game.gameOver) {
          if (button === "fire") {
            this.game.player.shootTop();
            this.game.rapidFire = true;
          }
          this.game.keys.push(button);
        }
      };

      const handleButtonReleased = (button) => {
        const keyIndex = this.game.keys.indexOf(button);
        if (keyIndex > -1) {
          if (button === "fire") {
            this.game.rapidFire = false;
          }
          this.game.keys.splice(keyIndex, 1);
        }
      };

      // up button actions
      this.upButton.addEventListener("touchstart", (e) => {
        handleButtonPressed(e.target.id);
      });

      this.upButton.addEventListener("touchend", (e) => {
        handleButtonReleased(e.target.id);
      });

      // down button actions
      this.downButton.addEventListener("touchstart", (e) => {
        handleButtonPressed(e.target.id);
      });

      this.downButton.addEventListener("touchend", (e) => {
        handleButtonReleased(e.target.id);
      });

      // autofire button actions
      this.autoFireButton.addEventListener("touchstart", () => {
        this.game.autoFire = !this.game.autoFire;
      });

      // fire button actions
      this.fireButton.addEventListener("touchstart", (e) => {
        handleButtonPressed(e.target.id);
      });

      this.fireButton.addEventListener("touchend", (e) => {
        handleButtonReleased(e.target.id);
      });
    }
  }

  class SoundController {
    constructor() {
      this.bgmPlay = document.getElementById("bgm");
      this.powerUpSound = document.getElementById("powerup");
      this.powerDownSound = document.getElementById("powerdown");
      this.explosionSound = document.getElementById("explosion");
      this.shotSound = document.getElementById("shot");
      this.hitSound = document.getElementById("hit");
      this.shieldSound = document.getElementById("shieldSound");
    }

    bgm() {
      this.bgmPlay.play();
      this.bgmPlay.loop = true;
    }

    powerUp() {
      this.powerUpSound.currentTime = 0;
      this.powerUpSound.volume = 0.4;
      this.powerUpSound.play();
    }

    powerDown() {
      this.powerDownSound.currentTime = 0;
      this.powerDownSound.volume = 0.4;
      this.powerDownSound.play();
    }

    explosion() {
      this.explosionSound.currentTime = 0;
      this.explosionSound.volume = 0.4;
      this.explosionSound.play();
    }

    shot() {
      this.shotSound.currentTime = 0;
      this.shotSound.volume = 0.4;
      this.shotSound.play();
    }

    hit() {
      this.hitSound.currentTime = 0;
      this.hitSound.volume = 0.4;
      this.hitSound.play();
    }

    shield() {
      this.shieldSound.currentTime = 0;
      this.shieldSound.volume = 0.4;
      this.shieldSound.play();
    }
  }

  class Shield {
    constructor(game) {
      this.game = game;
      this.width = this.game.player.width;
      this.height = this.game.player.height;
      this.frameX = 0;
      this.maxFrame = 24;
      this.image = document.getElementById("shield");
      this.fps = 30;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }

    update(deltaTime) {
      if (this.frameX < this.maxFrame) {
        if (this.timer > this.interval) {
          this.frameX++;
          this.timer = 0;
        } else {
          this.timer += deltaTime;
        }
      }
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.game.player.x,
        this.game.player.y,
        this.width,
        this.height
      );
    }

    reset() {
      this.frameX = 0;
      this.game.sound.shield();
    }
  }

  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 36.25;
      this.height = 20;
      this.speed = 25;
      this.markedForDeletion = false;
      this.image = document.getElementById("fireball");
      this.frameX = 0;
      this.maxFrame = 3;
      this.fps = 20;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }

    update(deltaTime) {
      if (this.game.player.powerUp) {
        this.x += this.speed * 2;
      } else {
        this.x += this.speed;
      }
      if (this.timer > this.interval) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;

        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }

      if (this.x > this.game.width * 0.95) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class Particle {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("gears");
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      this.bottomBounceBoundary = Math.random() * 80 + 60;
    }

    update() {
      this.angle += this.va;
      this.speedY += this.gravity;
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY;
      if (this.y > this.game.height + this.size || this.x < 0 - this.size)
        this.markedForDeletion = true;
      if (
        this.y > this.game.height - this.bottomBounceBoundary &&
        this.bounced < 2
      ) {
        this.bounced++;
        this.speedY *= -0.5;
      }
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size
      );
      context.restore();
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 150;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
      this.speedY = 0;
      this.speedX = 0;
      this.minSpeed = 3;
      this.maxSpeed = 8;
      this.projectiles = [];
      this.image = document.getElementById("player");
      this.health = 40;
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
      this.autoFireTimer = 0;
      this.autoFireInitialInterval = 150;
      this.autoFirePowerUpInterval = 100;
      this.autoFireInterval = this.autoFireInitialInterval;
    }

    update(deltaTime) {
      if (!this.game.gameOver) {
        // handle movement
        if (
          this.game.keys.includes("ArrowUp") ||
          this.game.keys.includes("upButton")
        ) {
          this.speedY = this.powerUp ? -this.maxSpeed : -this.minSpeed;
        } else if (
          this.game.keys.includes("ArrowDown") ||
          this.game.keys.includes("downButton")
        ) {
          this.speedY = this.powerUp ? this.maxSpeed : this.minSpeed;
        } else {
          this.speedY = 0;
          this.game.speed = this.game.minSpeed;
        }

        if (this.game.keys.includes("Shift")) {
          this.game.speed = this.game.boostSpeed * 10;
        } else {
          this.game.speed = this.game.minSpeed;
        }

        // vertical boundaries
        if (this.y > this.game.height - this.height * 0.5)
          this.y = this.game.height - this.height * 0.5;
        else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;

        // auto fire
        if (this.game.autoFire || this.game.rapidFire) {
          if (
            this.autoFireTimer > this.autoFireInterval &&
            !this.game.gameOver
          ) {
            this.shootTop();
            this.autoFireTimer = 0;
          } else {
            this.autoFireTimer += deltaTime;
          }
        }
      }

      this.y += this.speedY;

      // handle projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update(deltaTime);
      });
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
      // sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }

      // health status
      if (this.health <= 0) {
        this.game.gameOver = true;
        this.y += 10;
      }

      // power up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.autoFireInterval = this.autoFireInitialInterval;
          this.game.sound.powerDown();

          this.frameY = 0;
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          if (this.game.ammo < this.game.maxAmmo) {
            this.game.ammo += 0.1;
          }
        }
      }
    }

    draw(context) {
      if (this.game.debug) {
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.fillStyle = "white";
        context.font = "20px Helvetica";
        context.fillText(this.health, this.x, this.y);
        if (this.powerUp) {
          context.fillStyle = "#ffffbd";
          context.fillText(
            `${Math.floor(this.powerUpTimer)}/${this.powerUpLimit}`,
            this.x * 3,
            this.y
          );
        }
      }
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    shootTop() {
      if (this.game.ammo > 0) {
        this.game.sound.shot();
        this.projectiles.push(
          new Projectile(this.game, this.x + 50, this.y + 22)
        );
        this.game.ammo--;
      }
      if (this.powerUp) this.shootBottom();
    }

    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 50, this.y + 170)
        );
      }
    }
    enterPowerUp() {
      this.powerUpTimer = 0;
      this.autoFireInterval = this.autoFirePowerUpInterval;
      this.powerUp = true;
      if (this.game.ammo < this.game.maxAmmo)
        this.game.ammo = this.game.maxAmmo;
      this.game.sound.powerUp();
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -10.5 - 0.5;
      this.markedForDeletion = false;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }

    update() {
      this.x += this.speedX - this.game.speed;
      if (this.x + this.width < 0) this.markedForDeletion = true;

      // sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }

    draw(context) {
      if (this.game.debug) {
        context.save();
        context.strokeStyle = "red";
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.fillStyle = "white";
        context.font = "20px Helvetica";
        context.fillText(this.health, this.x, this.y);
        context.restore();
      }
      // full enemy health bar
      context.save();
      context.fillStyle = "black";
      for (let i = 0; i < this.maxHealth; i++) {
        context.fillRect(
          this.x + (this.width - 10 * i) / 2,
          this.y - 15,
          11,
          10
        );
      }
      context.restore();

      // current enemy health bar
      context.save();
      context.fillStyle = "red";
      for (let i = 0; i < this.health; i++) {
        context.fillRect(
          this.x + (this.width - 10 * i) / 2,
          this.y - 15,
          11,
          10
        );
      }
      context.restore();

      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.health = 5;
      this.maxHealth = 5;
      this.score = this.health;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler1");
      this.frameY = Math.floor(Math.random() * 3);
      this.damage = 2;
    }
  }

  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.health = 6;
      this.maxHealth = 6;
      this.score = this.health;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler2");
      this.frameY = Math.floor(Math.random() * 2);
      this.damage = 3;
    }
  }

  class LuckyFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.health = 5;
      this.maxHealth = 5;
      this.score = 15;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("lucky");
      this.frameY = Math.floor(Math.random() * 2);
      this.type = "lucky";
    }
  }

  class HiveWhale extends Enemy {
    constructor(game) {
      super(game);
      this.width = 400;
      this.height = 227;
      this.health = 15;
      this.maxHealth = 15;
      this.score = 15;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("hivewhale");
      this.frameY = 0;
      this.damage = 7;
      this.type = "hive";
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class Drone extends Enemy {
    constructor(game, x, y) {
      super(game);
      this.width = 115;
      this.height = 95;
      this.x = x;
      this.y = y;
      this.health = 3;
      this.maxHealth = 3;
      this.score = 3;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("drone");
      this.frameY = Math.floor(Math.random() * 2);
      this.damage = 3;
      this.type = "drone";
      this.speedX = Math.random() * -4.2 - 0.5;
    }
  }

  class BulbWhale extends Enemy {
    constructor(game) {
      super(game);
      this.width = 270;
      this.height = 219;
      this.health = 25;
      this.maxHealth = 25;
      this.score = 20;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("bulbwhale");
      this.frameY = Math.floor(Math.random() * 2);
      this.damage = 10;
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class MoonFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 227;
      this.height = 240;
      this.health = 15;
      this.maxHealth = 15;
      this.score = 20;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("moonfish");
      this.damage = 6;
      this.speedX = Math.random() * -1.2 - 2;
      this.type = "moon";
    }
  }

  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }

    update() {
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifier;
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }

  class Background {
    constructor(game) {
      this.game = game;

      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);

      this.layers = [this.layer1, this.layer2, this.layer3];
    }
    update() {
      this.layers.forEach((layer) => layer.update());
    }
    draw(context) {
      this.layers.forEach((layer) => layer.draw(context));
    }
  }

  class Explosion {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.frameX = 0;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
      this.fps = 25;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.markedForDeletion = false;
      this.maxFrame = 8;
    }

    update(deltaTime) {
      this.x -= this.game.speed;
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class SmokeExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById("smokeExplosion");
    }
  }

  class FireExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById("fireExplosion");
    }
  }

  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 30;
      this.fontFamily = "Carter One";
      this.color = "white";
    }

    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = `${this.fontSize}px ${this.fontFamily}`;
      // score
      context.fillText(`Score: ${this.game.score}`, 20, 40);
      // winning score
      context.save();
      context.font = `40px ${this.fontFamily}`;
      context.fillText(
        `Target Score: ${this.game.winningScore}`,
        this.game.width * 0.5 - 150,
        50
      );
      context.restore();
      // ammo
      context.fillStyle = this.color;
      if (this.game.player.powerUp) context.fillStyle = "#ffffbd";
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 10 * i, 80, 5, 20);
      }
      // timer
      context.fillStyle = this.color;
      const formattedTime = (this.game.gameTime * 0.001).toFixed(0);
      context.fillText(
        `Timer: ${Math.abs(formattedTime)}`,
        this.game.width * 0.9 - 20,
        40
      );
      // game over messages
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.score > this.game.winningScore) {
          message1 = "You Win!";
          message2 = "Well done!";
        } else {
          message1 = "You lose!";
          message2 = "Try again next time!";
        }
        context.font = `120px ${this.fontFamily}`;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 40
        );
        context.font = `50px ${this.fontFamily}`;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 40
        );
      }
      context.restore();
      context.save();
      // player health
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.fillStyle = "red";
      for (let i = 0; i < this.game.player.health; i++) {
        context.fillRect(20 + 10 * i, 50, 5, 20);
      }
      context.restore();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.player = new Player(this);
      this.shield = new Shield(this);
      this.input = new InputHandler(this);
      this.touchInput = new TouchScreenInputHandler(this);
      this.ui = new UI(this);
      this.sound = new SoundController();
      this.displayTouchControls = false;
      this.keys = [];
      this.enemies = [];
      this.particles = [];
      this.explosions = [];
      this.enemyTimer = 0;
      this.enemyInterval = 2000;
      this.autoFire = false;
      this.rapidFire = false;
      this.ammo = 20;
      this.maxAmmo = 40;
      this.ammoTimer = 0;
      this.ammoInterval = 350;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 500;
      this.gameTime = 120000;
      this.speed = 1;
      this.minSpeed = 1;
      this.boostSpeed = 2;
      this.isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );
      this.debug = false;
    }
    update(deltaTime) {
      this.sound.bgm();
      if (
        this.displayTouchControls ||
        (this.isMobileDevice && window.matchMedia("(orientation: landscape)").matches)
      ) {
        document.getElementById("touchInput").style.display = "flex";
      } else {
        document.getElementById("touchInput").style.display = "none";
      }
      if (!this.gameOver) this.gameTime -= deltaTime;
      if (this.gameTime <= 0) this.gameOver = true;
      this.background.update();
      this.background.layer4.update();
      this.player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
        }
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }
      this.shield.update(deltaTime);

      // Handle particles
      this.particles.forEach((particle) => particle.update());
      this.particles = this.particles.filter(
        (particle) => !particle.markedForDeletion
      );

      // handle explosions
      this.explosions.forEach((explosion) => explosion.update(deltaTime));
      this.explosions = this.explosions.filter(
        (explosion) => !explosion.markedForDeletion
      );

      // Handle enemies
      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollisions(this.player, enemy)) {
          enemy.markedForDeletion = true;
          this.addExplosion(enemy);
          this.shield.reset();
          for (let i = 0; i < enemy.health; i++) {
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );
          }
          if (!this.gameOver) {
            if (enemy.type === "lucky") this.player.enterPowerUp();
            else this.player.health -= enemy.damage;
          }
        }

        // handle player projectile collision
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollisions(projectile, enemy)) {
            enemy.health--;
            this.sound.hit();
            projectile.markedForDeletion = true;
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );

            // handle projectile collision on enemy
            if (enemy.health <= 0) {
              // handle particle effects
              for (let i = 0; i < enemy.score; i++) {
                this.particles.push(
                  new Particle(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                  )
                );
              }

              // handle enemy deletion
              enemy.markedForDeletion = true;

              // add explosion effect
              this.addExplosion(enemy);

              // handle enemy type 'hive'
              if (enemy.type === "hive") {
                for (let i = 0; i < 5; i++) {
                  this.enemies.push(
                    new Drone(
                      this,
                      enemy.x + Math.random() * enemy.width,
                      enemy.y + Math.random() * enemy.height * 0.5
                    )
                  );
                }
              }

              // handle enemy type 'moon'
              if (enemy.type === "moon") this.player.enterPowerUp();

              // handle gameOver state and scoring
              if (!this.gameOver) this.score += enemy.score;
              if (this.score > this.winningScore) {
                this.gameOver = true;
              }
            }
          }
        });
      });

      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }
    draw(context) {
      // draw background
      this.background.draw(context);

      // draw player
      this.player.draw(context);

      // draw shield
      this.shield.draw(context);

      // draw particles
      this.particles.forEach((particle) => particle.draw(context));

      // draw enemies
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });

      // draw explosions
      this.explosions.forEach((explosion) => explosion.draw(context));

      // draw foreground
      this.background.layer4.draw(context);

      // draw ui
      this.ui.draw(context);
    }
    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new Angler1(this));
      else if (randomize < 0.6) this.enemies.push(new Angler2(this));
      else if (randomize < 0.7) this.enemies.push(new HiveWhale(this));
      else if (randomize < 0.8) this.enemies.push(new BulbWhale(this));
      else if (randomize < 0.9) this.enemies.push(new MoonFish(this));
      else this.enemies.push(new LuckyFish(this));
    }
    addExplosion(enemy) {
      const randomize = Math.random();
      this.sound.explosion();
      if (randomize < 0.5) {
        this.explosions.push(
          new SmokeExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      } else {
        this.explosions.push(
          new FireExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      }
    }
    checkCollisions(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  // animation loop
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime);
    requestAnimationFrame(animate);
  }
  animate(0);
});
