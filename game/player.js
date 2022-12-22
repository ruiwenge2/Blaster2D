const { random, circleCol } = require("./functions.js");
const collide = require("line-circle-collision");
const Grenade = require("./grenade");

class Player {
  constructor(id, name, gun, room, isBot, loggedIn, angle, skin){
    this.id = id;
    let str = name.substr(0, 12);
    try {
      this.name = filter.clean(str);
    } catch(e){
      this.name = str;
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
    this.grenades = 3;
    this.grenadeTime = Date.now();
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
    if(this.x )
    if(this.left) this.x -= this.leftspeed;
    if(this.right) this.x += this.rightspeed;
    if(this.up) this.y -= this.upspeed;
    if(this.down) this.y += this.downspeed;
    this.checkCollision();
    this.checkMovement();
    this.leftspeed = this.rightspeed = this.upspeed = this.downspeed = speed;
  }

  checkDiagonal(){

    if(this.x - radius == 0) this.left = false;
    if(this.x + radius == size) this.right = false;
    if(this.y - radius == 0) this.up = false;
    if(this.y + radius == size) this.down = false;
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
    if(this.x - radius < 0) this.x = radius;
    if(this.x + radius > size) this.x = size - radius;
    if(this.y - radius < 0) this.y = radius;
    if(this.y + radius > size) this.y = size - radius;

    
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

  throwGrenade(angle){
    if(!this.grenades || Date.now() < this.grenadeTime) return;
    rooms[this.room].grenades[rooms[this.room].new_grenade_id] = new Grenade(this.x + Math.cos(angle) * (radius + 40), this.y + Math.sin(angle) * (radius + 40), angle, rooms[this.room].new_grenade_id, this.room, this.id, this.name);
    io.to(this.room).emit("new grenade", rooms[this.room].new_grenade_id, rooms[this.room].grenades[rooms[this.room].new_grenade_id]);
    rooms[this.room].new_grenade_id++;
    this.grenades--;
    this.grenadeTime = Date.now() + 1000;
  }

  checkCollision(){
    if(this.shotsLeft < weapons[this.gun].total || this.grenades < 3){
      Object.values(rooms[this.room].coins).forEach(coin => {
        if(circleCol(coin.x, coin.y, coinsize * 1.25, this.x, this.y, radius)){
          if(this.grenades == 3 || (this.grenades < 3 && random(0, 100) < 75 && this.shotsLeft < weapons[this.gun].total)){
            delete rooms[this.room].coins[coin.id];
            let shotsAdded = weapons[this.gun].shots;
            if(this.shotsLeft + shotsAdded > weapons[this.gun].total) shotsAdded = weapons[this.gun].total - this.shotsLeft;
            this.shotsLeft += shotsAdded;
            io.to(this.room).emit("collected coin", coin.id, this.id);
          } else {
            delete rooms[this.room].coins[coin.id];
            this.grenades++;
            io.to(this.room).emit("collected coin", coin.id, this.id);
          }
        }
      });
    }

    rocks.forEach(rock => {
      if(circleCol(this.x, this.y, radius, rock.x, rock.y, rock.size / 2)){
        let angle = Math.atan2(this.y - rock.y, this.x - rock.x);
        this.x = rock.x + Math.cos(angle) * (radius + rock.size / 2);
        this.y = rock.y + Math.sin(angle) * (radius + rock.size / 2);
        
        if(this.bot){
          this.target = {
            x: random(playersize, size - playersize),
            y: random(playersize, size - playersize)
          }
        }
      }
    });

    let players = {...rooms[this.room].players};
    delete players[this.id];
    Object.values(players).forEach(player => {
      if(circleCol(this.x, this.y, radius, player.x, player.y, radius)){
        let angle = Math.atan2(this.y - player.y, this.x - player.x);
        this.x = player.x + Math.cos(angle) * (radius * 2);
        this.y = player.y + Math.sin(angle) * (radius * 2);
        // if(this.bot){
        //   this.finishedMovement = true;
        //   var seconds = random(0, 5);
        //   if(this.target.coin) seconds = random(0, 1);
        //   this.movementTime = Date.now() + seconds * 1000;
        // }
      }
    });
    
    if(!this.spawned) return;
    Object.values(rooms[this.room].bullets).forEach(bullet => {
      if(this.died) return;
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
          io.to(this.room).emit("player died", this.id, bullet.shooter, bullet.shooterName, killWords[random(0, killWords.length - 1)]);
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

  addScore(id){
    try {
      this.score++;
      if(powerUps.includes(this.score)){
        this.shield = {
          end: Date.now() + 10 * 1000,
          timeleft: 10
        }
      }
      if(this.account && this.id != id){
        let time = Date.now();
        db.score(this.name).then(() => {});
      }
    } catch(e){
      console.log(e);
    }
  }
}

module.exports = Player;