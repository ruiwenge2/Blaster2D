const { random } = require("./functions.js");

class Player {
  constructor(id, name){
    this.id = id;
    this.name = name;
    this.x = random(playersize, size - playersize)
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
  }
  
  update(){
    this.checkMovement();
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
}

module.exports = Player;