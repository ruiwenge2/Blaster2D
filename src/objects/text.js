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

export default Text;