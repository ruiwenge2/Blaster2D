import Game from "./game";
import Load from "./game/load.js";
import Blank from "./game/blank.js";
import disconnect_scene from "./game/disconnect.js";
import { random } from "./functions.js";

window.room = false;
window.rejoin = false;
window.started = false;
window.mouseData = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  angle: 0
};

document.addEventListener("click", function(e){
  window.mouseData.x = e.clientX;
  window.mouseData.y = e.clientY;
  window.angle = Math.atan2(e.clientY - (window.innerHeight / 2), e.clientX - (window.innerWidth / 2));
});

document.addEventListener("contextmenu", function(e){
  e.preventDefault();
});

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
const game = new Phaser.Game(config);
game.scene.add("load", Load);
game.scene.add("blank", Blank);
game.scene.add("gamescene", Game);
game.scene.add("disconnect_scene", disconnect_scene);
game.scene.start("load");

window.addEventListener("resize", function() {
  config.width = window.innerWidth;
  config.height = window.innerHeight;
});

function startGame() {
  document.querySelector("canvas").style.display = "block";
  let name = document.getElementById("input").value;
  if (!name.replace(/\s/g, "")) {
    document.querySelector("p").style.display = "block";
    return;
  }
  if (!loggedIn) {
    localStorage.setItem("name", name);
  } else {
    localStorage.setItem("name", "");
  }

  if (document.getElementById("server").value == "auto") {
    localStorage.setItem("server", "auto");
  } else {
    window.chosenServer = document.getElementById("server").value;
    localStorage.setItem("server", window.chosenServer);
  }

  localStorage.setItem("gun", document.getElementById("gun").value);

  window.started = true;

  document.body.style.cursor = "url(/img/cursor.png) 15 15, auto";

  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  document.querySelector("main").style.display = "none";
  document.querySelector("p").style.display = "none";
  game.scene.start("gamescene");
    document.body.setAttribute("onbeforeunload", "return ''");
}

if (localStorage.getItem("name") && !loggedIn) {
  document.getElementById("input").value = localStorage.getItem("name");
}

if (loggedIn) {
  localStorage.setItem("name", "");
}

if (localStorage.getItem("server")) {
  document.getElementById("server").value = localStorage.getItem("server");
}
if (localStorage.getItem("gun")) {
  document.getElementById("gun").value = localStorage.getItem("gun");
}

document.getElementById("playbtn").addEventListener("click", function() {
  if (!window.rejoin) {
    window.room = false;
  } else {
    window.room = {
      mode: "join",
      code: window.rejoin
    }
  }
  startGame();
});

document.getElementById("createbtn").addEventListener("click", function() {
  window.room = {
    mode: "create"
  };
  startGame();
});

document.getElementById("joinbtn").addEventListener("click", function() {
  let a;
  if (autojoin) {
    a = promptmodal("", "Enter room code to join:", "Join", true, autojoin);
  } else {
    a = promptmodal("", "Enter room code to join:", "Join");
  }
  a.then(code => {
    if (!document.getElementById("input").value.replace(/\s/g, "")) {
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

document.getElementById("howtoplay").addEventListener("click", function() {
  alertmodal("How To Play", `<p style="font-size: 18px">
  - WASD/Arrow keys to move<br>
  <br>- Click to shoot<br>
  <br>- Press R to reload gun, and G to throw grenade<br>
  <br>- Press ENTER to chat<br>
  <br>- Press F for fullscreen, and L to leave game<br>
  <br>- Collect the gold for ammo<br>
  <br>- Kill as many players as you can<br>
  <br>Happy playing!</p>`, "OK", true).then(() => { });
});

if (autojoin) {
  document.getElementById("joinbtn").click();
}

const servers = {
  1: {
    url: "https://191bb644-256e-48ce-b188-a2dde4c165f4-00-1da43r3sj1wly.spock.replit.dev",
    num: 1,
  },
  2: {
    url: "https://blaster2d.onrender.com",
    num: 2
  }
};

async function showServerData(num) {
  try {
    let url = servers[num].url;
    let res = await fetch(url + "/stats");
    let data = await res.json();
    document.getElementById("server" + num).innerHTML = `Server ${num} (${data.tps} TPS)`;
    console.log(url, ": ", data.tps);
    servers[num].tps = data.tps;
    return data.tps;
  } catch (e) {
    console.log(e);
    document.getElementById("server" + num).innerHTML = `Server ${num} (offline)`;
    servers[num].tps = 0;
  }
}

window.getServerData = () => {
  showServerData(1).then(() => {
    showServerData(2).then(() => {
      let keys = Object.values(servers);
      keys = keys.sort(function(a, b) { return b.tps - a.tps });
      if (window.started) return;
      document.getElementById("autoserver").innerHTML = `Auto (Server ${keys[0].num})`;
      if (document.getElementById("server").value == "auto") {
        window.chosenServer = keys[0].url;
      }
    });
  });
};

getServerData();

