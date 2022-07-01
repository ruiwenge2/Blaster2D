const intersects = require("intersects");

const update = () => {
  setInterval(function(){
     Object.values(rooms.main.players).forEach(player => {
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
  }, 1000 / 30);
}

module.exports = update;