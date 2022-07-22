const { random, generateCode, checkUser, setUpRoom, verify, shoot, playerDead } = require("./functions.js");
const Player = require("./player.js");

const opposites = {
  "left": "right",
  "right": "left",
  "up": "down",
  "down": "up"
}

const socketfunc = socket => {
  socket.on("join", (name, token, loggedIn, room) => {
    verify(token, process.env.recaptcha_secret).then(verified => {
      if(!verified){
        console.log(name + " is a bot");
        socket.emit("kick", "Invalid reCAPTCHA token, please try again.", true);
        socket.disconnect();
        return;
      }
      if(room.mode == "join" && !Object.keys(rooms).includes(room.code)){
        socket.emit("kick", "Invalid room code.");
        socket.disconnect();
        return;
      }
      if(Object.keys(rooms.main.players).includes(socket.id)){
        socket.emit("kick", "Same ID as another player.\n\nPlease try again", false);
        socket.disconnect();
        return;
      }
      var code;
      if(room.code) code = room.code;
      else if(room.mode == "create"){
        code = generateCode(10);
        rooms[code] = {
          players: {},
          bullets: {},
          coins: {},
          new_bullet_id: 0,
          new_coin_id: 0,
          diedPlayers: []
        };
        setUpRoom(code);
        socket.emit("roomdata", code);
      } else {
        code = "main";
      }
      console.log(name + " joined the room " + code);
      rooms[code].players[socket.id] = new Player(socket.id, name, code, false, loggedIn);
      socket.emit("gamedata", rooms[code], code);
      socket.join(code);
      socket.broadcast.to(code).emit("new player", rooms[code].players[socket.id]);
    });
  });

  socket.on("player angle", (data, room) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    rooms[room].players[socket.id].angle = data.angle;
    rooms[room].players[socket.id].angle2 = data.angle2;
  });

  socket.on("disconnect", async () => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    let room;
    Object.keys(rooms).forEach(Room => {
      if(Object.keys(rooms[Room].players).includes(socket.id)) room = Room;
      return;
    });
    let name = rooms[room].players[socket.id].name;
    delete rooms[room].players[socket.id];
    io.to(room).emit("left", socket.id);
    console.log(name + " left");
    let sockets = await io.in(room).fetchSockets();
    if(!sockets.length && room != "main"){
      setTimeout(async () => {
        let s = await io.in(room).fetchSockets();
        if(s.length) return;
        delete rooms[room];
        console.log(`removed room ${room}`);
      }, 5000);
    }
  });

  socket.on("movement", (direction, room) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    rooms[room].players[socket.id][direction] = true;
    rooms[room].players[socket.id][opposites[direction]] = false;
  });
  
  socket.on("movement_end", (direction, room) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    rooms[room].players[socket.id][direction] = false;
  });

  socket.on("shoot", (angle, room) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    if(Date.now() >= rooms[room].players[socket.id].shootTime){
      shoot(socket.id, angle, room);
      rooms[room].players[socket.id].shootTime = Date.now() + 500;
    }
  });

  socket.on("chat message", (name, message, room) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    io.to(room).emit("chat message", `${name}: ${message}`);
  });

  socket.on("get_ping", (callback) => {
    callback();
  });

  socket.on("leaveGame", () => {
    socket.disconnect();
  });
};

module.exports = socketfunc;
