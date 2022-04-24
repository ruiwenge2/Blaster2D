const { random, generateCode, checkUser } = require("./functions");

module.exports = socket => {
  socket.on("join", name => {
    if(Object.keys(rooms.main.players).length == 0){
      const coinsize = 37.5;
      const treesize = 300;
      const size = 3000;
      for(let i = 0; i < random(30, 50); i++){
        rooms.main.coins.push({
          id: i,
          x: random(coinsize / 2, size - coinsize / 2),
          y: random(coinsize / 2, size - coinsize / 2)
        });
      }
      for(let i = 0; i < random(10, 15); i++){
        let percent = random(50, 100);
        let realsize = treesize * percent / 100;
        rooms.main.trees.push({
          id: i,
          size: realsize,
          x: random(realsize / 2, size - realsize / 2),
          y: random(realsize / 2, size - realsize / 2)
        });
      }
    }
    console.log(name + " joined");
    rooms.main.players[socket.id] = {
      name: name,
      x: random(playersize, 3000 - playersize),
      y: random(playersize, 3000 - playersize),
      health: 100,
      gun:"pistol"
    }
    socket.emit("gamedata", rooms.main);
    socket.broadcast.emit("new player", rooms.main.players[socket.id], socket.id);
  });

  socket.on("player move", (x, y, angle, angle2) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    socket.broadcast.emit("other player move", socket.id, x, y, angle, angle2);
    rooms.main.players[socket.id].x = x;
    rooms.main.players[socket.id].y = y;
    rooms.main.players[socket.id].angle = angle;
    rooms.main.players[socket.id].angle2 = angle2;
  });

  socket.on("disconnect", () => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    let name = rooms.main.players[socket.id].name;
    delete rooms.main.players[socket.id];
    io.emit("left", socket.id);
    console.log(name + " left");
  });
}