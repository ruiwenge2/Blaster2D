import { size, playersize, coinsize, ratio, random, checkMovement, treesize, gamestate_rate, radius } from "../functions.js";
import Text from "../objects/text.js";
import Button from "../objects/button.js";
import Bar from "../objects/bar.js";
import Chatbox from "./chat.js";
import Minimap from "./minimap.js";
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
    this.bulletsGroup = this.physics.add.group();
    this.enemies = {};
    this.bullets = {};
    this.verified = false;
    this.name = name || localStorage.getItem("name");
    let game = this;
    grecaptcha.ready(function() {
      grecaptcha.execute('6Lcm-s0gAAAAAEeQqYid3ppPGWgZuGKxXHKLyO77', {action: 'submit'}).then(function(token) {
          // Add your logic to submit to your backend server here.
        game.socket.emit("join", game.name, token);
        game.verified = true;
        document.getElementsByClassName("grecaptcha-badge")[0].style.display = "none";
      });
    });
    
    window.addEventListener("resize", () => {
      this.scale.resize(window.innerWidth, window.innerHeight);
      // this.cameras.main.setZoom((window.innerWidth * window.innerHeight) / (1300 * 730));
    });
    
    this.socket.on("gamedata", data => { // when game data arrives
      this.loaded = true;
      this.loadingtext.destroy();
      this.player = this.physics.add.sprite(data.players[this.socket.id].x, data.players[this.socket.id].y, "player").setScale(playersize / 100, playersize / 100).setDepth(2);
      this.bar = new Bar(this, this.player.x, this.player.y - radius - 20, 100, 2);
      this.nametext = new Text(this, this.player.x, this.player.y + radius + 20, this.name, { fontSize: 20, fontFamily: "sans-serif" }, 2, true);
      this.playerstext = new Text(this, 20, 20, "", { fontSize: 20, fontFamily: "Arial" }).setOrigin(0);
      this.scorestext = new Text(this, 200, 20, "", { fontSize: 20, fontFamily: "Arial" }).setOrigin(0);
      
      this.fpstext = new Text(this, window.innerWidth - 150, 120, "FPS: 60", { fontSize: 30, fontFamily: "copperplate" });
      this.tps = new Text(this, window.innerWidth - 150, 155, "TPS: 30", { fontSize: 30, fontFamily: "copperplate" });

      this.playerInfo = {
        x: this.player.x,
        y: this.player.y
      };
      
      this.cameras.main.startFollow(this.player);
      this.minimap = new Minimap(this);
      this.minimap.addPlayer(this, this.socket.id, data.players[this.socket.id].x, data.players[this.socket.id].y)
      
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
          this.minimap.addPlayer(this, data.players[oplayer].id, data.players[oplayer].x, data.players[oplayer].y);
        }
      }
      this.main();
        
    });

    this.socket.on("new player", (data, id) => { // when new player joins
      if(!this.verified) return;
      this.addPlayer(data);
      this.minimap.addPlayer(this, data.id, data.x, data.y);
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

    this.health = 100;

    this.score = 0;

    this.scoretext = new Text(this, window.innerWidth - 150, 50, "Score: " + this.score, { fontSize: 30, fontFamily: "copperplate" });

    this.gold = 0;
    this.goldtext = new Text(this, window.innerWidth - 150, 85, "Gold: " + this.gold, { fontSize: 30, fontFamily: "copperplate" });

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
              player.gun.x = player.player.x + Math.cos(data.players[enemy].angle2) * (radius + 29);
             player.gun.y = player.player.y + Math.sin(data.players[enemy].angle2) * (radius + 29);
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

      if(this.died) return;
      this.minimap.update(data.players);
    });

    this.socket.on("new bullet", (id, data) => {
      let bullet_image = this.bulletsGroup.create(data.x, data.y, "bullet").setScale(0.5, 2).setDepth(0.9);
      bullet_image.angle = data.angle;
      bullet_image.shooter = data.shooter;
      bullet_image.id = id;
      this.bullets[id] = bullet_image;
    });

    this.socket.on("removed bullet", id => {
      this.bullets[id].destroy();
      delete this.bullets[id];
    });

    this.socket.on("player died", (id, shooter, shooterName) => {
      let game = this;
      if(id == this.socket.id){
        this.died = true;
        this.gun.destroy();
        this.tweens.add({
          targets: [this.player, this.gun, this.bar, this.nametext],
          duration: 1000,
          alpha: 0,
          onComplete: function(){
            game.player.destroy();
            game.bar.destroy();
            game.nametext.destroy();
            game.playerstext.destroy();
            game.scorestext.destroy();
            game.goldtext.destroy();
            game.scoretext.destroy();
            game.fpstext.destroy();
            game.tps.destroy();
            let deathtext = new Text(game, window.innerWidth / 2, window.innerHeight / 2 - 200, "You died", { fontSize: 50 }).setDepth(101).setAlpha(0);
            let infotext = new Text(game, window.innerWidth / 2, window.innerHeight / 2 - 130, `Killed By: ${shooterName}\nKill Streak: ${game.score}`, { fontSize: 30 }).setDepth(101).setAlpha(0);
            let deathRect = game.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 500, 0x032a852).setOrigin(0.5).setAlpha(0).setDepth(100);
            
            deathRect.scrollFactorX = 0;
            deathRect.scrollFactorY = 0;
            let playAgain = new Button(game, window.innerWidth / 2, window.innerHeight / 2 + 100, "Play Again", function(){
              game.sys.game.destroy(true, false);
              document.querySelector("main").style.display = "block";
              grecaptcha.reset();
            }, { background: 0x00374ff });
            playAgain.text.setDepth(102).setAlpha(0);
            playAgain.button.setDepth(101).setAlpha(0);
            game.tweens.add({
              targets: deathRect,
              duration: 300,
              alpha:0.7
            });
            game.tweens.add({
              targets: [deathtext, infotext, playAgain.text, playAgain.button],
              duration: 300,
              alpha:1
            });
          }
        });
      } else {
        game.enemies[id].gun.destroy();
        this.tweens.add({
          targets: [this.enemies[id].player, this.enemies[id].gun, this.enemies[id].healthbar, this.enemies[id].nametext],
          duration: 1000,
          alpha: 0,
          onComplete: function(){
            game.enemies[id].player.destroy();
            game.enemies[id].healthbar.destroy();
            game.enemies[id].nametext.destroy();
            delete game.enemies[id];
          }
        });
      }
      if(shooter == this.socket.id){
        this.score++;
      } else {
        this.enemies[shooter].score++;
      }
    });
  }

  addPlayer(player){
    var playerObj = {
      id: player.id,
      x: player.x,
      y: player.y,
      name: player.name,
      player: this.add.image(player.x, player.y, "player").setScale(playersize / 100, playersize / 100).setDepth(1),
      nametext: new Text(this, player.x, player.y + radius + 20, player.name, { fontSize: 20, fontFamily: "sans-serif" }, 1, true),
      healthbar: new Bar(this, player.x, player.y - radius - 20, 100, 1),
      gun: this.add.image(player.x + Math.cos(player.angle2) * (radius + 29), player.y + Math.sin(player.angle2) * (radius + 29), "pistol").setDepth(1),
      angle: null,
      health: 100,
      score: player.score
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
    for(let i = 0; i < random(0, 2); i++){
      this.coins.create(random(coinsize / 2, size - coinsize / 2), random(coinsize / 2, size - coinsize / 2), "coin").setScale(0.75, 0.75);
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
      enemy.healthbar.setData(enemy.player.x, enemy.player.y - radius - 20, enemy.health);
      enemy.nametext.setPosition(enemy.player.x, enemy.player.y + radius + 20);
    });

    if(this.died) return;

    this.bar.setData(this.player.x, this.player.y - radius - 20, 100);
    this.nametext.setPosition(this.player.x, this.player.y + radius + 20);
    
    Array.prototype.insert = function(index, item) {
      this.splice(index, 0, item);
    };

    let playerslist = [...Object.values(this.enemies)];

    playerslist.insert(0, {
      score: this.score,
      name: this.name
    });
    
    let sorted_players = playerslist.sort(function(a, b){return b.score - a.score});
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
    
    this.gun.x = this.player.x + Math.cos(this.gun.angle2) * (radius + 29);
    this.gun.y = this.player.y + Math.sin(this.gun.angle2) * (radius + 29);

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