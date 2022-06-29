const intersects = require("intersects");

const update = () => {
  setInterval(function(){
    let keys = Object.keys(rooms.main.players);
    let length = keys.length;
    for(let i = 0; i < length; i++){
      rooms.main.players[keys[i]].update();
    }
    
    let bullets_keys = Object.keys(rooms.main.bullets);
    let bullets_length = bullets_keys.length;
    for(let i = 0; i < bullets_length; i++){
      let bullet = rooms.main.bullets[bullets_keys[i]];
      if(bullet.x < 0 || bullet.x > size || bullet.y < 0 || bullet.y > size){
        delete rooms.main.bullets[bullets_keys[i]];
        io.emit("removed bullet", bullets_keys[i]);
        continue;
      }
      bullet.x += Math.cos(bullet.angle2) * bullet_speed;
      bullet.y += Math.sin(bullet.angle2) * bullet_speed;
    }
    io.emit("gamestate", rooms.main);
  }, 1000 / 30);
}

module.exports = update;