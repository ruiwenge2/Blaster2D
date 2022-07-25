import { size, playersize, coinsize, ratio, random, checkMovement, treesize, gamestate_rate, radius } from "../functions.js";
import Text from "../objects/text.js";
import Button from "../objects/button.js";
import Bar from "../objects/bar.js";
import Chatbox from "./chat.js";
import Minimap from "./minimap.js";
import trees from "../trees.json";
import skins from "../skins.json";

class Game extends Phaser.Scene {
  constructor(){
    super();
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
  }
  
  preload() {
    for(let i of Object.keys(skins)){
      this.load.image(`skin_${skins[i].id}`, `/img/skins/${skins[i].url}.png`);
    }
    this.load.image("player", "/img/skins/player.png");
    this.load.image("coin", "/img/gameObjects/coin.png");
    this.load.image("grass", "/img/gameObjects/tile.png");
    this.load.image("bullet", "/img/gameObjects/bullet.png");
    this.load.image("pistol", "/img/guns/pistol.png");
    this.load.image("obstacle", "/img/gameObjects/obstacle.png");
    this.load.image("obstacle2", "/img/gameObjects/obstacle2.png");
    this.load.image("tree", "/img/gameObjects/tree.png");
    this.load.image("bullet_icon", "/img/gameObjects/bullet_icon.png");
    this.loadingtext = new Text(this, window.innerWidth / 2, window.innerHeight / 2, "Loading...", { fontSize: 100, fontFamily: "Arial" }).setOrigin(0.5);
    this.load.plugin("rexbbcodetextplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js", true);
  }

  create() {
    this.loaded = false;
    let url = window.room ? "https://blaster2d.ruiwenge2.repl.co": window.chosenServer;
    this.socket = io(url);
    this.name = name || localStorage.getItem("name");
    this.coins = {};
    this.trees = this.physics.add.group();
    this.bulletsGroup = this.physics.add.group();
    this.enemies = {};
    this.bullets = {};
    this.verified = false;
    this.minimap = new Minimap(this);
    this.chatbox = new Chatbox(this);
    this.spawned = false;
    // this.cameras.main.setZoom((window.innerWidth * window.innerHeight) / (1300 * 730));
    let game = this;
    grecaptcha.ready(function() {
      grecaptcha.execute("6Lcm-s0gAAAAAEeQqYid3ppPGWgZuGKxXHKLyO77", {action: "submit"}).then(function(token) {
        game.socket.emit("join", game.name, token, loggedIn, window.room);
        game.verified = true;
        document.getElementsByClassName("grecaptcha-badge")[0].style.display = "none";
        if(url != "https://blaster2d.ruiwenge2.repl.co"){
          io("https://blaster2d.ruiwenge2.repl.co").emit("join server 2", game.name);
        }
      });
    });
    
    window.addEventListener("resize", () => {
      this.scale.resize(window.innerWidth, window.innerHeight);
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
      promptmodal("", "Copy the link and share with your friends to play!", "Copy", true, `https://${location.host}/?code=${room}`, true).then((e) => {
        navigator.clipboard.writeText(e);
      });
    });
    
    this.socket.on("gamedata", (data, room) => { // when game data arrives
      try {
        this.loaded = true;
        this.room = room;
        this.loadingtext.destroy();
        this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, "player").setScale(playersize / 100, playersize / 100).setDepth(2).setAlpha(0.5);
        this.bar = new Bar(this, this.player.x, this.player.y - radius - 20, 100, 2);
        this.nametext = new Text(this, this.player.x, this.player.y + radius + 20, this.name, { fontSize: 20, fontFamily: "sans-serif", color: loggedIn ? "blue": "white" }, 2, true);
        this.playerstext = this.add.rexBBCodeText(20, 20, "", { fontSize: 22, fontFamily: "Arial" }).setOrigin(0).setDepth(100);
        this.playerstext.scrollFactorX = 0;
        this.playerstext.scrollFactorY = 0;
        this.scorestext = new Text(this, 200, 20, "", { fontSize: 22, fontFamily: "Arial" }).setOrigin(0);
        
        this.fpstext = new Text(this, window.innerWidth - 150, 50, "FPS: 60", { fontSize: 25, fontFamily: "copperplate" });
        this.tps = new Text(this, window.innerWidth - 150, 80, "TPS: 30", { fontSize: 25, fontFamily: "copperplate" });
        this.ping = new Text(this, window.innerWidth - 150, 110, "Ping: 0 ms", { fontSize: 25, fontFamily: "copperplate" });
        
        this.reloading = new Text(this, window.innerWidth - 300, window.innerHeight - 120, "", { fontSize: 40, fontFamily: "Arial" }).setOrigin(1);
        this.shots = new Text(this, window.innerWidth - 310, window.innerHeight - 70, "", { fontSize: 40, fontFamily: "Arial" }).setOrigin(1);
        this.bullet_icon = this.add.image(window.innerWidth - 290, window.innerHeight - 90, "bullet_icon").setDepth(100);
        this.bullet_icon.scrollFactorX = 0;
        this.bullet_icon.scrollFactorY = 0;
        
        this.shield = new Text(this, window.innerWidth / 2, 30, "", { fontSize: 40, fontFamily: "Arial" });
  
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
          angle2:0
        };
    
        for(let i of Object.values(data.coins)){
          let coin = {
            coin: this.add.image(i.x, i.y, "coin").setScale(0.75, 0.75).setDepth(0.99),
            id: i.id
          }
          this.coins[i.id] = coin;
        }
        for(let i of trees.trees){
          let tree = this.trees.create(i.x, i.y, "tree").setScale(i.size / treesize).setDepth(10).setAlpha(0.7);
          tree.id = i.id;
          tree.angle = i.angle;
        }
        
        for(let oplayer of Object.keys(data.players)){
          if(oplayer != this.socket.id){
            this.addPlayer(data.players[oplayer]);
            this.minimap.addPlayer(this, data.players[oplayer].id, data.players[oplayer].x, data.players[oplayer].y);
          }
        }
  
        Object.values(data.bullets).forEach(bullet => {
          let bullet_image = this.bulletsGroup.create(bullet.x, bullet.y, "bullet").setScale(0.5, 2).setDepth(0.999);
          bullet_image.angle = bullet.angle;
          bullet_image.shooter = bullet.shooter;
          bullet_image.id = bullet.id;
          this.bullets[bullet.id] = bullet_image;
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
          coin: this.add.image(data.x, data.y, "coin").setScale(0.75, 0.75).setDepth(1),
          id: data.id
        }
        this.coins[data.id] = coin;
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
      game.socket.emit("reload", game.room);
    });
    

    // for(let i = size / (ratio * 2); i < size; i += size / ratio){
    //   for(let j = size / (ratio * 2); j < size; j += size / ratio){
    //     let grass = this.physics.add.image(i, j, "grass").setDepth(0);
    //   }
    // }

    this.background = this.add.tileSprite(0, 0, size, size, "grass").setOrigin(0).setDepth(0);
    
    this.obstacle1 = this.physics.add.staticSprite(size / 2, size / 2 - 750, "obstacle").setDepth(0);
    this.obstacle2 = this.physics.add.staticSprite(size / 2, size / 2 + 750, "obstacle").setDepth(0);
    this.obstacle3 = this.physics.add.staticSprite(size / 2 - 750, size / 2, "obstacle2").setDepth(0);
    this.obstacle4 = this.physics.add.staticSprite(size / 2 + 750, size / 2, "obstacle2").setDepth(0);

  
    this.gun = this.physics.add.sprite(this.player.x, this.player.y, "pistol").setDepth(2);

    this.gun.angle2 = 0;

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
          this.health = self.health;
          this.shots.setText(`${self.shots}/${self.shotsLeft}`);
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

          if(self.shield){
            this.shield.setText(self.shield.timeleft);
            this.player.setTint(0x0ff0000);
          } else {
            this.shield.setText("");
            this.player.setTint(0xffffff);
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
        }
  
        Object.values(data.players).forEach(enemy => {
          if(enemy.id == this.socket.id) return;
          if(enemy.spawned && !this.enemies[enemy.id].spawned){
            this.enemies[enemy.id].player.setAlpha(1);
            this.enemies[enemy.id].spawned = true;
          }
          this.enemies[enemy.id].health = enemy.health;
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
        });
  
        Object.values(data.bullets).forEach(bullet => {
          this.tweens.add({
            targets: [this.bullets[bullet.id]],
            x: data.bullets[bullet.id].x,
            y: data.bullets[bullet.id].y,
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
        let bullet_image = this.bulletsGroup.create(data.x, data.y, "bullet").setScale(0.5, 2).setDepth(0.999);
        bullet_image.angle = data.angle;
        bullet_image.shooter = data.shooter;
        bullet_image.id = id;
        this.bullets[id] = bullet_image;
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
              
              let deathtext = new Text(game, window.innerWidth / 2, window.innerHeight / 2 - 200, "You died", { fontSize: 50 }).setDepth(101).setAlpha(0);
              let infotext = new Text(game, window.innerWidth / 2, window.innerHeight / 2 - 100, `Killed By: ${shooterName}\n\nKill Streak: ${game.score}`, { fontSize: 30 }).setDepth(101).setAlpha(0);
              let deathRect = game.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 500, 0x039e50).setOrigin(0.5).setAlpha(0).setDepth(100);
              
              deathRect.scrollFactorX = 0;
              deathRect.scrollFactorY = 0;
              deathRect.setStrokeStyle(5, 0x0000000);
              let playAgain = new Button(game, window.innerWidth / 2, window.innerHeight / 2 + 100, "Play Again", function(){
                game.sys.game.destroy(true, false);
                document.querySelector("main").style.display = "block";
                document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
                game.socket.disconnect();
                getServerData();
                if(game.room == "main"){
                  window.rejoin = false;
                } else {
                  window.rejoin = game.room;
                  document.getElementById("playbtn").click();
                }
              }, { background: 0x00374ff });
              playAgain.text.setDepth(102).setAlpha(0);
              playAgain.button.setDepth(101).setAlpha(0);
              
              if(game.enemies[shooter]){
                game.cameras.main.startFollow(game.enemies[shooter].player);
              }
              game.tweens.add({
                targets: deathRect,
                duration: 300,
                alpha:0.5
              });
              game.tweens.add({
                targets: [deathtext, infotext, playAgain.text, playAgain.button],
                duration: 300,
                alpha:1
              });
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
            this.killText.setText(`You killed ${playerName}\n\nKill Streak: ${this.score}`);
          } else {
            this.killText = new Text(this, window.innerWidth / 2, window.innerHeight - 90, `You killed ${playerName}\n\nKill Streak: ${this.score}`, { fontSize: 30 });
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
      player: this.add.image(player.x, player.y, "player").setScale(playersize / 100, playersize / 100).setDepth(1).setAlpha(alpha),
      nametext: new Text(this, player.x, player.y + radius + 20, player.name, { fontSize: 20, fontFamily: "sans-serif", color: player.bot ? "red": (player.account ? "blue": "white") }, 1, true),
      healthbar: new Bar(this, player.x, player.y - radius - 20, 100, 1),
      gun: this.add.image(player.x + Math.cos(player.angle2) * (radius + 29), player.y + Math.sin(player.angle2) * (radius + 29), "pistol").setDepth(1.1),
      angle: null,
      health: 100,
      score: player.score,
      spawned: done,
      bot: player.bot,
      account: player.account
    }
    this.enemies[player.id] = playerObj;
  }

  addWeaponActions(){
    this.input.on("pointerdown", e => {
      if(this.died) return;
      if(!this.chatbox.focus){
        var angle = Math.atan2(e.y - (window.innerHeight / 2), e.x - (window.innerWidth / 2));
        this.socket.emit("shoot", angle, this.room);
        this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
        this.gun.angle2 = angle;
      }
      document.getElementById("chat-input").blur();
    });
    
    this.input.on("pointermove", e => {
      if(this.died || this.socket.disconnected) return;
      var angle = Math.atan2(e.y - (window.innerHeight / 2), e.x - (window.innerWidth / 2));
      this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
      this.gun.angle2 = angle;
    });
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
    let cursors = this.input.keyboard.createCursorKeys();
    if(!this.chatbox.focus){
      if(cursors.left.isDown || this.a.isDown){
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
      
      if(cursors.right.isDown || this.d.isDown){
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
      
      if(cursors.up.isDown || this.w.isDown){
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
      
      if(cursors.down.isDown || this.s.isDown){
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