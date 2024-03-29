import { size, playersize, coinsize, ratio, random, checkMovement, treesize, gamestate_rate, radius } from "../functions.js";

class Minimap {
  constructor(scene){
    this.map = scene.add.rectangle(window.innerWidth - 220, window.innerHeight - 220, 200, 200, 0x0000000).setDepth(150).setAlpha(0.7).setOrigin(0).setStrokeStyle(3, 0x0000ff);
    this.map.scrollFactorX = 0;
    this.map.scrollFactorY = 0;
    this.players = {};
    this.scale = size / this.map.width;
    scene.cameras.main.ignore(this.map);
  }

  show(scene){
    scene.add.existing(this.map);
  }

  addPlayer(scene, id, x, y){
    if(scene.died) return;
    var color = 0x0ff0000;
    if(id == scene.socket.id) color = 0x0ffa500;
    let player = scene.add.circle(this.map.x + x / this.scale, this.map.y + y / this.scale, radius / this.scale, color).setDepth(151);
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

export default Minimap;