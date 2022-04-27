const express = require("express");
const app = express();
const server = require("http").Server(app);
const { exec } = require("child_process");

exec("npm run build", (error, stdout, stderr) => {
  if (error) {
    console.log(`${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`${stderr}`);
    return;
  }
  console.log(`${stdout}`);
});

global.io = require("socket.io")(server);
global.rooms = {
  main: {
    players: {},
    trees: [],
    bullets: {},
    coins:[]
  }
};
global.playersize = 50;

app.use(express.static("public"));
const { random, generateCode } = require("./functions");
const socketfunc = require("./socket");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socketfunc);

server.listen(3000, () => {
  console.log("server started");
});

// https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/