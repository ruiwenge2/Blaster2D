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
  }
  update(){
    if(this.left) this.x -= speed;
    if(this.right) this.x += speed;
    if(this.up) this.y -= speed;
    if(this.down) this.y += speed;
  }
}

module.exports = Player;