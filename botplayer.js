const { random } = require("./functions.js");
const collide = require("line-circle-collision");
const humanNames = require("human-names");

class BotPlayer {
  constructor(id){
    this.id = id;
    this.name = humanNames.allRandom();
    this.x = random(playersize, size - playersize);
    this.y = random(playersize, size - playersize);
    this.gun = "pistol";
    this.health = 100;
    this.ammo = 10;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.leftspeed = speed;
    this.rightspeed = speed;
    this.upspeed = speed;
    this.downspeed = speed;
    this.died = false;
    this.angle2 = 0;
    this.angle = ((this.angle2 * 180 / Math.PI) + 360) % 360;
    this.score = 0;
    this.bot = true;
    this.timeleft = 0;
    this.target = {
      x: random(playersize, size - playersize),
      y: random(playersize, size - playersize)
    }
  }
  
  update(){
    if(Math.abs(this.x - this.target.x) < 10){
      this.left = false;
      this.right = false;
    } else {
      if(this.x > this.target.x){
        this.left = true;
        this.right = false;
      } else {
        this.right = true;
        this.left = false;
      }
    }
    if(Math.abs(this.y - this.target.y) < 10){
      this.up = false;
      this.down = false;
    } else {
      if(this.y > this.target.y){
        this.up = true;
        this.down = false;
      } else {
        this.down = true;
        this.up = false;
      }
    }
    
    this.checkMovement();
    this.checkCollision();
    if(this.left) this.x -= this.leftspeed;
    if(this.right) this.x += this.rightspeed;
    if(this.up) this.y -= this.upspeed;
    if(this.down) this.y += this.downspeed;
    this.leftspeed = speed;
    this.rightspeed = speed;
    this.upspeed = speed;
    this.downspeed = speed;
  }

  checkMovement(){
    if(this.left && this.x - radius - speed < 0) this.leftspeed = this.x - radius;
    if(this.right && this.x + radius + speed > size) this.rightspeed = size - this.x - radius;
    if(this.up && this.y - radius - speed < 0) this.upspeed = this.y - radius;
    if(this.down && this.y + radius + speed > size) this.downspeed = size - this.y - radius;
  }

  checkCollision(){
    Object.values(rooms.main.bullets).forEach(bullet => {
      if(bullet.shooter == this.id) return;
      if(collide([bullet.x, bullet.y], [bullet.x, bullet.y], [this.x, this.y], radius)){
        this.died = true;
        delete rooms.main.bullets[bullet.id];
        io.emit("removed bullet", bullet.id);
        io.emit("player died", this.id, bullet.shooter, bullet.shooterName);
        rooms.main.players[bullet.shooter].score++;
        if(!rooms.main.timeleft){
          rooms.main.timeleft = 30 * random(1, 4); // random amount of seconds until a bot joins
        }
      }
    });
  }

  closestPlayer(){
    
  }
}

module.exports = BotPlayer;