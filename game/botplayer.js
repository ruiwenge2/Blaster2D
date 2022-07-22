const { random, shoot, circleCol } = require("./functions.js");
const collide = require("line-circle-collision");
const humanNames = require("human-names");
const Player = require("./player.js");

class BotPlayer extends Player {
  constructor(id){
    super(id, humanNames.allRandom(), "main", true, false);
    this.movementTime = Date.now();
    this.target = {
      x: random(playersize, size - playersize),
      y: random(playersize, size - playersize)
    }
    this.finishedMovement = false;
    this.shootrate = random(3, 10);
  }
  
  botUpdate(){
    var xdone = false;
    if(!this.finishedMovement){
      if(Math.abs(this.x - this.target.x) < 10){
        this.left = false;
        this.right = false;
        xdone = true;
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
        if(xdone) this.finishedMovement = true;
      } else {
        if(this.y > this.target.y){
          this.up = true;
          this.down = false;
        } else {
          this.down = true;
          this.up = false;
        }
      }
      
      if(this.finishedMovement){
        this.movementTime = Date.now() + random(0, 10) * 1000; // random amount of seconds until the bot moves again
        this.finishedMovement = true;
      }
    } else {
      this.left = false;
      this.right = false;
      this.up = false;
      this.down = false;
      if(Date.now() >= this.movementTime){
        this.target = {
          x: random(playersize, size - playersize),
          y: random(playersize, size - playersize)
        }
        this.finishedMovement = false;
      }
    }

    var id = this.closestPlayer();
    if(!id) return;
    var player = rooms[this.room].players[id];
    var angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.angle2 = angle;
    this.angle = ((this.angle2 * 180 / Math.PI) + 360) % 360;
    if(!random(0, this.shootrate) && Math.abs(this.x - player.x) < 500 && Math.abs(this.y - player.y) < 300){ // if player within range
      this.shoot(angle);
    }
    
    this.update();
  }

  closestPlayer(){
    var players = {...rooms[this.room].players};
    delete players[this.id];
    if(!Object.keys(players).length) return undefined;
    const player = Object.values(players).sort((a, b) =>  Math.hypot(this.x - a.x, this.y - a.y) - Math.hypot(this.x - b.x, this.y - b.y))[0];
    return player.id;
  }

  closestCoin(){
    var coins = {...rooms[this.room].coins};
    if(!Object.keys(coins).length) return undefined;
    const coin = Object.values(coins).sort((a, b) =>  Math.hypot(this.x - a.x, this.y - a.y) - Math.hypot(this.x - b.x, this.y - b.y))[0];
    return coin.id;
  }
}

module.exports = BotPlayer;