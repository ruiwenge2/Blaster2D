const { random } = require("./functions.js");

class Grenade {
  constructor(x, y, angle, id, room, throwerId, name){
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.id = id;
    this.room = room;
    this.throwerId = throwerId;
    this.name = name;
    this.movementEnd = Date.now() + 500;
    this.explosion = undefined;
    this.exploded = false;
  }

  update(){
    if(Date.now() < this.movementEnd){
      this.x += Math.cos(this.angle) * grenade_speed;
      this.y += Math.sin(this.angle) * grenade_speed;
    } else {
      if(!this.explosion) this.explosion = Date.now() + 2000;
      if(Date.now() >= this.explosion){
        this.explode();
      }
    }
  }

  explode(){
    this.exploded = true;
    io.to(this.room).emit("explosion", this.id);

    Object.values(rooms[this.room].players).forEach(player => {
      if(player.shield) return;
      let damage = 0;
      let distance = Math.hypot(this.x - player.x, this.y - player.y);
      if(distance <= 150){
        damage = 100;
      } else if(distance <= 200){
        damage = random(50, 75);
      } else if(distance <= 250){
        damage = random(20, 30);
      }

      player.health -= damage;
      if(player.health <= 0){
        player.health = 0;
        player.died = true;
        io.to(player.room).emit("player died", player.id, this.throwerId, this.name);
        if(rooms[player.room].players[this.throwerId]){
          rooms[this.room].players[this.throwerId].addScore();
        }
        if(this.bot){
          if(!rooms[player.room].timeleft){
            rooms[player.room].timeleft = 30 * random(1, 4); // random amount of seconds until a bot joins
          }
        } else {
          console.log(player.name + " left the room " + player.room);
          rooms[player.room].diedPlayers.push(player.id);
        }
      }
    });
  }
}

module.exports = Grenade;