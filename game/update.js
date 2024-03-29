const { random, generateCode, goldRockCol } = require("./functions");
const BotPlayer = require("./botplayer");
const collide = require("line-circle-collision");

const update = () => {
  setInterval(function(){
    try {
      if(Date.now() - time >= 1000){
        io.emit("tps", tps);
        TPS = tps;
        tps = 0;
        time = Date.now();
      }
      tps++;
      Object.keys(rooms).forEach(room => {
        if(Object.keys(rooms[room].coins).length < maxCoins){
          let x = random(coinsize / 2, size - coinsize / 2);
          let y = random(coinsize / 2, size - coinsize / 2);
          while(goldRockCol(x, y)){
            x = random(coinsize / 2, size - coinsize / 2);
            y = random(coinsize / 2, size - coinsize / 2);
          }
          rooms[room].coins[rooms[room].new_coin_id] = {
            id: rooms[room].new_coin_id,
            x,
            y
          };
          io.to(room).emit("new coin", rooms[room].coins[rooms[room].new_coin_id]);
          rooms[room].new_coin_id++;
        }

        if(room == "main"){
          if(Date.now() >= rooms[room].nextBot && Object.keys(rooms[room].players).length < 8){
          var id = generateCode(20, true);
          while (Object.keys(rooms[room].players).includes(id)){
            id = generateCode(20, true);
          }
          rooms[room].players[id] = new BotPlayer(id);
          io.to("main").emit("new player", rooms[room].players[id]);
          rooms[room].nextBot = Date.now() + random(1, 2) * 1000; // bot joins every random amount of seconds
        }
  
          if(rooms[room].timeleft) rooms[room].timeleft--;
        }
        
        Object.values(rooms[room].players).forEach(player => {
          if(player.died){
            delete rooms[room].players[player.id];
            return;
          }
          if(player.bot) player.botUpdate();
          else player.update();
        });
        
        Object.values(rooms[room].bullets).forEach(bullet => {
          if(bullet.x < 0 || bullet.x > size || bullet.y < 0 || bullet.y > size){
            let id = bullet.id;
            delete rooms[room].bullets[id];
            io.to(room).emit("removed bullet", id);
            return;
          }
          rocks.forEach(rock => {
            if(collide([bullet.x, bullet.y], [bullet.x, bullet.y], [rock.x, rock.y], rock.size / 2)){
              let id = bullet.id;
              delete rooms[room].bullets[id];
              io.to(room).emit("removed bullet", id);
              return;
            }
          })
          bullet.x += Math.cos(bullet.angle2) * bullet_speed;
          bullet.y += Math.sin(bullet.angle2) * bullet_speed;
        });

        Object.values(rooms[room].grenades).forEach(grenade => {
          grenade.update();
          if(grenade.exploded){
            let id = grenade.id;
            delete rooms[room].grenades[id];
            io.to(room).emit("removed grenade", id);
            return;
          }
        })
        
        io.to(room).emit("gamestate", rooms[room]);
      });
    } catch(e){
      console.log(e);
    };
      
  }, 1000 / 30);
}

module.exports = update;