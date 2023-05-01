const express = require("express");
const app = express();
const server = require("http").Server(app);
const bcrypt = require("bcrypt");
const socketio = require("socket.io");
const session = require("express-session");
const cors = require("cors");
const Filter = require("bad-words");
const fs = require("fs");

global.io = socketio(server, {
  cors: { origin: "*" },
});
global.rooms = {
  main: {
    players: {},
    bullets: {},
    grenades: {},
    coins: {},
    new_bullet_id: 0,
    new_grenade_id: 0,
    new_coin_id: 0,
    nextBot: Date.now(),
    diedPlayers: []
  }
};
global.playersize = 65;
global.radius = playersize / 2;
global.size = 5000;
global.treesize = 300;
global.coinsize = 37.5;
global.speed = 10;
global.bullet_speed = 45;
global.grenade_speed = 20;
global.spawntime = 3;
global.maxCoins = 50;
global.tps = 0;
global.TPS = 0;
global.time = Date.now();
global.damage = 50;
global.weapons = require("./game/weapons.js");
global.filter = new Filter();
global.killWords = ["killed", "destroyed", "murdered", "crushed", "wrecked"];

global.powerUps = [5, 10, 20, 30, 40, 50, 75, 100]; // number 1 for testing purposes

global.rocks = JSON.parse(fs.readFileSync("src/rocks.json")).rocks;

app.use(express.static("public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(express.urlencoded({extended: true}));
app.use(session({secret: process.env["secret"]}));

const { random, generateCode, loggedIn, getUser, deleteUser, verify, setUpRoom } = require("./game/functions.js");
const api = require("./api.js");
const socketfunc = require("./game/socket.js");
global.skins = require("./game/skins.js");
const update = require("./game/update.js");
const Database = require("./db.js");

setUpRoom("main");

global.db = new Database();

// require("./tests.js");
// require("./trees.js");
require("./webpack.config.js");


/* db.get("users").then(obj => {
  if(obj == "Not Found") db.set("users", {});
}); */

const saltRounds = 10;
const allchars = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i",
  "j", "k", "l", "m", "n", "o", "p", "q", "r",
  "s", "t", "u", "v", "w", "x", "y", "z", "A",
  "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S",
  "T", "U", "V", "W", "X", "Y", "Z", "0", "1",
  "2", "3", "4", "5", "6", "7", "8", "9", "_"
];
  
io.on("connection", socketfunc);
update();

app.use("/api", api);

app.get("/", (req, res) => {
  res.render("index.html", {loggedIn: loggedIn(req), username: (loggedIn(req) ? req.session.username: null), room: req.query.code});
});

app.get("/login", (req, res) => {
  if(loggedIn(req)){
    res.redirect("/");
    return;
  }
  res.render("login.html", {error: false});
});

app.get("/signup", (req, res) => {
  if(loggedIn(req)){
    res.redirect("/");
    return;
  }
  res.render("signup.html", {error: false});
});

app.get("/skins", async (req, res) => {
  try {
    var balance, skinsList, current;
    if(loggedIn(req)){
      var users = await db.get("users");
      balance = users[req.session.username].b;
      skinsList = users[req.session.username].s;
      current = users[req.session.username].c;
    }
    res.render("skins.html", {skins, loggedIn: loggedIn(req), balance, skinsList, current });
  } catch(e){
    console.log(e);
  }
});

app.post("/login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  db.get("users").then(users => {
    if(!Object.keys(users).includes(username)){
      res.render("login.html", {error: "Invalid username and/or password."});
      return;
    }
    bcrypt.compare(password, users[username].p, function(err, result){
      if(!result){
        res.render("login.html", {error: "Invalid username and/or password."});
        return;
      }
      req.session.username = username;
      res.redirect("/");
    });
  });
});

app.post("/signup", (req, res) => {
  let time = Date.now();
  var newusername = req.body.newusername;
  var newpassword = req.body.newpassword;
  let secret = process.env["recaptcha_signup_secret"];
  let token = req.body["g-recaptcha-response"];
  for(let i of newusername){
    if(!allchars.includes(i)){
      res.render("signup.html", {error: "Username can only contain alphanumeric characters and underscores"});
      return;
    }
  }
  verify(token, secret).then(success => {
    if(success){
      db.get("users").then(users => {
        if(Object.keys(users).includes(newusername)){
          res.render("signup.html", {error: "Username taken."});
          return;
        }
        if(newusername == "" || newpassword == ""){
          res.render("signup.html", {error: "All fields are required."});
          return;
        }
        console.log(newusername);
        bcrypt.hash(newpassword, saltRounds, function(err, hash){
          var data = {
            p: hash,
            s: [0],
            c: 0,
            g: "pistol",
            b: 0
          };

          /* 
          REMEMBER:
          p = password,
          s = skins,
          c = current skin,
          g = gun,
          b = balance (how much gold a player owns)
          */
          db.player(newusername, data).then(() => {
            console.log("new account created");
            req.session.username = newusername;
            res.redirect("/");
            console.log(Date.now() - time + " ms");
          });
        });
      });
    } else {
      res.render("signup.html", {error: "No bots allowed!"});
    }
  });
});

app.get("/stats", cors(), (req, res) => {
  res.send({
    tps: TPS,
    players: Object.keys(rooms.main.players).length
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/*", (req, res) => {
  res.status(404).send("Page not found");
});

server.listen(process.env.PORT || 3000, () => {
  console.log("server started");
  console.log(`${db.db_url}/users`);
});

process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error:\n", err);
  process.exit(1);
})

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
