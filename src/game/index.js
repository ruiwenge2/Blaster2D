import { size, playersize, coinsize, ratio, random, checkMovement, treesize, gamestate_rate } from "../functions.js";
import Text from "../objects/text.js";
import Button from "../objects/button.js";
import Bar from "../objects/bar.js";
import Chatbox from "./chat.js";
import trees from "../trees.json";
import skins from "../skins.json";

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
    this.loadingtext = new Text(this, window.innerWidth / 2, window.innerHeight / 2, "Loading...", { fontSize: 100, fontFamily: "Arial" }).setOrigin(0.5);
  }

  create() {
    this.loaded = false;
    this.socket = io("https://blaster2d.ruiwenge2.repl.co");
    this.coins = this.physics.add.group();
    this.trees = this.physics.add.group();
    this.enemies = {};
    this.name = name || localStorage.getItem("name");
    this.socket.emit("join", this.name);
    
    window.addEventListener("resize", () => {
      this.scale.resize(window.innerWidth, window.innerHeight);
      // this.cameras.main.setZoom((window.innerWidth * window.innerHeight) / (1300 * 730));
    });
    
    this.socket.on("gamedata", data => { // when game data arrives
      this.loaded = true;
      this.loadingtext.destroy();
      this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, "player").setScale(playersize / 100, playersize / 100).setDepth(2);
      this.bar = new Bar(this, this.player.x, this.player.y - playersize / 2 - 20, 100, 2);
      this.nametext = new Text(this, this.player.x, this.player.y + playersize / 2 + 20, this.name, { fontSize: 20, fontFamily: "sans-serif" }, 2, true);
      this.playerstext = new Text(this, 20, 20, "", { fontSize: 24, fontFamily: "Arial" }).setOrigin(0);
      
      this.fpstext = new Text(this, window.innerWidth - 150, 120, "FPS: 60", { fontSize: 30, fontFamily: "copperplate" });
      this.tps = new Text(this, window.innerWidth - 150, 155, "TPS: 30", { fontSize: 30, fontFamily: "copperplate" });

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
      for(let i of trees.trees){
        let tree = this.trees.create(i.x, i.y, "tree").setScale(i.size / treesize).setDepth(10).setAlpha(0.7);
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
      });
    });

    for(let i = size / (ratio * 2); i < size; i += size / ratio){
      for(let j = size / (ratio * 2); j < size; j += size / ratio){
        let grass = this.physics.add.image(i, j, "grass").setDepth(0);
      }
    }
    
    this.obstacle1 = this.physics.add.staticSprite(size / 2, size / 2 - 750, "obstacle").setDepth(0);
    this.obstacle2 = this.physics.add.staticSprite(size / 2, size / 2 + 750, "obstacle").setDepth(0);
    this.obstacle3 = this.physics.add.staticSprite(size / 2 - 750, size / 2, "obstacle2").setDepth(0);
    this.obstacle4 = this.physics.add.staticSprite(size / 2 + 750, size / 2, "obstacle2").setDepth(0);

  
    this.gun = this.physics.add.sprite(this.player.x, this.player.y, "pistol").setDepth(2);

    this.gun.angle2 = 0;

    this.bullets = this.physics.add.group();

    this.health = 100;

    this.score = 0;

    this.scoretext = new Text(this, window.innerWidth - 150, 50, "Score: " + this.score, { fontSize: 30, fontFamily: "copperplate" });

    this.gold = 0;
    this.goldtext = new Text(this, window.innerWidth - 150, 85, "Gold: " + this.gold, { fontSize: 30, fontFamily: "copperplate" });

    this.addWeaponActions();

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
      if(this.socket.disconnected){
        this.scene.start("disconnect_scene");
        return;
      }
      this.frames += 1;
      let self = data.players[this.socket.id];
      this.playerInfo.x = self.x;
      this.playerInfo.y = self.y;
      let game = this;

      this.tweens.add({
        targets: this.player,
        x: this.playerInfo.x,
        y: this.playerInfo.y,
        duration: gamestate_rate
      });

      for(let enemy of Object.keys(data.players)){
        if(enemy == this.socket.id) continue;
        this.tweens.add({
          targets: [this.enemies[enemy].player],
          x: data.players[enemy].x,
          y: data.players[enemy].y,
          duration: gamestate_rate,
          onUpdate: function(){
            try {
              let player = game.enemies[enemy];
              player.gun.x = player.player.x + Math.cos(data.players[enemy].angle2) * (playersize / 2 + 29);
             player.gun.y = player.player.y + Math.sin(data.players[enemy].angle2) * (playersize / 2 + 29);
              player.gun.angle = data.players[enemy].angle;
            } catch(e){
              console.error(e);
            }
          } 
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
      name: player.name,
      player: this.add.image(player.x, player.y, "player").setScale(playersize / 100, playersize / 100).setDepth(1),
      nametext: new Text(this, player.x, player.y + playersize / 2 + 20, player.name, { fontSize: 20, fontFamily: "sans-serif" }, 1, true),
      healthbar: new Bar(this, player.x, player.y - playersize / 2 - 20, 100, 1),
      gun: this.add.image(player.x + playersize / 2, player.y, "pistol").setDepth(1),
      angle: null,
      health: 100,
      score: 0
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
    for(let i = 0; i < random(0, 2); i++){
      this.coins.create(random(coinsize / 2, size - coinsize / 2), random(coinsize / 2, size - coinsize / 2), "coin").setScale(0.75, 0.75);
    }
  }

  addWeaponActions(){
    this.useweapon = true;
    this.input.on("pointerdown", e => {
      if(!this.useweapon) return;
      var angle = Math.atan2(e.y - (window.innerHeight / 2), e.x - (window.innerWidth / 2));
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
    if(this.socket.disconnected){
      this.scene.start("disconnect_scene");
      return;
    }
    this.bar.setData(this.player.x, this.player.y - playersize / 2 - 20, 100);
    this.nametext.setPosition(this.player.x, this.player.y + playersize / 2 + 20);
    for(let enemy of Object.keys(this.enemies)){
      this.enemies[enemy].healthbar.setData(this.enemies[enemy].player.x, this.enemies[enemy].player.y - playersize / 2 - 20, this.enemies[enemy].health);
      this.enemies[enemy].nametext.setPosition(this.enemies[enemy].player.x, this.enemies[enemy].player.y + playersize / 2 + 20);
    }
    Array.prototype.insert = function ( index, item ) {
      this.splice( index, 0, item );
    };

    let playerslist = [...Object.values(this.enemies)];

    playerslist.insert(0, {
      score: this.score,
      name: this.name
    });
    
    let sorted_players = playerslist.sort(function(a, b){return a.score - b.score});
    let text = "";
    for(let i of sorted_players){
      text += `${i.name} - ${i.score}\n`;
    }
    this.playerstext.setText(text);
    
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
    
    this.gun.x = this.player.x + Math.cos(this.gun.angle2) * (playersize / 2 + 29);
    this.gun.y = this.player.y + Math.sin(this.gun.angle2) * (playersize / 2 + 29);

    this.player.angle = this.gun.angle;

    if(this.player.angle != this.data.angle){
      this.data.angle = this.gun.angle;
      this.data.angle2 = this.gun.angle2;
      this.socket.emit("player angle", this.data);
    }
  }
}


export default gamescene;

// https://www.html5gamedevs.com/topic/7273-best-way-to-fix-weapon-to-player/