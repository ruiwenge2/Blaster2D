import Game from "./game";
import disconnect_scene from "./game/disconnect.js";
import { random } from "./functions.js";

window.room = false;
window.rejoin = false;
window.started = false;

function startGame(){
  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#000000",
    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 0
        },
        debug: false
      }
    }
  };
  let name = document.getElementById("input").value;
  if(!name.replace(/\s/g, "")){
    document.querySelector("p").style.display = "block";
    return;
  }
  if(!loggedIn){
    localStorage.setItem("name", name);
  } else {
    localStorage.setItem("name", "");
  }
  
  if(document.getElementById("server").value == "auto"){
    localStorage.setItem("server", "auto");
  } else {
    window.chosenServer = document.getElementById("server").value;
    localStorage.setItem("server", window.chosenServer);
  }
  
  window.started = true;
  const game = new Phaser.Game(config);
  
  game.scene.add("gamescene", Game);
  game.scene.add("disconnect_scene", disconnect_scene);
  
  game.scene.start("gamescene");
  document.querySelector("canvas").style.cursor = "crosshair";
  
  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
  
  document.querySelector("main").style.display = "none";
  document.querySelector("p").style.display = "none";
}

if(localStorage.getItem("name") && !loggedIn){
  document.getElementById("input").value = localStorage.getItem("name");
}

if(loggedIn){
  localStorage.setItem("name", "");
}

if(localStorage.getItem("server")){
  document.getElementById("server").value = localStorage.getItem("server");
}

document.getElementById("playbtn").addEventListener("click", function(){
  if(!window.rejoin){
    window.room = false;
  } else {
    window.room = {
      mode: "join",
      code: window.rejoin
    }
  }
  startGame();
});

document.getElementById("createbtn").addEventListener("click", function(){
  window.room = {
    mode: "create"
  };
  startGame();
});

document.getElementById("joinbtn").addEventListener("click", function(){
  let a;
  if(autojoin){
    a = promptmodal("", "Enter room code to join:", "Join", true, autojoin);
  } else {
    a = promptmodal("", "Enter room code to join:", "Join");
  }
  a.then(code => {
    if(!document.getElementById("input").value.replace(/\s/g, "")){
      promptmodal("", "Enter your name: ", "OK", true).then(name => {
        document.getElementById("input").value = name;
        window.room = {
          mode: "join",
          code
        };
        startGame();
      });
    } else {
      window.room = {
        mode: "join",
        code
      };
      startGame();
    }
  });
});

document.getElementById("howtoplay").addEventListener("click", function(){
  alertmodal("How To Play", `<p style="font-size: 18px">
  WASD/Arrow keys to move<br>
  <br>Click to shoot<br>
  <br>Press R to reload gun<br>
  <br>Press ENTER to chat</p>`, "OK", true).then(() => {});
});

if(autojoin){
  document.getElementById("joinbtn").click();
}

const servers = {
  1: {
    url: "https://blaster2d.ruiwenge2.repl.co",
    num: 1
  },
  2: {
    url: "https://blaster2d.herokuapp.com",
    num: 2
  }
};

async function showServerData(num){
  let url = servers[num].url;
  let data = await fetch(url + "/stats");
  data = await data.json();
  document.getElementById("server" + num).innerHTML = `Server ${num} (${data.tps} TPS)`;
  console.log(url, ": ", data.tps);
  servers[num].tps = data.tps;
  return data.tps;
}

window.getServerData = () => {
  showServerData(1).then(() => {
    showServerData(2).then(() => {
      let keys = Object.values(servers);
      keys = keys.sort(function(a, b){return b.tps - a.tps});
      if(window.started) return;
      document.getElementById("autoserver").innerHTML = `Auto (Server ${keys[0].num})`;
      if(document.getElementById("server").value == "auto"){
        window.chosenServer = keys[0].url;
      }
    });
  });
};

getServerData();