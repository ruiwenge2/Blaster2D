import gamescene from "./game/index.js";
import joinscene from "./scenes/join.js";
import howtoplay from "./scenes/howtoplay.js";
import diedscene from "./scenes/died.js";
import bestscores from "./scenes/best.js";
import disconnect_scene from "./scenes/disconnect.js";

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

function startGame(){
  let name = document.getElementById("input").value;
  if(!name.replace(" ", "")){
    document.querySelector("p").style.display = "block";
    return;
  }
  localStorage.setItem("name", name);
  
  const game = new Phaser.Game(config);
  
  game.scene.add("gamescene", gamescene);
  game.scene.add("joinscene", joinscene);
  game.scene.add("howtoplay", howtoplay);
  game.scene.add("diedscene", diedscene);
  game.scene.add("bestscores", bestscores);
  game.scene.add("disconnect_scene", disconnect_scene);
  game.scene.start("gamescene");
  document.querySelector("canvas").style.cursor = "crosshair";
  
  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
  
  document.querySelector("main").style.display = "none";
}

if(localStorage.getItem("name")){
  document.getElementById("input").value = localStorage.getItem("name");
}

document.getElementById("playbtn").addEventListener("click", startGame);