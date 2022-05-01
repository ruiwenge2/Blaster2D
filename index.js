const express = require("express");
const app = express();
const server = require("http").Server(app);
const { exec } = require("child_process");
const { verify } = require('hcaptcha');
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
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.urlencoded({extended: true}));

const { random, generateCode, is_human } = require("./functions");
const socketfunc = require("./socket");

io.on("connection", socketfunc);

app.get("/", (req, res) => {
  res.render("index.html");
});

app.get("/login", (req, res) => {
  res.render("login.html");
});

app.get("/signup", (req, res) => {
  res.render("signup.html");
});

app.get("/skins", (req, res) => {
  res.render("skins.html");
});

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

exec("npm run build", (error, stdout, stderr) => {
  if(error) {
    console.log(`${error.message}`);
    return;
  }
  if(stderr) {
    console.log(`${stderr}`);
    return;
  }
  console.log(`${stdout}`);
});

// https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/