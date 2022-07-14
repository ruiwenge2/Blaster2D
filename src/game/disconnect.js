import Text from "../objects/text.js";
import Button from "../objects/button.js";

class disconnect_scene extends Phaser.Scene {
  constructor(){
    super();
  }
  
  preload(){
    
  }
  
  create(){
    this.disconnecttext = new Text(this, window.innerWidth / 2, 100, "You got disconnected", { fontSize: 50, fontFamily: "Arial" }).setOrigin(0.5);
    this.button = new Button(this, window.innerWidth / 2, window.innerHeight / 2, "Reload", () => {
      location.reload();
    });
    
  }
  
  update(){

  }
}

export default disconnect_scene;