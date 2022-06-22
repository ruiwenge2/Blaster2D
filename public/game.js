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
/* harmony import */ var _chat_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _trees_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _skins_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);







const speed = 275;

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
    for(let i of Object.keys(_skins_json__WEBPACK_IMPORTED_MODULE_5__)){
      this.load.image(`skin_${_skins_json__WEBPACK_IMPORTED_MODULE_5__[i].id}`, `/img/skins/${_skins_json__WEBPACK_IMPORTED_MODULE_5__[i].url}.png`);
    }
    this.load.image("player", "/img/skins/player.png");
    this.load.image("coin", "/img/gameObjects/coin.png");
    this.load.image("grass", "/img/gameObjects/tile.png");
    this.load.image("bullet", "/img/gameObjects/bullet.png");
    this.load.image("pistol", "/img/guns/pistol.png");
    this.load.image("obstacle", "/img/gameObjects/obstacle.png");
    this.load.image("obstacle2", "/img/gameObjects/obstacle2.png");
    this.load.image("tree", "/img/gameObjects/tree.png");
    this.loadingtext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight / 2, "Loading...", { fontSize: 100 }).setOrigin(0.5);
  }

  create() {
    this.loaded = false;
    this.socket = io();
    this.coins = this.physics.add.group();
    this.trees = this.physics.add.group();
    this.enemies = {};
    this.socket.emit("join", localStorage.getItem("name"));
    
    this.socket.on("gamedata", data => { // when game data arrives
      this.loaded = true;
      this.loadingtext.destroy();
      this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, "player").setScale(_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100, _functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100).setDepth(1);
      
      this.fpstext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 120, "FPS:", { fontSize: 25 });
      this.tps = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 155, "TPS:", { fontSize: 25 });

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
      for(let i of _trees_json__WEBPACK_IMPORTED_MODULE_4__.trees){
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
      this.addPlayer(data);
    });

    this.socket.on("collected gold", id => {
      for(let coin of this.coins.children.entries){
        if(coin.id == id){
          coin.destroy();
        }
      }
    });
  
    this.socket.on("left", id => {
      this.enemies[id].player.destroy();
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
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

    for(let i = _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / (_functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio * 2); i < _functions_js__WEBPACK_IMPORTED_MODULE_0__.size; i += _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / _functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio){
      for(let j = _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / (_functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio * 2); j < _functions_js__WEBPACK_IMPORTED_MODULE_0__.size; j += _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / _functions_js__WEBPACK_IMPORTED_MODULE_0__.ratio){
        let grass = this.physics.add.image(i, j, "grass").setDepth(0);
      }
    }
    
    this.obstacle1 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 - 750, "obstacle").setDepth(0);
    this.obstacle2 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 + 750, "obstacle").setDepth(0);
    this.obstacle3 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 - 750, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, "obstacle2").setDepth(0);
    this.obstacle4 = this.physics.add.staticSprite(_functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2 + 750, _functions_js__WEBPACK_IMPORTED_MODULE_0__.size / 2, "obstacle2").setDepth(0);

  
    this.gun = this.physics.add.sprite(this.player.x, this.player.y, "pistol").setDepth(1);

    this.gun.angle2 = 0;

    this.bullets = this.physics.add.group();

    this.health = 100;
    // this.healthtext = new Text(this, 100, 50, "Health");

    // this.healthbar = this.add.rectangle(200, 100, 200, 20, 0x0ffffff).setDepth(10);
    // this.healthbar.scrollFactorX = 0;
    // this.healthbar.scrollFactorY = 0;

    // this.healthbarinside = this.add.rectangle(200, 100, 200, 20, 0x060f20c).setDepth(10);
    // this.healthbarinside.scrollFactorX = 0;
    // this.healthbarinside.scrollFactorY = 0;

    this.score = 0;

    this.scoretext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 50, "Score: " + this.score, { fontSize: 25 });

    this.gold = 0;
    this.goldtext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth - 150, 85, "Gold: " + this.gold, { fontSize: 25 });

    this.addWeaponActions();

    var gameobject = this;
    this.healFunction = setInterval(function(){
      if(gameobject.health < 100){
        gameobject.health += 1;
        gameobject.updateHealthBar();
      }
    }, 1000);

    this.physics.add.collider(this.player, this.coins, (player, coin) => { // player collects coin
      this.collect(player, coin);
    });

    this.physics.add.collider(this.bullets, this.obstacle1, (obstacle, bullet) => {
      bullet.destroy();
    });
    this.physics.add.collider(this.player, this.obstacle1, () => {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    });

    this.physics.add.collider(this.bullets, this.obstacle2, (obstacle, bullet) => {
      bullet.destroy();
    });
    this.physics.add.collider(this.player, this.obstacle2, () => {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    });

    this.physics.add.collider(this.bullets, this.obstacle3, (obstacle, bullet) => {
      bullet.destroy();
    });
    this.physics.add.collider(this.player, this.obstacle3, () => {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    });

    this.physics.add.collider(this.bullets, this.obstacle4, (obstacle, bullet) => {
      bullet.destroy();
    });
    this.physics.add.collider(this.player, this.obstacle4, () => {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    });

    this.socket.on("gamestate", data => {
      this.frames += 1;
      let self = data.players[this.socket.id];
      this.playerInfo.x = self.x;
      this.playerInfo.y = self.y;

      this.tweens.add({
        targets: this.player,
        x: this.playerInfo.x,
        y: this.playerInfo.y,
        duration: _functions_js__WEBPACK_IMPORTED_MODULE_0__.gamestate_rate
      });

      for(let enemy of Object.keys(data.players)){
        if(enemy == this.socket.id) continue;
        this.tweens.add({
          targets: [this.enemies[enemy].player, this.enemies[enemy].gun],
          x: data.players[enemy].x,
          y: data.players[enemy].y,
          duration: _functions_js__WEBPACK_IMPORTED_MODULE_0__.gamestate_rate
        });
      }
    });
    
    // this.physics.add.collider(this.bullets, this.demons, (bullet, demon) => {
    //   bullet.destroy();
    //   demon.destroy();
    //   this.score += 1;
    //   this.scoretext.setText("Score: " + this.score);
    //   this.demontext.setText("Demons: " + this.demons.children.entries.length);
    //   if(this.score > localStorage.getItem("bestscore")){
    //     localStorage.setItem("bestscore", this.score);
    //   }
    // });
  }

  addPlayer(player){
    var playerObj = {
      id: player.id,
      x: player.x,
      y: player.y,
      player: this.add.image(player.x, player.y, "player").setScale(_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100, _functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 100).setDepth(1),
      gun: this.add.image(player.x + _functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 2, player.y, "pistol").setDepth(15),
      angle: null,
      healthbar: undefined,
      nametext: undefined,
      
    }
    this.enemies[player.id] = playerObj;
  }

  updatePlayers(data){
    
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

  updateHealthBar(){
    if(this.health < 0) this.health = 0;
    this.healthbarinside.width = 200 * this.health / 100;
  }

  addWeaponActions(){
    this.useweapon = true;
    window.addEventListener("mousedown", e => {
      if(!this.useweapon) return;
      var angle = Math.atan2(e.clientY - (window.innerHeight / 2), e.clientX - (window.innerWidth / 2));
      let bullet = this.bullets.create(this.player.x + Math.cos(angle) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 2 + 23), this.player.y + Math.sin(angle) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 2 + 23), "bullet").setScale(0.5, 2).setDepth(13);
      bullet.angle = ((angle * 180 / Math.PI) + 360) % 360;
      bullet.setVelocityX(Math.cos(angle) * 1500);
      bullet.setVelocityY(Math.sin(angle) * 1500);
      this.gun.angle = ((angle * 180 / Math.PI) + 360) % 360;
      this.gun.angle2 = angle;
      this.useweapon = false;
    });
    
    window.addEventListener("mousemove", e => {
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
    
    this.gun.x = this.player.x + Math.cos(this.gun.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 2 + 29);
    this.gun.y = this.player.y + Math.sin(this.gun.angle2) * (_functions_js__WEBPACK_IMPORTED_MODULE_0__.playersize / 2 + 29);

    this.player.angle = this.gun.angle;

    if(this.player.x != this.data.x || this.player.y != this.data.y || this.player.angle != this.data.angle){
      this.data.angle = this.gun.angle;
      this.data.angle2 = this.gun.angle2;
      this.data.gunx = this.gun.x;
      this.data.guny = this.gun.y
      // this.socket.emit("player move", this.data);
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
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "ratio": () => (/* binding */ ratio),
/* harmony export */   "size": () => (/* binding */ size),
/* harmony export */   "treesize": () => (/* binding */ treesize)
/* harmony export */ });
const size = 5000;
const playersize = 65;
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
  constructor(scene, x, y, text, style){
    // default values
    if(!style){
      style = {};
      style.fontFamily = "Arial";
      style.fontSize = 30;
      style.background = 0x0000ff;
    }
    if(!("fontFamily" in style)){
      style.fontFamily = "Arial";
    }
    if(!("fontSize" in style)){
      style.fontSize = 30;
    }
    super(scene, x, y, text, style);
    this.scrollFactorX = 0;
    this.scrollFactorY = 0;
    this.setDepth(100);
    scene.add.existing(this);
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
class Chatbox {
  constructor(game){
  }
  
  create(){
    
  }
  
  remove(){
    
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Chatbox);

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = JSON.parse('{"trees":[{"id":0,"size":327,"x":1594.5,"y":4572.5},{"id":1,"size":300,"x":2630,"y":1730},{"id":2,"size":177,"x":3963.5,"y":3503.5},{"id":3,"size":492,"x":1207,"y":3174},{"id":4,"size":258,"x":3030,"y":3793},{"id":5,"size":591,"x":4376.5,"y":3732.5},{"id":6,"size":219,"x":1212.5,"y":1197.5},{"id":7,"size":216,"x":2850,"y":2969},{"id":8,"size":390,"x":238,"y":3287},{"id":9,"size":459,"x":4392.5,"y":4598.5},{"id":10,"size":234,"x":1694,"y":4132},{"id":11,"size":552,"x":2654,"y":1059},{"id":12,"size":222,"x":1575,"y":2342},{"id":13,"size":186,"x":3186,"y":586},{"id":14,"size":561,"x":3474.5,"y":2271.5},{"id":15,"size":468,"x":1416,"y":2168},{"id":16,"size":564,"x":3101,"y":445},{"id":17,"size":516,"x":2937,"y":3886},{"id":18,"size":426,"x":3550,"y":2650},{"id":19,"size":435,"x":3464.5,"y":778.5},{"id":20,"size":546,"x":4190,"y":4350},{"id":21,"size":360,"x":4701,"y":4645},{"id":22,"size":273,"x":212.5,"y":1941.5},{"id":23,"size":525,"x":1244.5,"y":4502.5},{"id":24,"size":534,"x":3126,"y":675},{"id":25,"size":597,"x":3989.5,"y":696.5},{"id":26,"size":234,"x":1744,"y":132},{"id":27,"size":399,"x":517.5,"y":2982.5},{"id":28,"size":225,"x":1640.5,"y":2321.5},{"id":29,"size":234,"x":4274,"y":4328},{"id":30,"size":267,"x":2844.5,"y":3115.5},{"id":31,"size":411,"x":390.5,"y":4741.5},{"id":32,"size":312,"x":3430,"y":2413},{"id":33,"size":255,"x":2967.5,"y":4768.5},{"id":34,"size":486,"x":3666,"y":1759},{"id":35,"size":324,"x":3855,"y":3187},{"id":36,"size":525,"x":3233.5,"y":3159.5},{"id":37,"size":270,"x":3985,"y":1890},{"id":38,"size":183,"x":3058.5,"y":3299.5},{"id":39,"size":552,"x":1716,"y":3922},{"id":40,"size":528,"x":2691,"y":1089},{"id":41,"size":594,"x":4579,"y":3638},{"id":42,"size":546,"x":1498,"y":3234},{"id":43,"size":417,"x":3101.5,"y":2129.5},{"id":44,"size":279,"x":3939.5,"y":1860.5},{"id":45,"size":318,"x":3576,"y":1900},{"id":46,"size":399,"x":2324.5,"y":3030.5},{"id":47,"size":249,"x":1159.5,"y":2666.5},{"id":48,"size":402,"x":597,"y":4666},{"id":49,"size":408,"x":4399,"y":1876},{"id":50,"size":183,"x":4161.5,"y":437.5},{"id":51,"size":408,"x":2042,"y":1737},{"id":52,"size":597,"x":1774.5,"y":2233.5},{"id":53,"size":252,"x":1194,"y":2611}]}');

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = JSON.parse('[{"id":0,"url":"player","cost":0},{"id":1,"url":"skull","cost":200},{"id":2,"url":"smileyface","cost":100},{"id":3,"url":"target","cost":100}]');

/***/ }),
/* 8 */
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
/* 9 */
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
/* 10 */
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
/* 11 */
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
    this.disconnecttext = new _objects_text_js__WEBPACK_IMPORTED_MODULE_0__["default"](this, window.innerWidth / 2, 100, "You got disconnected", {fontSize: 50}).setOrigin(0.5);
    this.button = new _objects_button_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, window.innerWidth / 2, window.innerHeight / 2, 'OK', () => {
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
/* harmony import */ var _scenes_join_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var _scenes_howtoplay_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _scenes_died_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);
/* harmony import */ var _scenes_best_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);
/* harmony import */ var _scenes_disconnect_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(12);







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