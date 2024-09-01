import skins from "../skins.json";

class Load extends Phaser.Scene {
  constructor(){
    super();
  }
  
  preload(){
    for(let i of Object.keys(skins)){
      this.load.image(`skin_${skins[i].url}`, `/img/skins/${skins[i].url}.png`);
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

  create(){
    
  }

  update(){
    
  }
}

export default Load;