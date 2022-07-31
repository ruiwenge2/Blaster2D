const { random, shoot, circleCol } = require("./functions.js");
const collide = require("line-circle-collision");
const humanNames = require("human-names");
const Player = require("./player.js");

class BotPlayer extends Player {
  constructor(id){
    var gun = Object.keys(weapons)[random(0, Object.keys(weapons).length - 1)];
    super(id, humanNames.allRandom(), gun, "main", true, false, 0, "botplayer");
    this.movementTime = Date.now();
    this.target = {
      x: random(playersize, size - playersize),
      y: random(playersize, size - playersize)
    }
    this.finishedMovement = false;
    this.shootrate = random(1, weapons[this.gun].useRate);
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
        var seconds = random(0, 5);
        if(this.target.coin) seconds = random(0, 1);
        this.movementTime = Date.now() + seconds * 1000; // random amount of seconds until the bot moves again
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
        if(this.shotsLeft <= weapons[this.gun].shots){ // bots gotta collect ammo as well
          let coin = rooms[this.room].coins[this.closestCoin()];
          this.target = {
            x: coin.x,
            y: coin.y,
            coin: true
          }
        }
      }
    }

    var id = this.closestPlayer();
    if(id){
      var player = rooms[this.room].players[id];
      var angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.angle2 = angle;
      this.angle = ((this.angle2 * 180 / Math.PI) + 360) % 360;
      if(!random(0, this.shootrate) && Math.abs(this.x - player.x) < 500 && Math.abs(this.y - player.y) < 500 && !this.reloading){ // if player within range
        this.shoot(angle);
        if(!this.shots){ // bot reloading
          setTimeout(() => {
            this.reloading = true;
            this.reloadTime = Date.now();
          }, 300);
        }
      }
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