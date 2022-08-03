const { random, circleCol } = require("./functions.js");
const collide = require("line-circle-collision");

class Player {
  constructor(id, name, gun, room, isBot, loggedIn, angle, skin){
    this.id = id;
    let str = name.substr(0, 14);
    try {
      this.name = filter.clean(str);
    } catch(e){
      this.name =  str;
    }
    this.bot = isBot;
    this.account = loggedIn;
    this.x = random(playersize, size - playersize);
    this.y = random(playersize, size - playersize);
    this.gun = gun;
    this.health = 100;
    this.ammo = 10;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.leftspeed = this.rightspeed = this.upspeed = this.downspeed = speed;
    this.died = false;
    this.angle2 = angle;
    this.angle = ((this.angle2 * 180 / Math.PI) + 360) % 360;
    this.score = 0;
    this.joinTime = Date.now();
    this.shootTime = Date.now();
    this.spawned = false;
    this.damage = damage;
    this.healTime = undefined;
    this.room = room;
    this.shots = weapons[this.gun].shots;
    this.shotsLeft = weapons[this.gun].total;
    this.shield = false;
    this.skin = skin;
  }
  
  update(){
    if(Date.now() - this.joinTime >= spawntime * 1000 && !this.spawned) this.spawned = true;
    if(this.health < 100 && Date.now() >= this.healTime){
      this.health += 1;
      this.healTime = Date.now() + 500;
    }
    if(this.reloading && Date.now() - this.reloadTime >=  weapons[this.gun].reloadTime){
      let shotsAdded = weapons[this.gun].shots - this.shots;
      if(shotsAdded > this.shotsLeft) shotsAdded = this.shotsLeft;
      this.shots += shotsAdded;
      this.shotsLeft -= shotsAdded;
      this.reloading = false;
    }
    if(this.shield){
      if(Date.now() >= this.shield.end){
        this.shield = false;
      } else {
        this.shield.timeleft = Math.round((this.shield.end - Date.now()) / 1000);
      }
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

    let players = {...rooms[this.room].players};
    delete players[this.id];
    Object.values(players).forEach(player => {
      if((this.left && circleCol(this.x - this.leftspeed, this.y, radius * 0.75, player.x, player.y, radius * 0.75)) || 
        (this.right && circleCol(this.x + this.rightspeed, this.y, radius * 0.75, player.x, player.y, radius * 0.75)) || 
        (this.up && circleCol(this.x, this.y - this.upspeed, radius * 0.75, player.x, player.y, radius * 0.75)) || 
        (this.down && circleCol(this.x, this.y + this.downspeed, radius * 0.75, player.x, player.y, radius * 0.75))) this.stop();
    });
  }

  stop(){
    this.left = this.right = this.up = this.down = false;
  }

  shoot(angle){
  // if(!this.spawned) return;
    if(this.reloading) return;
    if(!this.shots){
      if(!this.shotsLeft) return;
      this.reloading = true;
      this.reloadTime = Date.now();
      return;
    }
    if(Date.now() < this.shootTime) return;
    rooms[this.room].bullets[rooms[this.room].new_bullet_id] = {
      shooter: this.id,
      x: this.x + Math.cos(angle) * (radius + 40), 
      y: this.y + Math.sin(angle) * (radius + 40),
      angle: ((angle * 180 / Math.PI) + 360) % 360,
      angle2: angle,
      id: rooms[this.room].new_bullet_id,
      shooterName: this.name,
      gun: this.gun
    }
    
    io.to(this.room).emit("new bullet", rooms[this.room].new_bullet_id, rooms[this.room].bullets[rooms[this.room].new_bullet_id]);
    rooms[this.room].new_bullet_id++;
    this.shootTime = Date.now() + weapons[this.gun].coolDown;
    this.shots--;
  }

  checkCollision(){
    if(this.shotsLeft < weapons[this.gun].total){
      Object.values(rooms[this.room].coins).forEach(coin => {
        if(circleCol(coin.x, coin.y, coinsize * 1.25, this.x, this.y, radius)){
          delete rooms[this.room].coins[coin.id];
          io.to(this.room).emit("collected coin", coin.id, this.id);
          let shotsAdded = weapons[this.gun].shots;
          if(this.shotsLeft + shotsAdded > weapons[this.gun].total) shotsAdded = weapons[this.gun].total - this.shotsLeft;
          this.shotsLeft += shotsAdded;
        }
      });
    }
    if(!this.spawned) return;
    Object.values(rooms[this.room].bullets).forEach(bullet => {
      if(bullet.shooter == this.id) return;
      if(collide([bullet.x, bullet.y], [bullet.x, bullet.y], [this.x, this.y], radius)){
        delete rooms[this.room].bullets[bullet.id];
        io.to(this.room).emit("removed bullet", bullet.id);
        if(this.shield) return;
        this.health -= random(weapons[bullet.gun].min, weapons[bullet.gun].max);
        this.healTime = Date.now() + 5000;
        if(this.health <= 0){
          this.health = 0;
          this.died = true;
          io.to(this.room).emit("player died", this.id, bullet.shooter, bullet.shooterName);
          if(rooms[this.room].players[bullet.shooter]){
            rooms[this.room].players[bullet.shooter].addScore();
          }
          if(this.bot){
            if(!rooms[this.room].timeleft){
              rooms[this.room].timeleft = 30 * random(1, 4); // random amount of seconds until a bot joins
            }
          } else {
            console.log(this.name + " left the room " + this.room);
            rooms[this.room].diedPlayers.push(this.id);
          }
        }
      }
    });
  }

  addScore(){
    try {
      this.score++;
      if(powerUps.includes(this.score)){
        this.shield = {
          end: Date.now() + 10 * 1000,
          timeleft: 10
        }
      }
      if(this.account){
        let time = Date.now();
        db.score(this.name).then(() => {});
      }
    } catch(e){
      console.log(e);
    }
  }
}

module.exports = Player;