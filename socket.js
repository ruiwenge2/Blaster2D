const { random, generateCode, checkUser, setUpRoom } = require("./functions.js");
const Player = require("./player.js");

const opposites = {
  "left": "right",
  "right": "left",
  "up": "down",
  "down": "up"
}

const socketfunc = socket => {
  socket.on("join", name => {
    setUpRoom();
    console.log(name + " joined");
    rooms.main.players[socket.id] = new Player(socket.id, name);
    socket.emit("gamedata", rooms.main);
    socket.broadcast.emit("new player", rooms.main.players[socket.id]);
  });

  socket.on("player angle", data => {
    if(!checkUser(socket.id)) return socket.emit("leave");
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

  socket.on("movement", direction => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    rooms.main.players[socket.id][direction] = true;
    rooms.main.players[socket.id][opposites[direction]] = false;
  });
  
  socket.on("movement_end", direction => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    rooms.main.players[socket.id][direction] = false;
  });

  socket.on("leaveGame", () => {
    socket.disconnect();
  });
};

module.exports = socketfunc;
