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
/* harmony import */ var _trees_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
/* harmony import */ var _skins_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(8);








class gamescene extends Phaser.Scene {
  constructor(){
    super();
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.frames = 0;
  }
  
  preload() {
    for(let i of Object.keys(_skins_json__WEBPACK_IMPORTED_MODULE_6__)){
      this.load.image(`skin_${_skins_json__WEBPACK_IMPORTED_MODULE_6__[i].id}`, `/img/skins/${_skins_json__WEBPACK_IMPORTED_MODULE_6__[i].url}.png`);
    }
    this.load.image("player", "/img/skins/skull.png");
    this.load.image("coin", "/img/gameObjects/coin.png");
    this.load.image("grass", "/img/gameObjects/tile.png");
    this.load.image("bullet", "/img/gameObjects/bullet.png");
    this.load.image("pistol", "/img/guns/pistol.png");
    this.load.image("obstacle", "/img/gameObjects/obstacle.png");
    this.load.image("obstacle2", "/img/gameObjects/obstacle2.png");
    this.load.image("tree", "/img/gameObjects/tree.png");
    this.loadingtext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight / 2, "Loading...", { fontSize: 100, fontFamily: "Arial" }).setOrigin(0.5);
  }

  create() {
    this.loaded = false;
    this.socket = io("https://blaster2d.ruiwenge2.repl.co");
    this.coins = this.physics.add.group();
    this.trees = this.physics.add.group();
    this.bulletsGroup = this.physics.add.group();
    this.enemies = {};
    this.bullets = {};
    this.verified = false;
    this.name = name || localStorage.getItem("name");
    grecaptcha.execute().then(() => {
      var s = setInterval(() => {
        if(!grecaptcha.getResponse()) return;
        this.socket.emit("join", this.name, grecaptcha.getResponse());
        this.verified = true;
        clearInterval(s);
        }, 100);
      });
    
    window.addEventListener("resize", () => {
      this.scale.resize(window.innerWidth, window.innerHeight);
      // this.cameras.main.setZoom((window.innerWidth * window.innerHeight) / (1300 * 730));
    });
    
    this.socket.on("gamedata", data => { // when game data arrives
      this.loaded = true;
      this.loadingtext.destroy();
      this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, "player").setScale(_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100, _functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100).setDepth(2);
      this.bar = new _objects_bar_js__WEBPACK_IMPORTED_MODULE_3__["default"](this, this.player.x, this.player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, 100, 2);
      this.nametext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, this.player.x, this.player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20, this.name, { fontSize: 20, fontFamily: "sans-serif" }, 2, true);
      this.playerstext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, 20, 20, "", { fontSize: 20, fontFamily: "Arial" }).setOrigin(0);
      this.scorestext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, 200, 20, "", { fontSize: 20, fontFamily: "Arial" }).setOrigin(0);
      
      this.fpstext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 120, "FPS: 60", { fontSize: 30, fontFamily: "copperplate" });
      this.tps = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 155, "TPS: 30", { fontSize: 30, fontFamily: "copperplate" });

      this.playerInfo = {
        x: this.player.x,
        y: this.player.y
      };
      
      this.cameras.main.startFollow(this.player);
      this.data = {
        x: data.players[this.socket.id].x,
        y: data.players[this.socket.id].y,
        angle: 0,
        angle2:0
      };
  
      for(let i of data.coins){
        let coin = this.coins.create(i.x, i.y, "coin").setScale(0.75, 0.75).setDepth(1);
        coin.id = i.id;
      }
      for(let i of _trees_json__WEBPACK_IMPORTED_MODULE_5__.trees){
        let tree = this.trees.create(i.x, i.y, "tree").setScale(i.size / _functions_js__WEBPACK_IMPORTED_MODULE_0__.treesize).setDepth(10).setAlpha(0.7);
        tree.id = i.id;
      }
      
      for(let oplayer of Object.keys(data.players)){
        if(oplayer != this.socket.id){
          this.addPlayer(data.players[oplayer]);
        }
      }
      this.main();
        
    });

    this.socket.on("new player", (data, id) => { // when new player joins
      if(!this.verified) return;
      this.addPlayer(data);
    });

    this.socket.on("collected gold", id => {
      if(!this.verified) return;
      this.coins.children.entries.forEach(coin => {
        if(coin.id == id){
          coin.destroy();
        }
      });
    });
  
    this.socket.on("left", id => {
      if(!this.verified) return;
      this.enemies[id].player.destroy();
      this.enemies[id].gun.destroy();
      this.enemies[id].healthbar.destroy();
      this.enemies[id].nametext.destroy();
      delete this.enemies[id];
    });
  
    this.socket.on("leave", () => {
      this.scene.start("disconnect_scene");
    });
  }

  main(){
    setInterval(() => {
      this.tps.setText("TPS: " + this.frames);
      this.frames = 0;
    }, 1000);
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.l = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    var game = this;
    this.l.on("down", function(){
      confirmmodal("", "Are you sure you want to exit the game?", "Exit").then(() => {
        game.sys.game.destroy(true, false);
        document.querySelector("main").style.display = "block";
        game.socket.emit("leaveGame");
        grecaptcha.reset();
      });
    });

    for(let i = _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / (_functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio * 2); i < _functions_js__WEBPACK_IMPORTED_MODULE_0__.size; i += _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / _functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio){
      for(let j = _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / (_functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio * 2); j < _functions_js__WEBPACK_IMPORTED_MODULE_0__.size; j += _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / _functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio){
        let grass = this.physics.add.image(i, j, "grass").setDepth(0);
      }
    }
    
    this.obstacle1 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 - 750, "obstacle").setDepth(0);
    this.obstacle2 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 + 750, "obstacle").setDepth(0);
    this.obstacle3 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 - 750, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, "obstacle2").setDepth(0);
    this.obstacle4 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 + 750, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, "obstacle2").setDepth(0);

  
    this.gun = this.physics.add.sprite(this.player.x, this.player.y, "pistol").setDepth(2);

    this.gun.angle2 = 0;

    this.health = 100;

    this.score = 0;

    this.scoretext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 50, "Score: " + this.score, { fontSize: 30, fontFamily: "copperplate" });

    this.gold = 0;
    this.goldtext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 85, "Gold: " + this.gold, { fontSize: 30, fontFamily: "copperplate" });

    this.addWeaponActions();

    this.physics.add.collider(this.player, this.coins, (player, coin) => { // player collects coin
      this.collect(player, coin);
    });

    this.socket.on("gamestate", data => {
      if(this.socket.disconnected){
        this.scene.start("disconnect_scene");
        return;
      }
      this.frames += 1;
      if(!this.died){
        let self = data.players[this.socket.id];
        this.playerInfo.x = self.x;
        this.playerInfo.y = self.y;
        let game = this;
  
        this.tweens.add({
          targets: this.player,
          x: this.playerInfo.x,
          y: this.playerInfo.y,
          duration: 100
        });
      }

      Object.keys(data.players).forEach(enemy => {
        if(enemy == this.socket.id) return;
        this.tweens.add({
          targets: [this.enemies[enemy].player],
          x: data.players[enemy].x,
          y: data.players[enemy].y,
          duration: 100,
          onUpdate: function(){
            try {
              let player = game.enemies[enemy];
              player.gun.x = player.player.x + Math.cos(data.players[enemy].angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);
             player.gun.y = player.player.y + Math.sin(data.players[enemy].angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);
              player.gun.angle = data.players[enemy].angle;
              player.player.angle = data.players[enemy].angle;
            } catch(e){
              console.log(e);
            }
          } 
        });
      });

      Object.keys(data.bullets).forEach(bullet => {
        this.tweens.add({
          targets: [this.bullets[bullet]],
          x: data.bullets[bullet].x,
          y: data.bullets[bullet].y,
          duration: 1000 / 30
        });
      });
    });

    this.socket.on("new bullet", (id, data) => {
      let bullet_image = this.bulletsGroup.create(data.x, data.y, "bullet").setScale(0.5, 2).setDepth(13);
      bullet_image.angle = data.angle;
      bullet_image.shooter = data.shooter;
      bullet_image.id = id;
      this.bullets[id] = bullet_image;
    });

    this.socket.on("removed bullet", id => {
      this.bullets[id].destroy();
      delete this.bullets[id];
    });

    this.socket.on("player died", (id, shooter) => {
      let game = this;
      if(id == this.socket.id){
        let deathtext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight / 2 - 100, "You died", { fontSize: 50 }).setDepth(101);
        let deathRect = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 500, 0x032a852).setOrigin(0.5).setAlpha(0.7).setDepth(100);
        
        deathRect.scrollFactorX = 0;
        deathRect.scrollFactorY = 0;
        this.died = true;
        let playAgain = new _objects_button_js__WEBPACK_IMPORTED_MODULE_2__["default"](this, window.innerWidth / 2, window.innerHeight / 2 + 100, "Play Again", function(){
          game.sys.game.destroy(true, false);
          document.querySelector("main").style.display = "block";
          grecaptcha.reset();
        }, { background: 0x032a852 });
        playAgain.text.setDepth(102);
        playAgain.button.setDepth(101).setAlpha(0.7);
        
        this.tweens.add({
          targets: [this.player, this.gun, this.bar, this.nametext],
          duration: 1000,
          alpha: 0,
          onComplete: function(){
            game.player.destroy();
            game.gun.destroy();
            game.bar.destroy();
            game.nametext.destroy();
            game.playerstext.destroy();
            game.scorestext.destroy();
            game.goldtext.destroy();
            game.scoretext.destroy();
            game.fpstext.destroy();
            game.tps.destroy();
          }
        });
      } else {
        this.tweens.add({
          targets: [this.enemies[id].player, this.enemies[id].gun, this.enemies[id].healthbar, this.enemies[id].nametext],
          duration: 1000,
          alpha: 0,
          onComplete: function(){
            game.enemies[id].player.destroy();
            game.enemies[id].gun.destroy();
            game.enemies[id].healthbar.destroy();
            game.enemies[id].nametext.destroy();
            delete game.enemies[id];
          }
        });
      }
    });
  }

  addPlayer(player){
    var playerObj = {
      id: player.id,
      x: player.x,
      y: player.y,
      name: player.name,
      player: this.add.image(player.x, player.y, "player").setScale(_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100, _functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100).setDepth(1),
      nametext: new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, player.x, player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20, player.name, { fontSize: 20, fontFamily: "sans-serif" }, 1, true),
      healthbar: new _objects_bar_js__WEBPACK_IMPORTED_MODULE_3__["default"](this, player.x, player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, 100, 1),
      gun: this.add.image(player.x + Math.cos(player.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29), player.y + Math.sin(player.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29), "pistol").setDepth(1),
      angle: null,
      health: 100,
      score: 0
    }
    this.enemies[player.id] = playerObj;
  }

  collect(player, coin){
    this.socket.emit("collect gold", coin.id);
    this.gold += 1;
    this.goldtext.setText("Gold: " + this.gold);
    coin.destroy();
    if(this.gold > localStorage.getItem("bestgold")){
      localStorage.setItem("bestgold", this.gold);
    }
    for(let i = 0; i < (0,_functions_js__WEBPACK_IMPORTED_MODULE_0__.random)(0, 2); i++){
      this.coins.create((0,_functions_js__WEBPACK_IMPORTED_MODULE_0__.random)(_functions_js__WEBPACK_IMPORTED_MODULE_0__.coinsize / 2, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size - _functions_js__WEBPACK_IMPORTED_MODULE_0__.coinsize / 2), (0,_functions_js__WEBPACK_IMPORTED_MODULE_0__.random)(_functions_js__WEBPACK_IMPORTED_MODULE_0__.coinsize / 2, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size - _functions_js__WEBPACK_IMPORTED_MODULE_0__.coinsize / 2), "coin").setScale(0.75, 0.75);
    }
  }

  addWeaponActions(){
    this.useweapon = true;
    this.input.on("pointerdown", e => {
      if(!this.useweapon || this.died) return;
      var angle = Math.atan2(e.y - (window.innerHeight / 2), e.x - (window.innerWidth / 2));
      this.socket.emit("shoot", this.player.x, this.player.y, angle);
      this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
      this.gun.angle2 = angle;
      this.useweapon = false;
    });
    
    window.addEventListener("mousemove", e => {
      if(this.died || this.socket.disconnected) return;
      var angle = Math.atan2(e.clientY - (window.innerHeight / 2), e.clientX - (window.innerWidth / 2));
      this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
      this.gun.angle2 = angle;
    });

    setInterval(() => {
      if(!this.useweapon){
        this.useweapon = true;
      }
    }, 500);
  }

  update() {
    if(!this.loaded) return;
    if(this.socket.disconnected){
      this.scene.start("disconnect_scene");
      return;
    }
    
    Object.values(this.enemies).forEach(enemy => {
      enemy.healthbar.setData(enemy.player.x, enemy.player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, enemy.health);
      enemy.nametext.setPosition(enemy.player.x, enemy.player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20);
    });

    if(this.died) return;

    this.bar.setData(this.player.x, this.player.y - _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius - 20, 100);
    this.nametext.setPosition(this.player.x, this.player.y + _functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 20);
    
    Array.prototype.insert = function(index, item) {
      this.splice(index, 0, item);
    };

    let playerslist = [...Object.values(this.enemies)];

    playerslist.insert(0, {
      score: this.score,
      name: this.name
    });
    
    let sorted_players = playerslist.sort(function(a, b){return a.score - b.score});
    let text = "";
    let text2 = "";
    for(let i of sorted_players){
      text += i.name + "\n";
      text2 += i.score + "\n";
    }
    this.playerstext.setText(text);
    this.scorestext.setText(text2);
    
    this.fpstext.setText("FPS: " + Math.round(this.sys.game.loop.actualFps));
    let cursors = this.input.keyboard.createCursorKeys();
    if(cursors.left.isDown || this.a.isDown){
      if(!this.left){
        this.socket.emit("movement", "left");
        this.left = true;
        this.right = false;
      }
    } else {
      if(this.left){
        this.socket.emit("movement_end", "left");
        this.left = false;
      }
    }
    
    if(cursors.right.isDown || this.d.isDown){
      if(!this.right){
        this.socket.emit("movement", "right");
        this.right = true;
        this.left = false;
      }
    } else {
      if(this.right){
        this.socket.emit("movement_end", "right");
        this.right = false;
      }
    }
    
    if(cursors.up.isDown || this.w.isDown){
      if(!this.up){
        this.socket.emit("movement", "up");
        this.up = true;
        this.down = false;
      }
    } else {
      if(this.up){
        this.socket.emit("movement_end", "up");
        this.up = false;
      }
    }
    
    if(cursors.down.isDown || this.s.isDown){
      if(!this.down){
        this.socket.emit("movement", "down");
        this.down = true;
        this.up = false;
      }
    } else {
      if(this.down){
        this.socket.emit("movement_end", "down");
        this.down = false;
      }
    }
    
    this.gun.x = this.player.x + Math.cos(this.gun.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);
    this.gun.y = this.player.y + Math.sin(this.gun.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.radius + 29);

    this.player.angle = this.gun.angle;

    if(this.player.angle != this.data.angle){
      this.data.angle = this.gun.angle;
      this.data.angle2 = this.gun.angle2;
      this.socket.emit("player angle", this.data);
    }
  }
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (gamescene);

// https://www.html5gamedevs.com/topic/7273-best-way-to-fix-weapon-to-player/

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


class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, onclick, style){
    super(scene);
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
  }
  
  create(){
    
  }
  
  remove(){
    
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Chatbox);

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = JSON.parse('{"trees":[{"id":0,"size":513,"x":2999.5,"y":3200.5},{"id":1,"size":333,"x":3520.5,"y":3089.5},{"id":2,"size":543,"x":2272.5,"y":2900.5},{"id":3,"size":525,"x":4204.5,"y":4578.5},{"id":4,"size":426,"x":800,"y":1638},{"id":5,"size":459,"x":3770.5,"y":3611.5},{"id":6,"size":306,"x":4820,"y":593},{"id":7,"size":516,"x":1905,"y":556},{"id":8,"size":258,"x":1699,"y":2130},{"id":9,"size":567,"x":2982.5,"y":3324.5},{"id":10,"size":384,"x":1235,"y":4383},{"id":11,"size":501,"x":1503.5,"y":845.5},{"id":12,"size":234,"x":2507,"y":2225},{"id":13,"size":573,"x":3603.5,"y":2764.5},{"id":14,"size":546,"x":932,"y":4000},{"id":15,"size":423,"x":1428.5,"y":1833.5},{"id":16,"size":312,"x":2421,"y":3723},{"id":17,"size":405,"x":3900.5,"y":845.5},{"id":18,"size":201,"x":2719.5,"y":391.5},{"id":19,"size":468,"x":4440,"y":1709},{"id":20,"size":177,"x":4050.5,"y":4853.5},{"id":21,"size":369,"x":390.5,"y":2925.5},{"id":22,"size":309,"x":4214.5,"y":2536.5},{"id":23,"size":300,"x":2497,"y":1842},{"id":24,"size":237,"x":3216.5,"y":2604.5},{"id":25,"size":504,"x":3299,"y":1806},{"id":26,"size":588,"x":298,"y":2039},{"id":27,"size":291,"x":2076.5,"y":1116.5},{"id":28,"size":438,"x":4619,"y":963},{"id":29,"size":216,"x":4264,"y":3225},{"id":30,"size":522,"x":3902,"y":4640},{"id":31,"size":291,"x":255.5,"y":1430.5},{"id":32,"size":342,"x":2779,"y":2066},{"id":33,"size":243,"x":4620.5,"y":703.5},{"id":34,"size":399,"x":296.5,"y":850.5},{"id":35,"size":465,"x":1834.5,"y":2910.5},{"id":36,"size":573,"x":3575.5,"y":2183.5},{"id":37,"size":174,"x":3732,"y":3574},{"id":38,"size":354,"x":1705,"y":4184},{"id":39,"size":231,"x":906.5,"y":2564.5},{"id":40,"size":213,"x":710.5,"y":4321.5},{"id":41,"size":366,"x":2553,"y":3555},{"id":42,"size":222,"x":4869,"y":2990},{"id":43,"size":471,"x":2366.5,"y":3879.5},{"id":44,"size":474,"x":1817,"y":2878},{"id":45,"size":249,"x":2129.5,"y":4789.5},{"id":46,"size":216,"x":1314,"y":4521},{"id":47,"size":207,"x":660.5,"y":2221.5},{"id":48,"size":219,"x":2154.5,"y":4158.5},{"id":49,"size":285,"x":3276.5,"y":3238.5},{"id":50,"size":300,"x":1452,"y":4306},{"id":51,"size":516,"x":3748,"y":733},{"id":52,"size":183,"x":1578.5,"y":3997.5},{"id":53,"size":537,"x":1250.5,"y":933.5},{"id":54,"size":504,"x":480,"y":1358},{"id":55,"size":390,"x":496,"y":2019}]}');

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = JSON.parse('[{"id":0,"url":"player","cost":0},{"id":1,"url":"skull","cost":200},{"id":2,"url":"smileyface","cost":100},{"id":3,"url":"target","cost":100},{"id":4,"url":"basketball","cost":250}]');

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class joinscene extends Phaser.Scene {
  constructor(){
    super();
  }
  
  preload(){
    
  }
  
  create(){
    if(!localStorage.getItem("bestscore")){
      localStorage.setItem("bestscore", 0);
    }
    if(!localStorage.getItem("bestgold")){
      localStorage.setItem("bestgold", 0);
    }
    this.add.text(window.innerWidth / 2, 100, "Game", { fontFamily: "Arial", fontSize:100 }).setOrigin(0.5);

    this.button = this.add.rectangle(0, 0, 0, 0, 0x0f0);
    this.text = this.add.text(window.innerWidth / 2, window.innerHeight / 2.5, 'Play', { fill: '#ffffff', fontFamily: "Arial", fontSize:50 }).setOrigin(0.5);
    this.button.width = this.text.width + 15;
    this.button.height = this.text.height + 15;
    this.button.x = this.text.x - (this.text.width / 2) - 5;
    this.button.y = this.text.y - (this.text.height / 2) - 5;
    this.button.setInteractive().on('pointerdown', () => {
      this.scene.start("gamescene");
    });

    this.button2 = this.add.rectangle(0, 0, 0, 0, 0x0f0);
    this.text2 = this.add.text(window.innerWidth / 2, window.innerHeight / 1.8, 'How To Play', { fill: '#ffffff', fontFamily: "Arial", fontSize:50 }).setOrigin(0.5);
    this.button2.width = this.text2.width + 15;
    this.button2.height = this.text2.height + 15;
    this.button2.x = this.text2.x - (this.text2.width / 2) - 5;
    this.button2.y = this.text2.y - (this.text2.height / 2) - 5;
    this.button2.setInteractive().on('pointerdown', () => {
      this.scene.start("howtoplay");
    });

    this.button3 = this.add.rectangle(0, 0, 0, 0, 0x0f0);
    this.text3 = this.add.text(window.innerWidth / 2, window.innerHeight / 1.4, 'Your Best Scores', { fill: '#ffffff', fontFamily: "Arial", fontSize:50 }).setOrigin(0.5);
    this.button3.width = this.text3.width + 15;
    this.button3.height = this.text3.height + 15;
    this.button3.x = this.text3.x - (this.text3.width / 2) - 5;
    this.button3.y = this.text3.y - (this.text3.height / 2) - 5;
    this.button3.setInteractive().on('pointerdown', () => {
      this.scene.start("bestscores");
    });
  }
  
  update(){

  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (joinscene);

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class howtoplay extends Phaser.Scene {
  constructor(){
    super();
  }

  preload(){
    
  }
  
  create(){
    this.add.text(window.innerWidth / 2, 100, "How To Play", { fontFamily: "Arial", fontSize:75 }).setOrigin(0.5 );
    this.button = this.add.rectangle(0, 0, 0, 0, 0x0f0);
    this.text = this.add.text(window.innerWidth / 2, window.innerHeight / 1.5, 'Back', { fill: '#ffffff', fontFamily: "Arial", fontSize:50 }).setOrigin(0.5);
    this.button.width = this.text.width + 10;
    this.button.height = this.text.height + 10;
    this.button.x = this.text.x - (this.text.width / 2) - 5;
    this.button.y = this.text.y - (this.text.height / 2) - 5;
    this.button.setInteractive().on('pointerdown', () => {
      this.scene.start("joinscene");
    });
  }
  
  update(){

  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (howtoplay);

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class diedscene extends Phaser.Scene {
  constructor(){
    super();
  }
  
  preload(){
     
  }
  
  create(){
    this.add.text(window.innerWidth / 2, 100, "You Died", { fontFamily: "Arial", fontSize:100 }).setOrigin(0.5);

    this.button = this.add.rectangle(0, 0, 0, 0, 0x0f0);
    this.text = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'OK', { fill: '#ffffff', fontFamily: "Arial", fontSize:50 }).setOrigin(0.5);
    this.button.width = this.text.width + 15;
    this.button.height = this.text.height + 15;
    this.button.x = this.text.x - (this.text.width / 2) - 5;
    this.button.y = this.text.y - (this.text.height / 2) - 5;
    this.button.setInteractive().on('pointerdown', () => {
      this.scene.start("joinscene");
    });
  }
  
  update(){

  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (diedscene);

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class bestscores extends Phaser.Scene {
  constructor(){
    super();
  }

  preload(){
    
  }
  
  create(){
    this.add.text(window.innerWidth / 2, 100, "Your Best", { fontFamily: "Arial", fontSize:100 }).setOrigin(0.5);
    this.add.text(window.innerWidth / 2, 300, "Score: " + localStorage.getItem("bestscore"), { fontFamily: "Arial", fontSize:75 }).setOrigin(0.5);
    this.add.text(window.innerWidth / 2, 400, "Gold: " + localStorage.getItem("bestgold"), { fontFamily: "Arial", fontSize:75 }).setOrigin(0.5);

    this.button = this.add.rectangle(0, 0, 0, 0, 0x0f0);
    this.text = this.add.text(window.innerWidth / 2, window.innerHeight / 1.25, 'Back', { fill: '#ffffff', fontFamily: "Arial", fontSize:50 }).setOrigin(0.5);
    this.button.width = this.text.width + 15;
    this.button.height = this.text.height + 15;
    this.button.x = this.text.x - (this.text.width / 2) - 5;
    this.button.y = this.text.y - (this.text.height / 2) - 5;
    this.button.setInteractive().on('pointerdown', () => {
      this.scene.start("joinscene");
    });
  }
  update(){

  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (bestscores);

/***/ }),
/* 13 */
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
    this.disconnecttext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_0__["default"](this, window.innerWidth / 2, 100, "You got disconnected", { fontSize: 50, fontFamily: "Arial" }).setOrigin(0.5);
    this.button = new _objects_button_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight / 2, "Reload", () => {
      location.reload();
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
/* harmony import */ var _scenes_join_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _scenes_howtoplay_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _scenes_died_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);
/* harmony import */ var _scenes_best_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(12);
/* harmony import */ var _scenes_disconnect_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(13);







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
  if(!name.replace(/\s/g, "")){
    document.querySelector("p").style.display = "block";
    return;
  }
  localStorage.setItem("name", name);
  
  const game = new Phaser.Game(config);
  
  game.scene.add("gamescene", _game__WEBPACK_IMPORTED_MODULE_0__["default"]);
  game.scene.add("joinscene", _scenes_join_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
  game.scene.add("howtoplay", _scenes_howtoplay_js__WEBPACK_IMPORTED_MODULE_2__["default"]);
  game.scene.add("diedscene", _scenes_died_js__WEBPACK_IMPORTED_MODULE_3__["default"]);
  game.scene.add("bestscores", _scenes_best_js__WEBPACK_IMPORTED_MODULE_4__["default"]);
  game.scene.add("disconnect_scene", _scenes_disconnect_js__WEBPACK_IMPORTED_MODULE_5__["default"]);
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


document.getElementById("playbtn").addEventListener("click", startGame);
})();

/******/ })()
;