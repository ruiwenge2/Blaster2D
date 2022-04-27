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

export default joinscene;