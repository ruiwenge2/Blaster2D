const { random, generateCode, checkUser, setUpRoom, verify, shoot, playerDead } = require("./functions.js");
const Player = require("./player.js");

const opposites = {
  "left": "right",
  "right": "left",
  "up": "down",
  "down": "up"
}

const banned = [];
const possible = ["24.6.134.221", "184.103.221.193", "68.225.240.203"];

const socketfunc = socket => {
  socket.on("join", async (name, gun, token, loggedIn, room, angle) => {
    try {
      let ip = socket.handshake.headers["x-forwarded-for"].split(", ")[0];
      if(banned.includes(ip)){
        console.log(ip);
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
      console.log(rooms[code].players[socket.id].name + " joined the room " + code + ": " + ip);
    } catch(e){
      console.log(e);
    }
  });

  socket.on("join server 2", name => {
    console.log(name + " joined server 2: " + socket.handshake.headers["x-forwarded-for"].split(",")[0]);
  });

  socket.on("player angle", (data, room) => {
    try {
      if(!checkUser(socket.id)) return socket.emit("leave");
      if(playerDead(socket.id)) return;
      rooms[room].players[socket.id].angle = data.angle;
      rooms[room].players[socket.id].angle2 = data.angle2;
    } catch(e){
      console.log(e);
    }
  });

  socket.on("disconnect", async () => {
    try {
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
    } catch(e){
      console.log(e);
    }
  });

  socket.on("movement", (direction, room) => {
    try {
      if(!checkUser(socket.id)) return socket.emit("leave");
      if(playerDead(socket.id)) return;
      rooms[room].players[socket.id][direction] = true;
      rooms[room].players[socket.id][opposites[direction]] = false;
    } catch(e){
      console.log(e);
    }
  });
  
  socket.on("movement_end", (direction, room) => {
    try {
      if(!checkUser(socket.id)) return socket.emit("leave");
      if(playerDead(socket.id)) return;
      rooms[room].players[socket.id][direction] = false;
    } catch(e){
      console.log(e);
    }
  });

  socket.on("shoot", (angle, room) => {
    try {
      if(!checkUser(socket.id)) return socket.emit("leave");
      if(playerDead(socket.id)) return;
      rooms[room].players[socket.id].shoot(angle);
    } catch(e){
      console.log(e);
    }
  });

  socket.on("chat message", (name, message, room) => {
    try {
      if(!checkUser(socket.id)) return socket.emit("leave");
      if(playerDead(socket.id)) return;
      try {
        message = filter.clean(message);
      } catch(e){}
      io.to(room).emit("chat message", `${name}: ${message}`);
    } catch(e){
      console.log(e);
    }
  });

  socket.on("reload", room => {
    try {
      if(!checkUser(socket.id)) return socket.emit("leave");
      if(playerDead(socket.id)) return;
      if(rooms[room].players[socket.id].shots == weapons[rooms[room].players[socket.id].gun].shots || rooms[room].players[socket.id].reloading) return;
      rooms[room].players[socket.id].reloading = true;
      rooms[room].players[socket.id].reloadTime = Date.now();
    } catch(e){
      console.log(e);
    }
  });

  socket.on("get_ping", (callback) => {
    try {
      callback();
    } catch(e){
      console.log(e);
    }
  });

  socket.on("leaveGame", () => {
    try {
      socket.disconnect();
    } catch(e){
      console.log(e);
    }
  });
};

module.exports = socketfunc;
