import { size, playersize, coinsize, ratio, random, checkMovement, treesize, gamestate_rate, radius } from "../functions.js";
import Text from "../objects/text.js";
import Button from "../objects/button.js";
import Bar from "../objects/bar.js";
import Chatbox from "./chat.js";
import Minimap from "./minimap.js";
import trees from "../trees.json";
import rocks from "../rocks.json";
import skins from "../skins.json";

class Game extends Phaser.Scene {
  constructor(){
    super();
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.leftDown = false;
    this.rightDown = false;
    this.upDown = false;
    this.downDown = false;
  }
  
  preload() {
    for(let i of Object.keys(skins)){
      this.load.image(`skin_${skins[i].url}`, `/img/skins/${skins[i].url}.png`);
    }
    // this.load.image("skin_player", "/img/skins/player.png");
    this.load.image("skin_botplayer", "/img/skins/bot.png");
    this.load.image("coin", "/img/gameObjects/coin.png");
    this.load.image("grass", "/img/gameObjects/tile.png");
    this.load.image("bullet", "/img/gameObjects/bullet.png");
    this.load.image("gun", "/img/gameObjects/gun.png");
    this.load.image("obstacle", "/img/gameObjects/obstacle.png");
    this.load.image("obstacle2", "/img/gameObjects/obstacle2.png");
    this.load.image("tree", "/img/gameObjects/tree.png");
    this.load.image("rock", "/img/gameObjects/rock.png");
    this.load.image("bullet_icon", "/img/gameObjects/bullet_icon.png");
    this.load.image("shield_icon", "/img/gameObjects/shield_icon.png");
    this.load.image("grenade_icon", "/img/gameObjects/grenade_icon.png");
    this.load.image("arrow", "/img/gameObjects/arrow.png");
    this.load.image("grenade", "/img/gameObjects/grenade.png");
    this.load.image("explosion", "/img/gameObjects/explosion.png");
    this.cam = this.cameras.add(this.cameras.main.x, this.cameras.main.y, window.innerWidth, window.innerHeight);
    this.loadingtext = new Text(this, window.innerWidth / 2, window.innerHeight / 2, "Loading...", { fontSize: 100, fontFamily: "Arial" }).setOrigin(0.5);
    this.cameras.main.ignore(this.loadingtext);
    this.load.plugin("rexbbcodetextplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js", true);
  }

  create() {
    this.loaded = false;
    this.full_screen = false;
    let url = window.room ? "https://blaster2d.ruiwenge2.repl.co": window.chosenServer;
    this.socket = io(url);
    this.name = name || localStorage.getItem("name");
    this.coins = {};
    this.enemies = {};
    this.bullets = {};
    this.grenades = {};
    this.verified = false;
    this.minimap = new Minimap(this);
    this.chatbox = new Chatbox(this);
    this.gunType = document.getElementById("gun").value;
    this.spawned = false;
    this.pointerX = window.mouseData.x;
    this.pointerY = window.mouseData.y;
    this.shooting = false;
    this.shotBefore = false;
    this.focus = true;
    this.cameras.main.setZoom((window.innerWidth + window.innerHeight) / 2200);
    let game = this;
    grecaptcha.ready(function() {
      grecaptcha.execute("6LerbDQhAAAAAFyt22lecnaCm6UmDmRsytTDtD1k", {action: "submit"}).then(function(token) {
        game.socket.emit("join", game.name, game.gunType, token, loggedIn, window.room, window.mouseData.angle);
        game.verified = true;
        document.getElementsByClassName("grecaptcha-badge")[0].style.display = "none";
      });
    });
    
    window.addEventListener("resize", () => {
      if(!this.loaded) return;
      this.cameras.main.setZoom((window.innerWidth + window.innerHeight) / 2200);
      if(this.died){
        this.deathtext.x = window.innerWidth / 2
        this.deathtext.y = window.innerHeight / 2 - 200;
        this.infotext.x = window.innerWidth / 2;
        this.infotext.y = window.innerHeight / 2 - 100;
        this.deathRect.x = window.innerWidth / 2;
        this.deathRect.y = window.innerHeight / 2;
        this.playAgain.setPosition(window.innerWidth / 2, window.innerHeight / 2 + 100);

        if(this.room != "main"){
          this.switchWeapon.setPosition(window.innerWidth - 150, 50);
          this.leaveBtn.setPosition(window.innerWidth - 150, 110);
        }
      } else {
        this.socket.emit("resize", { width: window.innerWidth, height: window.innerHeight }, this.room);
        this.scale.resize(window.innerWidth, window.innerHeight);
        this.fpstext.x = window.innerWidth - 150;
        this.tps.x = window.innerWidth - 150;
        this.ping.x = window.innerWidth - 150;
        this.shield.x = window.innerWidth / 2;
        this.shield_icon.x = window.innerWidth / 2 - 50;
        this.reloading.x = window.innerWidth - 300;
        this.reloading.y = window.innerHeight - 120;
        this.shots.x = window.innerWidth - 310;
        this.shots.y = window.innerHeight - 80;
        this.bullet_icon.x = window.innerWidth - 295;
        this.bullet_icon.y = window.innerHeight - 95;
        this.grenadesText.x = window.innerWidth - 320;
        this.grenadesText.y = window.innerHeight - 40;
        this.grenade_icon.x = window.innerWidth - 295;
        this.grenade_icon.y = window.innerHeight - 55;
        this.minimap.resize();
      }

      if(this.killText){
        this.killText.x = window.innerWidth / 2;
        this.killText.y = window.innerHeight - 90;
      }

      if(this.arrowLeft){
        this.arrowLeft.setPosition(window.innerWidth - 150, window.innerHeight - 400);
        this.arrowRight.setPosition(window.innerWidth - 50, window.innerHeight - 400);
        this.arrowUp.setPosition(window.innerWidth - 100, window.innerHeight - 450);
        this.arrowDown.setPosition(window.innerWidth - 100, window.innerHeight - 350);
      }
    });
    
    const handle = function(){
      if(game.loaded) return;
      window.error = {
        message: "Failed to join server\n\nTry again or choose a different server",
        reload: false
      };
      game.scene.start("disconnect_scene");
      game.chatbox.destroy();
      window.rejoin = false;
    }

    this.socket.on("connect_error", handle);
    
    this.socket.on("connect_failed", handle);

    this.socket.on("kick", (message, reload) => {
      window.error = {
        message,
        reload
      };
      game.scene.start("disconnect_scene");
      game.chatbox.destroy();
      window.rejoin = false;
    });

    this.socket.on("roomdata", room => {
      this.focus = false;
      promptmodal("", "Copy the link and share with your friends to play!", "Copy", true, `https://${location.host}/?code=${room}`, true).then((e) => {
        navigator.clipboard.writeText(e);
        this.focus = true;
      });
    });
    
    this.socket.on("gamedata", (data, room) => { // when game data arrives
      try {
        this.loaded = true;
        this.room = room;
        this.loadingtext.destroy();
        this.name = data.players[this.socket.id].name;
        if(url != "https://blaster2d.ruiwenge2.repl.co"){
          io("https://blaster2d.ruiwenge2.repl.co").emit("join server 2", this.name);
        }

        
        this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, `skin_${data.players[this.socket.id].skin}`).setScale(playersize / 100, playersize / 100).setDepth(2).setAlpha(0.5);
        this.bar = new Bar(this, this.player.x, this.player.y - radius - 20, 100, 2);
        this.nametext = new Text(this, this.player.x, this.player.y + radius + 20, this.name, { fontSize: 20, fontFamily: "sans-serif", color: loggedIn ? "blue": "white" }, 2, true);
        this.playerstext = this.add.rexBBCodeText(20, 20, "", { fontSize: 22, fontFamily: "Arial" }).setOrigin(0).setDepth(100);
        this.playerstext.scrollFactorX = 0;
        this.playerstext.scrollFactorY = 0;
        this.scorestext = new Text(this, 250, 20, "", { fontSize: 22, fontFamily: "Arial" }).setOrigin(0);
        
        this.fpstext = new Text(this, window.innerWidth - 150, 50, "FPS: 60", { fontSize: 25, fontFamily: "copperplate" });
        this.tps = new Text(this, window.innerWidth - 150, 80, "TPS: 30", { fontSize: 25, fontFamily: "copperplate" });
        this.ping = new Text(this, window.innerWidth - 150, 110, "Ping: 0 ms", { fontSize: 25, fontFamily: "copperplate" });
        
        this.reloading = new Text(this, window.innerWidth - 300, window.innerHeight - 120, "", { fontSize: 30, fontFamily: "Arial" }).setOrigin(1);
        this.shots = new Text(this, window.innerWidth - 310, window.innerHeight - 80, "", { fontSize: 30, fontFamily: "Arial" }).setOrigin(1);
        this.bullet_icon = this.add.image(window.innerWidth - 295, window.innerHeight - 95, "bullet_icon").setDepth(100).setScale(0.75, 0.75);
        this.bullet_icon.scrollFactorX = 0;
        this.bullet_icon.scrollFactorY = 0;

        this.grenadesText = new Text(this, window.innerWidth - 320, window.innerHeight - 40, "", { fontSize: 30, fontFamily: "Arial" }).setOrigin(1);
        this.grenade_icon = this.add.image(window.innerWidth - 295, window.innerHeight - 55, "grenade_icon").setDepth(100).setScale(0.75, 0.75);
        this.grenade_icon.scrollFactorX = 0;
        this.grenade_icon.scrollFactorY = 0;
        
        this.shield = new Text(this, window.innerWidth / 2, 50, "", { fontSize: 40, fontFamily: "Arial" });
        this.shield_icon = this.add.image(window.innerWidth / 2 - 50, 50, "shield_icon").setDepth(100).setScale(0.5, 0.5);
        this.shield_icon.scrollFactorX = 0;
        this.shield_icon.scrollFactorY = 0;
        this.shield_icon.visible = false;

        this.cameras.main.ignore([this.playerstext, this.scorestext, this.fpstext, this.tps, this.ping, this.reloading, this.shots, this.bullet_icon, this.grenadesText, this.grenade_icon, this.shield, this.shield_icon]);
        
        this.cam.ignore([this.player, this.nametext]);
  
        this.playerInfo = {
          x: this.player.x,
          y: this.player.y
        };
        
        this.cameras.main.startFollow(this.player);
        this.minimap.show(this);
        this.minimap.addPlayer(this, this.socket.id, data.players[this.socket.id].x, data.players[this.socket.id].y)
        
        this.data = {
          x: data.players[this.socket.id].x,
          y: data.players[this.socket.id].y,
          angle: 0,
          angle2: 0
        };
    
        for(let i of Object.values(data.coins)){
          let coin = {
            coin: this.add.image(i.x, i.y, "coin").setScale(0.75, 0.75).setDepth(0.99),
            id: i.id
          }
          this.cam.ignore(coin.coin);
          this.coins[i.id] = coin;
        }
        for(let i of trees.trees){
          let tree = this.add.image(i.x, i.y, "tree").setScale(i.size / treesize).setDepth(10).setAlpha(0.7);
          tree.id = i.id;
          tree.angle = i.angle;
          this.cam.ignore(tree);
        }

        for(let i of rocks.rocks){
          let rock = this.add.image(i.x, i.y, "rock").setScale(i.size / 100).setDepth(0.5);
          rock.id = i.id;
          rock.angle = i.angle;
          this.cam.ignore(rock);
        }
        
        for(let oplayer of Object.keys(data.players)){
          if(oplayer != this.socket.id){
            this.addPlayer(data.players[oplayer]);
            this.minimap.addPlayer(this, data.players[oplayer].id, data.players[oplayer].x, data.players[oplayer].y);
          }
        }
  
        Object.values(data.bullets).forEach(bullet => {
          let bullet_image = this.add.image(bullet.x, bullet.y, "bullet").setScale(0.5, 2).setDepth(0.999);
          bullet_image.angle = bullet.angle;
          bullet_image.shooter = bullet.shooter;
          bullet_image.id = bullet.id;
          this.bullets[bullet.id] = bullet_image;
          this.cam.ignore(bullet_image);
        });

        Object.values(data.grenades).forEach(grenade => {
          let grenade_image = this.add.image(grenade.x, grenade.y, "grenade").setDepth(1).setScale(0.75, 0.75);
          grenade_image.thrower = grenade.throwerId;
          grenade_image.id = grenade.id;
          this.grenades[grenade.id] = grenade_image;
          this.cam.ignore(grenade_image);
        });
        
        this.main();
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("new player", data => { // when new player joins
      if(!this.verified) return;
      this.addPlayer(data);
      this.minimap.addPlayer(this, data.id, data.x, data.y);
    });

    this.socket.on("collected coin", (id, playerId) => {
      try {
        if(!this.verified) return;
        let player;
        if(playerId == this.socket.id) player = this.player;
        else player = this.enemies[playerId].player;
        let coin = this.coins[id];
        this.tweens.add({
          targets: coin.coin,
          x: player.x,
          y: player.y,
          duration: 75,
          onComplete: function(){
            coin.coin.destroy();
          }
        });
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("new coin", data => {
      try {
        let coin = {
          coin: this.add.image(data.x, data.y, "coin").setScale(0.75, 0.75).setDepth(0.99),
          id: data.id
        }
        this.coins[data.id] = coin;
        this.cam.ignore(coin.coin);
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("tps", tps => {
      try {
        // this.tps.setText(`Tick speed: ${Math.round(tps / 30 * 100)}%`);
        this.tps.setText("TPS: " + tps);
        let time = Date.now();
        this.socket.emit("get_ping", () => {
          this.ping.setText(`Ping: ${Date.now() - time} ms`);
        });
      } catch(e){
        console.log(e);
      }
    });
  
    this.socket.on("left", id => {
      try {
        this.enemies[id].player.destroy();
        this.enemies[id].gun.destroy();
        this.enemies[id].healthbar.destroy();
        this.enemies[id].nametext.destroy();
        delete this.enemies[id];
        this.minimap.removePlayer(id);
      } catch(e){
        console.log(e);
      }
    });
  
    this.socket.on("leave", () => {
      this.chatbox.destroy();
      window.error = {
        message: "You got disconnected",
        reload: false
      };
      this.scene.start("disconnect_scene");
      window.rejoin = false;
    });
  }

  main(){
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false);
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false);
    var l = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L, false);
    var spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false);
    var enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
    var r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R, false);
    var f = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F, false);
    var g = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G, false);

    var game = this;
    l.on("down", function(){
      if(game.chatbox.focus) return;
      confirmmodal("", "Are you sure you want to exit the game?", "Exit").then(() => {
        game.sys.game.destroy(true, false);
        game.chatbox.destroy();
        document.querySelector("main").style.display = "block";
        game.socket.emit("leaveGame");
        document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
        getServerData();
        window.rejoin = false;
        document.body.style.cursor = "auto";
      });
    });

    enterKey.on("down", function(){
      if(game.chatbox.sent){
        game.chatbox.sent = false;
        return game.chatbox.input.blur();
      }
      if(!game.chatbox.focus) game.chatbox.input.focus();
    });

    r.on("down", function(){
      if(game.chatbox.focus) return;
      game.socket.emit("reload", game.room);
    });

    f.on("down", function(){
      if(game.chatbox.focus) return;
      if(this.full_screen){
        if(document.exitFullscreen) {
          document.exitFullscreen();
        } else if(document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if(document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.full_screen = false;
      }
      else {
        let body = document.body;
        if(body.requestFullscreen){
          body.requestFullscreen();
        } else if(body.webkitRequestFullscreen){
          body.webkitRequestFullscreen();
        } else if(body.msRequestFullscreen) {
          body.msRequestFullscreen();
        }
        this.full_screen = true;
      }
    });

    g.on("down", function(){
      if(game.chatbox.focus) return;
      let angle = Math.atan2(game.pointerY - (window.innerHeight / 2), game.pointerX - (window.innerWidth / 2));
      game.socket.emit("throw", angle, game.room);
    });
    

    // for(let i = size / (ratio * 2); i < size; i += size / ratio){
    //   for(let j = size / (ratio * 2); j < size; j += size / ratio){
    //     let grass = this.physics.add.image(i, j, "grass").setDepth(0);
    //   }
    // }

    this.background = this.add.tileSprite(0, 0, size, size, "grass").setOrigin(0).setDepth(0);
    this.cam.ignore(this.background);
    
    // this.obstacle1 = this.physics.add.staticSprite(size / 2, size / 2 - 750, "obstacle").setDepth(0);
    // this.obstacle2 = this.physics.add.staticSprite(size / 2, size / 2 + 750, "obstacle").setDepth(0);
    // this.obstacle3 = this.physics.add.staticSprite(size / 2 - 750, size / 2, "obstacle2").setDepth(0);
    // this.obstacle4 = this.physics.add.staticSprite(size / 2 + 750, size / 2, "obstacle2").setDepth(0);

    const isMobile = () => {
      try {
        document.createEvent("TouchEvent");
        return true; 
      }
      catch(e){
        return false;
      }
    }
    if(isMobile()){

      this.arrowLeft = this.add.image(window.innerWidth - 150, window.innerHeight - 400, "arrow").setAngle(270).setInteractive().on("pointerdown", () => {
        this.leftDown = true;
      }).on("pointerup", () => {
        this.leftDown = false;
      }).setScrollFactor(0, 0).setDepth(100).setScale(0.7);
  
      this.arrowRight = this.add.image(window.innerWidth - 50, window.innerHeight - 400, "arrow").setAngle(90).setInteractive().on("pointerdown", () => {
        this.rightDown = true;
      }).on("pointerup", () => {
        this.rightDown = false;
      }).setScrollFactor(0, 0).setDepth(100).setScale(0.7);
  
      this.arrowUp = this.add.image(window.innerWidth - 100, window.innerHeight - 450, "arrow").setAngle(0).setInteractive().on("pointerdown", () => {
        this.upDown = true;
      }).on("pointerup", () => {
        this.upDown = false;
      }).setScrollFactor(0, 0).setDepth(100).setScale(0.7);
  
      this.arrowDown = this.add.image(window.innerWidth - 100, window.innerHeight - 350, "arrow").setAngle(180).setInteractive().on("pointerdown", () => {
        this.downDown = true;
      }).on("pointerup", () => {
        this.downDown = false;
      }).setScrollFactor(0, 0).setDepth(100).setScale(0.7);
       this.cameras.main.ignore([this.arrowLeft, this.arrowRight, this.arrowUp, this.arrowDown]);
    }
  
    this.gun = this.physics.add.sprite(this.player.x, this.player.y, "gun").setDepth(2);

    this.gun.angle2 = window.angle || 0;
    this.gun.angle = ((this.gun.angle2 * 180 / Math.PI) + 360) % 360;
    this.player.angle = this.gun.angle;

    this.cam.ignore(this.gun);

    this.health = 100;

    this.score = 0;

    this.addWeaponActions();

    this.socket.on("gamestate", data => {
      try {
        if(!this.verified) return;
        if(this.socket.disconnected){
          this.chatbox.destroy();
          window.error = {
            message: "You got disconnected",
            reload: false
          };
          this.scene.start("disconnect_scene");
          window.rejoin = false;
          return;
        }
        let game = this;
        
        if(!this.died){
          let self = data.players[this.socket.id];
          this.playerInfo.x = self.x;
          this.playerInfo.y = self.y;
          this.shots.setText(`${self.shots}/${self.shotsLeft}`);
          this.grenadesText.setText(self.grenades);
          if(self.reloading){
            this.reloading.setText("Reloading...");
            this.gun.visible = false;
          } else {
            this.reloading.setText("");
            this.gun.visible = true;
          }

          if(!self.shots && !self.shotsLeft){
            this.shots.setTint(0x0ff0000);
          } else {
            this.shots.setTint(0x0ffffff);
          }

          if(!self.grenades){
            this.grenadesText.setTint(0x0ff0000);
          } else {
            this.grenadesText.setTint(0x0ffffff);
          }

          if(self.shield){
            this.shield.setText(self.shield.timeleft);
            this.player.setTint(0x0ff0000);
            this.shield_icon.visible = true;
          } else {
            this.shield.setText("");
            this.player.setTint(0xffffff);
            this.shield_icon.visible = false;
          }
  
          if(self.spawned && !this.spawned){
            this.player.setAlpha(1);
          }
          this.tweens.add({
            targets: this.player,
            x: this.playerInfo.x,
            y: this.playerInfo.y,
            duration: 100
          });

          this.tweens.addCounter({
            from: this.health,
            to: self.health,
            duration: 1000 / 30,
            onUpdate: function(tween){
              try {
                game.health = tween.getValue();
              } catch(e){
                console.log(e);
              }
            }
          });
        }
  
        Object.values(data.players).forEach(enemy => {
          if(enemy.id == this.socket.id) return;
          if(enemy.spawned && !this.enemies[enemy.id].spawned){
            this.enemies[enemy.id].player.setAlpha(1);
            this.enemies[enemy.id].spawned = true;
          }
          if(enemy.reloading){
            this.enemies[enemy.id].gun.visible = false;
          } else {
            this.enemies[enemy.id].gun.visible = true;
          }
          if(enemy.shield){
            this.enemies[enemy.id].player.setTint(0x0ff0000);
          } else {
            this.enemies[enemy.id].player.setTint(0xffffff);
          }
          
          this.tweens.add({
            targets: [this.enemies[enemy.id].player],
            x: enemy.x,
            y: enemy.y,
            duration: 100,
            onUpdate: function(){
              let player = game.enemies[enemy.id];
              if(!player) return;
              player.gun.x = player.player.x + Math.cos(enemy.angle2) * (radius + 29);
              player.gun.y = player.player.y + Math.sin(enemy.angle2) * (radius + 29);
              player.gun.angle = enemy.angle;
              player.player.angle = enemy.angle;
            } 
          });

          this.tweens.addCounter({
            from: this.enemies[enemy.id].health,
            to: enemy.health,
            duration: 1000 / 30,
            onUpdate: function(tween){
              try {
                game.enemies[enemy.id].health = tween.getValue();
              } catch(e){
                console.log(e);
              }
            }
          })
        });
  
        Object.values(data.bullets).forEach(bullet => {
          this.tweens.add({
            targets: [this.bullets[bullet.id]],
            x: data.bullets[bullet.id].x,
            y: data.bullets[bullet.id].y,
            duration: 1000 / 30
          });
        });

        Object.values(data.grenades).forEach(grenade => {
          this.tweens.add({
            targets: [this.grenades[grenade.id]],
            x: data.grenades[grenade.id].x,
            y: data.grenades[grenade.id].y,
            duration: 1000 / 30
          });
        });
  
        /* var playerIds = Object.keys(data.players);
        Object.keys(this.enemies).forEach(id => {
          if(!playerIds.includes(id)){
            this.enemies[id].gun.destroy();
            this.enemies[id].healthbar.destroy();
            this.enemies[id].nametext.destroy();
            this.enemies[id].player.destroy();
            this.enemies[id].nametext.destroy();
            delete game.enemies[id];
            this.minimap.removePlayer(id);
          }
        }); */
  
        if(this.died) return;
        this.minimap.update(data.players);
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("new bullet", (id, data) => {
      try {
        if(!this.verified) return;
        let bullet_image = this.add.image(data.x, data.y, "bullet").setScale(0.5, 2).setDepth(0.999);
        bullet_image.angle = data.angle;
        bullet_image.shooter = data.shooter;
        bullet_image.id = id;
        this.bullets[id] = bullet_image;
        this.cam.ignore(bullet_image);
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("removed bullet", id => {
      try {
        if(!this.verified) return;
        this.bullets[id].destroy();
        delete this.bullets[id];
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("new grenade", (id, data) => {
      try {
        if(!this.verified) return;
        let grenade_image = this.add.image(data.x, data.y, "grenade").setDepth(1).setScale(0.75, 0.75);
        grenade_image.thrower = data.throwerId;
        grenade_image.id = data.id;
        this.grenades[data.id] = grenade_image;
        this.cam.ignore(grenade_image);
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("explosion", id => {
      try {
        let game = this;
        if(!this.verified) return;
        var explosion = this.add.image(this.grenades[id].x, this.grenades[id].y, "explosion").setAlpha(0).setDepth(15).setScale(0, 0);
        this.cam.ignore(explosion);
        this.tweens.add({
          targets: explosion,
          duration: 300,
          alpha: 0.7,
          scaleX: 1.5,
          scaleY: 1.5,
          onComplete: function(){
            setTimeout(() => {
              game.tweens.add({
                targets: explosion,
                duration: 750,
                alpha: 0,
                onComplete: function(){
                  explosion.destroy();
                }
              });
            }, 2000);
          }
        });
        this.grenades[id].destroy();
        delete this.grenades[id];
      } catch(e){
        console.log(e);
      }
    });

    this.socket.on("player died", (id, shooter, shooterName) => {   
      try {
        if(!this.verified) return;
        let game = this;
        if(id != this.socket.id) var playerName = this.enemies[id].name;
        if(id == this.socket.id){
          this.died = true;
          this.gun.destroy();
          this.bar.destroy();
          this.nametext.destroy();
          
          this.tweens.add({
            targets: [this.player],
            duration: 1000,
            alpha: 0,
            onComplete: function(){
              game.player.destroy();
              game.nametext.destroy();
              game.playerstext.destroy();
              game.scorestext.destroy();
              game.fpstext.destroy();
              game.tps.destroy();
              game.ping.destroy();
              game.minimap.destroy();
              game.chatbox.destroy();
              game.reloading.destroy();
              game.shots.destroy();
              game.bullet_icon.destroy();
              game.grenadesText.destroy();
              game.grenade_icon.destroy();
              game.shield.destroy();
              
              game.deathtext = new Text(game, window.innerWidth / 2, window.innerHeight / 2 - 200, "You died", { fontSize: 50 }).setDepth(101).setAlpha(0);
              game.infotext = new Text(game, window.innerWidth / 2, window.innerHeight / 2 - 100, `Killed By: ${shooterName}\n\nKill Streak: ${game.score}`, { fontSize: 30 }).setDepth(101).setAlpha(0);
              game.deathRect = game.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 500, 0x039e50).setOrigin(0.5).setAlpha(0).setDepth(100);
              
              game.deathRect.scrollFactorX = 0;
              game.deathRect.scrollFactorY = 0;
              game.deathRect.setStrokeStyle(5, 0x0000000);
              game.playAgain = new Button(game, window.innerWidth / 2, window.innerHeight / 2 + 100, "Play Again", function(){
                game.sys.game.destroy(true, false);
                document.querySelector("main").style.display = "block";
                document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
                game.socket.disconnect();
                getServerData();
                document.body.style.cursor = "auto";
                if(game.room == "main"){
                  window.rejoin = false;
                } else {
                  window.rejoin = game.room;
                  document.getElementById("playbtn").click();
                }
              }, { background: 0x00374ff });
              game.playAgain.text.setDepth(102).setAlpha(0);
              game.playAgain.button.setDepth(101).setAlpha(0);
              game.cameras.main.ignore([game.deathtext, game.infotext, game.deathRect, game.playAgain.text, game.playAgain.button]);
              if(game.room != "main"){
                game.switchWeapon = new Button(game, window.innerWidth - 150, 50, "Switch Weapon", function(){
                  selectmodal("Switch Weapon", "Choose a weapon: ", {
                    "pistol": "Pistol",
                    "sniper": "Sniper",
                    "machineGun": "Machine Gun"
                  }, document.getElementById("gun").value).then(gun => {
                    document.getElementById("gun").value = gun;
                  });
                }, { fontSize: 30 });
                
                game.switchWeapon.text.setDepth(102).setAlpha(0);
                game.switchWeapon.button.setDepth(101).setAlpha(0);

                game.leaveBtn = new Button(game, window.innerWidth - 150, 110, "Leave", function(){
                  game.sys.game.destroy(true, false);
                  document.querySelector("main").style.display = "block";
                  document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
                  game.socket.disconnect();
                  getServerData();
                  document.body.style.cursor = "auto";
                  window.rejoin = false;
                }, { fontSize: 30 });
                
                game.leaveBtn.text.setDepth(102).setAlpha(0);
                game.leaveBtn.button.setDepth(101).setAlpha(0);
                game.cameras.main.ignore([game.switchWeapon.text, game.switchWeapon.button, game.leaveBtn.text, game.leaveBtn.button]);
              }
              
              if(game.enemies[shooter]){
                game.cameras.main.startFollow(game.enemies[shooter].player);
              }
              game.tweens.add({
                targets: game.deathRect,
                duration: 300,
                alpha:0.5
              });
              
              game.tweens.add({
                targets: [game.deathtext, game.infotext, game.playAgain.text, game.playAgain.button],
                duration: 300,
                alpha:1
              });
              
              if(game.room != "main"){
                game.tweens.add({
                  targets: [game.switchWeapon.text, game.switchWeapon.button, game.leaveBtn.text, game.leaveBtn.button],
                  duration: 300,
                  alpha: 1
                });
              }
            }
          });
        } else {
          this.enemies[id].gun.destroy();
          this.enemies[id].healthbar.destroy();
          this.enemies[id].nametext.destroy();
          this.tweens.add({
            targets: [this.enemies[id].player],
            duration: 1000,
            alpha: 0,
            onComplete: function(){
              if(!game.enemies[id]) return;
              game.enemies[id].player.destroy();
              delete game.enemies[id];
              game.minimap.removePlayer(id);
            }
          });
        }
        if(shooter == this.socket.id){
          this.score++;
          if(this.killText){
            this.killText.setText(`You killed ${playerName || this.name}\n\nKill Streak: ${this.score}`);
          } else {
            this.killText = new Text(this, window.innerWidth / 2, window.innerHeight - 90, `You killed ${playerName || this.name}\n\nKill Streak: ${this.score}`, { fontSize: 30 });
            this.cameras.main.ignore(this.killText);
          }
          setTimeout(() => {
            this.killText.destroy();
            this.killText = undefined;
          }, 4000);
        } else {
          this.enemies[shooter].score++;
        }
      } catch(e){
        console.log(e);
      }
    });
  }

  addPlayer(player){
    var alpha = 0.5;
    var done = false;
    if(player.spawned){
      alpha = 1;
      done = true;
    }
    
    var playerObj = {
      id: player.id,
      x: player.x,
      y: player.y,
      name: player.name,
      player: this.add.image(player.x, player.y, `skin_${player.skin}`).setScale(playersize / 100, playersize / 100).setDepth(1).setAlpha(alpha),
      nametext: new Text(this, player.x, player.y + radius + 20, player.name, { fontSize: 20, fontFamily: "sans-serif", color: player.bot ? "red": (player.account ? "blue": "white") }, 1, true),
      healthbar: new Bar(this, player.x, player.y - radius - 20, 100, 1),
      gun: this.add.image(player.x + Math.cos(player.angle2) * (radius + 29), player.y + Math.sin(player.angle2) * (radius + 29), "gun").setDepth(1.1),
      angle: null,
      health: 100,
      score: player.score,
      spawned: done,
      bot: player.bot,
      account: player.account
    }
    this.enemies[player.id] = playerObj;

    this.cam.ignore([playerObj.player, playerObj.nametext, playerObj.gun]);
  }

  addWeaponActions(){
    const shoot = (e) => {
      if(this.died) return;
      let x = e.clientX || e.touches[0].clientX;
      let y = e.clientY || e.touches[0].clientY;
      this.shooting = true;
      var angle = Math.atan2(y - (window.innerHeight / 2), x - (window.innerWidth / 2));
      this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
      this.gun.angle2 = angle;
      this.pointerX = x;
      this.pointerY = y;
    };
    const shootEnd = () => {
      if(this.died) return;
      this.shooting = false;
      this.shotBefore = false;
      if(this.arrowLeft){
        this.leftDown = false;
        this.rightDown = false;
        this.upDown = false;
        this.downDown = false;
      }
    };

    const pointerMove = (e) => {
      let x = e.clientX || e.touches[0].clientX;
      let y = e.clientY || e.touches[0].clientY;
      if(this.died || this.socket.disconnected) return;
      var angle = Math.atan2(y - (window.innerHeight / 2), x - (window.innerWidth / 2));
      this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
      this.gun.angle2 = angle;
      this.pointerX = x;
      this.pointerY = y;
    }
    
    window.addEventListener("mousedown", shoot);
    window.addEventListener("touchstart", shoot);
    window.addEventListener("mouseup", shootEnd);
    window.addEventListener("touchend", shootEnd);
    window.addEventListener("touchcancel", shootEnd);
    window.addEventListener("mousemove", pointerMove);
    window.addEventListener("touchmove", pointerMove);
  }

  update() {
    if(!this.loaded) return;
    if(!this.verified) return;
    if(this.socket.disconnected){
      this.chatbox.destroy();
      window.error = {
        message: "You got disconnected",
        reload: false
      };
      this.scene.start("disconnect_scene");
      window.rejoin = false;
      return;
    }
    
    Object.values(this.enemies).forEach(enemy => {
      enemy.healthbar.setData(enemy.player.x, enemy.player.y - radius - 20, enemy.health);
      enemy.nametext.setPosition(enemy.player.x, enemy.player.y + radius + 20);
    });

    if(this.died) return;

    this.bar.setData(this.player.x, this.player.y - radius - 20, this.health);
    this.nametext.setPosition(this.player.x, this.player.y + radius + 20);
    
    Array.prototype.insert = function(index, item) {
      this.splice(index, 0, item);
    };

    let playerslist = [...Object.values(this.enemies)];
    let colors = {};

    playerslist.insert(0, {
      score: this.score,
      name: this.name,
      bot: false,
      account: loggedIn
    });
    
    let sorted_players = playerslist.sort(function(a, b){return b.score - a.score});
    let text = "";
    let text2 = "";
    for(let p of sorted_players){
      text += `[color=${p.bot ? "red": (p.account ? "blue": "white")}]${p.name}[/color]\n`; // #2b2bff
      text2 += p.score + "\n";
    }
    this.playerstext.setText(text);
    this.scorestext.setText(text2);

    for(let num of Object.keys(colors)){
      this.playerstext.addColor(colors[num], num);
    }
    
    this.fpstext.setText("FPS: " + Math.round(this.sys.game.loop.actualFps));

    if(this.shooting && !this.chatbox.focus && !this.died && (!this.shotBefore || this.gunType == "machineGun") && this.focus && !this.leftDown && !this.rightDown && !this.upDown && !this.downDown) {
      var angle = Math.atan2(this.pointerY - (window.innerHeight / 2), this.pointerX - (window.innerWidth / 2));
      this.socket.emit("shoot", angle, this.room);
      this.shotBefore = true;
    }

    let cursors = this.input.keyboard.createCursorKeys();
    if(!this.chatbox.focus){
      if(cursors.left.isDown || this.a.isDown || this.leftDown){
        if(!this.left){
          this.socket.emit("movement", "left", this.room);
          this.left = true;
          this.right = false;
        }
      } else {
        if(this.left){
          this.socket.emit("movement_end", "left", this.room);
          this.left = false;
        }
      }
      
      if(cursors.right.isDown || this.d.isDown || this.rightDown){
        if(!this.right){
          this.socket.emit("movement", "right", this.room);
          this.right = true;
          this.left = false;
        }
      } else {
        if(this.right){
          this.socket.emit("movement_end", "right", this.room);
          this.right = false;
        }
      }
      
      if(cursors.up.isDown || this.w.isDown || this.upDown){
        if(!this.up){
          this.socket.emit("movement", "up", this.room);
          this.up = true;
          this.down = false;
        }
      } else {
        if(this.up){
          this.socket.emit("movement_end", "up", this.room);
          this.up = false;
        }
      }
      
      if(cursors.down.isDown || this.s.isDown || this.downDown){
        if(!this.down){
          this.socket.emit("movement", "down", this.room);
          this.down = true;
          this.up = false;
        }
      } else {
        if(this.down){
          this.socket.emit("movement_end", "down", this.room);
          this.down = false;
        }
      }
    }
    
    this.gun.x = this.player.x + Math.cos(this.gun.angle2) * (radius + 29);
    this.gun.y = this.player.y + Math.sin(this.gun.angle2) * (radius + 29);

    this.player.angle = this.gun.angle;

    if(this.player.angle != this.data.angle){
      this.data.angle = this.gun.angle;
      this.data.angle2 = this.gun.angle2;
      this.socket.emit("player angle", this.data, this.room);
    }
  }
}


export default Game;