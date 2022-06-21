const intersects = require("intersects");

const update = () => {
  setInterval(function(){
    for(let player of Object.keys(rooms.main.players)){
      rooms.main.players[player].update();
    }
    io.emit("gamestate", rooms.main);
  }, 1000 / 30);
}

module.exports = update;