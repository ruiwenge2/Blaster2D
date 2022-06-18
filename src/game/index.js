import { size, playersize, coinsize, ratio, random, checkMovement, treesize } from "../functions.js";
import Text from "../objects/text.js";
import Button from "../objects/button.js";
import Chatbox from "./chat.js";
import trees from "../trees.json";
import skins from "../skins.json";

const speed = 275;

class gamescene extends Phaser.Scene {
  constructor(){
    super();
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
    this.loadingtext = new Text(this, window.innerWidth / 2, window.innerHeight / 2, "Loading...", {fontSize: 100}).setOrigin(0.5);
  }

  create() {
    this.loaded = false;
    this.socket = io("https://blaster2d.ruiwenge2.repl.co");
    this.otherplayers = this.physics.add.group();
    this.otherguns = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.trees = this.physics.add.group();
    
    this.socket.emit("join", localStorage.getItem("name"));
    this.socket.on("gamedata", data => { // when game data arrives
      this.loaded = true;
      this.loadingtext.destroy();
      this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, "skin").setScale(0.5, 0.5).setDepth(1);
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
      for(let i of trees.trees){
        let tree = this.trees.create(i.x, i.y, "tree").setScale(i.size / treesize).setDepth(10);
        tree.id = i.id;
      }
      
      for(let oplayer of Object.keys(data.players)){
        if(oplayer != this.socket.id){
          let otherplayer = this.otherplayers.create(data.players[oplayer].x, data.players[oplayer].y, "player").setScale(0.5, 0.5).setDepth(1);
          otherplayer.id = oplayer;
          let gun = this.otherguns.create(data.players[oplayer].x + Math.cos(data.players[oplayer].angle2) * (playersize / 2 + 28), data.players[oplayer].y + Math.sin(data.players[oplayer].angle2) * (playersize / 2 + 28), "pistol").setDepth(15);
          gun.angle = data.players[oplayer].angle;
          gun.angle2 = data.players[oplayer].angle2;
          gun.id = oplayer;
        }
      }
      this.main();
        
    });
    

    this.socket.on("new player", (data, id) => { // when new player joins
      let otherplayer = this.otherplayers.create(data.x, data.y, "player").setScale(0.5, 0.5).setDepth(1);
      let gun = this.otherguns.create(data.x + Math.cos(0) * (playersize / 2 + 28), data.y + Math.sin(0) * (playersize / 2 + 28), "pistol").setDepth(15);
      gun.angle = 0;
      gun.angle2 = 0;
      otherplayer.id = id;
      gun.id = id;
    });
  
    this.socket.on("other player move", (id, data) => { // when other player moves
      this.otherplayers.getChildren().forEach(oplayer => {
        if(oplayer.id == id){
          oplayer.setPosition(data.x, data.y);
          oplayer.angle = data.angle;
          this.otherguns.getChildren().forEach(gun => {
            if(gun.id == id){
              gun.angle = data.angle;
              gun.angle2 = data.angle2;
              gun.setPosition(data.gunx, data.guny);
            }
          });
        }
      });
    });

    this.socket.on("collected gold", id => {
      for(let coin of this.coins.children.entries){
        if(coin.id == id){
          coin.destroy();
          console.log("deleted coin");
        }
      }
    });
  
    this.socket.on("left", id => {
      for(let player of this.otherplayers.children.entries){
        if(player.id == id){
          player.destroy();
        }
      }
  
      for(let gun of this.otherguns.children.entries){
        if(gun.id == id){
          gun.destroy();
        }
      }
    });
  
    this.socket.on("leave", () => {
      this.scene.start("disconnect_scene");
    });
  }

  main(){
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

    for(let i = size / (ratio * 2); i < size; i += size / ratio){
      for(let j = size / (ratio * 2); j < size; j += size / ratio){
        let grass = this.physics.add.image(i, j, "grass").setDepth(0);
      }
    }
    
    this.obstacle1 = this.physics.add.staticSprite(size / 2, size / 2 - 750, "obstacle").setDepth(0);
    this.obstacle2 = this.physics.add.staticSprite(size / 2, size / 2 + 750, "obstacle").setDepth(0);
    this.obstacle3 = this.physics.add.staticSprite(size / 2 - 750, size / 2, "obstacle2").setDepth(0);
    this.obstacle4 = this.physics.add.staticSprite(size / 2 + 750, size / 2, "obstacle2").setDepth(0);

  
    this.gun = this.physics.add.sprite(this.player.x, this.player.y, "pistol").setDepth(15);

    this.gun.angle2 = 0;

    this.bullets = this.physics.add.group();

    this.health = 100;
    this.healthtext = new Text(this, 100, 50, "Health");

    this.healthbar = this.add.rectangle(200, 100, 200, 20, 0x0ffffff).setDepth(10);
    this.healthbar.scrollFactorX = 0;
    this.healthbar.scrollFactorY = 0;

    this.healthbarinside = this.add.rectangle(200, 100, 200, 20, 0x060f20c).setDepth(10);
    this.healthbarinside.scrollFactorX = 0;
    this.healthbarinside.scrollFactorY = 0;

    this.score = 0;

    this.scoretext = new Text(this, window.innerWidth - 200, 100, "Score: " + this.score);

    this.gold = 0;
    this.goldtext = new Text(this, window.innerWidth - 200, 150, "Gold: " + this.gold);

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

  collect(player, coin){
    this.socket.emit("collect gold", coin.id);
    console.log(coin.id)
    this.gold += 1;
    this.goldtext.setText("Gold: " + this.gold);
    coin.destroy();
    if(this.gold > localStorage.getItem("bestgold")){
      localStorage.setItem("bestgold", this.gold);
    }
    for(let i = 0; i < random(0, 2); i++){
      this.coins.create(random(coinsize / 2, size - coinsize / 2), random(coinsize / 2, size - coinsize / 2), "coin").setScale(0.75, 0.75);
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
      let bullet = this.bullets.create(this.player.x + Math.cos(angle) * (playersize / 2 + 23), this.player.y + Math.sin(angle) * (playersize / 2 + 23), "bullet").setScale(0.5, 2).setDepth(13);
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
    if(!this.fpstext){
      this.fpstext = new Text(this, window.innerWidth - 200, 200, "Loading FPS...");
    }
    this.fpstext.setText("FPS: " + Math.round(this.sys.game.loop.actualFps));
    let cursors = this.input.keyboard.createCursorKeys();
    
    this.player.setVelocityX(0);
    this.player.setVelocityY(0);
    if(cursors.left.isDown || this.a.isDown){
      if(checkMovement("left", this.player.body.position.x, this.player.body.position.y)) this.player.setVelocityX(-speed);
    } if(cursors.right.isDown || this.d.isDown){
      if(checkMovement("right", this.player.body.position.x, this.player.body.position.y)) this.player.setVelocityX(speed);
    } if(cursors.up.isDown || this.w.isDown){
      if(checkMovement("up", this.player.body.position.x, this.player.body.position.y)) this.player.setVelocityY(-speed);
    } if(cursors.down.isDown || this.s.isDown){
      if(checkMovement("down", this.player.body.position.x, this.player.body.position.y)) this.player.setVelocityY(speed);
    }
    
    this.gun.x = this.player.body.position.x + playersize / 2 + Math.cos(this.gun.angle2) * (playersize / 2 + 28);
    this.gun.y = this.player.body.position.y + playersize / 2 + Math.sin(this.gun.angle2) * (playersize / 2 + 28);

    this.player.angle = this.gun.angle;

    if(this.player.x != this.data.x || this.player.y != this.data.y || this.player.angle != this.data.angle){
      this.data.x = this.player.x;
      this.data.y = this.player.y;
      this.data.angle = this.gun.angle;
      this.data.angle2 = this.gun.angle2;
      this.data.gunx = this.gun.x;
      this.data.guny = this.gun.y
      this.socket.emit("player move", this.data);
    }
  }
}


export default gamescene;

// https://www.html5gamedevs.com/topic/7273-best-way-to-fix-weapon-to-player/