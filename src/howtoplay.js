import { width, height } from "./functions.js";

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

export default howtoplay;