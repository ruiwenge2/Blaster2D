/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _functions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _objects_text_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _objects_button_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _objects_bar_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _chat_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _minimap_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
/* harmony import */ var _trees_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(8);
/* harmony import */ var _rocks_json__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(9);
/* harmony import */ var _skins_json__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(10);










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
    this.died = false;
    
  }
  
  preload() {
    this.cam = this.cameras.add(this.cameras.main.x, this.cameras.main.y, window.innerWidth, window.innerHeight);
    this.loadingtext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight / 2, "Loading...", { fontSize: 100, fontFamily: "Arial" }).setOrigin(0.5);
    this.cameras.main.ignore(this.loadingtext);
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
    this.minimap = new _minimap_js__WEBPACK_IMPORTED_MODULE_5__["default"](this);
    this.chatbox = new _chat_js__WEBPACK_IMPORTED_MODULE_4__["default"](this);
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
      try {
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
      } catch(e){
        console.log(e);
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

        
        this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, `skin_${data.players[this.socket.id].skin}`).setScale(_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100, _functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100).setDepth(2).setAlpha(0.5);
        this.bar = new _objects_bar_js__WEBPACK_IMPORTED_MODULE_3__["default"](this, this.player.x, this.player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, 100, 2);
        this.nametext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, this.player.x, this.player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20, this.name, { fontSize: 20, fontFamily: "sans-serif", color: loggedIn ? "blue": "white" }, 2, true);
        this.playerstext = this.add.rexBBCodeText(20, 20, "", { fontSize: 22, fontFamily: "Arial" }).setOrigin(0).setDepth(100);
        this.playerstext.scrollFactorX = 0;
        this.playerstext.scrollFactorY = 0;
        this.scorestext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, 250, 20, "", { fontSize: 22, fontFamily: "Arial" }).setOrigin(0);
        
        this.fpstext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 50, "FPS: 60", { fontSize: 25, fontFamily: "copperplate" });
        this.tps = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 80, "TPS: 30", { fontSize: 25, fontFamily: "copperplate" });
        this.ping = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 110, "Ping: 0 ms", { fontSize: 25, fontFamily: "copperplate" });
        
        this.reloading = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 300, window.innerHeight - 120, "", { fontSize: 30, fontFamily: "Arial" }).setOrigin(1);
        this.shots = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 310, window.innerHeight - 80, "", { fontSize: 30, fontFamily: "Arial" }).setOrigin(1);
        this.bullet_icon = this.add.image(window.innerWidth - 295, window.innerHeight - 95, "bullet_icon").setDepth(100).setScale(0.75, 0.75);
        this.bullet_icon.scrollFactorX = 0;
        this.bullet_icon.scrollFactorY = 0;

        this.grenadesText = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 320, window.innerHeight - 40, "", { fontSize: 30, fontFamily: "Arial" }).setOrigin(1);
        this.grenade_icon = this.add.image(window.innerWidth - 295, window.innerHeight - 55, "grenade_icon").setDepth(100).setScale(0.75, 0.75);
        this.grenade_icon.scrollFactorX = 0;
        this.grenade_icon.scrollFactorY = 0;
        
        this.shield = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, 50, "", { fontSize: 40, fontFamily: "Arial" });
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
        for(let i of _trees_json__WEBPACK_IMPORTED_MODULE_6__.trees){
          let tree = this.add.image(i.x, i.y, "tree").setScale(i.size / _functions_js__WEBPACK_IMPORTED_MODULE_0__.treesize).setDepth(10).setAlpha(0.7);
          tree.id = i.id;
          tree.angle = i.angle;
          this.cam.ignore(tree);
        }

        for(let i of _rocks_json__WEBPACK_IMPORTED_MODULE_7__.rocks){
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
      if(this.died) return;
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
        game.scene.start("load");
        document.querySelector("canvas").style.display = "none";
        game.chatbox.destroy();
        document.querySelector("main").style.display = "block";
        game.socket.emit("leaveGame");
        document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
        game.died = false;
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

    this.background = this.add.tileSprite(0, 0, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size, "grass").setOrigin(0).setDepth(0);
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
              player.gun.x = player.player.x + Math.cos(enemy.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);
              player.gun.y = player.player.y + Math.sin(enemy.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);
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
              if(game.arrowLeft){
                game.arrowLeft.destroy();
                game.arrowRight.destroy();
                game.arrowUp.destroy();
                game.arrowDown.destroy();
              }

              game.deathtext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](game, window.innerWidth / 2, window.innerHeight / 2 - 200, "You died", { fontSize: 50 }).setDepth(101).setAlpha(0);
              game.infotext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](game, window.innerWidth / 2, window.innerHeight / 2 - 100, `Killed By: ${shooterName}\n\nKill Streak: ${game.score}`, { fontSize: 30 }).setDepth(101).setAlpha(0);
              game.deathRect = game.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 500, 0x039e50).setOrigin(0.5).setAlpha(0).setDepth(100);
              
              game.deathRect.scrollFactorX = 0;
              game.deathRect.scrollFactorY = 0;
              game.deathRect.setStrokeStyle(5, 0x0000000);
              game.playAgain = new _objects_button_js__WEBPACK_IMPORTED_MODULE_2__["default"](game, window.innerWidth / 2, window.innerHeight / 2 + 100, "Play Again", function(){
    window.removeEventListener("mousedown", game.shoot);
    window.removeEventListener("touchstart", game.shoot);
    window.removeEventListener("mouseup", game.shootEnd);
    window.removeEventListener("touchend", game.shootEnd);
    window.removeEventListener("touchcancel", game.shootEnd);
    window.removeEventListener("mousemove", game.pointerMove);
    window.removeEventListener("touchmove", game.pointerMove);
                document.querySelector("canvas").style.display = "none";
                document.querySelector("main").style.display = "block";
                document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
                
                game.died = false;
                game.socket.disconnect();
                getServerData();
                document.body.style.cursor = "auto";
                if(game.room == "main"){
                  window.rejoin = false;
                game.scene.start("load");
                } else {
                  window.rejoin = game.room;
                  document.getElementById("playbtn").click();
                }

                
    
              }, { background: 0x00374ff });
              
              game.playAgain.text.setDepth(102).setAlpha(0);
              game.playAgain.button.setDepth(101).setAlpha(0);
              game.cameras.main.ignore([game.deathtext, game.infotext, game.deathRect, game.playAgain.text, game.playAgain.button]);
              if(game.room != "main"){
                game.switchWeapon = new _objects_button_js__WEBPACK_IMPORTED_MODULE_2__["default"](game, window.innerWidth - 150, 50, "Switch Weapon", function(){
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

                game.leaveBtn = new _objects_button_js__WEBPACK_IMPORTED_MODULE_2__["default"](game, window.innerWidth - 150, 110, "Leave", function(){
                  game.scene.start("load");
                  document.querySelector("canvas").style.display = "none";
                  document.querySelector("main").style.display = "block";
                  document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
                  game.socket.disconnect();
                  getServerData();
                  document.body.style.cursor = "auto";
                  window.rejoin = false;
                  game.died = false;
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
            this.killText = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight - 90, `You killed ${playerName || this.name}\n\nKill Streak: ${this.score}`, { fontSize: 30 });
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
      player: this.add.image(player.x, player.y, `skin_${player.skin}`).setScale(_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100, _functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100).setDepth(1).setAlpha(alpha),
      nametext: new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, player.x, player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20, player.name, { fontSize: 20, fontFamily: "sans-serif", color: player.bot ? "red": (player.account ? "blue": "white") }, 1, true),
      healthbar: new _objects_bar_js__WEBPACK_IMPORTED_MODULE_3__["default"](this, player.x, player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, 100, 1),
      gun: this.add.image(player.x + Math.cos(player.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29), player.y + Math.sin(player.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29), "gun").setDepth(1.1),
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
    this.shoot = (e) => {
      try {
        if(this.died || this.socket.disconnected) return;
        let x = e.clientX || e.touches[0].clientX;
        let y = e.clientY || e.touches[0].clientY;
        this.shooting = true;
        var angle = Math.atan2(y - (window.innerHeight / 2), x - (window.innerWidth / 2));
        this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
        this.gun.angle2 = angle;
        this.pointerX = x;
        this.pointerY = y;
      } catch(e){
        console.log(e);
      }
    };
    this.shootEnd = () => {
      try {
        if(this.died || this.socket.disconnected) return;
        this.shooting = false;
        this.shotBefore = false;
        if(this.arrowLeft){
          this.leftDown = false;
          this.rightDown = false;
          this.upDown = false;
          this.downDown = false;
        }
      } catch(e){
        console.log(e);
      }
    };

    this.pointerMove = (e) => {
      try {
        if(this.died || this.socket.disconnected) return;
        let x = e.clientX || e.touches[0].clientX;
        let y = e.clientY || e.touches[0].clientY;
        var angle = Math.atan2(y - (window.innerHeight / 2), x - (window.innerWidth / 2));
        this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
        this.gun.angle2 = angle;
        this.pointerX = x;
        this.pointerY = y;
      } catch(e){
        console.log(e);
      }
    }
    
    window.addEventListener("mousedown", this.shoot);
    window.addEventListener("touchstart", this.shoot);
    window.addEventListener("mouseup", this.shootEnd);
    window.addEventListener("touchend", this.shootEnd);
    window.addEventListener("touchcancel", this.shootEnd);
    window.addEventListener("mousemove", this.pointerMove);
    window.addEventListener("touchmove", this.pointerMove);
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
      enemy.healthbar.setData(enemy.player.x, enemy.player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, enemy.health);
      enemy.nametext.setPosition(enemy.player.x, enemy.player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20);
    });

    if(this.died) return;

    this.bar.setData(this.player.x, this.player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, this.health);
    this.nametext.setPosition(this.player.x, this.player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20);
    
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
    
    this.gun.x = this.player.x + Math.cos(this.gun.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);
    this.gun.y = this.player.y + Math.sin(this.gun.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);

    this.player.angle = this.gun.angle;

    if(this.player.angle != this.data.angle){
      this.data.angle = this.gun.angle;
      this.data.angle2 = this.gun.angle2;
      this.socket.emit("player angle", this.data, this.room);
    }
  }
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Game);

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "checkMovement": () => (/* binding */ checkMovement),
/* harmony export */   "coinsize": () => (/* binding */ coinsize),
/* harmony export */   "gamestate_rate": () => (/* binding */ gamestate_rate),
/* harmony export */   "playersize": () => (/* binding */ playersize),
/* harmony export */   "radius": () => (/* binding */ radius),
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "ratio": () => (/* binding */ ratio),
/* harmony export */   "size": () => (/* binding */ size),
/* harmony export */   "treesize": () => (/* binding */ treesize)
/* harmony export */ });
const size = 5000;
const playersize = 65;
const radius = playersize / 2;
const coinsize = 37.5;
const ratio = size / 500;
const treesize = 300;
const gamestate_rate = 100;

function random(number1, number2){
  return Math.round(Math.random() * (number2 - number1)) + number1;
}

function checkMovement(direction, x, y){
  if(direction == "left"){
    if(x <= 0) return false;
  } if(direction == "right"){
    if(x + playersize >= size) return false;
  } if(direction == "up"){
    if(y <= 0) return false;
  } if(direction == "down"){
    if(y + playersize >= size) return false;
  } if(direction == "none"){
    return false;
  }
  return true;
}



/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Text extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style, depth = 100, scroll = false){
    // default values
    
    if(!style){
      style = {};
      style.fontFamily = "Arial";
      style.fontSize = 30;
      style.background = 0x0000ff;
    }
    if(!("fontSize" in style)){
      style.fontSize = 30;
    }
    
    super(scene, x, y, text, style);
    if(!scroll){
      this.scrollFactorX = 0;
      this.scrollFactorY = 0;
    }
    this.setDepth(100);
    this.setOrigin(0.5);
    this.setDepth(depth);
    scene.add.existing(this);
  }

  setPosition(x, y){
    this.x = x;
    this.y = y;
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Text);

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _text_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);


class Button {
  constructor(scene, x, y, text, onclick, style){
    // default values
    if(!style){
      style = {};
      style.fontSize = 50;
      style.fontFamily = "Arial";
      style.background = 0x0000ff;
    }
    if(!("fontSize" in style)){
      style.fontSize = 50;
    }
    if(!("fontFamily" in style)){
      style.fontFamily = "Arial";
    }
    if(!("background" in style)){
      style.background = 0x0000ff;
    }
    this.text = new _text_js__WEBPACK_IMPORTED_MODULE_0__["default"](scene, x, y, text, {fontSize: style.fontSize, fontFamily: style.fontFamily}).setOrigin(0.5);
    this.button = scene.add.rectangle(0, 0, 0, 0, style.background).setDepth(99);
    this.button.scrollFactorX = 0;
    this.button.scrollFactorY = 0;
    this.button.width = this.text.width + 15;
    this.button.height = this.text.height + 15;
    this.button.x = this.text.x - (this.text.width / 2) - 5;
    this.button.y = this.text.y - (this.text.height / 2) - 5;
    this.button.setInteractive().on('pointerdown', onclick);
    scene.add.existing(this);
  }

  setPosition(x, y){
    this.text.x = x;
    this.text.y = y;
    this.button.x = this.text.x - (this.text.width / 2) - 5;
    this.button.y = this.text.y - (this.text.height / 2) - 5;
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Button);

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Bar {
  constructor(scene, x, y, health, depth){
    this.bar = scene.add.rectangle(x, y, 100, 20, 0x0ffffff).setDepth(depth);
    this.inside = scene.add.rectangle(x, y, health / 100 * 100, 20, 0x00084ff).setDepth(depth);
    scene.add.existing(this.bar);
    scene.add.existing(this.inside);
    scene.cam.ignore([this.bar, this.inside]);
  }
  
  setData(x, y, health){
    this.bar.x = x;
    this.bar.y = y;
    this.inside.x = x;
    this.inside.y = y;
    this.inside.width = this.inside.width = health / 100 * 100;
  }

  destroy(){
    this.bar.destroy();
    this.inside.destroy();
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Bar);

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Chatbox {
  constructor(game){
    this.socket = game.socket;
    this.on = true;
    this.name = game.name;
    this.focus = false;
    this.sent = false;
    this.chatbox = document.getElementById("chatbox");
    this.input = document.getElementById("chat-input");
    this.messages = document.getElementById("messages");
    this.chatbox.style.display = "block";
    
    this.input.addEventListener("keydown", e => {
      if(!this.on) return;
      if(e.key == "Enter"){
        if(!this.validMessage(this.input.value)) return this.sent = false;
        this.socket.emit("chat message", this.name, this.input.value, game.room);
        this.input.value = "";
        this.sent = true;
      }

      if(e.key == "Tab"){
        e.preventDefault();
        this.input.blur();
      }
    });
    this.socket.on("chat message", message => {
      if(!this.on) return;
      this.messages.innerHTML += `<p>${this.encodeHTML(message)}</p>`;
      this.messages.scrollTo(0, this.messages.scrollHeight);
    });

    this.input.onfocus = () => {
      this.input.placeholder = "Press TAB to exit";
      this.focus = true;
    }

    this.input.onblur = () => {
      this.input.placeholder = "Press ENTER to chat";
      this.focus = false;
    }
  }

  encodeHTML(text){
    var div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  }

  validMessage(text){
    if(!text) return false;
    for(var i of text){
      if(i != " ") return true;
    }
    return false;
  }
  
  destroy(){
    this.on = false;
    this.chatbox.style.display = "none";
    this.messages.innerHTML = "";
    this.input.value = "";
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Chatbox);

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _functions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);


class Minimap {
  constructor(scene){
    this.map = scene.add.rectangle(window.innerWidth - 220, window.innerHeight - 220, 200, 200, 0x0000000).setDepth(150).setAlpha(0.7).setOrigin(0).setStrokeStyle(3, 0x0000ff);
    this.map.scrollFactorX = 0;
    this.map.scrollFactorY = 0;
    this.players = {};
    this.scale = _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / this.map.width;
    scene.cameras.main.ignore(this.map);
  }

  show(scene){
    scene.add.existing(this.map);
  }

  addPlayer(scene, id, x, y){
    if(scene.died) return;
    var color = 0x0ff0000;
    if(id == scene.socket.id) color = 0x0ffa500;
    let player = scene.add.circle(this.map.x + x / this.scale, this.map.y + y / this.scale, _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius / this.scale, color).setDepth(151);
    player.scrollFactorX = 0;
    player.scrollFactorY = 0;
    scene.add.existing(player);
    this.players[id] = player;
    scene.cameras.main.ignore(player);
  }

  removePlayer(id){
    if(!this.players[id]) return;
    this.players[id].destroy();
    delete this.players[id];
  }

  update(players){
    Object.values(players).forEach(player => {
      this.players[player.id].x = this.map.x + player.x / this.scale;
      this.players[player.id].y = this.map.y + player.y / this.scale;
    });
  }

  resize(){
    this.map.x = window.innerWidth - 220;
    this.map.y = window.innerHeight - 220;
    Object.values(this.players).forEach(player => {
      player.x = this.map.x + player.x / this.scale;
      player.y = this.map.y + player.y / this.scale;
    });
  }

  destroy(){
    this.map.destroy();
    Object.values(this.players).forEach(player => {
      player.destroy();
    });
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Minimap);

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = JSON.parse('{"trees":[{"id":0,"size":336,"x":3690,"y":4432,"angle":44},{"id":1,"size":237,"x":1262.5,"y":4872.5,"angle":309},{"id":2,"size":339,"x":685.5,"y":2524.5,"angle":91},{"id":3,"size":384,"x":787,"y":1179,"angle":19},{"id":4,"size":201,"x":579.5,"y":1304.5,"angle":32},{"id":5,"size":558,"x":2916,"y":3319,"angle":149},{"id":6,"size":213,"x":2356.5,"y":803.5,"angle":221},{"id":7,"size":480,"x":433,"y":982,"angle":168},{"id":8,"size":150,"x":2519,"y":4027,"angle":348},{"id":9,"size":426,"x":1674,"y":272,"angle":190},{"id":10,"size":582,"x":2511,"y":2833,"angle":37},{"id":11,"size":234,"x":4272,"y":3622,"angle":50},{"id":12,"size":240,"x":130,"y":3920,"angle":192},{"id":13,"size":417,"x":550.5,"y":1605.5,"angle":195},{"id":14,"size":219,"x":4867.5,"y":4450.5,"angle":179},{"id":15,"size":294,"x":3191,"y":1778,"angle":272},{"id":16,"size":165,"x":2823.5,"y":682.5,"angle":56},{"id":17,"size":201,"x":2582.5,"y":516.5,"angle":140},{"id":18,"size":432,"x":4670,"y":1524,"angle":177},{"id":19,"size":198,"x":4039,"y":3499,"angle":165},{"id":20,"size":258,"x":252,"y":3954,"angle":346},{"id":21,"size":318,"x":4774,"y":4229,"angle":71},{"id":22,"size":561,"x":1527.5,"y":784.5,"angle":102},{"id":23,"size":279,"x":970.5,"y":1196.5,"angle":256},{"id":24,"size":384,"x":319,"y":2260,"angle":41},{"id":25,"size":600,"x":3409,"y":2251,"angle":60},{"id":26,"size":597,"x":2119.5,"y":300.5,"angle":11},{"id":27,"size":198,"x":3422,"y":4858,"angle":246},{"id":28,"size":309,"x":1562.5,"y":3170.5,"angle":86},{"id":29,"size":153,"x":1762.5,"y":3825.5,"angle":63},{"id":30,"size":549,"x":471.5,"y":4032.5,"angle":260},{"id":31,"size":456,"x":3454,"y":4168,"angle":57}]}');

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = JSON.parse('{"rocks":[{"id":0,"size":154,"x":1192,"y":602,"angle":182},{"id":1,"size":189,"x":3727.5,"y":4887.5,"angle":194},{"id":2,"size":199,"x":2644.5,"y":4668.5,"angle":151},{"id":3,"size":74,"x":3140,"y":4025,"angle":301},{"id":4,"size":191,"x":4830.5,"y":320.5,"angle":40},{"id":5,"size":198,"x":1008,"y":2400,"angle":217},{"id":6,"size":125,"x":2994.5,"y":3416.5,"angle":163},{"id":7,"size":90,"x":1850,"y":1573,"angle":252},{"id":8,"size":91,"x":642.5,"y":2637.5,"angle":161},{"id":9,"size":152,"x":2003,"y":408,"angle":19},{"id":10,"size":125,"x":2574.5,"y":4517.5,"angle":109},{"id":11,"size":135,"x":4063.5,"y":2319.5,"angle":181},{"id":12,"size":194,"x":2497,"y":4431,"angle":339},{"id":13,"size":132,"x":1235,"y":3130,"angle":260},{"id":14,"size":155,"x":1849.5,"y":4761.5,"angle":360},{"id":15,"size":95,"x":3783.5,"y":1869.5,"angle":334},{"id":16,"size":69,"x":984.5,"y":4199.5,"angle":116},{"id":17,"size":105,"x":4397.5,"y":101.5,"angle":83},{"id":18,"size":121,"x":1924.5,"y":2106.5,"angle":267},{"id":19,"size":61,"x":3120.5,"y":4706.5,"angle":40},{"id":20,"size":111,"x":1972.5,"y":2423.5,"angle":106},{"id":21,"size":81,"x":1999.5,"y":1528.5,"angle":35},{"id":22,"size":162,"x":1070,"y":1068,"angle":318},{"id":23,"size":176,"x":308,"y":4842,"angle":224},{"id":24,"size":117,"x":1706.5,"y":4734.5,"angle":226},{"id":25,"size":154,"x":1967,"y":1659,"angle":165},{"id":26,"size":93,"x":4413.5,"y":824.5,"angle":129},{"id":27,"size":114,"x":2424,"y":2504,"angle":111},{"id":28,"size":117,"x":1579.5,"y":4517.5,"angle":224},{"id":29,"size":76,"x":3927,"y":2444,"angle":140},{"id":30,"size":192,"x":2363,"y":2830,"angle":132},{"id":31,"size":105,"x":1839.5,"y":848.5,"angle":244},{"id":32,"size":125,"x":3004.5,"y":2552.5,"angle":245},{"id":33,"size":78,"x":3837,"y":3009,"angle":41}]}');

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = JSON.parse('[{"id":0,"url":"player","cost":0},{"id":1,"url":"skull","cost":1000},{"id":2,"url":"smileyface","cost":200},{"id":3,"url":"target","cost":100},{"id":4,"url":"basketball","cost":500},{"id":5,"url":"sunglasses","cost":2000},{"id":6,"url":"thumbsup","cost":150},{"id":7,"url":"expressionless","cost":200},{"id":8,"url":"magician","cost":800},{"id":9,"url":"lightning","cost":300},{"id":10,"url":"crown","cost":3000},{"id":11,"url":"cap","cost":900}]');

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _skins_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);


class Load extends Phaser.Scene {
  preload(){
    for(let i of Object.keys(_skins_json__WEBPACK_IMPORTED_MODULE_0__)){
      this.load.image(`skin_${_skins_json__WEBPACK_IMPORTED_MODULE_0__[i].url}`, `/img/skins/${_skins_json__WEBPACK_IMPORTED_MODULE_0__[i].url}.png`);
    }
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
    this.load.plugin("rexbbcodetextplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js", true);
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Load);

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _objects_text_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _objects_button_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);



class disconnect_scene extends Phaser.Scene {
  constructor(){
    super();
  }
  
  preload(){
    
  }
  
  create(){
    this.disconnecttext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_0__["default"](this, window.innerWidth / 2, 100, window.error.message, { fontSize: 30, fontFamily: "Arial" }).setOrigin(0.5);
    this.button = new _objects_button_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight / 2, window.error.reload ? "Reload": "OK", () => {
      if(window.error.reload) location.reload();
      else {
        this.scene.start("load");
        document.querySelector("main").style.display = "block";
        document.querySelector("canvas").style.display = "none";
        document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
        document.body.style.cursor = "auto";
      }
    });
    
  }
  
  update(){

  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (disconnect_scene);

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _game_load_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _game_disconnect_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _functions_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2);





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
game.scene.add("load", _game_load_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
game.scene.add("gamescene", _game__WEBPACK_IMPORTED_MODULE_0__["default"]);
game.scene.add("disconnect_scene", _game_disconnect_js__WEBPACK_IMPORTED_MODULE_2__["default"]);
game.scene.start("load");

window.addEventListener("resize", function(){
  config.width = window.innerWidth;
  config.height = window.innerHeight;
});

function startGame(){
  game.scene.start("gamescene");
  document.querySelector("canvas").style.display = "block";
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

  localStorage.setItem("gun", document.getElementById("gun").value);
  
  window.started = true;
  
  document.body.style.cursor = "crosshair";
  
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
if(localStorage.getItem("gun")){
  document.getElementById("gun").value = localStorage.getItem("gun");
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
  - WASD/Arrow keys to move<br>
  <br>- Click to shoot<br>
  <br>- Press R to reload gun, and G to throw grenade<br>
  <br>- Press ENTER to chat<br>
  <br>- Press F for fullscreen, and L to leave game<br>
  <br>- Collect the gold for ammo<br>
  <br>- Kill as many players as you can<br>
  <br>Happy playing!</p>`, "OK", true).then(() => {});
});

if(autojoin){
  document.getElementById("joinbtn").click();
}

const servers = {
  1: {
    url: "https://blaster2d.ruiwenge2.repl.co",
    num: 1,
  },
  2: {
    url: "https://blaster2d.herokuapp.com",
    num: 2
  }
};

async function showServerData(num){
  try {
    let url = servers[num].url;
    let res = await fetch(url + "/stats");
    let data = await res.json();
    document.getElementById("server" + num).innerHTML = `Server ${num} (${data.tps} TPS)`;
    console.log(url, ": ", data.tps);
    servers[num].tps = data.tps;
    return data.tps;
  } catch(e){
    console.log(e);
    document.getElementById("server" + num).innerHTML = `Server ${num} (offline)`;
    servers[num].tps = 0;
  }
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

// window.onerror = function(msg, url, line) {
//     document.write("Error : " + msg + "<br><br>");
//     document.write("Line number : " + line + "<br><br>");
//     document.write("File : " + url);
// };
})();

/******/ })()
;