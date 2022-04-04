const { random, generateCode, checkUser } = require("./functions");

module.exports = socket => {
  socket.on("join", name => {
    console.log(name + " joined");
    global.rooms.main.players[socket.id] = {
      name: name,
      x: random(playersize, 3000 - playersize),
      y: random(playersize, 3000 - playersize),
      health: 100,
      gun:"pistol"
    }
    socket.emit("gamedata", global.rooms.main);
    socket.broadcast.emit("new player", global.rooms.main.players[socket.id], socket.id);
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
    let name = global.rooms.main.players[socket.id].name;
    delete global.rooms.main.players[socket.id];
    io.emit("left", socket.id);
    console.log(name + " left");
  });
}