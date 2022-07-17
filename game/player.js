const { random, circleCol } = require("./functions.js");
const collide = require("line-circle-collision");

class Player {
  constructor(id, name, isBot){
    this.id = id;
    this.name = name;
    this.bot = isBot;
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
    this.joinTime = Date.now();
    this.shootTime = Date.now();
    this.spawned = false;
    this.damage = damage;
    this.healTime = undefined;
  }
  
  update(){
    if(Date.now() - this.joinTime >= spawntime * 1000 && !this.spawned) this.spawned = true;
    if(this.health < 100 && Date.now() >= this.healTime){
      this.health += 1;
      this.healTime = Date.now() + 500;
    }
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


    let players = {...rooms.main.players};
    delete players[this.id];
    Object.values(players).forEach(player => {
      if((this.left && circleCol(this.x - this.leftspeed, this.y, radius * 0.8, player.x, player.y, radius * 0.8)) || 
        (this.right && circleCol(this.x + this.rightspeed, this.y, radius * 0.8, player.x, player.y, radius * 0.8)) || 
        (this.up && circleCol(this.x, this.y - this.upspeed, radius * 0.8, player.x, player.y, radius * 0.8)) || 
        (this.down && circleCol(this.x, this.y + this.downspeed, radius * 0.8, player.x, player.y, radius * 0.8))) this.stop();
    });
  }

  stop(){
    this.left = this.right = this.up = this.down = false;
  }

  checkCollision(){
    Object.values(rooms.main.coins).forEach(coin => {
      if(circleCol(coin.x, coin.y, coinsize * 1.25, this.x, this.y, radius)){
        delete rooms.main.coins[coin.id];
        io.emit("collected coin", coin.id, this.id);
      }
    });
    if(!this.spawned) return;
    Object.values(rooms.main.bullets).forEach(bullet => {
      if(bullet.shooter == this.id) return;
      if(collide([bullet.x, bullet.y], [bullet.x, bullet.y], [this.x, this.y], radius)){
        this.health -= random(weapons[bullet.gun].min, weapons[bullet.gun].max);
        delete rooms.main.bullets[bullet.id];
        io.emit("removed bullet", bullet.id);
        this.healTime = Date.now() + 5000;
        if(this.health <= 0){
          this.health = 0;
          this.died = true;
          io.emit("player died", this.id, bullet.shooter, bullet.shooterName);
          if(rooms.main.players[bullet.shooter]){
            rooms.main.players[bullet.shooter].score++;
          }
          if(this.bot){
            if(!rooms.main.timeleft){
              rooms.main.timeleft = 30 * random(1, 4); // random amount of seconds until a bot joins
            }
          } else {
            console.log(this.name + " left");
            rooms.main.diedPlayers.push(this.id);
          }
        }
      }
    });
  }
}

module.exports = Player;