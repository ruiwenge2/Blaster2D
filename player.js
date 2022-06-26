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
    this.speed = speed;
  }
  
  update(){
    this.checkMovement();
    if(this.left) this.x -= this.speed;
    if(this.right) this.x += this.speed;
    if(this.up) this.y -= this.speed;
    if(this.down) this.y += this.speed;
    this.speed = speed;
  }

  checkMovement(){
    if(this.left && this.x - radius - speed < 0) this.speed = this.x - radius;
    if(this.right && this.x + radius + speed > size) this.speed = size - this.x - radius;
    if(this.up && this.y - radius - speed < 0) this.speed = this.y - radius;
    if(this.down && this.y + radius + speed > size) this.speed = size - this.y - radius;
  }
}

module.exports = Player;