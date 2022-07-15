const { random, generateCode } = require("./functions");
const BotPlayer = require("./botplayer");

const update = () => {
  setInterval(function(){
    try {
      if(Date.now() - time >= 1000){
        io.emit("tps", tps);
        tps = 0;
        time = Date.now();
      }
      if(Object.keys(rooms.main.coins).length < maxCoins){
        rooms.main.coins[rooms.main.new_coin_id] = {
          id: rooms.main.new_coin_id,
          x: random(coinsize / 2, size - coinsize / 2),
          y: random(coinsize / 2, size - coinsize / 2)
        };
        io.emit("new coin", rooms.main.coins[rooms.main.new_coin_id]);
        rooms.main.new_coin_id++;
      }
      
      if(!rooms.main.timeleft && Object.keys(rooms.main.players).length < 8){
        var id = generateCode(20, true);
        rooms.main.players[id] = new BotPlayer(id);
        io.emit("new player", rooms.main.players[id]);
        rooms.main.timeleft = 30 * random(1, 2); // bot joins every random amount of seconds
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

      if(Object.keys(rooms.main.coins).length <= 10){
        for(let i = 0; i < 10; i++){
          rooms.main.coins[rooms.main.new_coin_id] = {
            id: rooms.main.new_coin_id,
            x: random(coinsize / 2, size - coinsize / 2),
            y: random(coinsize / 2, size - coinsize / 2)
          };
          io.emit("new coin", rooms.main.coins[rooms.main.new_coin_id]);
          rooms.main.new_coin_id++;
        }
      }
      
      io.emit("gamestate", rooms.main);
      tps++;
    } catch(e){
      console.log(e);
    }
  }, 1000 / 30);
}

module.exports = update;