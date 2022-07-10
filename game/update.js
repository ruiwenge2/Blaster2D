const { random, generateCode } = require("./functions");
const BotPlayer = require("./botplayer");

const update = () => {
  setInterval(function(){
    try {
      if(!rooms.main.timeleft && Object.keys(rooms.main.players).length < 8){
        var id = generateCode(20, true);
        rooms.main.players[id] = new BotPlayer(id);
        io.emit("new player", rooms.main.players[id]);
        rooms.main.timeleft = 30 * random(1, 2); // bot joins every random amount of seconds (5)
      }

      if(rooms.main.timeleft) rooms.main.timeleft--;
      
      Object.values(rooms.main.players).forEach(player => {
        if(player.died){
          delete rooms.main.players[player.id];
          return;
        }
        player.update();
      });
      
      Object.values(rooms.main.bullets).forEach(bullet => {
        if(bullet.x < 0 || bullet.x > size || bullet.y < 0 || bullet.y > size){
          let id = bullet.id;
          delete rooms.main.bullets[id];
          io.emit("removed bullet", id);
          return;
        }
        bullet.x += Math.cos(bullet.angle2) * bullet_speed;
        bullet.y += Math.sin(bullet.angle2) * bullet_speed;
      });
      
      io.emit("gamestate", rooms.main);
      
    } catch(e){
      console.log(e);
    }
  }, 1000 / 30);
}

module.exports = update;