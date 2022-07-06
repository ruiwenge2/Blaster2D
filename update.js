const update = () => {
  setInterval(function(){
    try {
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