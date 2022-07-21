import Game from "./game";
import disconnect_scene from "./game/disconnect.js";

window.room = false;
window.rejoin = false;

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
  localStorage.setItem("server", document.getElementById("server").value);
  
  const game = new Phaser.Game(config);
  
  game.scene.add("gamescene", Game);
  game.scene.add("disconnect_scene", disconnect_scene);
  
  game.scene.start("gamescene");
  document.querySelector("canvas").style.cursor = "crosshair";
  
  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
  
  document.querySelector("main").style.display = "none";
}

if(localStorage.getItem("name") && !loggedIn){
  document.getElementById("input").value = localStorage.getItem("name");
}

if(loggedIn){
  localStorage.setItem("name", "");
}

if(localStorage.getItem("server")){
  document.getElementById("server").value = localStorage.getItem("server");
} else {
  document.getElementById("server").value = "https://blaster2d.ruiwenge2.repl.co";
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
  promptmodal("", "Enter room code to join:").then(code => {
    window.room = {
      mode: "join",
      code
    };
    startGame();
  });
});

window.getServerData = () => {
  const servers = {
    "https://blaster2d.ruiwenge2.repl.co": 1,
    "https://blaster2d.herokuapp.com": 2
  };
  for(let url of Object.keys(servers)){
    fetch(url + "/stats").then(res => res.json()).then(data => {
      document.getElementById("server" + servers[url]).innerHTML = `Server ${servers[url]} (${data.tps} TPS)`;
      console.log(url, ": ", data.tps);
    });
  }
};

getServerData();