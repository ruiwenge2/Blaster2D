const { random, generateCode, checkUser, setUpRoom, verify, shoot, playerDead } = require("./functions.js");
const Player = require("./player.js");

const opposites = {
  "left": "right",
  "right": "left",
  "up": "down",
  "down": "up"
}

const banned = [];
const possible = ["24.6.134.221"];

const socketfunc = socket => {
  socket.on("join", async (name, gun, token, loggedIn, room, angle) => {
  if(banned.includes(socket.handshake.headers["x-forwarded-for"])){
    console.log(socket.handshake.headers["x-forwarded-for"]);
    socket.emit("kick", "You are banned.");
    return;
  }
  let verified = await verify(token, process.env.recaptcha_secret);
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
    let skin = "player";
    if(loggedIn){
      var users = await db.get("users");
      let num = users[name].c;
      skin = skins.filter(e => e.id == num)[0].url;
    }
    rooms[code].players[socket.id] = new Player(socket.id, name, gun, code, false, loggedIn, angle || 0, skin);
    socket.emit("gamedata", rooms[code], code);
    socket.join(code);
    socket.broadcast.to(code).emit("new player", rooms[code].players[socket.id]);
    console.log(rooms[code].players[socket.id].name + " joined the room " + code + ": " + socket.handshake.headers["x-forwarded-for"]);
  });

  socket.on("join server 2", name => {
    console.log(name + " joined server 2: " + socket.handshake.headers["x-forwarded-for"]);
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
    console.log(name + " left the room " + room);
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
    rooms[room].players[socket.id].shoot(angle);
  });

  socket.on("chat message", (name, message, room) => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    io.to(room).emit("chat message", `${name}: ${filter.clean(message)}`);
  });

  socket.on("reload", room => {
    if(!checkUser(socket.id)) return socket.emit("leave");
    if(playerDead(socket.id)) return;
    if(rooms[room].players[socket.id].shots == weapons[rooms[room].players[socket.id].gun].shots || rooms[room].players[socket.id].reloading) return;
    rooms[room].players[socket.id].reloading = true;
    rooms[room].players[socket.id].reloadTime = Date.now();
  });

  socket.on("get_ping", (callback) => {
    callback();
  });

  socket.on("leaveGame", () => {
    socket.disconnect();
  });
};

module.exports = socketfunc;
