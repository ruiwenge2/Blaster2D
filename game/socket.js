const { random, generateCode, checkUser, setUpRoom, verify, shoot, playerDead } = require("./functions.js");
const Player = require("./player.js");

const opposites = {
  "left": "right",
  "right": "left",
  "up": "down",
  "down": "up"
}

const socketfunc = socket => {
  socket.on("join", (name, token, loggedIn) => {
    verify(token, process.env.recaptcha_secret).then(verified => {
      if(!verified){
        console.log(name + " is a bot");
        socket.emit("kick", "No bots allowed");
        // socket.disconnect();
        return;
      }
      console.log(name + " joined");
      if(Object.keys(rooms.main.players).includes(socket.id)){
        socket.emit("kick", "Same ID as another player.\n\nPlease try again")
      }
      rooms.main.players[socket.id] = new Player(socket.id, name, false, loggedIn);
      socket.emit("gamedata", rooms.main);
      socket.broadcast.emit("new player", rooms.main.players[socket.id]);
    });
  });

  socket.on("player angle", data => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    rooms.main.players[socket.id].angle = data.angle;
    rooms.main.players[socket.id].angle2 = data.angle2;
  });

  socket.on("disconnect", () => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    let name = rooms.main.players[socket.id].name;
    delete rooms.main.players[socket.id];
    io.emit("left", socket.id);
    console.log(name + " left");
  });

  socket.on("movement", direction => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    rooms.main.players[socket.id][direction] = true;
    rooms.main.players[socket.id][opposites[direction]] = false;
  });
  
  socket.on("movement_end", direction => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    rooms.main.players[socket.id][direction] = false;
  });

  socket.on("shoot", (angle) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    if(Date.now() >= rooms.main.players[socket.id].shootTime){
      shoot(socket.id, angle);
      rooms.main.players[socket.id].shootTime = Date.now() + 500;
    }
  });

  socket.on("chat message", (name, message) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    io.emit("chat message", `${name}: ${message}`);
  });

  socket.on("leaveGame", () => {
    socket.disconnect();
  });
};

module.exports = socketfunc;
