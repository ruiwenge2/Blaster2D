const { random, circleCol } = require("./functions.js");
const collide = require("line-circle-collision");

class Player {
  constructor(id, name){
    this.id = id;
    this.name = name;
    this.x = random(playersize, size - playersize);
    this.y = random(playersize, size - playersize);
    this.gun = "pistol";
    this.health = 100;
    this.ammo = 10;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.leftspeed = this.rightspeed = this.upspeed = this.downspeed = speed;
    this.died = false;
    this.angle2 = 0;
    this.angle = ((this.angle2 * 180 / Math.PI) + 360) % 360;
    this.score = 0;
    this.spawntimeleft = spawntime * 30;
  }
  
  update(){
    if(this.spawntimeleft) this.spawntimeleft --;
    this.checkDiagonal();
    this.checkMovement();
    this.checkCollision();
    if(this.left) this.x -= this.leftspeed;
    if(this.right) this.x += this.rightspeed;
    if(this.up) this.y -= this.upspeed;
    if(this.down) this.y += this.downspeed;
    this.leftspeed = this.rightspeed = this.upspeed = this.downspeed = speed;
  }

  checkDiagonal(){
    if(this.left && this.up){
      this.leftspeed = this.upspeed = Math.sqrt(speed * speed / 2);
    }
    if(this.left && this.down){
      this.leftspeed = this.downspeed = Math.sqrt(speed * speed / 2);
    }
    if(this.right && this.down){
      this.rightspeed = this.downspeed = Math.sqrt(speed * speed / 2);
    }
    if(this.right && this.up){
      this.rightspeed = this.upspeed = Math.sqrt(speed * speed / 2);
    }
  }

  checkMovement(){
    if(this.left && this.x - radius - speed < 0) this.leftspeed = this.x - radius;
    if(this.right && this.x + radius + speed > size) this.rightspeed = size - this.x - radius;
    if(this.up && this.y - radius - speed < 0) this.upspeed = this.y - radius;
    if(this.down && this.y + radius + speed > size) this.downspeed = size - this.y - radius;
  }

  checkCollision(){
    Object.values(rooms.main.coins).forEach(coin => {
      if(circleCol(coin.x, coin.y, coinsize * 1.5, this.x, this.y, radius)){
        delete rooms.main.coins[coin.id];
        io.emit("collected coin", coin.id, this.id);
      }
    });
    if(this.spawntimeleft) return;
    Object.values(rooms.main.bullets).forEach(bullet => {
      if(bullet.shooter == this.id) return;
      if(collide([bullet.x, bullet.y], [bullet.x, bullet.y], [this.x, this.y], radius)){
        this.died = true;
        delete rooms.main.bullets[bullet.id];
        io.emit("removed bullet", bullet.id);
        io.emit("player died", this.id, bullet.shooter, bullet.shooterName);
        rooms.main.players[bullet.shooter].score++;
      }
    });
  }
}

module.exports = Player;