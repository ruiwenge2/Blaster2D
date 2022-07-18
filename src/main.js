import Game from "./game";
import disconnect_scene from "./game/disconnect.js";

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
  localStorage.setItem("name", name);
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

if(localStorage.getItem("server")){
  document.getElementById("server").value = localStorage.getItem("server");
}

document.getElementById("playbtn").addEventListener("click", startGame);

const servers = ["https://blaster2d.ruiwenge2.repl.co", "https://blaster2d.herokuapp.com"];

let num = 1;
servers.forEach(url => {
  fetch(url + "/serverstats").then(body => body.text()).then(tps => {
    document.getElementById("server" + num).innerHTML += ` (${tps} TPS)`;
    num++;
  });
})