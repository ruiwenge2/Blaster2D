const express = require("express");
const app = express();
const server = require("http").Server(app);
global.io = require("socket.io")(server);
global.rooms = {
  main: {
    "players": {},
    "trees": {},
    "bullets": {},
    "gold":{}
  }
};
global.playersize = 75;

app.use(express.static("public"));
const { random, generateCode} = require("./functions");
const socketfunc = require("./socket");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socketfunc);

server.listen(3000, () => {
  console.log("server started");
});

// https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/