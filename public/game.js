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
    this.socket = io("https://blaster2d.ruiwenge2.repl.co");
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

module.exports = JSON.parse('{"trees":[{"id":0,"size":186,"x":3560,"y":1648},{"id":1,"size":345,"x":3828.5,"y":4650.5},{"id":2,"size":402,"x":1581,"y":2630},{"id":3,"size":549,"x":1419.5,"y":412.5},{"id":4,"size":366,"x":3772,"y":677},{"id":5,"size":168,"x":2750,"y":362},{"id":6,"size":306,"x":4646,"y":3265},{"id":7,"size":348,"x":1650,"y":1861},{"id":8,"size":516,"x":474,"y":4351},{"id":9,"size":450,"x":868,"y":4623},{"id":10,"size":459,"x":486.5,"y":4675.5},{"id":11,"size":159,"x":4079.5,"y":1609.5},{"id":12,"size":162,"x":2691,"y":321},{"id":13,"size":546,"x":1511,"y":2403},{"id":14,"size":531,"x":1325.5,"y":2069.5},{"id":15,"size":210,"x":2670,"y":987},{"id":16,"size":402,"x":349,"y":4701},{"id":17,"size":588,"x":2835,"y":2492},{"id":18,"size":378,"x":4667,"y":4163},{"id":19,"size":438,"x":4078,"y":3801},{"id":20,"size":555,"x":2216.5,"y":3590.5},{"id":21,"size":384,"x":2639,"y":2526},{"id":22,"size":435,"x":4330.5,"y":1365.5},{"id":23,"size":228,"x":2801,"y":4107},{"id":24,"size":330,"x":4331,"y":4154},{"id":25,"size":528,"x":813,"y":2921},{"id":26,"size":174,"x":3667,"y":2131},{"id":27,"size":492,"x":403,"y":4117},{"id":28,"size":432,"x":222,"y":2101},{"id":29,"size":597,"x":3699.5,"y":2650.5},{"id":30,"size":348,"x":4242,"y":3155},{"id":31,"size":363,"x":3010.5,"y":4135.5},{"id":32,"size":189,"x":488.5,"y":3016.5},{"id":33,"size":387,"x":2144.5,"y":1391.5},{"id":34,"size":162,"x":4369,"y":3883},{"id":35,"size":549,"x":1544.5,"y":2129.5},{"id":36,"size":480,"x":2579,"y":1012},{"id":37,"size":381,"x":4303.5,"y":1764.5},{"id":38,"size":246,"x":971,"y":3531},{"id":39,"size":393,"x":1409.5,"y":2663.5},{"id":40,"size":381,"x":2042.5,"y":626.5},{"id":41,"size":561,"x":3076.5,"y":3178.5},{"id":42,"size":552,"x":4240,"y":4093},{"id":43,"size":411,"x":2676.5,"y":1733.5},{"id":44,"size":168,"x":3481,"y":2931},{"id":45,"size":339,"x":2651.5,"y":3146.5},{"id":46,"size":534,"x":1022,"y":3214},{"id":47,"size":408,"x":4122,"y":1361},{"id":48,"size":264,"x":2532,"y":1713},{"id":49,"size":246,"x":4822,"y":3282},{"id":50,"size":288,"x":4670,"y":652},{"id":51,"size":519,"x":1078.5,"y":2261.5},{"id":52,"size":291,"x":2483.5,"y":2303.5},{"id":53,"size":465,"x":2686.5,"y":2345.5},{"id":54,"size":444,"x":2045,"y":3807},{"id":55,"size":507,"x":1506.5,"y":2153.5},{"id":56,"size":450,"x":4232,"y":756}]}');

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