const express = require("express");
const app = express();
const server = require("http").Server(app);
const { verify } = require('hcaptcha');
const bcrypt = require('bcrypt');
const socketio = require("socket.io");
const session = require('express-session');
const Database = require("@replit/database");
const db = new Database();
global.io = socketio(server);
require("./tests");

require("./webpack.config.js");
global.rooms = {
  main: {
    players: {},
    trees: [],
    bullets: {},
    coins: []
  }
};
global.playersize = 50;

app.use(express.static("public"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.urlencoded({extended: true}));

const { random, generateCode } = require("./functions");
const socketfunc = require("./socket");
const skins = require("./skins");

io.on("connection", socketfunc);

app.get("/", (req, res) => {
  res.render("index.html", {skins: JSON.stringify(skins)});
});

app.get("/login", (req, res) => {
  res.render("login.html");
});

app.get("/signup", (req, res) => {
  res.render("signup.html");
});

app.get("/skins", (req, res) => {
  res.render("skins.html", {skins: skins});
});

app.post("/login", (req, res) => {
  res.send("working on it");
})

app.post("/signup", (req, res) => {
  var newusername = req.body.newusername;
  var newpassword = req.body.newpassword;
  let secret = process.env["captcha_secret"];
  let token = req.body["h-captcha-response"];
  
  verify(secret, token).then(data => {
    if(data.success){
      res.send("Verified");
    } else {
      res.send("Hi robot");
    }
  });
});

server.listen(3000, () => {
  console.log("server started");
});

// https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

// https://www.creativebloq.com/how-to/build-a-progressive-web-app