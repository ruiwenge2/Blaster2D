const { random, generateCode, checkUser, setUpRoom } = require("./functions");

module.exports = socket => {
  socket.on("join", name => {
    setUpRoom();
    console.log(name + " joined");
    rooms.main.players[socket.id] = {
      name: name,
      x: random(playersize, 3000 - playersize),
      y: random(playersize, 3000 - playersize),
      health: 100,
      gun:"pistol",
      ammo: 10
    }
    socket.emit("gamedata", rooms.main);
    socket.broadcast.emit("new player", rooms.main.players[socket.id], socket.id);
  });

  socket.on("player move", data => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    socket.broadcast.emit("other player move", socket.id, data);
    rooms.main.players[socket.id].x = data.x;
    rooms.main.players[socket.id].y = data.y;
    rooms.main.players[socket.id].angle = data.angle;
    rooms.main.players[socket.id].angle2 = data.angle2;
  });

  socket.on("collect gold", id => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    rooms.main.coins.splice(id, 1);
    socket.broadcast.emit("collected gold", id);
  });

  socket.on("disconnect", () => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    let name = rooms.main.players[socket.id].name;
    delete rooms.main.players[socket.id];
    io.emit("left", socket.id);
    console.log(name + " left");
  });
};