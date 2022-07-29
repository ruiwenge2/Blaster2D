import Text from "../objects/text.js";
import Button from "../objects/button.js";

class disconnect_scene extends Phaser.Scene {
  constructor(){
    super();
  }
  
  preload(){
    
  }
  
  create(){
    this.disconnecttext = new Text(this, window.innerWidth / 2, 100, window.error.message, { fontSize: 30, fontFamily: "Arial" }).setOrigin(0.5);
    this.button = new Button(this, window.innerWidth / 2, window.innerHeight / 2, window.error.reload ? "Reload": "OK", () => {
      if(window.error.reload) location.reload();
      else {
        this.sys.game.destroy(true, false);
        document.querySelector("main").style.display = "block";
        document.getElementsByClassName("grecaptcha-badge")[0].style.display = "block";
        document.body.style.cursor = "auto";
      }
    });
    
  }
  
  update(){

  }
}

export default disconnect_scene;